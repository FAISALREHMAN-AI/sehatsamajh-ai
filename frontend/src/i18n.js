/**
 * Internationalization (i18n) dictionary for SehatSamajh.
 * Supports English ('en'), Urdu ('ur', RTL), and Roman Urdu ('roman_ur').
 */

export const translations = {
  en: {
    appName: "SehatSamajh",
    appTagline: "Understand Your Health",
    sdgBadge: "AI for Accessible Healthcare & Well-Being (UN SDG 3)",
    navHome: "Home",
    navAnalyze: "Upload Document",
    backHome: "Back to Home",
    newAnalysis: "Analyze Another",
    viewSaved: "View Last Saved Result",

    // Home
    heroTitle: "Understand your medical reports and prescriptions in",
    heroTitleHighlight: "simple, everyday language",
    heroSubtitle:
      "Turn complex medical jargon and English-only reports into clear, grade-6 explanations in Urdu, Roman Urdu, or English. Strictly educational and non-diagnostic.",
    ctaUpload: "Upload Medical Document",
    ctaSampleLab: "Try Sample Lab Report",
    ctaSamplePrescription: "Try Sample Prescription",

    // How it works
    howItWorksTitle: "How SehatSamajh Works in 3 Easy Steps",
    step1Title: "1. Upload or Paste",
    step1Desc: "Upload a photo, PDF, or paste text of your lab report or prescription.",
    step2Title: "2. Grade-6 AI Translation",
    step2Desc: "Our safety-first AI breaks down values against printed reference intervals.",
    step3Title: "3. Actionable Clarity",
    step3Desc: "Get traffic-light indicators, a medicine schedule, and 3-5 questions to ask your doctor.",

    // Analyze
    analyzeHeading: "Analyze Your Medical Document",
    analyzeSubheading: "Upload a clear photo, PDF, or paste text from your lab report or prescription.",
    tabUpload: "Upload Document / Photo",
    tabPaste: "Paste Text",
    dragDropText: "Drag and drop your report here, or click to browse",
    dragDropSub: "Supports PNG, JPG, JPEG, WEBP, and PDF up to 8 MB",
    cameraButton: "Take Photo with Camera",
    fileChosen: "Selected file:",
    removeFile: "Remove file",
    pasteLabel: "Paste Report or Prescription Text",
    pastePlaceholder: "Paste the text of your lab tests, doctor's notes, or prescription here...",
    loadSampleLab: "Load Sample CBC Lab Report",
    loadSampleRx: "Load Sample Prescription (3 Medicines)",
    analyzeButton: "Analyze Document Now",
    analyzingProgress: "Analyzing document with Gemini AI...",
    analyzingStep1: "Reading printed reference intervals...",
    analyzingStep2: "Translating medical jargon to Grade-6 language...",
    analyzingStep3: "Generating doctor questions and safety checks...",

    // Result
    docTypeLab: "Laboratory Test Report",
    docTypeRx: "Doctor Prescription (Rx)",
    docTypeUnknown: "Unclassified Document",
    summaryTitle: "Plain Language Summary",
    summaryBadge: "Grade-6 Reading Level",

    // Urgent Banner
    urgentBadge: "Urgent Medical Attention",
    urgentTitle: "Important Notice: Please consult a qualified doctor promptly!",
    urgentFooter: "This finding is significantly outside the reference range and requires professional medical evaluation.",

    // Traffic Light Table
    tableTitle: "Test Results & Explanations",
    tableLegend: "Traffic-light visual: Green (Normal), Yellow (Low), Red (High), Grey (Unclear)",
    itemsCount: "Items",
    patientValue: "Patient Value:",
    referenceRange: "Reference Range:",
    statusNormal: "Normal",
    statusLow: "Low",
    statusHigh: "High",
    statusUnclear: "Unclear",

    // Medicines Guide
    medGuideTitle: "Prescribed Medicines Guide",
    medGuideSubtitle: "Plain explanation of each medicine. Never change dosage without consulting your doctor.",
    medCount: "Medicines",
    doseLabel: "Dose:",
    frequencyLabel: "Frequency:",
    purposeLabel: "General Purpose:",
    notesLabel: "Important Directions:",

    // Doctor Questions
    doctorQuestionsTitle: "Questions to Ask Your Doctor",
    doctorQuestionsSubtitle: "Empower yourself during your clinic visit by asking these focused questions.",
    copyQuestion: "Copy question",
    copiedToast: "Copied to clipboard",

    // Chat Box
    chatTitle: "Ask Questions About This Document",
    chatSubtitle: "Answers strictly from this report. Politely refuses diagnosis and dosage changes.",
    quickQuestionsLabel: "Suggested Quick Questions:",
    quickQuestions: [
      "Can you summarize this in one simple sentence?",
      "Which results should I discuss first with my doctor?",
      "What are the general instructions for these medicines?",
    ],
    chatPlaceholder: "Ask a question about this report (e.g., 'What does TLC mean?')...",
    chatSend: "Ask",
    chatThinking: "Thinking...",
    chatDisclaimer: "AI answers strictly from document context. Never provides a medical diagnosis.",

    // Read Aloud
    readAloud: "Read Aloud",
    pauseAudio: "Pause",
    resumeAudio: "Resume",
    stopAudio: "Stop",

    // Disclaimers
    disclaimerLabel: "Mandatory Medical Disclaimer",
    disclaimerText:
      "Medical Disclaimer: SehatSamajh is an educational AI tool designed to help you understand medical documents in plain language. It DOES NOT provide medical diagnosis, clinical opinions, or treatment advice. Never change, pause, or stop prescribed medication on your own. Always confirm all lab results and prescriptions directly with your qualified doctor.",
  },

  ur: {
    appName: "صحت سمجھ",
    appTagline: "اپنی صحت کو آسان زبان میں سمجھیں",
    sdgBadge: "طبی آگاہی کے لیے اے آئی (اقوام متحدہ ایس ڈی جی 3)",
    navHome: "مرکزی صفحہ",
    navAnalyze: "دستاویز اپلوڈ کریں",
    backHome: "مرکزی صفحہ پر جائیں",
    newAnalysis: "نیا تجزیہ کریں",
    viewSaved: "پچھلا محفوظ شدہ نتیجہ دیکھیں",

    // Home
    heroTitle: "اپنی میڈیکل رپورٹس اور نسخہ جات کو",
    heroTitleHighlight: "آسان اردو میں سمجھیں",
    heroSubtitle:
      "پیچیدہ طبی اصطلاحات اور انگریزی رپورٹس کی آسان الفاظ میں وضاحت حاصل کریں۔ کوئی طبی تشخیص نہیں، صرف بہتر آگاہی اور ڈاکٹر سے بات کرنے میں آسانی۔",
    ctaUpload: "اپنی رپورٹ اپلوڈ کریں",
    ctaSampleLab: "ڈیمو لیب رپورٹ آزمائیں",
    ctaSamplePrescription: "ڈیمو نسخہ (Rx) آزمائیں",

    // How it works
    howItWorksTitle: "صحت سمجھ کیسے کام کرتا ہے؟ (3 آسان مراحل)",
    step1Title: "1. اپلوڈ کریں یا لکھیں",
    step1Desc: "لیب رپورٹ یا نسخے کی تصویر، پی ڈی ایف فائل یا متن داخل کریں۔",
    step2Title: "2. آسان اردو ترجمہ",
    step2Desc: "ہمارا محفوظ اے آئی چھٹی جماعت کی آسان فہم اردو میں وضاحت پیش کرتا ہے۔",
    step3Title: "3. مکمل آگاہی اور رہنمائی",
    step3Desc: "ٹریفک لائٹ اشارے، ادویات کا شیڈول، اور ڈاکٹر سے پوچھنے والے سوالات حاصل کریں۔",

    // Analyze
    analyzeHeading: "طبی دستاویز کا جائزہ لیں",
    analyzeSubheading: "لیب رپورٹ یا ڈاکٹر کے نسخہ کی تصویر اپلوڈ کریں، یا متن درج کریں۔",
    tabUpload: "فائل یا تصویر اپلوڈ کریں",
    tabPaste: "متن درج کریں",
    dragDropText: "اپنی فائل یہاں ڈریگ کریں، یا منتخب کرنے کے لیے کلک کریں",
    dragDropSub: "پی این جی، جے پی جی، ویب پی اور پی ڈی ایف (زیادہ سے زیادہ 8 ایم بی)",
    cameraButton: "کیمرے سے تصویر لیں",
    fileChosen: "منتخب فائل:",
    removeFile: "فائل ہٹائیں",
    pasteLabel: "رپورٹ یا نسخے کا متن یہاں لکھیں",
    pastePlaceholder: "لیب ٹیسٹ یا نسخے کا متن یہاں چسپاں کریں...",
    loadSampleLab: "ڈیمو سی بی سی رپورٹ لوڈ کریں",
    loadSampleRx: "ڈیمو نسخہ (3 ادویات) لوڈ کریں",
    analyzeButton: "ابھی رپورٹ کا جائزہ لیں",
    analyzingProgress: "اے آئی کے ذریعے جائزہ لیا جا رہا ہے...",
    analyzingStep1: "رپورٹ میں درج نارمل حدود کا موازنہ ہو رہا ہے...",
    analyzingStep2: "طبی الفاظ کو آسان اردو میں تبدیل کیا جا رہا ہے...",
    analyzingStep3: "ڈاکٹر کے سوالات اور حفاظتی جائزے تیار ہو رہے ہیں...",

    // Result
    docTypeLab: "لیبارٹری ٹیسٹ رپورٹ",
    docTypeRx: "ڈاکٹر کا نسخہ (Rx)",
    docTypeUnknown: "طبی دستاویز",
    summaryTitle: "آسان زبان میں خلاصہ",
    summaryBadge: "چھٹی جماعت کے فہم کے مطابق",

    // Urgent Banner
    urgentBadge: "فوری طبی توجہ درکار ہے",
    urgentTitle: "اہم انتباہ: برائے مہربانی فوری طور پر اپنے ڈاکٹر سے رابطہ کریں!",
    urgentFooter: "یہ نتیجہ معمول کی حد سے بہت مختلف ہے اور ڈاکٹر کے معائنے کا تقاضا کرتا ہے۔",

    // Traffic Light Table
    tableTitle: "ٹیسٹ کے نتائج کی تفصیل",
    tableLegend: "ٹریفک لائٹ اشارے: سبز (معمول)، پیلا (کم)، سرخ (زیادہ)، سرمئی (غیر واضح)",
    itemsCount: "نتائج",
    patientValue: "آپ کا نتیجہ:",
    referenceRange: "نارمل حد:",
    statusNormal: "معمول (درست)",
    statusLow: "کم (لو)",
    statusHigh: "زیادہ (ہائی)",
    statusUnclear: "غیر واضح",

    // Medicines Guide
    medGuideTitle: "تجویز کردہ ادویات کی معلومات",
    medGuideSubtitle: "یہ معلومات صرف سمجھنے کے لیے ہیں؛ دوا لینے کے اوقات اور مقدار اپنے ڈاکٹر کے مطابق رکھیں۔",
    medCount: "ادویات",
    doseLabel: "مقدار / خوراک:",
    frequencyLabel: "لینے کا وقت:",
    purposeLabel: "یہ دوا کس لیے ہے؟",
    notesLabel: "خاص ہدایات:",

    // Doctor Questions
    doctorQuestionsTitle: "ڈاکٹر سے پوچھنے کے لیے اہم سوالات",
    doctorQuestionsSubtitle: "جب آپ اگلی بار ڈاکٹر کے پاس جائیں تو یہ سوالات اپنے ساتھ لے جا سکتے ہیں۔",
    copyQuestion: "سوال کاپی کریں",
    copiedToast: "کاپی ہو گیا",

    // Chat Box
    chatTitle: "رپورٹ کے بارے میں مزید سوال پوچھیں",
    chatSubtitle: "اے آئی صرف اس رپورٹ کی حدود کے اندر سے جواب دے گا اور کوئی تشخیص نہیں کرے گا۔",
    quickQuestionsLabel: "تجویز کردہ سوالات:",
    quickQuestions: [
      "یہ رپورٹ مجموعی طور پر کیا بتاتی ہے؟",
      "کیا کوئی ایسی چیز ہے جس پر مجھے ڈاکٹر سے بات کرنی چاہیے؟",
      "ان ادویات کے عام استعمال کیا ہیں؟",
    ],
    chatPlaceholder: "اس رپورٹ کے بارے میں سوال پوچھیں...",
    chatSend: "ارسال کریں",
    chatThinking: "سوچ رہا ہے...",
    chatDisclaimer: "اے آئی صرف دستاویز کی بنیاد پر وضاحت کرتا ہے، علاج تجویز نہیں کرتا۔",

    // Read Aloud
    readAloud: "آواز میں سنیں",
    pauseAudio: "وقفہ",
    resumeAudio: "جاری رکھیں",
    stopAudio: "روکیں",

    // Disclaimers
    disclaimerLabel: "لازمی طبی دستبرداری",
    disclaimerText:
      "طبی دستبرداری: صحت سمجھ ایک تعلیمی اے آئی ٹول ہے جو طبی دستاویزات کو آسان زبان میں سمجھنے کے لیے بنایا گیا ہے۔ یہ کوئی طبی تشخیص، معائنہ یا علاج کی تجویز فراہم نہیں کرتا۔ اپنے معالج (ڈاکٹر) کے مشورے کے بغیر ادویات میں کبھی خود سے ردوبدل نہ کریں اور نہ ہی بند کریں۔ ہمیشہ اپنے معالج یا ڈاکٹر سے رجوع کر کے تصدیق کریں۔",
  },

  roman_ur: {
    appName: "SehatSamajh",
    appTagline: "Apni Sehat Ko Aasan Roman Urdu Mein Samjhein",
    sdgBadge: "AI for Accessible Healthcare & Well-Being (UN SDG 3)",
    navHome: "Home",
    navAnalyze: "Report Upload Karein",
    backHome: "Wapas Home",
    newAnalysis: "Naya Jaiza Lein",
    viewSaved: "Pichla Saved Result Dekhein",

    // Home
    heroTitle: "Apni medical reports aur prescription ko",
    heroTitleHighlight: "Aasan Roman Urdu mein samjhein",
    heroSubtitle:
      "Mushkil medical reports aur doctor ke nuskhe ki aasan alfaz mein wazahat hasil karein. Koi bimari diagnose nahi, sirf behtar samajh aur doctor se baat cheet mein asaani.",
    ctaUpload: "Report Upload Karein",
    ctaSampleLab: "Sample Lab Report Try Karein",
    ctaSamplePrescription: "Sample Prescription (Rx) Try Karein",

    // How it works
    howItWorksTitle: "SehatSamajh Kaise Kaam Karta Hai? (3 Aasan Steps)",
    step1Title: "1. Upload ya Paste Karein",
    step1Desc: "Photo, PDF ya text copy paste karein.",
    step2Title: "2. Aasan Urdu Translation",
    step2Desc: "Humara AI report ke numbers ko normal limits se check kar ke aasan wazahat deta hai.",
    step3Title: "3. Doctor Se Sawalat",
    step3Desc: "Traffic-light signals, dawaiyon ka time table aur doctor ke liye sawalat hasil karein.",

    // Analyze
    analyzeHeading: "Medical Document Ka Jaiza Lein",
    analyzeSubheading: "Lab report ya doctor ke nuskhe ki photo upload karein ya text paste karein.",
    tabUpload: "File / Photo Upload Karein",
    tabPaste: "Text Paste Karein",
    dragDropText: "File yahan drag karein, ya click kar ke select karein",
    dragDropSub: "PNG, JPG, JPEG, WEBP aur PDF (Maximum 8 MB)",
    cameraButton: "Camera Se Photo Lein",
    fileChosen: "Selected file:",
    removeFile: "File hatayein",
    pasteLabel: "Report Ya Prescription Ka Text Likhein",
    pastePlaceholder: "Apni report ya doctor ka nuskha yahan paste karein...",
    loadSampleLab: "Sample CBC Lab Report Load Karein",
    loadSampleRx: "Sample Prescription (3 Dawaiyan) Load Karein",
    analyzeButton: "Abhi Report Analyze Karein",
    analyzingProgress: "AI ke zariye analysis ho raha hai...",
    analyzingStep1: "Printed reference ranges check ho rahi hain...",
    analyzingStep2: "Medical terms ko aasan zuban mein convert kar rahe hain...",
    analyzingStep3: "Doctor ke sawalat tayyar ho rahe hain...",

    // Result
    docTypeLab: "Laboratory Test Report",
    docTypeRx: "Doctor Prescription (Rx)",
    docTypeUnknown: "Medical Document",
    summaryTitle: "Aasan Alfaz Mein Khulasa",
    summaryBadge: "Grade-6 Reading Level",

    // Urgent Banner
    urgentBadge: "Fori Tawajah Darkar Hai",
    urgentTitle: "Aham Notice: Meharbani farma kar fori taur par doctor se ruju karein!",
    urgentFooter: "Yeh result aam miyaar se kaafi mukhtalif hai aur doctor ke jaizay ki zaroorat hai.",

    // Traffic Light Table
    tableTitle: "Test Results Ki Tafseel",
    tableLegend: "Traffic-light: Sabz (Normal), Peela (Low), Surkh (High), Slate (Unclear)",
    itemsCount: "Results",
    patientValue: "Aap Ka Result:",
    referenceRange: "Normal Hadd:",
    statusNormal: "Normal",
    statusLow: "Kam (Low)",
    statusHigh: "Ziyada (High)",
    statusUnclear: "Ghair Wazeh",

    // Medicines Guide
    medGuideTitle: "Prescription Dawaiyan Guide",
    medGuideSubtitle: "Yeh sirf samajhnay ke liye hai; dawai ka waqt aur miqdaar doctor ke mutabiq rakhein.",
    medCount: "Dawaiyan",
    doseLabel: "Dose / Miqdaar:",
    frequencyLabel: "Lene Ka Waqt:",
    purposeLabel: "Yeh dawai kis liye hai?",
    notesLabel: "Aham Hidayat:",

    // Doctor Questions
    doctorQuestionsTitle: "Doctor Se Poochnay Ke Sawalat",
    doctorQuestionsSubtitle: "Agli checkup par aap doctor se yeh sawalat aasaani se pooch saktay hain.",
    copyQuestion: "Sawal copy karein",
    copiedToast: "Copy ho gaya",

    // Chat Box
    chatTitle: "Report Ke Baray Mein Sawal Poochein",
    chatSubtitle: "AI sirf is report ki hadd tak wazahat day ga aur koi bimari diagnose nahi karay ga.",
    quickQuestionsLabel: "Suggested Sawalat:",
    quickQuestions: [
      "Yeh report aasan alfaz mein kya batati hai?",
      "Kya koi test ya dawai doctor se discuss karni chahiye?",
      "In dawaiyon ke aam istemal kya hain?",
    ],
    chatPlaceholder: "Is report ke mutaliq sawal poochein...",
    chatSend: "Bhejein",
    chatThinking: "Soch raha hai...",
    chatDisclaimer: "AI sirf document ki bunyad par jawab deta hai, ilaj tajweez nahi karta.",

    // Read Aloud
    readAloud: "Awaaz Mein Sunein",
    pauseAudio: "Pause",
    resumeAudio: "Resume",
    stopAudio: "Stop",

    // Disclaimers
    disclaimerLabel: "Zaroori Tibbi Disclaimer",
    disclaimerText:
      "Medical Disclaimer: SehatSamajh ek taleemi AI tool hai jo medical reports aur prescriptions ko aasan zuban mein samajhnay ke liye banaya gaya hai. Yeh koi tibbi tashkhees (diagnosis) ya ilaj tajweez nahi karta. Apnay doctor ke mashwaray ke baghair dawai hargiz tabdeel ya band na karein. Hamesha apnay doctor se tasdeeq karein.",
  },
};

/**
 * Helper to get translation key with fallback to English
 */
export function t(key, lang = "en") {
  const currentDict = translations[lang] || translations.en;
  if (currentDict && key in currentDict) {
    return currentDict[key];
  }
  return translations.en[key] || key;
}
