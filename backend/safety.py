"""
Safety guardrails and medical disclaimers for SehatSamajh.
Enforces non-diagnostic explanations, critical value detection, multilingual disclaimers,
and post-generation sanitization that rewrites/removes diagnosis or medicine-change instructions.
"""

import re
from typing import Dict, List, Optional, Any

# Standard medical disclaimers in English, Urdu, and Roman Urdu
DISCLAIMERS: Dict[str, str] = {
    "en": (
        "Medical Disclaimer: SehatSamajh is an educational AI tool designed to help you understand medical documents in plain language. "
        "It DOES NOT provide medical diagnosis, clinical opinions, or treatment advice. "
        "Never change, pause, or stop prescribed medication on your own. "
        "Always confirm all lab results and prescriptions directly with your qualified doctor."
    ),
    "ur": (
        "طبی دستبرداری: صحت سمجھ ایک تعلیمی اے آئی ٹول ہے جو طبی دستاویزات کو آسان زبان میں سمجھنے کے لیے بنایا گیا ہے۔ "
        "یہ کوئی طبی تشخیص، معائنہ یا علاج کی تجویز فراہم نہیں کرتا۔ "
        "اپنے معالج (ڈاکٹر) کے مشورے کے بغیر ادویات میں کبھی خود سے ردوبدل نہ کریں اور نہ ہی بند کریں۔ "
        "ہمیشہ اپنے معالج یا ڈاکٹر سے رجوع کر کے تصدیق کریں۔"
    ),
    "roman_ur": (
        "Medical Disclaimer: SehatSamajh ek taleemi AI tool hai jo medical reports aur prescriptions ko aasan zuban mein samajhnay ke liye banaya gaya hai. "
        "Yeh koi tibbi tashkhees (diagnosis) ya ilaj tajweez nahi karta. "
        "Apnay doctor ke mashwaray ke baghair dawai hargiz tabdeel ya band na karein. "
        "Hamesha apnay doctor se tasdeeq karein."
    )
}

def get_disclaimer(language: str = "en") -> str:
    """Return standardized medical disclaimer in the selected language."""
    return DISCLAIMERS.get(language, DISCLAIMERS["en"])

# Well-known critical clinical thresholds that warrant an urgent warning.
# Grouped by physiological categories with regex patterns and explicit exclusion rules.
CRITICAL_THRESHOLDS = [
    {
        "category": "glucose",
        "patterns": [r"\bglucose\b", r"\bblood\s+sugar\b", r"\bfbs\b", r"\brbs\b"],
        "exclude": [],
        "min": 50.0,
        "max": 350.0,
        "unit": "mg/dL"
    },
    {
        "category": "hemoglobin",
        "patterns": [r"\bhemoglobin\b", r"\bhb\b"],
        # Exclude HbA1c (glycated hemoglobin) which is measured in % (normal ~4.0-5.6%)
        "exclude": [r"\bhba1c\b", r"\ba1c\b", r"glycated"],
        "min": 6.5,
        "max": 20.0,
        "unit": "g/dL"
    },
    {
        "category": "potassium",
        "patterns": [r"\bpotassium\b", r"\bk\+\b"],
        "exclude": [],
        "min": 2.8,
        "max": 6.2,
        "unit": "mmol/L"
    },
    {
        "category": "platelets",
        "patterns": [r"\bplatelet", r"\bplt\b"],
        "exclude": [],
        "min": 30000.0,
        "max": 1000000.0,
        "unit": "/cumm"
    },
    {
        "category": "systolic",
        "patterns": [r"\bsystolic\b", r"\bsbp\b"],
        "exclude": [],
        "min": 80.0,
        "max": 180.0,
        "unit": "mmHg"
    },
    {
        "category": "diastolic",
        "patterns": [r"\bdiastolic\b", r"\bdbp\b"],
        "exclude": [],
        "min": 50.0,
        "max": 120.0,
        "unit": "mmHg"
    },
]

def extract_numeric_value(val_str: str) -> Optional[float]:
    """Safely extracts the primary floating point number from a value string."""
    if not val_str:
        return None
    cleaned = str(val_str).replace(",", "").strip()
    match = re.search(r"[-+]?\d*\.?\d+", cleaned)
    if match:
        try:
            return float(match.group())
        except ValueError:
            return None
    return None

# Patterns representing diagnostic claims to sanitize
DIAGNOSIS_PATTERNS = [
    (r"\b(you have|patient has|you suffer from|patient suffers from|you are diagnosed with)\s+([a-zA-Z\s]+?)([\.,;]|$)",
     r"the report notes indicators related to \2 (confirm with your doctor)\3"),
    (r"\b(diagnosis:\s*)([a-zA-Z\s]+?)([\.,;]|$)",
     r"clinical note mention: \2 (confirm with your doctor)\3"),
    (r"(آپ کو|مریض کو)\s+([^\s]+(?:\s+[^\s]+){0,3})\s+(کی بیماری ہے|کا مرض ہے|ہو گیا ہے)",
     r"رپورٹ میں \2 سے متعلق اشارے درج ہیں (اپنے معالج یا ڈاکٹر سے رجوع کریں)"),
    (r"\b(aap ko|mareez ko)\s+([a-zA-Z\s]+?)\s+(ki bimari hai|ka marz hai|ho gaya hai)\b",
     r"report mein \2 se mutaliq marks darj hain (apnay doctor se tasdeeq karein)"),
]

# Patterns representing instructions to change or initiate medication to sanitize
MEDICINE_CHANGE_PATTERNS = [
    (r"\b(stop taking|discontinue|quit taking|do not take)\s+([a-zA-Z0-9\s]+?)([\.,;]|$)",
     r"do not change medication without speaking to your doctor (confirm with your doctor)\3"),
    (r"\b(start taking|begin taking|start on|switch to)\s+([a-zA-Z0-9\s]+?)([\.,;]|$)",
     r"medication should only be prescribed by your doctor (confirm with your doctor)\3"),
    (r"\b(increase|decrease|double|reduce|change)\s+(your\s+)?(dose|dosage|amount)\s+(of\s+)?([a-zA-Z0-9\s]+?)([\.,;]|$)",
     r"dosage should only be adjusted by your prescribing physician (confirm with your doctor)\6"),
    (r"(دوا|دوائی|گولی)(?:\s+[^\s]+){0,2}\s*(لینا بند کر دیں|کھانا چھوڑ دیں|روک دیں|بڑھائیں|کم کریں)",
     r"دوا کی مقدار صرف ڈاکٹر کے مشورے سے تبدیل کریں (اپنے معالج یا ڈاکٹر سے رجوع کریں)"),
    (r"(دوا|دوائی|گولی)(?:\s+[^\s]+){0,2}\s*(شروع کریں|لینا شروع کریں)",
     r"دوا صرف ڈاکٹر کے مشورے اور نسخے کے مطابق استعمال کریں (اپنے معالج یا ڈاکٹر سے رجوع کریں)"),
    (r"\b(dawai|dawa|tablet|goli)(?:\s+[a-zA-Z]+){0,2}\s*(lena band karein|khana chor dein|barha dein|kam karein)\b",
     r"dawai ki miqdaar sirf doctor ke mashwaray se tabdeel karein (apnay doctor se tasdeeq karein)"),
    (r"\b(dawai|dawa|tablet|goli)(?:\s+[a-zA-Z]+){0,2}\s*(shuru karein|lena shuru karein)\b",
     r"dawai sirf doctor ke mashwaray se shuru karein (apnay doctor se tasdeeq karein)"),
]

# Default fallback questions ensuring 3 to 5 practical questions per requirement
DEFAULT_PRACTICAL_QUESTIONS: Dict[str, List[str]] = {
    "en": [
        "What do these specific findings mean for my day-to-day health?",
        "Do I need any follow-up tests, monitoring, or lifestyle adjustments?",
        "What warning signs or symptoms should prompt me to contact you immediately?"
    ],
    "ur": [
        "یہ نتائج مجموعی طور پر میری صحت اور روزمرہ زندگی کے لیے کیا معنی رکھتے ہیں؟",
        "کیا مجھے کسی فالو اپ ٹیسٹ یا خوراک میں تبدیلی کی ضرورت ہے؟",
        "ایسی کون سی علامات ہیں جن کی صورت میں مجھے فوری طور پر ہسپتال یا آپ سے رابطہ کرنا چاہیے؟"
    ],
    "roman_ur": [
        "Yeh results meri sehat ke liye kya matlab rakhte hain?",
        "Kya mujhe kisi mazeed follow-up test ya parhez ki zaroorat hai?",
        "Aisi kaunsi alamat hain jin par mujhe fori taur par doctor se ruju karna chahiye?"
    ]
}

def sanitize_safety_text(text: str, language: str = "en") -> str:
    """
    Post-check sanitization: rewrites or removes any output text that sounds
    like a clinical diagnosis or a medicine-change instruction.
    Ensures safe, objective phrasing and non-prescriptive language.
    """
    if not text or not isinstance(text, str):
        return ""

    sanitized = text

    # Rewrite diagnosis patterns
    for pattern, replacement in DIAGNOSIS_PATTERNS:
        sanitized = re.sub(pattern, replacement, sanitized, flags=re.IGNORECASE)

    # Rewrite medicine change instructions
    for pattern, replacement in MEDICINE_CHANGE_PATTERNS:
        sanitized = re.sub(pattern, replacement, sanitized, flags=re.IGNORECASE)

    return sanitized.strip()

def verify_safety_flags(analysis_dict: dict, language: str = "en") -> dict:
    """
    Validate and enforce safety rules:
    1. Ensure disclaimer is populated in the proper language.
    2. Check items for critical laboratory anomalies with calm urgent reason.
    3. Ensure at least 3 practical doctor questions are present.
    4. Post-check sanitization across all narrative fields.
    """
    if not isinstance(analysis_dict, dict):
        analysis_dict = {}

    # Enforce disclaimer
    if not analysis_dict.get("disclaimer"):
        analysis_dict["disclaimer"] = get_disclaimer(language)

    # Ensure doc_type is defaulted if missing
    if not analysis_dict.get("doc_type"):
        analysis_dict["doc_type"] = "unknown"

    # Ensure summary is populated
    if not analysis_dict.get("summary"):
        if language == "ur":
            analysis_dict["summary"] = "اس دستاویز کا طبی خلاصہ تیار نہیں ہو سکا۔ برائے مہربانی اپنے معالج یا ڈاکٹر سے رجوع کریں۔"
        elif language == "roman_ur":
            analysis_dict["summary"] = "Is document ka tibbi khulasa tayyar nahi ho saka. Baraye meharbani apnay doctor se ruju karein."
        else:
            analysis_dict["summary"] = "Unable to identify a medical summary for this document. Please consult your doctor."

    # Check for rule-based critical alerts
    urgent = analysis_dict.get("urgent_flag", False)
    urgent_reason = analysis_dict.get("urgent_reason", "").strip()

    items = analysis_dict.get("items", []) or []
    critical_findings: List[str] = []

    for item in items:
        name = str(item.get("name", "")).strip()
        name_lower = name.lower()
        val_str = str(item.get("value", "")).strip()
        val_num = extract_numeric_value(val_str)

        if val_num is None:
            continue

        for thresh in CRITICAL_THRESHOLDS:
            # Check exclusions first (e.g. HbA1c is excluded from blood hemoglobin threshold)
            if any(re.search(ex, name_lower) for ex in thresh["exclude"]):
                continue

            # Check matching patterns
            matched = any(re.search(pat, name_lower) for pat in thresh["patterns"])
            if matched:
                chk_val = val_num
                if thresh["category"] == "platelets" and val_num < 1000.0:
                    # Platelets in thousands (e.g. 250 x10^3/uL -> 250,000)
                    chk_val = val_num * 1000.0

                if chk_val < thresh["min"]:
                    critical_findings.append(f"{name} ({val_str} {thresh['unit']}) is significantly below reference interval")
                elif chk_val > thresh["max"]:
                    critical_findings.append(f"{name} ({val_str} {thresh['unit']}) is significantly above reference interval")
                break

    # Deduplicate findings while preserving order
    seen = set()
    unique_findings = []
    for f in critical_findings:
        if f not in seen:
            seen.add(f)
            unique_findings.append(f)

    if unique_findings:
        urgent = True
        critical_msg = "; ".join(unique_findings)
        # Calm, non-alarmist sentence telling the user to see a doctor soon
        if language == "ur":
            urgent_reason = f"طبی انتباہ: آپ کے ٹیسٹ میں بعض نتائج معمول کی حد سے نمایاں طور پر مختلف ہیں ({critical_msg})۔ برائے مہربانی جلد از جلد اپنے معالج یا ڈاکٹر سے مشورہ کریں۔"
        elif language == "roman_ur":
            urgent_reason = f"Medical Notice: Aap ke test mein baaz results normal hadd se kafi mukhtalif hain ({critical_msg}). Baraye meharbani jald apnay doctor se ruju karein."
        else:
            urgent_reason = f"Medical Notice: One or more lab values are significantly outside the reference range ({critical_msg}). Please schedule a prompt consultation with your doctor."
    elif not any(item.get("status") in ("high", "low") for item in items):
        # When all tests are normal or unclear with no critical anomaly, suppress urgent flag
        urgent = False
        urgent_reason = ""

    analysis_dict["urgent_flag"] = bool(urgent)
    analysis_dict["urgent_reason"] = urgent_reason if urgent else ""

    # Ensure 3 to 5 practical questions for the doctor (unless document is completely unknown)
    q_list = analysis_dict.get("questions_for_doctor")
    if not isinstance(q_list, list):
        q_list = []
    if len(q_list) < 3 and analysis_dict.get("doc_type") != "unknown":
        defaults = DEFAULT_PRACTICAL_QUESTIONS.get(language, DEFAULT_PRACTICAL_QUESTIONS["en"])
        for def_q in defaults:
            if def_q not in q_list and len(q_list) < 5:
                q_list.append(def_q)
    analysis_dict["questions_for_doctor"] = q_list

    # Post-check sanitization on all output fields
    if "summary" in analysis_dict and isinstance(analysis_dict["summary"], str):
        analysis_dict["summary"] = sanitize_safety_text(analysis_dict["summary"], language)

    if "urgent_reason" in analysis_dict and isinstance(analysis_dict["urgent_reason"], str):
        analysis_dict["urgent_reason"] = sanitize_safety_text(analysis_dict["urgent_reason"], language)

    for item in analysis_dict.get("items", []) or []:
        if isinstance(item, dict) and "plain_explanation" in item and isinstance(item["plain_explanation"], str):
            item["plain_explanation"] = sanitize_safety_text(item["plain_explanation"], language)

    for med in analysis_dict.get("medicines", []) or []:
        if isinstance(med, dict):
            if "purpose" in med and isinstance(med["purpose"], str):
                med["purpose"] = sanitize_safety_text(med["purpose"], language)
            if "notes" in med and isinstance(med["notes"], str):
                med["notes"] = sanitize_safety_text(med["notes"], language)

    # Sanitize questions for doctor as well
    if "questions_for_doctor" in analysis_dict and isinstance(analysis_dict["questions_for_doctor"], list):
        analysis_dict["questions_for_doctor"] = [
            sanitize_safety_text(str(q), language) for q in analysis_dict["questions_for_doctor"]
        ]

    return analysis_dict
