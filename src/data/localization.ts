export interface LocaleData {
  appName: string;
  home: string;
  heroTitle: string;
  heroSubtitle: string;
  backToHome: string;
  selectLanguage: string;
  
  // Cards
  cardCallTitle: string;
  cardCallDesc: string;
  cardCallBtn: string;
  
  cardScreenshotTitle: string;
  cardScreenshotDesc: string;
  cardScreenshotBtn: string;
  
  cardCurrencyTitle: string;
  cardCurrencyDesc: string;
  cardCurrencyBtn: string;
  
  // Analyzer Pages
  callAnalyzerTitle: string;
  callAnalyzerSub: string;
  callLabel: string;
  callPlaceholder: string;
  callLength: string;
  callClear: string;
  callPresetLabel: string;
  
  screenshotAnalyzerTitle: string;
  screenshotAnalyzerSub: string;
  screenshotUploadLabel: string;
  screenshotUploadHint: string;
  screenshotDelete: string;
  screenshotPresetLabel: string;
  
  currencyAnalyzerTitle: string;
  currencyAnalyzerSub: string;
  currencyUploadLabel: string;
  currencyUploadHint: string;
  currencyDelete: string;
  currencyScannerDisclaimer: string;
  
  // Loading
  loadingCall: string;
  loadingScreenshot: string;
  loadingCurrency: string;
  loadingSubtitle: string;
  
  // Results
  resultTitle: string;
  riskScore: string;
  riskLevel: string;
  scamType: string;
  summary: string;
  whyFlagged: string;
  whatToDo: string;
  actionItem: string;
  signalItem: string;
  evidence: string;
  explanation: string;
  officialWarning: string;
  shareWarning: string;
  copiedText: string;
  extractedTextTitle: string;
  
  // Risk Levels
  riskLow: string;
  riskMedium: string;
  riskHigh: string;
  riskCritical: string;
  riskInconclusive: string;
  
  // Error
  errorHeading: string;
  errorReset: string;
  errorNoInputCall: string;
  errorNoInputScreenshot: string;
  errorNoInputCurrency: string;
  errorImageUploadType: string;
  
  // Presets Titles
  presetDigitalArrestTitle: string;
  presetElectricityTitle: string;
  presetKbcTitle: string;

  // Fraud News and Alerts
  navFraudNews: string;
  sectionNewsTitle: string;
  sectionNewsDesc: string;
  btnViewAllNews: string;
  btnReadFullArticle: string;
  btnRetry: string;
  btnRefresh: string;
  lblLoadingNews: string;
  lblNewsUnavailable: string;
  lblSearchPlaceholder: string;
  lblFilterAll: string;
  lblCategoryDigitalArrest: string;
  lblCategoryBankFraud: string;
  lblCategoryUpiFraud: string;
  lblCategoryWhatsAppScam: string;
  lblCategoryInvestmentScam: string;
  lblCategoryJobScam: string;
  lblCategoryPhishing: string;
  lblCategoryIdentityTheft: string;
  lblCategoryOtherCyberFraud: string;
  lblAiSummary: string;
  lblGeneratingSummary: string;
  btnGetAiSummary: string;
  prototypeDisclaimer: string;
  navHelpAssistant: string;
  homeHelpHeading: string;
  homeHelpDesc: string;
  homeHelpBtn: string;
  chatTitle: string;
  chatSubheading: string;
  chatDisclaimer: string;
  chatPlaceholder: string;
  chatSuggestedHeading: string;
  chatDisclaimerFooter: string;
  chatSend: string;
  chatReset: string;
  chatErrTitle: string;
  chatErrDesc: string;
  chatErrCall1930: string;
  chatErrOpenPortal: string;
}

export const LOCALIZATION: Record<'en' | 'hi' | 'mr', LocaleData> = {
  en: {
    appName: "Netra AI",
    home: "Home",
    heroTitle: "Check suspicious activity before you act",
    heroSubtitle: "Analyze suspicious calls, messages and currency notes using AI-assisted risk screening.",
    backToHome: "Back to Home",
    selectLanguage: "Language",
    
    // Cards
    cardCallTitle: "Suspicious Call",
    cardCallDesc: "Describe a suspicious phone call and check for common fraud patterns.",
    cardCallBtn: "Analyze Call",
    
    cardScreenshotTitle: "WhatsApp Message",
    cardScreenshotDesc: "Upload a message screenshot to identify suspicious links, threats and scam patterns.",
    cardScreenshotBtn: "Check Screenshot",
    
    cardCurrencyTitle: "Currency Note",
    cardCurrencyDesc: "Upload a clear note image for preliminary visual risk screening.",
    cardCurrencyBtn: "Scan Note",
    
    // Analyzer Pages
    callAnalyzerTitle: "Suspicious Call Analyzer",
    callAnalyzerSub: "Describe a suspicious phone call and check for common fraud patterns.",
    callLabel: "Describe what the caller said, or paste a call transcript:",
    callPlaceholder: "Provide details. E.g. They claimed they are calling from Mumbai Police/CBI and that my Aadhaar is linked to illegal parcels caught at the airport. They threatened me with digital arrest.",
    callLength: "Length",
    callClear: "Clear Text",
    callPresetLabel: "Select a standard incident report to prefill:",
    
    screenshotAnalyzerTitle: "WhatsApp Screenshot Analyzer",
    screenshotAnalyzerSub: "Upload a message screenshot to identify suspicious links, threats and scam patterns.",
    screenshotUploadLabel: "Browse Chat Screenshot Image",
    screenshotUploadHint: "PNG, JPG, or JPEG up to 10MB",
    screenshotDelete: "Delete",
    screenshotPresetLabel: "Select a standard digital scam screenshot preset:",
    
    currencyAnalyzerTitle: "Currency Note Scanner",
    currencyAnalyzerSub: "Upload a clear note image for preliminary visual risk screening.",
    currencyUploadLabel: "Browse Currency Note Image",
    currencyUploadHint: "PNG, JPG, or JPEG up to 10MB. Make sure the note is flat and well-lit.",
    currencyDelete: "Delete",
    currencyScannerDisclaimer: "Important Notice: This tool provides preliminary visual risk screening of Indian banknotes based on visual features. It does not replace physical examinations or official vetting. Genuine notes should be handled in accordance with RBI guidelines.",
    
    // Loading
    loadingCall: "Checking the information...",
    loadingScreenshot: "Reviewing suspicious patterns...",
    loadingCurrency: "Analyzing the uploaded image...",
    loadingSubtitle: "Vetting conversation details, urgency signals, and visual indicators.",
    
    // Results
    resultTitle: "Screening Report",
    riskScore: "Risk Score",
    riskLevel: "Risk Level",
    scamType: "Possible Scam Type",
    summary: "Summary",
    whyFlagged: "Why this was flagged",
    whatToDo: "What you should do now",
    actionItem: "ACTION ITEM",
    signalItem: "SIGNAL",
    evidence: "Evidence",
    explanation: "Explanation",
    officialWarning: "Official Warning: Always file your formal cyber complaint securely at cybercrime.gov.in or call 1930.",
    shareWarning: "Share Warning Alert",
    copiedText: "Report Copied!",
    extractedTextTitle: "Extracted Text from Image",
    
    // Risk Levels
    riskLow: "Low Risk",
    riskMedium: "Medium Risk",
    riskHigh: "High Risk",
    riskCritical: "Critical Risk",
    riskInconclusive: "Inconclusive",
    
    // Error
    errorHeading: "Analysis Halted",
    errorReset: "Reset and Try Again",
    errorNoInputCall: "Please describe the phone call first.",
    errorNoInputScreenshot: "Please upload a screenshot first.",
    errorNoInputCurrency: "Please upload a currency note image first.",
    errorImageUploadType: "Please upload an image file (PNG, JPG, or JPEG).",
    
    // Presets
    presetDigitalArrestTitle: "🚨 Digital Arrest (CBI / Mumbai Police Impersonation)",
    presetElectricityTitle: "⚡ Electricity Bill Disconnection Scam",
    presetKbcTitle: "🎉 Fake KBC Lottery Claim on WhatsApp",

    // Fraud News and Alerts
    navFraudNews: "Fraud News",
    sectionNewsTitle: "Latest Fraud Alerts",
    sectionNewsDesc: "Stay informed about recent online scams, cyber fraud and financial fraud incidents.",
    btnViewAllNews: "View All Fraud News",
    btnReadFullArticle: "Read Full Article",
    btnRetry: "Retry",
    btnRefresh: "Refresh",
    lblLoadingNews: "Loading latest fraud alerts...",
    lblNewsUnavailable: "Latest fraud news is temporarily unavailable. Please try again.",
    lblSearchPlaceholder: "Search fraud news",
    lblFilterAll: "All",
    lblCategoryDigitalArrest: "Digital Arrest",
    lblCategoryBankFraud: "Bank Fraud",
    lblCategoryUpiFraud: "UPI Fraud",
    lblCategoryWhatsAppScam: "WhatsApp",
    lblCategoryInvestmentScam: "Investment",
    lblCategoryJobScam: "Job Scam",
    lblCategoryPhishing: "Phishing",
    lblCategoryIdentityTheft: "Identity Theft",
    lblCategoryOtherCyberFraud: "Other Cyber Fraud",
    lblAiSummary: "AI Summary",
    lblGeneratingSummary: "Generating AI summary...",
    btnGetAiSummary: "Summarize with AI",
    prototypeDisclaimer: "Prototype Disclaimer: Citizen Fraud Shield is an experimental hackathon prototype that uses AI-assisted analysis. AI-generated results may occasionally be incomplete, inaccurate, or incorrect. The platform provides preliminary risk screening and awareness guidance only and should not be considered a final legal, financial, law-enforcement, or currency authentication decision. Users should verify important information through official authorities and trusted sources before taking action.",
    navHelpAssistant: "Help Assistant",
    homeHelpHeading: "Need Help Reporting a Fraud?",
    homeHelpDesc: "Not sure what to do next? Our AI assistant can guide you through the reporting process step by step.",
    homeHelpBtn: "Talk to Help Assistant",
    chatTitle: "Citizen Help Assistant",
    chatSubheading: "Get step-by-step guidance for reporting cyber fraud.",
    chatDisclaimer: "This assistant provides general reporting guidance. It does not replace police, legal authorities, banks, or official government services.",
    chatPlaceholder: "Type your message here...",
    chatSuggestedHeading: "Suggested Questions",
    chatDisclaimerFooter: "Citizen Help Assistant is an experimental AI feature. AI responses may occasionally be incomplete or inaccurate. Always verify important reporting information through official government, police, bank, or cybercrime channels.",
    chatSend: "Send",
    chatReset: "New Conversation",
    chatErrTitle: "Help Assistant is currently unavailable",
    chatErrDesc: "Our AI guidance service has reached its available usage limit. Please use official reporting channels for urgent cases.",
    chatErrCall1930: "For cyber financial fraud, call 1930.",
    chatErrOpenPortal: "Open National Cyber Crime Reporting Portal"
  },
  hi: {
    appName: "नेत्र AI",
    home: "होम",
    heroTitle: "कोई भी कदम उठाने से पहले संदिग्ध गतिविधि की जांच करें",
    heroSubtitle: "AI-संचालित जांच के जरिए संदिग्ध कॉल, मैसेज और करेंसी नोटों का विश्लेषण करें।",
    backToHome: "होम पर वापस जाएं",
    selectLanguage: "भाषा",
    
    // Cards
    cardCallTitle: "संदिग्ध कॉल",
    cardCallDesc: "किसी संदिग्ध फोन कॉल का विवरण दें और सामान्य धोखाधड़ी के पैटर्न की जांच करें।",
    cardCallBtn: "कॉल की जांच करें",
    
    cardScreenshotTitle: "व्हाट्सएप संदेश",
    cardScreenshotDesc: "संदिग्ध लिंक, धमकियों और घोटाले के पैटर्न की पहचान करने के लिए संदेश का स्क्रीनशॉट अपलोड करें।",
    cardScreenshotBtn: "स्क्रीनशॉट की जांच करें",
    
    cardCurrencyTitle: "करेंसी नोट",
    cardCurrencyDesc: "प्रारंभिक विज़ुअल जोखिम जांच के लिए करेंसी नोट की साफ तस्वीर अपलोड करें।",
    cardCurrencyBtn: "नोट को स्कैन करें",
    
    // Analyzer Pages
    callAnalyzerTitle: "संदिग्ध कॉल विश्लेषक",
    callAnalyzerSub: "किसी संदिग्ध फोन कॉल का विवरण दें और सामान्य धोखाधड़ी के पैटर्न की जांच करें।",
    callLabel: "कॉलर ने क्या कहा उसका विवरण दें, या कॉल ट्रांसक्रिप्ट पेस्ट करें:",
    callPlaceholder: "विवरण प्रदान करें। जैसे - उन्होंने दावा किया कि वे मुंबई पुलिस/CBI से बात कर रहे हैं और मेरा आधार हवाई अड्डे पर पकड़े गए अवैध पार्सल से जुड़ा है। उन्होंने मुझे डिजिटल अरेस्ट करने की धमकी दी।",
    callLength: "अक्षर संख्या",
    callClear: "साफ करें",
    callPresetLabel: "पहले से भरी गई घटना की रिपोर्ट चुनें:",
    
    screenshotAnalyzerTitle: "व्हाट्सएप स्क्रीनशॉट विश्लेषक",
    screenshotAnalyzerSub: "संदिग्ध लिंक, धमकियों और घोटाले के पैटर्न की पहचान करने के लिए संदेश का स्क्रीनशॉट अपलोड करें।",
    screenshotUploadLabel: "व्हाट्सएप स्क्रीनशॉट इमेज चुनें",
    screenshotUploadHint: "PNG, JPG या JPEG फ़ाइल, अधिकतम 10MB",
    screenshotDelete: "हटाएं",
    screenshotPresetLabel: "दिए गए डिजिटल घोटाले के स्क्रीनशॉट उदाहरणों में से चुनें:",
    
    currencyAnalyzerTitle: "करेंसी नोट स्कैनर",
    currencyAnalyzerSub: "प्रारंभिक विज़ुअल जोखिम जांच के लिए करेंसी नोट की साफ तस्वीर अपलोड करें।",
    currencyUploadLabel: "करेंसी नोट की इमेज चुनें",
    currencyUploadHint: "PNG, JPG या JPEG फ़ाइल, अधिकतम 10MB। ध्यान रखें कि नोट मुड़ा हुआ न हो और रोशनी अच्छी हो।",
    currencyDelete: "हटाएं",
    currencyScannerDisclaimer: "महत्वपूर्ण सूचना: यह टूल दृश्य विशेषताओं के आधार पर भारतीय बैंक नोटों की केवल प्रारंभिक जोखिम जांच प्रदान करता है। यह भौतिक परीक्षण या आधिकारिक सत्यापन का स्थान नहीं लेता है। असली नोटों को हमेशा आरबीआई के दिशानिर्देशों के अनुसार ही संभालना चाहिए।",
    
    // Loading
    loadingCall: "जानकारी की जांच की जा रही है...",
    loadingScreenshot: "संदिग्ध पैटर्न की समीक्षा की जा रही है...",
    loadingCurrency: "अपलोड की गई इमेज का विश्लेषण किया जा रहा है...",
    loadingSubtitle: "बातचीत के विवरण, तत्परता के संकेतों और विज़ुअल संकेतकों की जांच हो रही है।",
    
    // Results
    resultTitle: "स्क्रीनिंग रिपोर्ट",
    riskScore: "जोखिम स्कोर",
    riskLevel: "जोखिम स्तर",
    scamType: "संभावित घोटाले का प्रकार",
    summary: "सारांश",
    whyFlagged: "इसे क्यों चिह्नित किया गया",
    whatToDo: "अब आपको क्या करना चाहिए",
    actionItem: "आवश्यक कदम",
    signalItem: "संदिग्ध संकेत",
    evidence: "सबूत/तथ्य",
    explanation: "व्याख्या/स्पष्टीकरण",
    officialWarning: "आधिकारिक चेतावनी: हमेशा अपनी औपचारिक साइबर शिकायत सुरक्षित रूप से cybercrime.gov.in पर दर्ज करें या 1930 पर कॉल करें।",
    shareWarning: "धोखाधड़ी की चेतावनी साझा करें",
    copiedText: "रिपोर्ट कॉपी हो गई!",
    extractedTextTitle: "इमेज से निकाला गया टेक्स्ट",
    
    // Risk Levels
    riskLow: "कम जोखिम",
    riskMedium: "मध्यम जोखिम",
    riskHigh: "उच्च जोखिम",
    riskCritical: "अत्यंत गंभीर जोखिम",
    riskInconclusive: "अस्पष्ट",
    
    // Error
    errorHeading: "जांच रुक गई है",
    errorReset: "रीसेट करें और फिर से प्रयास करें",
    errorNoInputCall: "कृपया पहले फोन कॉल का विवरण लिखें।",
    errorNoInputScreenshot: "कृपया पहले स्क्रीनशॉट अपलोड करें।",
    errorNoInputCurrency: "कृपया पहले करेंसी नोट की इमेज अपलोड करें।",
    errorImageUploadType: "कृपया केवल इमेज फ़ाइल (PNG, JPG, या JPEG) अपलोड करें।",
    
    // Presets
    presetDigitalArrestTitle: "🚨 डिजिटल अरेस्ट (CBI / मुंबई पुलिस का फर्जीवाड़ा)",
    presetElectricityTitle: "⚡ बिजली बिल काटने का फर्जी मैसेज",
    presetKbcTitle: "🎉 व्हाट्सएप पर फर्जी केबीसी (KBC) लॉटरी का दावा",

    // Fraud News and Alerts
    navFraudNews: "धोखाधड़ी समाचार",
    sectionNewsTitle: "नवीनतम धोखाधड़ी अलर्ट",
    sectionNewsDesc: "हाल के ऑनलाइन घोटालों, साइबर धोखाधड़ी और वित्तीय धोखाधड़ी की घटनाओं के बारे में सूचित रहें।",
    btnViewAllNews: "सभी धोखाधड़ी समाचार देखें",
    btnReadFullArticle: "पूरा लेख पढ़ें",
    btnRetry: "पुनः प्रयास करें",
    btnRefresh: "रिफ्रेश करें",
    lblLoadingNews: "नवीनतम धोखाधड़ी अलर्ट लोड हो रहे हैं...",
    lblNewsUnavailable: "नवीनतम धोखाधड़ी समाचार अस्थायी रूप से अनुपलब्ध है। कृपया पुन: प्रयास करें।",
    lblSearchPlaceholder: "धोखाधड़ी समाचार खोजें",
    lblFilterAll: "सभी",
    lblCategoryDigitalArrest: "डिजिटल अरेस्ट",
    lblCategoryBankFraud: "बैंक धोखाधड़ी",
    lblCategoryUpiFraud: "UPI धोखाधड़ी",
    lblCategoryWhatsAppScam: "व्हाट्सएप",
    lblCategoryInvestmentScam: "निवेश",
    lblCategoryJobScam: "नौकरी घोटाला",
    lblCategoryPhishing: "फ़िशिंग",
    lblCategoryIdentityTheft: "पहचान की चोरी",
    lblCategoryOtherCyberFraud: "अन्य साइबर धोखाधड़ी",
    lblAiSummary: "AI सारांश",
    lblGeneratingSummary: "AI सारांश जनरेट किया जा रहा है...",
    btnGetAiSummary: "AI द्वारा सारांशित करें",
    prototypeDisclaimer: "प्रोटोटाइप अस्वीकरण: सिटीजन फ्रॉड शील्ड एक प्रयोगात्मक हैकाथॉन प्रोटोटाइप है जो एआई (AI) आधारित विश्लेषण का उपयोग करता है। एआई द्वारा तैयार किए गए परिणाम कभी-कभी अधूरे, गलत या त्रुटिपूर्ण हो सकते हैं। यह प्लेटफॉर्म केवल शुरुआती जांच और जागरूकता मार्गदर्शन प्रदान करता है और इसे अंतिम कानूनी, वित्तीय, पुलिस या करेंसी नोट सत्यापन का निर्णय नहीं माना जाना चाहिए। उपयोगकर्ताओं को कोई भी कदम उठाने से पहले सरकारी अधिकारियों और विश्वसनीय स्रोतों के माध्यम से महत्वपूर्ण जानकारी की जांच अवश्य करनी चाहिए।",
    navHelpAssistant: "सहायता सहायक",
    homeHelpHeading: "धोखाधड़ी की रिपोर्ट करने में सहायता चाहिए?",
    homeHelpDesc: "समझ नहीं आ रहा कि आगे क्या करना है? हमारा AI सहायक आपको चरण-दर-चरण रिपोर्टिंग प्रक्रिया के माध्यम से मार्गदर्शन कर सकता है।",
    homeHelpBtn: "सहायता सहायक से बात करें",
    chatTitle: "नागरिक सहायता सहायक",
    chatSubheading: "साइबर धोखाधड़ी की रिपोर्ट करने के लिए चरण-दर-चरण मार्गदर्शन प्राप्त करें।",
    chatDisclaimer: "यह सहायक सामान्य रिपोर्टिंग मार्गदर्शन प्रदान करता है। यह पुलिस, कानूनी अधिकारियों, बैंकों या आधिकारिक सरकारी सेवाओं का स्थान नहीं लेता है।",
    chatPlaceholder: "अपना संदेश यहाँ टाइप करें...",
    chatSuggestedHeading: "सुझाए गए प्रश्न",
    chatDisclaimerFooter: "नागरिक सहायता सहायक एक प्रयोगात्मक AI विशेषता है। AI प्रतिक्रियाएं कभी-कभी अधूरी या गलत हो सकती हैं। हमेशा महत्वपूर्ण रिपोर्टिंग जानकारी को आधिकारिक सरकारी, पुलिस, बैंक, या साइबर अपराध चैनलों के माध्यम से सत्यापित करें।",
    chatSend: "भेजें",
    chatReset: "नई बातचीत",
    chatErrTitle: "सहायता सहायक वर्तमान में अनुपलब्ध है",
    chatErrDesc: "हमारी AI मार्गदर्शन सेवा अपनी उपलब्ध उपयोग सीमा तक पहुँच गई है। कृपया तत्काल मामलों के लिए आधिकारिक रिपोर्टिंग चैनलों का उपयोग करें।",
    chatErrCall1930: "साइबर वित्तीय धोखाधड़ी के लिए, 1930 पर कॉल करें।",
    chatErrOpenPortal: "राष्ट्रीय साइबर अपराध रिपोर्टिंग पोर्टल खोलें"
  },
  mr: {
    appName: "नेत्र AI",
    home: "होम",
    heroTitle: "कोणतेही पाऊल उचलण्यापूर्वी संशयास्पद हालचालींची खात्री करा",
    heroSubtitle: "AI-आधारित तपासणीद्वारे संशयास्पद कॉल्स, मेसेज आणि चलन नोटांचे विश्लेषण करा।",
    backToHome: "होमवर परत जा",
    selectLanguage: "भाषा",
    
    // Cards
    cardCallTitle: "संशयास्पद कॉल",
    cardCallDesc: "संशयास्पद फोन कॉलचे वर्णन करा आणि फसवणुकीच्या सामान्य पद्धती तपासा।",
    cardCallBtn: "कॉल तपासा",
    
    cardScreenshotTitle: "व्हॉट्सॲप मेसेज",
    cardScreenshotDesc: "संशयास्पद लिंक्स, धमक्या आणि फसवणूक ओळखण्यासाठी मेसेजचा स्क्रीनशॉट अपलोड करा।",
    cardScreenshotBtn: "स्क्रीनशॉट तपासा",
    
    cardCurrencyTitle: "करेंसी नोट",
    cardCurrencyDesc: "प्रारंभिक दृश्यात्मक (व्हिज्युअल) तपासणीसाठी नोटेचा स्पष्ट फोटो अपलोड करा।",
    cardCurrencyBtn: "नोट स्कॅन करा",
    
    // Analyzer Pages
    callAnalyzerTitle: "संशयास्पद कॉल विश्लेषक",
    callAnalyzerSub: "संशयास्पद फोन कॉलचे वर्णन करा आणि फसवणुकीच्या सामान्य पद्धती तपासा।",
    callLabel: "कॉलरने काय म्हटले त्याचे वर्णन लिहा किंवा कॉल ट्रान्सक्रिप्ट पेस्ट करा:",
    callPlaceholder: "माहिती द्या. उदा. त्यांनी दावा केला की ते मुंबई पोलीस/CBI कडून बोलत आहेत आणि माझे आधार कार्ड विमानतळावर जप्त केलेल्या बेकायदेशीर पार्सलशी जोडलेले आहे. त्यांनी मला डिजिटल अरेस्ट करण्याची धमकी दिली.",
    callLength: "अक्षरांची संख्या",
    callClear: "साफ करा",
    callPresetLabel: "नमुन्यासाठी आधीच लिहिलेला रिपोर्ट निवडा:",
    
    screenshotAnalyzerTitle: "व्हॉट्सॲप स्क्रीनशॉट विश्लेषक",
    screenshotAnalyzerSub: "संशयास्पद लिंक्स, धमक्या आणि फसवणूक ओळखण्यासाठी मेसेजचा स्क्रीनशॉट अपलोड करा।",
    screenshotUploadLabel: "व्हॉट्सॲप स्क्रीनशॉटचा फोटो निवडा",
    screenshotUploadHint: "PNG, JPG किंवा JPEG फाईल, कमाल 10MB",
    screenshotDelete: "काढून टाका",
    screenshotPresetLabel: "दिलेल्या डिजिटल फसवणुकीच्या स्क्रीनशॉट नमुन्यांमधून निवडा:",
    
    currencyAnalyzerTitle: "करेंसी नोट स्कॅनर",
    currencyAnalyzerSub: "प्रारंभिक दृश्यात्मक (व्हिज्युअल) तपासणीसाठी नोटेचा स्पष्ट फोटो अपलोड करा।",
    currencyUploadLabel: "करेंसी नोटचा फोटो निवडा",
    currencyUploadHint: "PNG, JPG किंवा JPEG फाईल, कमाल 10MB. नोट सरळ पसरलेली असावी आणि प्रकाश चांगला असावा.",
    currencyDelete: "काढून टाका",
    currencyScannerDisclaimer: "महत्त्वाची सूचना: हे साधन केवळ दृश्यात्मक वैशिष्ट्यांवर आधारित भारतीय नोटांची प्राथमिक तपासणी प्रदान करते. हे शारीरिक पडताळणी किंवा अधिकृत तपासणीचा पर्याय नाही. खऱ्या नोटा नेहमी आरबीआयच्या मार्गदर्शक तत्त्वांनुसारच हाताळाव्यात.",
    
    // Loading
    loadingCall: "माहिती तपासली जात आहे...",
    loadingScreenshot: "संशयास्पद पॅटर्नचे पुनरावलोकन केले जात आहे...",
    loadingCurrency: "अपलोड केलेल्या फोटोचे विश्लेषण केले जात आहे...",
    loadingSubtitle: "संभाषणाचा तपशील, घाई दाखवणारे संकेत आणि दृश्यात्मक घटकांची तपासणी सुरू आहे.",
    
    // Results
    resultTitle: "स्क्रीनिंग रिपोर्ट",
    riskScore: "धोका गुणसंख्या",
    riskLevel: "धोक्याची पातळी",
    scamType: "संभावित फसवणुकीचा प्रकार",
    summary: "थोडक्यात माहिती",
    whyFlagged: "हे का चिन्हांकित केले गेले",
    whatToDo: "तुम्ही आता काय करावे",
    actionItem: "आवश्यक पाऊल",
    signalItem: "संशयास्पद संकेत",
    evidence: "पुरावा / तथ्य",
    explanation: "स्पष्टीकरण",
    officialWarning: "अधिकृत चेतावणी: नेहमी तुमची अधिकृत सायबर तक्रार सुरक्षितपणे cybercrime.gov.in वर नोंदवा किंवा 1930 वर कॉल करा.",
    shareWarning: "फसवणुकीची चेतावणी शेअर करा",
    copiedText: "रिपोर्ट कॉपी झाला!",
    extractedTextTitle: "फोटोमधून काढलेला मजकूर",
    
    // Risk Levels
    riskLow: "कमी धोका",
    riskMedium: "मध्यम धोका",
    riskHigh: "जास्त धोका",
    riskCritical: "अति-गंभीर धोका",
    riskInconclusive: "अस्पष्ट",
    
    // Error
    errorHeading: "विश्लेषण थांबले आहे",
    errorReset: "पुन्हा प्रयत्न करा",
    errorNoInputCall: "कृपया आधी फोन कॉलचे वर्णन लिहा.",
    errorNoInputScreenshot: "कृपया आधी स्क्रीनशॉट फोटो अपलोड करा.",
    errorNoInputCurrency: "कृपया आधी नोटेचा फोटो अपलोड करा.",
    errorImageUploadType: "कृपया फक्त फोटो फाईल (PNG, JPG किंवा JPEG) अपलोड करा.",
    
    // Presets
    presetDigitalArrestTitle: "🚨 डिजिटल अरेस्ट (CBI / मुंबई पोलिसांचे बनावट सोंग)",
    presetElectricityTitle: "⚡ वीज बिल कापण्याचा खोटा मेसेज",
    presetKbcTitle: "🎉 व्हॉट्सॲपवर बनावट केबीसी (KBC) लॉटरीचा दावा",

    // Fraud News and Alerts
    navFraudNews: "फसवणूक बातम्या",
    sectionNewsTitle: "नवीनतम फसवणूक अलर्ट",
    sectionNewsDesc: "अलीकडील ऑनलाइन घोटाळे, सायबर फसवणूक आणि आर्थिक फसवणुकीच्या घटनांबद्दल माहिती मिळवा.",
    btnViewAllNews: "सर्व फसवणूक बातम्या पहा",
    btnReadFullArticle: "पूर्ण लेख वाचा",
    btnRetry: "पुन्हा प्रयत्न करा",
    btnRefresh: "रिफ्रेश करा",
    lblLoadingNews: "नवीनतम फसवणूक अलर्ट लोड होत आहेत...",
    lblNewsUnavailable: "नवीनतम फसवणूक बातम्या तात्पुरत्या अनुपलब्ध आहेत. कृपया पुन्हा प्रयत्न करा.",
    lblSearchPlaceholder: "फसवणूक बातम्या शोधा",
    lblFilterAll: "सर्व",
    lblCategoryDigitalArrest: "डिजिटल अरेस्ट",
    lblCategoryBankFraud: "बँक फसवणूक",
    lblCategoryUpiFraud: "UPI फसवणूक",
    lblCategoryWhatsAppScam: "व्हाट्सॲप",
    lblCategoryInvestmentScam: "गुंतवणूक",
    lblCategoryJobScam: "नोकरी घोटाला",
    lblCategoryPhishing: "फिशिंग",
    lblCategoryIdentityTheft: "ओळख चोरी",
    lblCategoryOtherCyberFraud: "इतर सायबर फसवणूक",
    lblAiSummary: "AI सारांश",
    lblGeneratingSummary: "AI सारांश जनरेट केला जात आहे...",
    btnGetAiSummary: "AI द्वारे सारांशित करा",
    prototypeDisclaimer: "प्रोटोटाइप अस्वीकरण: 'सिटीझन फ्रॉड शील्ड' हा एक प्रायोगिक हॅकाथॉन प्रोटोटाइप आहे जो एआई (AI) आधारित विश्लेषणाचा वापर करतो. एआई द्वारे मिळालेले निकाल काहीवेळा अपूर्ण, चुकीचे किंवा त्रुटीयुक्त असू शकतात. हे प्लॅटफॉर्म केवळ प्राथमिक तपासणी आणि जागरूकतेसाठी मार्गदर्शन पुरवते. याला अंतिम कायदेशीर, आर्थिक, पोलीस किंवा चलन नोट खरेपणाचा निर्णय मानू नये. वापरकर्त्यांनी कोणतीही कृती करण्यापूर्वी सरकारी यंत्रणा आणि विश्वसनीय स्रोतांद्वारे महत्त्वाच्या माहितीची खात्री करून घ्यावी.",
    navHelpAssistant: "सहायता सहाय्यक",
    homeHelpHeading: "फसवणुकीची तक्रार नोंदवण्यासाठी मदत हवी आहे?",
    homeHelpDesc: "पुढे काय करावे याबद्दल खात्री नाही? आमचा AI सहाय्यक तुम्हाला तक्रार नोंदवण्याच्या प्रक्रियेचे चरण-दर-चरण मार्गदर्शन करू शकतो.",
    homeHelpBtn: "सहायता सहाय्यकाशी बोला",
    chatTitle: "नागरिक सहायता सहाय्यक",
    chatSubheading: "सायबर फसवणुकीची तक्रार नोंदवण्यासाठी चरण-दर-चरण मार्गदर्शन मिळवा.",
    chatDisclaimer: "हा सहाय्यक सामान्य रिपोर्टिंग मार्गदर्शन प्रदान करतो. हे पोलीस, कायदेशीर अधिकारी, बँका किंवा अधिकृत सरकारी सेवांची जागा घेत नाही.",
    chatPlaceholder: "तुमचा मेसेज येथे टाईप करा...",
    chatSuggestedHeading: "सुचवलेले प्रश्न",
    chatDisclaimerFooter: "नागरिक सहायता सहाय्यक हे एक प्रायोगिक AI वैशिष्ट्य आहे. AI कडून मिळणारे प्रतिसाद काहीवेळा अपूर्ण किंवा चुकीचे असू शकतात. महत्त्वाच्या रिपोर्टिंग माहितीची नेहमी अधिकृत सरकारी, पोलीस, बँक किंवा सायबर गुन्हेगारी चॅनेलद्वारे खात्री करून घ्या.",
    chatSend: "पाठवा",
    chatReset: "नवीन संभाषण",
    chatErrTitle: "सहायता सहाय्यक सध्या अनुपलब्ध आहे",
    chatErrDesc: "आमची AI मार्गदर्शन सेवा तिच्या उपलब्ध वापर मर्यादेवर पोहोचली आहे. कृपया तातडीच्या प्रकरणांसाठी अधिकृत तक्रार चॅनेल वापरा.",
    chatErrCall1930: "सायबर आर्थिक फसवणुकीसाठी, 1930 वर कॉल करा.",
    chatErrOpenPortal: "राष्ट्रीय सायबर गुन्हे नोंदणी पोर्टल उघडा"
  }
};
