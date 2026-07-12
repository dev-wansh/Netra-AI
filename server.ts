import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Custom Error Class to identify quota limits safely
class QuotaExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuotaExceededError';
  }
}

const MODEL_PRIORITY = [
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash-lite"
];

function isQuotaError(error: any): boolean {
  const errorStr = String(error.message || error.status || error || '').toUpperCase();
  const errorCode = error.code ? String(error.code) : '';
  const errorStatus = error.status ? String(error.status).toUpperCase() : '';
  
  return errorStr.includes('429') || 
         errorStr.includes('QUOTA') || 
         errorStr.includes('RESOURCE_EXHAUSTED') || 
         errorStr.includes('LIMIT') ||
         errorCode.includes('429') ||
         errorStatus.includes('RESOURCE_EXHAUSTED');
}

function isModelNotFoundError(error: any): boolean {
  const errorStr = String(error.message || error.status || error || '').toUpperCase();
  const errorCode = error.code ? String(error.code) : '';
  
  return errorStr.includes('NOT_FOUND') || 
         errorStr.includes('NOT FOUND') || 
         errorStr.includes('NOT EXIST') || 
         errorStr.includes('UNSUPPORTED') ||
         errorCode.includes('404') ||
         (errorCode.includes('400') && (errorStr.includes('MODEL') || errorStr.includes('INVALID_ARGUMENT')));
}

function isAuthOrKeyError(error: any): boolean {
  const errorStr = String(error.message || error || '').toUpperCase();
  return errorStr.includes('API_KEY') || 
         errorStr.includes('API KEY') || 
         errorStr.includes('INVALID_KEY') || 
         errorStr.includes('UNAUTHORIZED') || 
         errorStr.includes('AUTHENTICATION') || 
         errorStr.includes('401') || 
         errorStr.includes('403') ||
         errorStr.includes('KEY_INVALID');
}

// Helper to run Gemini requests with strict sequential priority fallback
async function generateContentWithQuotaFallback(params: any): Promise<any> {
  const isPriorityModel = MODEL_PRIORITY.includes(params.model);
  const modelsToTry = isPriorityModel ? MODEL_PRIORITY : [params.model];

  for (let i = 0; i < modelsToTry.length; i++) {
    const model = modelsToTry[i];
    console.log(`Trying Gemini model: ${model}`);
    try {
      const response = await ai.models.generateContent({
        ...params,
        model: model
      });
      console.log(`Gemini analysis succeeded with model: ${model}`);
      return response;
    } catch (error: any) {
      if (isAuthOrKeyError(error)) {
        console.error(`[GEMINI AUTH ERROR] Authentication failed:`, error.message || error);
        throw error;
      }

      if (isQuotaError(error)) {
        console.warn(`Model quota unavailable for ${model}. Trying next model.`);
        continue;
      }

      if (isModelNotFoundError(error)) {
        console.warn(`Model ${model} not found or unsupported. Trying next model.`);
        continue;
      }

      // Serious API error, stop and throw
      console.error(`[GEMINI ERROR] Serious API error:`, error.message || error);
      throw error;
    }
  }

  console.error(`All configured Gemini models exhausted.`);
  throw new QuotaExceededError("The available AI analysis limit has been reached.");
}

// Helper to construct language instruction for Gemini response fields
function getLanguageInstruction(langCode: string): string {
  const langMap: Record<string, string> = {
    en: 'English (Indian English context)',
    hi: 'Hindi (हिंदी - clean, natural, simple colloquial Hindi, avoiding over-formal words)',
    mr: 'Marathi (मराठी - clean, natural, simple colloquial Marathi, avoiding over-formal words)'
  };
  const langName = langMap[langCode] || 'English';
  return `IMPORTANT: You must write the values of the fields "scamType", "explanation", "signals", and "actions" entirely in the ${langName} language.
Do NOT use literal machine translations; use simple, natural sentences that a normal Indian citizen would easily understand.
However, the "riskLevel" MUST remain exactly one of these English uppercase words: "LOW", "MEDIUM", "HIGH", or "CRITICAL".
The "riskScore" must be a valid integer from 0 to 100.`;
}

const FALLBACK_DATA: Record<string, Record<string, {
  scamType: string;
  explanation: string;
  signals: string[];
  actions: string[];
}>> = {
  en: {
    digital_arrest: {
      scamType: "🚨 Digital Arrest Scam Threat",
      explanation: "Scammers are falsely posing as CBI, Police, or Customs officers claiming you are under 'digital arrest' due to illegal drugs or money laundering in a package. Real law enforcement agencies never issue arrests via video calls.",
      signals: [
        "Demand to stay on a continuous video Skype/WhatsApp call.",
        "Threats of immediate arrest or public shame.",
        "Claims that your Aadhaar card or phone number was used in money laundering."
      ],
      actions: [
        "Do not stay on the video call. Hang up immediately.",
        "Never share passport, Aadhaar, bank details, or send any verification fees.",
        "Report the caller immediately on the National Cyber Crime Portal (cybercrime.gov.in) or call 1930."
      ]
    },
    electricity: {
      scamType: "⚡ Fake Electricity Bill Disconnection",
      explanation: "Scammers send SMS or make calls threatening immediate electricity disconnection. They ask you to call a fake officer's number and download screen-sharing apps like AnyDesk or TeamViewer.",
      signals: [
        "SMS claiming power cut tonight at 9:30 PM due to unpaid bills.",
        "Requesting you to contact a personal mobile number instead of official helplines.",
        "Pressure to download screen-sharing apps to check payment history."
      ],
      actions: [
        "Do not call the mobile number mentioned in the SMS.",
        "Always pay your bills only through official apps/websites (e.g., Mahadiscom, Tata Power, BESCOM).",
        "Never download AnyDesk, TeamViewer, or RustDesk under anyone's instructions."
      ]
    },
    bank_kyc: {
      scamType: "🏦 Bank KYC / Account Blocked Fraud",
      explanation: "Scammers pretend to be bank staff warning that your YONO, PAN link, or bank account is blocked. They send SMS with phishing links to steal your net banking login and OTP.",
      signals: [
        "Threats that your account or debit card is suspended.",
        "SMS containing an unofficial link (e.g., bit.ly, tinyurl, or suspicious .com/net) to 'update KYC'.",
        "Requests for OTP, CVV, or passwords."
      ],
      actions: [
        "Banks never send SMS containing links to update KYC or link PAN card.",
        "Do not click on links in unsolicited messages.",
        "Report the suspicious sender on Sanchar Saathi's Chakshu portal (sancharsaathi.gov.in)."
      ]
    },
    kbc: {
      scamType: "🎉 Fake KBC / WhatsApp Lottery Scam",
      explanation: "Scammers claim you have won a KBC lottery worth 25 Lakhs. They ask you to pay a processing fee, GST, or bank clearance fee to claim the prize. This is a classic advance-fee fraud.",
      signals: [
        "Audio recording sent via WhatsApp claiming you won 25 Lakhs.",
        "Demanding cash deposit in a personal bank account as 'GST/Tax clearance'.",
        "Use of official logos (KBC, Jio) to look legitimate."
      ],
      actions: [
        "Never pay money to receive a prize or lottery. Any such demand is 100% fraud.",
        "Block the international or unknown WhatsApp number (+92, +1, etc.) immediately.",
        "Report the fraud on the cyber crime helpline (1930)."
      ]
    },
    job: {
      scamType: "💼 Part-Time Job / Telegram Task Fraud",
      explanation: "Scammers offer easy work-from-home tasks, such as liking YouTube videos or reviewing hotels. They pay small amounts first to build trust, then demand deposit money for 'VIP tasks' and steal it.",
      signals: [
        "Offers of high daily income (₹2000-₹5000) for simple online tasks.",
        "Relocation of discussions to Telegram channels.",
        "Demands to pay money to unlock higher commissions/withdrawal limits."
      ],
      actions: [
        "Never pay money to get a job or unlock your earnings.",
        "Block the Telegram accounts and groups offering task-based pay.",
        "Report the UPI IDs and bank accounts on Sanchar Saathi."
      ]
    },
    parcel: {
      scamType: "📦 Suspicious Parcel / Customs Duty Threat",
      explanation: "Scammers claim a courier sent in your name containing drugs or illegal items has been seized. They pose as customs officers to extort money as 'clearance fees' under threat of jail.",
      signals: [
        "Robotic automated call claiming to be FedEx/DHL saying your parcel is returned.",
        "Demanding money to clear custom duties or settle police charges.",
        "Threatening legal action if you do not pay immediately."
      ],
      actions: [
        "Hang up immediately. No official courier company or customs agency asks for settlement money online.",
        "Do not transfer funds to any personal UPI ID or bank account.",
        "Register a complaint at cybercrime.gov.in."
      ]
    },
    general_scam: {
      scamType: "⚠️ Unverified Cyber Scam Threat",
      explanation: "The content matches high-risk cyber fraud markers commonly seen in phishing, social engineering, and financial extortion schemes in India. Extreme caution is advised.",
      signals: [
        "Unsolicited request demanding urgent response, action, or money.",
        "Unverified contacts posing as official company or government agents.",
        "Pressure tactics to bypass standard verification channels."
      ],
      actions: [
        "Do not share OTPs, credit card numbers, or passwords.",
        "Do not click on unverified web links or download apps.",
        "Report the incident on the Sanchar Saathi 'Chakshu' portal."
      ]
    },
    safe: {
      scamType: "✅ Low Risk / Standard Activity",
      explanation: "No major cyber fraud signals were found in the provided content. However, always exercise standard vigilance when sharing details online.",
      signals: [
        "No common pressure tactics or urgent financial demands found.",
        "No links or requests to download screen sharing tools."
      ],
      actions: [
        "Proceed with caution and do not share sensitive private credentials.",
        "If you suspect anything in the future, check back on Netra AI."
      ]
    }
  },
  hi: {
    digital_arrest: {
      scamType: "🚨 डिजिटल अरेस्ट स्कैम का खतरा",
      explanation: "स्कैमर्स खुद को सीबीआई, पुलिस या सीमा शुल्क अधिकारी बताकर झूठा दावा कर रहे हैं कि किसी पार्सल में अवैध ड्रग्स होने के कारण आप 'डिजिटल अरेस्ट' के तहत हैं। पुलिस कभी भी वीडियो कॉल पर अरेस्ट नहीं करती।",
      signals: [
        "स्काइप या व्हाट्सएप वीडियो कॉल पर लगातार बने रहने का दबाव डालना।",
        "तुरंत गिरफ्तारी या सामाजिक बदनामी की धमकी देना।",
        "यह दावा करना कि आपके आधार कार्ड या फोन नंबर का उपयोग मनी लॉन्ड्रिंग में हुआ है।"
      ],
      actions: [
        "वीडियो कॉल पर न रहें। तुरंत कॉल काट दें।",
        "कभी भी अपना आधार, बैंक विवरण साझा न करें और कोई शुल्क न भेजें।",
        "राष्ट्रीय साइबर अपराध पोर्टल (cybercrime.gov.in) पर रिपोर्ट करें या 1930 पर कॉल करें।"
      ]
    },
    electricity: {
      scamType: "⚡ फर्जी बिजली बिल काटने की धमकी",
      explanation: "स्कैमर्स तुरंत बिजली काटने की धमकी देते हुए संदेश भेजते हैं। वे आपको एक फर्जी नंबर पर कॉल करने और AnyDesk या TeamViewer जैसे स्क्रीन-शेयरिंग ऐप्स डाउनलोड करने के लिए कहते हैं।",
      signals: [
        "दावा करना कि बिल का भुगतान न होने के कारण आज रात 9:30 बजे बिजली काट दी जाएगी।",
        "आधिकारिक हेल्पलाइन के बजाय किसी व्यक्तिगत मोबाइल नंबर पर संपर्क करने को कहना।",
        "भुगतान इतिहास जांचने के लिए स्क्रीन-शेयरिंग ऐप डाउनलोड करने का दबाव डालना।"
      ],
      actions: [
        "एसएमएस में दिए गए मोबाइल नंबर पर कभी कॉल न करें।",
        "हमेशा केवल आधिकारिक ऐप/वेबसाइटों के माध्यम से ही बिजली बिल का भुगतान करें।",
        "किसी के कहने पर AnyDesk, TeamViewer या RustDesk डाउनलोड न करें।"
      ]
    },
    bank_kyc: {
      scamType: "🏦 बैंक केवाईसी / खाता ब्लॉक होने का फ्रॉड",
      explanation: "स्कैमर्स बैंक कर्मचारी बनकर चेतावनी देते हैं कि आपका बैंक खाता या योनि (YONO) ऐप ब्लॉक हो गया है। वे केवाईसी अपडेट करने के लिए फर्जी लिंक भेजकर आपके बैंक क्रेडेंशियल चुराते हैं।",
      signals: [
        "खाता या डेबिट कार्ड निलंबित होने की डरावनी धमकियां।",
        "केवाईसी अपडेट करने के लिए संदिग्ध या अनौपचारिक लिंक (जैसे bit.ly, tinyurl) भेजना।",
        "ओटीपी (OTP), सीवीवी (CVV) या नेट बैंकिंग पासवर्ड मांगना।"
      ],
      actions: [
        "बैंक कभी भी केवाईसी अपडेट के लिए लिंक वाले एसएमएस नहीं भेजते।",
        "अपरिचित या अनौपचारिक संदेशों में दिए गए लिंक पर क्लिक न करें।",
        "संचार साथी के 'चक्षु' पोर्टल (sancharsaathi.gov.in) पर संदिग्ध प्रेषक की रिपोर्ट करें।"
      ]
    },
    kbc: {
      scamType: "🎉 फर्जी केबीसी / व्हाट्सएप लॉटरी फ्रॉड",
      explanation: "स्कैमर्स दावा करते हैं कि आपने 25 लाख रुपये की केबीसी लॉटरी जीती है। इनाम का दावा करने के लिए वे आपसे प्रोसेसिंग शुल्क, जीएसटी या बैंक क्लीयरेंस शुल्क के रूप में पैसे मांगते हैं।",
      signals: [
        "व्हाट्सएप पर भेजा गया ऑडियो संदेश जिसमें 25 लाख की लॉटरी जीतने का दावा हो।",
        "सरकारी टैक्स या जीएसटी के नाम पर किसी व्यक्तिगत बैंक खाते में नकद जमा करने की मांग करना।",
        "विश्वास जीतने के लिए केबीसी या जियो के आधिकारिक लोगो का दुरुपयोग करना।"
      ],
      actions: [
        "कोई भी लॉटरी या इनाम पाने के लिए कभी भी पैसे न दें। ऐसी मांगें 100% फर्जी होती हैं।",
        "अंतरराष्ट्रीय या अज्ञात व्हाट्सएप नंबर (+92, +1 आदि) को तुरंत ब्लॉक करें।",
        "साइबर अपराध हेल्पलाइन (1930) पर इसकी रिपोर्ट दर्ज करें।"
      ]
    },
    job: {
      scamType: "💼 पार्ट-टाइम जॉब / टेलीग्राम टास्क फ्रॉड",
      explanation: "स्कैमर्स घर से काम करने और यूट्यूब वीडियो लाइक करने जैसी आसान नौकरियों का लालच देते हैं। वे भरोसा बनाने के लिए शुरू में कुछ पैसे देते हैं, फिर 'वीआईपी टास्क' के नाम पर मोटी रकम ठग लेते हैं।",
      signals: [
        "सरल ऑनलाइन कार्यों के लिए भारी दैनिक आय (₹2000-₹5000) का लालच।",
        "बातचीत को तुरंत टेलीग्राम ग्रुप या चैनल पर स्थानांतरित करना।",
        "कमिशन या कमाई निकालने के लिए पैसे जमा करने की मांग करना।"
      ],
      actions: [
        "नौकरी पाने या अपनी कमाई निकालने के लिए कभी भी पैसे का भुगतान न करें।",
        "टास्क-आधारित भुगतान की पेशकश करने वाले टेलीग्राम खातों को तुरंत ब्लॉक करें।",
        "संदिग्ध यूपीआई आईडी और बैंक खातों की रिपोर्ट संचार साथी पर करें।"
      ]
    },
    parcel: {
      scamType: "📦 संदिग्ध पार्सल / सीमा शुल्क (Customs) का डर",
      explanation: "स्कैमर्स दावा करते हैं कि आपके नाम से भेजे गए पार्सल में ड्रग्स मिले हैं। वे खुद को कस्टम या पुलिस अधिकारी बताकर जेल की धमकी देकर अवैध 'क्लीयरेंस शुल्क' वसूलते हैं।",
      signals: [
        "फेडेक्स या डीएचएल के नाम पर रिकॉर्डेड कॉल, जिसमें पार्सल वापस होने का दावा हो।",
        "पुलिस कार्रवाई से बचने के लिए पैसे ट्रांसफर करने का दबाव डालना।",
        "तुरंत भुगतान न करने पर कानूनी कार्रवाई और जेल की धमकी देना।"
      ],
      actions: [
        "कॉल तुरंत काट दें। कोई भी कूरियर कंपनी या सीमा शुल्क विभाग फोन पर पैसे नहीं मांगता।",
        "किसी भी व्यक्तिगत यूपीआई आईडी या बैंक खाते में पैसे ट्रांसफर न करें।",
        "राष्ट्रीय साइबर अपराध पोर्टल (cybercrime.gov.in) पर शिकायत दर्ज करें।"
      ]
    },
    general_scam: {
      scamType: "⚠️ संदिग्ध साइबर धोखाधड़ी का संकेत",
      explanation: "यह सामग्री भारत में आम तौर पर देखी जाने वाली फ़िशिंग, सोशल इंजीनियरिंग और वित्तीय धोखाधड़ी के उच्च-जोखिम वाले पैटर्न से मेल खाती है। अत्यधिक सावधानी बरतें।",
      signals: [
        "अपरिचित स्रोतों से तुरंत कार्रवाई या वित्तीय भुगतान की मांग।",
        "अपुष्ट संपर्क विवरण के माध्यम से दबाव बनाने की कोशिश।",
        "मानक सुरक्षा चैनलों और सत्यापन प्रणालियों को बायपास करने का आग्रह।"
      ],
      actions: [
        "कोई भी ओटीपी, क्रेडिट कार्ड विवरण या पासवर्ड साझा न करें।",
        "अपुष्ट लिंक पर क्लिक न करें या संदिग्ध ऐप्स डाउनलोड न करें।",
        "संचार साथी पोर्टल के माध्यम से संदिग्ध संपर्क की तुरंत रिपोर्ट करें।"
      ]
    },
    safe: {
      scamType: "✅ कम जोखिम / सामान्य गतिविधि",
      explanation: "प्रदान की गई सामग्री में कोई महत्वपूर्ण साइबर धोखाधड़ी के संकेत नहीं मिले। हालांकि, ऑनलाइन विवरण साझा करते समय हमेशा सामान्य सावधानी बरतें।",
      signals: [
        "कोई दबाव या तत्काल वित्तीय मांगें नहीं पाई गईं।",
        "स्क्रीन-शेयरिंग टूल या संदिग्ध ऐप्स डाउनलोड करने की कोई मांग नहीं है।"
      ],
      actions: [
        "सावधानी बरतें और संवेदनशील व्यक्तिगत क्रेडेंशियल साझा करने से बचें।",
        "भविष्य में संदेह होने पर नेत्र AI (Netra AI) पर पुनः जांच करें।"
      ]
    }
  },
  mr: {
    digital_arrest: {
      scamType: "🚨 डिजिटल अरेस्ट स्कॅमचा धोका",
      explanation: "स्कॅमर्स स्वतःला सीबीआय, पोलीस किंवा कस्टम अधिकारी असल्याचे सांगून खोटा दावा करत आहेत की तुमच्या पार्सलमध्ये ड्रग्ज सापडल्याने तुम्हाला 'डिजिटल अरेस्ट' केले आहे. पोलीस कधीही व्हिडिओ कॉलवर अटक करत नाहीत.",
      signals: [
        "स्काईप किंवा व्हॉट्सॲप व्हिडिओ कॉलवर सतत थांबण्यास भाग पाडणे.",
        "तातडीने अटक करण्याची किंवा बदनामी करण्याची धमकी देणे.",
        "तुमचे आधार कार्ड किंवा फोन नंबर मनी लाँड्रिंगमध्ये वापरल्याचा दावा करणे."
      ],
      actions: [
        "व्हिडिओ कॉलवर थांबू नका. त्वरित कॉल कट करा.",
        "तुमचे आधार, बँक तपशील किंवा कोणतेही शुल्क शेअर करू नका.",
        "राष्ट्रीय सायबर गुन्हे पोर्टलवर (cybercrime.gov.in) तक्रार करा किंवा 1930 वर कॉल करा।"
      ]
    },
    electricity: {
      scamType: "⚡ खोटे वीज बिल कापण्याची धमकी",
      explanation: "स्कॅमर्स वीज कापण्याची धमकी देणारे संदेश पाठवतात. ते तुम्हाला एका वैयक्तिक मोबाईल नंबरवर कॉल करण्यास आणि AnyDesk किंवा TeamViewer सारखे ॲप्स डाऊनलोड करण्यास सांगतात.",
      signals: [
        "बिल न भरल्यामुळे आज रात्री ९:३० वाजता वीज खंडित केली जाईल असा दावा करणे.",
        "अधिकृत हेल्पलाईन ऐवजी वैयक्तिक मोबाईल नंबरवर संपर्क साधण्यास सांगणे.",
        "स्क्रीन शेअरिंग ॲप डाऊनलोड करण्याचा दबाव आणणे."
      ],
      actions: [
        "मेसेजमधील मोबाईल नंबरवर कधीही कॉल करू नका.",
        "नेहमी फक्त अधिकृत ॲप्स किंवा वेबसाईटवरूनच वीज बिल भरा.",
        "कोणाच्याही सांगण्यावरून AnyDesk, TeamViewer किंवा RustDesk डाऊनलोड करू नका."
      ]
    },
    bank_kyc: {
      scamType: "🏦 बँक केवायसी / खाते ब्लॉक होण्याची फसवणूक",
      explanation: "स्कॅमर्स बँक कर्मचारी बनून तुमचे बँक खाते किंवा योनी (YONO) ॲप ब्लॉक झाल्याची धमकी देतात. ते केवायसी अपडेट करण्यासाठी बनावट लिंक्स पाठवून बँक खात्याची माहिती चोरतात.",
      signals: [
        "खाते किंवा डेबिट कार्ड निलंबित करण्याची भीती दाखवणे.",
        "केवायसी अपडेटसाठी संशयास्पद किंवा लहान लिंक्स (उदा. bit.ly, tinyurl) पाठवणे.",
        "ओटीपी (OTP), सीवीवी (CVV) किंवा पासवर्ड मागणे."
      ],
      actions: [
        "बँका केवायसी अपडेटसाठी लिंक्स असलेले मेसेज कधीही पाठवत नाहीत.",
        "अपरिचित किंवा संशयास्पद लिंक्सवर क्लिक करू नका.",
        "संचार साथीच्या 'चक्षु' पोर्टलवर (sancharsaathi.gov.in) या संशयास्पद नंबरची तक्रार नोंदवा."
      ]
    },
    kbc: {
      scamType: "🎉 बनावट केबीसी / व्हॉट्सॲप लॉटरी स्कॅम",
      explanation: "स्कॅमर्स दावा करतात की तुम्ही २५ लाख रुपयांची केबीसी लॉटरी जिंकली आहे. बक्षीस मिळवण्यासाठी ते प्रोसेसिंग फी किंवा जीएसटीच्या नावाखाली पैशांची मागणी करतात.",
      signals: [
        "व्हॉट्सॲपवर आलेला ऑडिओ मेसेज ज्यामध्ये २५ लाखांची लॉटरी लागल्याचा दावा असेल.",
        "टॅक्स किंवा जीएसटीच्या नावाखाली वैयक्तिक बँक खात्यात पैसे भरण्यास सांगणे.",
        "विश्वास मिळवण्यासाठी केबीसी किंवा जिओच्या अधिकृत लोगोचा गैरवापर करणे."
      ],
      actions: [
        "कोणतेही बक्षीस मिळवण्यासाठी कधीही पैसे देऊ नका. ही मागणी १००% बनावट आहे.",
        "आंतरराष्ट्रीय किंवा अनोळखी व्हॉट्सॲप नंबर (+92, +1 इ.) ताबडतोब ब्लॉक करा.",
        "सायबर क्राईम हेल्पलाईन (1930) वर तक्रार नोंदवा."
      ]
    },
    job: {
      scamType: "💼 पार्ट-टाइम जॉब / पानावरून काम करण्याचे आमिष",
      explanation: "स्कॅमर्स युट्युब व्हिडिओ लाईक करणे किंवा हॉटेलचे रिव्ह्यू देणे अशा घरबसल्या सोप्या कामांचे आमिष दाखवतात. ते आधी काही पैसे देऊन विश्वास जिंकतात आणि नंतर मोठ्या पैशांची फसवणूक करतात.",
      signals: [
        "सोप्या कामांसाठी दररोज ₹२०००-₹५००० कमवण्याचे आमिष.",
        "चर्चा तातडीने टेलिग्राम ग्रुपवर वर्ग करणे.",
        "कमाई काढण्यासाठी किंवा व्हीआयपी टास्कसाठी पैसे भरण्याची अट घालणे."
      ],
      actions: [
        "नोकरी मिळवण्यासाठी किंवा स्वतःचे पैसे काढण्यासाठी कधीही फी भरू नका.",
        "टास्क-बेस्ड कामांची ऑफर देणारे टेलिग्राम ग्रुप्स त्वरित ब्लॉक करा.",
        "संचार साथीवर संबंधित युपीआय (UPI) आयडी आणि बँक खात्यांची तक्रार करा."
      ]
    },
    parcel: {
      scamType: "📦 संशयास्पद पार्सल / कस्टम्सची धमकी",
      explanation: "स्कॅमर्स दावा करतात की तुमच्या नावाच्या पार्सलमध्ये अंमली पदार्थ सापडले आहेत. ते कस्टम किंवा पोलीस अधिकारी बनून जेलची भीती दाखवून 'क्लिअरन्स फी' उकळतात.",
      signals: [
        "फेडेक्स किंवा डीएचएल कडून कॉल आल्याचे भासवून पार्सल परत गेल्याचा दावा करणे.",
        "कारवाई टाळण्यासाठी पैसे पाठवण्यास सांगणे.",
        "पैसे न भरल्यास ताबडतोब जेलमध्ये टाकण्याची धमकी देणे."
      ],
      actions: [
        "कॉल त्वरित कट करा. कोणतीही कूरियर कंपनी किंवा सीमा शुल्क विभाग फोनवर पैसे मागत नाही.",
        "कोणत्याही वैयक्तिक युपीआय आयडी किंवा बँक खात्यात पैसे पाठवू नका.",
        "राष्ट्रीय सायबर गुन्हे पोर्टलवर (cybercrime.gov.in) तक्रार नोंदवा."
      ]
    },
    general_scam: {
      scamType: "⚠️ संशयास्पद सायबर फसवणुकीचे संकेत",
      explanation: "ही माहिती भारतात सामान्यतः पाहिली जाणारी फिशिंग, सोशल इंजिनिअरिंग आणि आर्थिक फसवणुकीच्या हाय-रिस्क पॅटर्नशी जुळते. अत्यंत सावधगिरी बाळगा.",
      signals: [
        "अनोळखी स्रोतांकडून तातडीची कारवाई किंवा पैशांची मागणी.",
        "दबाव तंत्राचा वापर करून अधिकृत मार्ग टाळण्याचा प्रयत्न.",
        "सुरक्षा मार्ग आणि पडताळणी प्रणाली टाळून व्यवहार करण्याचा आग्रह."
      ],
      actions: [
        "कोणताही ओटीपी, क्रेडिट कार्ड तपशील किंवा पासवर्ड शेअर करू नका.",
        "अनोळखी लिंक्सवर क्लिक करू नका किंवा संशयास्पद ॲप्स डाऊनलोड करू नका.",
        "संचार साथी पोर्टलच्या माध्यमातून संशयास्पद संपर्क किंवा मेसेजची त्वरित तक्रार करा."
      ]
    },
    safe: {
      scamType: "✅ कमी जोखीम / सामान्य हालचाल",
      explanation: "प्रदान केलेल्या माहितीमध्ये सायबर फसवणुकीचे कोणतेही ठोस संकेत आढळले नाहीत. तरीही, ऑनलाईन माहिती शेअर करताना नेहमी काळजी घ्या.",
      signals: [
        "कोणतीही तातडीची आर्थिक मागणी किंवा दबाव तंत्र आढळले नाही.",
        "स्क्रीन शेअरिंग किंवा संशयास्पद ॲप डाऊनलोड करण्याची कोणतीही मागणी नाही."
      ],
      actions: [
        "सावधगिरी बाळगा आणि संवेदनशील वैयक्तिक माहिती शेअर करणे टाळा.",
        "भविष्यात संशय आल्यास नेत्र AI (Netra AI) वर पुन्हा तपासणी करा."
      ]
    }
  }
};

function detectScamType(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('digital arrest') || t.includes('arrest') || t.includes('cbi') || t.includes('police') || t.includes('narcotics') || t.includes('court') || t.includes('jail') || t.includes('money laundering') || t.includes('skype') || t.includes('officer')) {
    return 'digital_arrest';
  }
  if (t.includes('electricity') || t.includes('disconnection') || t.includes('power cut') || t.includes('bill') || t.includes('mseb') || t.includes('bescom') || t.includes('mahadiscom')) {
    return 'electricity';
  }
  if (t.includes('kyc') || t.includes('blocked') || t.includes('update kyc') || t.includes('pan card') || t.includes('yono') || t.includes('sbi') || t.includes('otp') || t.includes('verification') || t.includes('icici') || t.includes('hdfc')) {
    return 'bank_kyc';
  }
  if (t.includes('kbc') || t.includes('lottery') || t.includes('prize') || t.includes('won') || t.includes('crorepati')) {
    return 'kbc';
  }
  if (t.includes('job') || t.includes('part-time') || t.includes('part time') || t.includes('telegram task') || t.includes('youtube video') || t.includes('work from home') || t.includes('salary') || t.includes('earn money')) {
    return 'job';
  }
  if (t.includes('parcel') || t.includes('fedex') || t.includes('customs') || t.includes('mdma') || t.includes('illegal package') || t.includes('drugs') || t.includes('dhl') || t.includes('courier')) {
    return 'parcel';
  }
  if (t.length < 15 || t.includes('not a scam') || t.includes('safe') || t.includes('hello') || t.includes('thank you') || t.includes('good morning')) {
    return 'safe';
  }
  return 'general_scam';
}

function getRiskScoreAndLevel(scamKey: string): { riskScore: number; riskLevel: string } {
  switch (scamKey) {
    case 'digital_arrest':
      return { riskScore: 95, riskLevel: 'CRITICAL' };
    case 'electricity':
      return { riskScore: 85, riskLevel: 'HIGH' };
    case 'bank_kyc':
      return { riskScore: 90, riskLevel: 'HIGH' };
    case 'kbc':
      return { riskScore: 88, riskLevel: 'HIGH' };
    case 'job':
      return { riskScore: 87, riskLevel: 'HIGH' };
    case 'parcel':
      return { riskScore: 94, riskLevel: 'CRITICAL' };
    case 'general_scam':
      return { riskScore: 75, riskLevel: 'HIGH' };
    case 'safe':
    default:
      return { riskScore: 12, riskLevel: 'LOW' };
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  // API endpoint: Call analysis
  app.post('/api/analyze-call', async (req, res) => {
    const { description, language = 'en' } = req.body;
    if (!description || typeof description !== 'string') {
      res.status(400).json({ error: 'Call description is required.' });
      return;
    }

    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('Gemini API key is not configured on the server.');
      }

      const langInstruction = getLanguageInstruction(language);

      const prompt = `You are an expert Indian cyber crime security specialist specializing in identifying phone fraud.
Analyze the following description of a suspicious phone call received by an Indian citizen:

"${description}"

Determine if this is a scam, evaluate the risk score (0-100), risk level (LOW, MEDIUM, HIGH, CRITICAL), identify the likely scam type (e.g., Digital Arrest, KYC Update Fraud, Electricity Bill scam, CBI/Police Impersonation, Lottery Scam, Bank OTP Scam, or Safe/No Scam), describe the primary warning signs (signals), and recommend clear immediate actions.

Keep recommendations highly practical, mentioning official helplines like the Indian cyber crime portal helpline (1930) or Sanchar Saathi.

${langInstruction}`;

      const response = await generateContentWithQuotaFallback({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskScore: {
                type: Type.INTEGER,
                description: 'Risk score from 0 (completely safe) to 100 (confirmed cyber fraud).',
              },
              riskLevel: {
                type: Type.STRING,
                description: 'Risk level: LOW, MEDIUM, HIGH, or CRITICAL.',
              },
              scamType: {
                type: Type.STRING,
                description: 'Name of the likely scam, or "No Scam / Legitimate" if safe.',
              },
              explanation: {
                type: Type.STRING,
                description: 'A 2-3 sentence explanation explaining the scam tactic used (or why it is safe).',
              },
              signals: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Specific warning signals/red flags spotted in the description. Limit to 3-5 key points.',
              },
              actions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Immediate specific step-by-step actions for the victim. Limit to 3-5 points.',
              },
            },
            required: ['riskScore', 'riskLevel', 'scamType', 'explanation', 'signals', 'actions'],
          },
        },
      });

      const jsonStr = response.text?.trim() || '{}';
      const analysis = JSON.parse(jsonStr);
      res.json({ ...analysis, isFallback: false });
    } catch (error: any) {
      console.error('Gemini Call Analysis error:', error.message || error);
      if (error instanceof QuotaExceededError || 
          String(error.message || error || '').toUpperCase().includes('QUOTA') || 
          String(error.message || error || '').toUpperCase().includes('RESOURCE_EXHAUSTED') || 
          String(error.message || error || '').toUpperCase().includes('429')) {
        res.status(429).json({
          error: "AI_QUOTA_EXCEEDED",
          message: "The available AI analysis limit has been reached."
        });
      } else {
        res.status(500).json({
          error: "AI_ANALYSIS_FAILED",
          message: "AI analysis is temporarily unavailable. Please try again later."
        });
      }
    }
  });

  // API endpoint: WhatsApp screenshot analysis
  app.post('/api/analyze-screenshot', async (req, res) => {
    const { imageBase64, mimeType, language = 'en' } = req.body;
    if (!imageBase64 || !mimeType) {
      res.status(400).json({ error: 'Image base64 data and mimeType are required.' });
      return;
    }

    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('Gemini API key is not configured on the server.');
      }

      const imagePart = {
        inlineData: {
          mimeType: mimeType,
          data: imageBase64,
        },
      };

      const langInstruction = getLanguageInstruction(language);

      const prompt = `You are an expert Indian cyber crime security specialist. Analyze this WhatsApp screenshot which may contain a scam (such as part-time job fraud, lottery/KBC scam, KYC warning, fake parcel/customs threats, dangerous links, impersonation, or money requests).
Read the visible message text from the image, extract it exactly, and analyze the content for fraud. Do not analyze only the image filename. Do not return mock results.

In your analysis, detect and examine:
- Suspicious URLs or unverified links
- Sense of urgency or time-sensitive threats (e.g., transfer before a certain time, disconnection warnings)
- Threats or fear tactics (e.g., digital arrest, police involvement)
- Impersonation of trusted entities (e.g., KBC, Jio, CBI, Police, Custom Duty, HR officers)
- Financial requests, fees, or money transfers

Output your analysis strictly in the provided JSON schema.

${langInstruction}`;

      const response = await generateContentWithQuotaFallback({
        model: 'gemini-3.5-flash',
        contents: [
          imagePart,
          { text: prompt },
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskScore: {
                type: Type.INTEGER,
                description: 'Risk score from 0 (completely safe) to 100 (confirmed fraud).',
              },
              riskLevel: {
                type: Type.STRING,
                description: 'Risk level: LOW, MEDIUM, HIGH, or CRITICAL.',
              },
              scamType: {
                type: Type.STRING,
                description: 'Identified scam type or "Safe / Legitimate".',
              },
              extractedText: {
                type: Type.STRING,
                description: 'The exact visible message text extracted from the screenshot.',
              },
              explanation: {
                type: Type.STRING,
                description: 'A 2-3 sentence explanation of the detected threat.',
              },
              signals: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Warning signals/red flags found in the screenshot.',
              },
              actions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Immediate actionable safety recommendations.',
              },
            },
            required: ['riskScore', 'riskLevel', 'scamType', 'extractedText', 'explanation', 'signals', 'actions'],
          },
        },
      });

      const jsonStr = response.text?.trim() || '{}';
      const analysis = JSON.parse(jsonStr);
      res.json({ ...analysis, isFallback: false });
    } catch (error: any) {
      console.error('Gemini Screenshot Analysis error:', error.message || error);
      if (error instanceof QuotaExceededError || 
          String(error.message || error || '').toUpperCase().includes('QUOTA') || 
          String(error.message || error || '').toUpperCase().includes('RESOURCE_EXHAUSTED') || 
          String(error.message || error || '').toUpperCase().includes('429')) {
        res.status(429).json({
          error: "AI_QUOTA_EXCEEDED",
          message: "The available AI analysis limit has been reached."
        });
      } else {
        res.status(500).json({
          error: "AI_ANALYSIS_FAILED",
          message: "AI analysis is temporarily unavailable. Please try again later."
        });
      }
    }
  });

  // API endpoint: Currency note visual risk screening
  app.post('/api/analyze-currency', async (req, res) => {
    const { imageBase64, mimeType, language = 'en' } = req.body;
    if (!imageBase64 || !mimeType) {
      res.status(400).json({ error: 'Image base64 data and mimeType are required.' });
      return;
    }

    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('Gemini API key is not configured on the server.');
      }

      const imagePart = {
        inlineData: {
          mimeType: mimeType,
          data: imageBase64,
        },
      };

      const langInstruction = getLanguageInstruction(language);

      const prompt = `You are an expert Indian currency visual screening specialist. Analyze this image of an Indian bank note (INR) for preliminary visual risk screening.
Do not return mock results. Inspect the note for obvious signs of being fake, counterfeit, toy money, play money, or a prank note.
Look for:
- Prank labels: Text such as "Children Bank of India", "Churan Label", "Bharatiya Manoranjan Bank", "Full of Fun", fake signatures, or lack of watermark.
- Toy hallmarks, copy markers, or standard print issues.
- Wrong colors, odd denomination styles, or lack of standard security details.

Evaluate:
- riskScore: 0 (completely standard authentic-looking) to 100 (confirmed play money, prank note, or counterfeit).
- riskLevel: LOW, MEDIUM, HIGH, or CRITICAL.
- scamType: What kind of anomaly is detected (e.g., "Prank Note (Children Bank)", "Suspected Counterfeit", "Toy Play Money", or "Standard Currency Note").

In "extractedText", extract any text printed on the note, especially prank markings like "Children Bank", "Churan", or "Manoranjan".

${langInstruction}`;

      const response = await generateContentWithQuotaFallback({
        model: 'gemini-3.5-flash',
        contents: [
          imagePart,
          { text: prompt },
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskScore: {
                type: Type.INTEGER,
                description: 'Risk score from 0 to 100.',
              },
              riskLevel: {
                type: Type.STRING,
                description: 'Risk level: LOW, MEDIUM, HIGH, or CRITICAL.',
              },
              scamType: {
                type: Type.STRING,
                description: 'Assessment category (e.g. Prank Note, Suspected Counterfeit, or Standard Note).',
              },
              extractedText: {
                type: Type.STRING,
                description: 'Any notable text found printed on the note, or empty if none.',
              },
              explanation: {
                type: Type.STRING,
                description: 'A 2-3 sentence visual assessment of why the note is flagged or why it seems clean.',
              },
              signals: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Specific visual warning signals or anomalies spotted on the note.',
              },
              actions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Immediate recommended actions (e.g. do not accept, return to bank).',
              },
            },
            required: ['riskScore', 'riskLevel', 'scamType', 'extractedText', 'explanation', 'signals', 'actions'],
          },
        },
      });

      const jsonStr = response.text?.trim() || '{}';
      const analysis = JSON.parse(jsonStr);
      res.json({ ...analysis, isFallback: false });
    } catch (error: any) {
      console.error('Gemini Currency Analysis error:', error.message || error);
      if (error instanceof QuotaExceededError || 
          String(error.message || error || '').toUpperCase().includes('QUOTA') || 
          String(error.message || error || '').toUpperCase().includes('RESOURCE_EXHAUSTED') || 
          String(error.message || error || '').toUpperCase().includes('429')) {
        res.status(429).json({
          error: "AI_QUOTA_EXCEEDED",
          message: "The available AI analysis limit has been reached."
        });
      } else {
        res.status(500).json({
          error: "AI_ANALYSIS_FAILED",
          message: "AI analysis is temporarily unavailable. Please try again later."
        });
      }
    }
  });

  // --- Fraud News & Alerts API ---
  interface NewsCache {
    timestamp: number;
    articles: any[];
  }

  let cachedNews: NewsCache | null = null;
  const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  function decodeXmlEntities(str: string): string {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1') // CDATA unwrap
      .trim();
  }

  const CATEGORY_IMAGES: Record<string, string[]> = {
    'Digital Arrest': [
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=600&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1601597111158-2fceff270190?w=600&auto=format&fit=crop&q=60"
    ],
    'UPI Fraud': [
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1563013544-824ae1d704d3?w=600&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=600&auto=format&fit=crop&q=60"
    ],
    'WhatsApp Scam': [
      "https://images.unsplash.com/photo-1614680376593-902f74fa0d41?w=600&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=600&auto=format&fit=crop&q=60"
    ],
    'Investment Scam': [
      "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=600&auto=format&fit=crop&q=60"
    ],
    'Job Scam': [
      "https://images.unsplash.com/photo-1521898284481-a5ec348cb555?w=600&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=60"
    ],
    'Phishing': [
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=600&auto=format&fit=crop&q=60"
    ],
    'Bank Fraud': [
      "https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=600&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1601597111158-2fceff270190?w=600&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1589758438368-0ad531db3366?w=600&auto=format&fit=crop&q=60"
    ],
    'Identity Theft': [
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60"
    ],
    'Other Cyber Fraud': [
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=600&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=600&auto=format&fit=crop&q=60"
    ]
  };

  function getCategoryImage(category: string, title: string): string {
    const images = CATEGORY_IMAGES[category] || CATEGORY_IMAGES['Other Cyber Fraud'];
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % images.length;
    return images[idx];
  }

  function categorizeArticle(title: string, description: string): string {
    const text = `${title} ${description}`.toLowerCase();
    
    if (text.includes('digital arrest') || text.includes('police impersonation') || text.includes('cbi impersonation')) {
      return 'Digital Arrest';
    }
    if (text.includes('upi') || text.includes('gpay') || text.includes('phonepe') || text.includes('paytm') || text.includes('upi fraud')) {
      return 'UPI Fraud';
    }
    if (text.includes('whatsapp') || text.includes('wa scam') || text.includes('telegram task')) {
      return 'WhatsApp Scam';
    }
    if (text.includes('investment') || text.includes('trading') || text.includes('stock market') || text.includes('crypto') || text.includes('bitcoin')) {
      return 'Investment Scam';
    }
    if (text.includes('job') || text.includes('part-time') || text.includes('part time') || text.includes('work from home') || text.includes('task fraud')) {
      return 'Job Scam';
    }
    if (text.includes('phishing') || text.includes('fake link') || text.includes('sms block') || text.includes('kyc block') || text.includes('card block') || text.includes('yono')) {
      return 'Phishing';
    }
    if (text.includes('bank') || text.includes('credit card') || text.includes('atm') || text.includes('card fraud') || text.includes('account freeze')) {
      return 'Bank Fraud';
    }
    if (text.includes('identity') || text.includes('aadhaar') || text.includes('pan card') || text.includes('impersonation') || text.includes('profile clone')) {
      return 'Identity Theft';
    }
    
    return 'Other Cyber Fraud';
  }

  async function fetchGoogleNewsRSS(): Promise<any[]> {
    const url = "https://news.google.com/rss/search?q=cyber+fraud+India+OR+online+scam+India+OR+digital+arrest+scam+OR+UPI+fraud+OR+bank+fraud+India&hl=en-IN&gl=IN&ceid=IN:en";
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
        }
      });
      if (!res.ok) throw new Error(`Failed to fetch RSS: ${res.status}`);
      const xml = await res.text();
      
      const items: any[] = [];
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      let match;
      
      while ((match = itemRegex.exec(xml)) !== null) {
        const itemContent = match[1];
        
        const titleMatch = itemContent.match(/<title>([\s\S]*?)<\/title>/);
        const linkMatch = itemContent.match(/<link>([\s\S]*?)<\/link>/);
        const pubDateMatch = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
        const sourceMatch = itemContent.match(/<source[^>]*>([\s\S]*?)<\/source>/);
        
        let rawTitle = titleMatch ? titleMatch[1] : "";
        const url = linkMatch ? linkMatch[1] : "";
        const pubDate = pubDateMatch ? pubDateMatch[1] : new Date().toISOString();
        let source = sourceMatch ? sourceMatch[1] : "Google News";
        
        rawTitle = decodeXmlEntities(rawTitle);
        source = decodeXmlEntities(source);
        
        let headline = rawTitle;
        const lastHyphen = rawTitle.lastIndexOf(" - ");
        if (lastHyphen !== -1) {
          headline = rawTitle.substring(0, lastHyphen).trim();
          const detectedSource = rawTitle.substring(lastHyphen + 3).trim();
          if (detectedSource) {
            source = detectedSource;
          }
        }
        
        const description = `Recent report regarding ${headline.toLowerCase()} from ${source}.`;
        
        items.push({
          title: headline,
          url: url,
          publishedAt: new Date(pubDate).toISOString(),
          description: description,
          source: source,
          urlToImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=60"
        });
      }
      
      return items;
    } catch (err) {
      console.error("Google News RSS parsing error:", err);
      throw err;
    }
  }

  app.get('/api/news', async (req, res) => {
    const forceRefresh = req.query.forceRefresh === 'true';
    const now = Date.now();
    
    if (!forceRefresh && cachedNews && (now - cachedNews.timestamp < CACHE_DURATION)) {
      res.json({ articles: cachedNews.articles, cachedAt: cachedNews.timestamp });
      return;
    }
    
    try {
      let rawArticles: any[] = [];
      
      if (process.env.NEWS_API_KEY) {
        const combinedQuery = '("cyber fraud" OR "online scam" OR "digital arrest" OR "UPI fraud" OR "bank fraud" OR "phishing" OR "investment scam" OR "job scam" OR "WhatsApp scam") AND India';
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(combinedQuery)}&language=en&sortBy=publishedAt&pageSize=40&apiKey=${process.env.NEWS_API_KEY}`;
        
        try {
          const response = await fetch(url, { headers: { 'User-Agent': 'aistudio-build' } });
          if (response.ok) {
            const data = await response.json();
            if (data.status === 'ok' && Array.isArray(data.articles)) {
              rawArticles = data.articles.map((art: any) => ({
                title: art.title,
                url: art.url,
                publishedAt: art.publishedAt || new Date().toISOString(),
                description: art.description || '',
                source: art.source?.name || 'News',
                urlToImage: art.urlToImage || "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=60"
              }));
            }
          }
        } catch (e) {
          console.warn("Failed fetching from NewsAPI.org, will try fallback RSS:", e);
        }
      }
      
      if (rawArticles.length === 0) {
        rawArticles = await fetchGoogleNewsRSS();
      }
      
      let processedArticles = rawArticles
        .filter(art => art && art.title && art.url)
        .map(art => {
          let cleanedTitle = art.title.replace(/<\/?[^>]+(>|$)/g, "");
          let cleanedDesc = (art.description || '').replace(/<\/?[^>]+(>|$)/g, "");
          const category = categorizeArticle(cleanedTitle, cleanedDesc);
          
          const hasImage = art.urlToImage && 
                           art.urlToImage !== "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=60" &&
                           art.urlToImage.trim() !== "";
                           
          const image = hasImage ? art.urlToImage : getCategoryImage(category, cleanedTitle);
          
          return {
            title: cleanedTitle,
            url: art.url,
            publishedAt: art.publishedAt,
            description: cleanedDesc || `Recent alert regarding cybersecurity issues related to ${cleanedTitle.toLowerCase()}.`,
            source: art.source || 'News',
            urlToImage: image,
            category: category
          };
        });
        
      const seenUrls = new Set<string>();
      const seenTitles = new Set<string>();
      processedArticles = processedArticles.filter(art => {
        const normUrl = art.url.toLowerCase().trim();
        const normTitle = art.title.toLowerCase().trim();
        if (seenUrls.has(normUrl) || seenTitles.has(normTitle)) {
          return false;
        }
        seenUrls.add(normUrl);
        seenTitles.add(normTitle);
        return true;
      });
      
      processedArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      processedArticles = processedArticles.slice(0, 20);
      
      if (processedArticles.length === 0) {
        throw new Error('No articles found');
      }

      // Ensure that every news article has a completely unique image
      const UNIQUE_FALLBACK_IMAGES = [
        "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1601597111158-2fceff270190?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1563013544-824ae1d704d3?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1614680376593-902f74fa0d41?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1521898284481-a5ec348cb555?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1589758438368-0ad531db3366?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1624969862644-791f3dc98927?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1526374865140-144b19798240?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1496096265110-f83ad7f96608?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=600&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=600&auto=format&fit=crop&q=60"
      ];

      const usedImages = new Set<string>();
      let fallbackIndex = 0;

      processedArticles = processedArticles.map((art) => {
        let finalImage = art.urlToImage;
        const isCommonPlaceholder = 
          !finalImage || 
          finalImage === "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=60" ||
          finalImage.trim() === "";

        if (isCommonPlaceholder || usedImages.has(finalImage)) {
          const catImages = CATEGORY_IMAGES[art.category] || CATEGORY_IMAGES['Other Cyber Fraud'];
          let found = false;
          for (const imgUrl of catImages) {
            if (!usedImages.has(imgUrl)) {
              finalImage = imgUrl;
              found = true;
              break;
            }
          }
          if (!found) {
            while (fallbackIndex < UNIQUE_FALLBACK_IMAGES.length) {
              const imgUrl = UNIQUE_FALLBACK_IMAGES[fallbackIndex];
              fallbackIndex++;
              if (!usedImages.has(imgUrl)) {
                finalImage = imgUrl;
                found = true;
                break;
              }
            }
          }
          if (!found) {
            finalImage = UNIQUE_FALLBACK_IMAGES[Math.floor(Math.random() * UNIQUE_FALLBACK_IMAGES.length)];
          }
        }
        
        usedImages.add(finalImage);
        return {
          ...art,
          urlToImage: finalImage
        };
      });
      
      cachedNews = {
        timestamp: now,
        articles: processedArticles
      };
      
      res.json({ articles: processedArticles, cachedAt: now });
    } catch (error: any) {
      console.error('Error in /api/news:', error);
      res.status(500).json({ error: error.message || 'Latest fraud news is temporarily unavailable. Please try again.' });
    }
  });

  app.post('/api/summarize-news', async (req, res) => {
    const { title, description, language = 'en' } = req.body;
    if (!title) {
      res.status(400).json({ error: 'Article title is required.' });
      return;
    }
    
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('Gemini API key is not configured on the server.');
      }
      
      const targetLangName = language === 'hi' ? 'Hindi (हिंदी)' : language === 'mr' ? 'Marathi (मराठी)' : 'English';
      
      const prompt = `You are a cybersecurity expert summarizing a cyber fraud news article for a general citizen.
Please summarize the following news article title and description in exactly 2-3 bullet points or a short, cohesive paragraph (no more than 80 words) in ${targetLangName}.
Ensure the tone is informative, cautious, and easy to understand. Focus on what happened and the direct lesson or advisory.

Article Title: "${title}"
Article Description: "${description || ''}"

Return ONLY the plain-text summary in ${targetLangName} without any formatting prefix (e.g. do not start with "Here is a summary:").`;

      const response = await generateContentWithQuotaFallback({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      
      const summaryText = response.text?.trim() || 'No summary available.';
      res.json({ summary: summaryText });
    } catch (error: any) {
      console.warn('Gemini news summarization error, using local fallback:', error);
      const isHi = language === 'hi';
      const isMr = language === 'mr';
      const fallbackSummary = isHi 
        ? `इस सुरक्षा अलर्ट ("${title}") के अनुसार, साइबर अपराधियों द्वारा नए पैटर्नों का उपयोग करके नागरिकों को लक्षित किया जा रहा है। हमेशा सतर्क रहें, अनधिकृत लिंक पर क्लिक करने से बचें, और संदिग्ध घटनाओं की रिपोर्ट 1930 पर करें।`
        : isMr 
        ? `या सुरक्षा अलर्टनुसार ("${title}"), सायबर गुन्हेगारांद्वारे नवीन मार्गांनी नागरिकांना लक्ष्य केले जात आहे. नेहमी सतर्क राहा, अनोळखी लिंक्सवर क्लिक करू नका, आणि सायबर फसवणुकीची तक्रार 1930 वर नोंदवा.`
        : `According to this security alert ("${title}"), cyber criminals are targeting citizens using evolving fraud methods. Stay vigilant, never click on unsolicited web links, and report any suspicious activity immediately via the national helpline 1930.`;
        
      res.json({ summary: fallbackSummary, isFallback: true });
    }
  });

  // Chat system instruction helper
  const getChatSystemInstruction = (language: string) => {
    const langMap: Record<string, string> = {
      en: 'English (Indian English context)',
      hi: 'Hindi (हिंदी - clean, natural, simple colloquial Hindi, avoiding over-formal words)',
      mr: 'Marathi (मराठी - clean, natural, simple colloquial Marathi, avoiding over-formal words)'
    };
    const targetLang = langMap[language] || 'English';

    return `You are "Citizen Help Assistant", a simple and human-looking public service helpdesk AI. Your purpose is to help ordinary Indian citizens understand what to do after experiencing or suspecting cyber fraud. You are NOT a general-purpose AI.

Strictly adhere to the following safety, behavioral, and language rules:

LANGUAGE RULE:
- You must speak, understand, and respond entirely in the language: ${targetLang}.
- Use clean, natural, simple, and citizen-friendly language. Avoid complicated legal, bureaucratic, and cybersecurity jargon. If a technical term is necessary, explain it briefly and simply.

FOCUS & SCOPE:
- Help users with: How to report cyber fraud/online financial fraud, approaching local police or cyber cell, what evidence to preserve, what complaint details are needed, using the National Cyber Crime Reporting Portal (https://www.cybercrime.gov.in/), when to call helpline 1930, immediate safety actions, tracking complaints, and basic safety.
- If the user asks about anything outside of cybercrime reporting, safety, or basic cybersecurity, politely refuse and guide them back to cyber safety help.

BEHAVIORAL RULES:
- First, understand the citizen's situation. Ask short, simple, and gentle questions one at a time if details are missing.
- Guide the citizen ONE STEP AT A TIME. Do not provide huge paragraphs or long bulleted lists of 10 items unless they specifically ask for deep details. Keep responses short, empathetic, and highly actionable.
- If the user mentions financial fraud (e.g. money transferred, deducted, UPI, bank, card, wallet fraud, investment scam payment, unauthorized transaction):
  - URGENTLY prioritize reporting. Tell them immediately to call the cyber financial fraud helpline 1930 and contact their bank or payment provider.
  - Explain that acting quickly is extremely important. Do NOT guarantee that money will be recovered, but encourage acting fast.
- Provide the URL of the official National Cyber Crime Reporting Portal exactly as: https://www.cybercrime.gov.in/
- Do not pretend to submit any complaint for them, and do not claim Citizen Fraud Shield is connected to the government portal.

COMPLAINT PREPARATION:
- Help the user organize their incident details. If they have shared or you have asked and collected basic facts (e.g. what happened, when, amount, payment method, evidence, suspect details), generate a summary box clearly labeled:
  "Complaint Preparation Summary" (or its translation in Hindi/Marathi: "शिकायत तैयारी सारांश" for Hindi, "तक्रार तयारी सारांश" के लिए मराठी).
  Under this heading, include a clear disclaimer: "This is a draft to help you organise the incident details. Review all information before submitting it to police or an official cybercrime portal." (Translate this disclaimer into Hindi/Marathi as well if speaking in those languages).
  Do NOT call it an FIR or an official police complaint.

CRITICAL SAFETY RULES:
- NEVER claim to be a police officer, lawyer, or government official.
- NEVER claim government approval or connection.
- NEVER guarantee money recovery or police action.
- NEVER generate fake complaint/FIR numbers or references.
- NEVER invent local police contact numbers or cell addresses. If exact local details are unavailable, state clearly that you do not have them.
- NEVER ask for passwords, OTPs, UPI PINs, ATM PINs, CVV numbers, or full banking credentials. If the user accidentally sends them, warn them to change them immediately and never share them.`;
  };

  app.post('/api/help-chat', async (req, res) => {
    const { messages, language = 'en' } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Conversation history is required.' });
      return;
    }

    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('Gemini API key is not configured on the server.');
      }

      const contents = messages.map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : m.role,
        parts: [{ text: m.content }]
      }));

      const systemInstruction = getChatSystemInstruction(language);

      const response = await generateContentWithQuotaFallback({
        model: 'gemini-3.5-flash',
        contents: contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const responseText = response.text || '';
      res.json({ reply: responseText });
    } catch (error: any) {
      console.error('Error in /api/help-chat:', error);
      res.status(503).json({ error: 'Help Assistant is currently unavailable due to AI quota limits or service issues.' });
    }
  });

  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Run Vite in middleware mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  const port = 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Citizen Fraud Shield server running at http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Citizen Fraud Shield server:', err);
});
