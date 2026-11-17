"""
Safety guardrails and medical disclaimers for SehatSamajh.
Enforces non-diagnostic explanations, critical value detection, and multilingual disclaimers.
"""

import re
from typing import Dict, List, Optional

# Standard medical disclaimers by language
DISCLAIMERS: Dict[str, str] = {
    "en": (
        "Medical Disclaimer: SehatSamajh is an educational AI tool designed to help you understand medical documents in plain language. "
        "It DOES NOT provide medical diagnosis, clinical opinions, or treatment advice. "
        "Never change, pause, or stop prescribed medication on your own. "
        "Always discuss all lab results and prescriptions directly with a qualified healthcare professional."
    ),
    "ur": (
        "طبی دستبرداری: صحت سمجھ ایک تعلیمی اے آئی ٹول ہے جو طبی دستاویزات کو آسان زبان میں سمجھنے کے لیے بنایا گیا ہے۔ "
        "یہ کوئی طبی تشخیص، معائنہ یا علاج کی تجویز فراہم نہیں کرتا۔ "
        "اپنے معالج (ڈاکٹر) کے مشورے کے بغیر ادویات میں کبھی خود سے ردوبدل نہ کریں اور نہ ہی بند کریں۔ "
        "اپنی تمام رپورٹس اور نسخہ جات مستند ڈاکٹر کو دکھا کر ان کی رہنمائی حاصل کریں۔"
    ),
    "roman_ur": (
        "Medical Disclaimer: SehatSamajh ek taleemi AI tool hai jo medical reports aur prescriptions ko aasan zuban mein samajhnay ke liye banaya gaya hai. "
        "Yeh koi tibbi tashkhees (diagnosis) ya ilaj tajweez nahi karta. "
        "Apnay doctor ke mashwaray ke baghair dawai hargiz tabdeel ya band na karein. "
        "Apni reports aur prescriptions hamesha qualified doctor ko dikhayen."
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
    # Remove thousand separators
    cleaned = str(val_str).replace(",", "").strip()
    match = re.search(r"[-+]?\d*\.?\d+", cleaned)
    if match:
        try:
            return float(match.group())
        except ValueError:
            return None
    return None

def verify_safety_flags(analysis_dict: dict, language: str = "en") -> dict:
    """
    Validate and enforce safety rules:
    1. Ensure disclaimer is populated in the proper language.
    2. Check items for critical laboratory anomalies without false positives.
    3. Ensure urgent_reason is populated if urgent_flag is true.
    """
    # Enforce disclaimer
    if not analysis_dict.get("disclaimer"):
        analysis_dict["disclaimer"] = get_disclaimer(language)

    # Check for rule-based critical alerts if urgent_flag isn't already set
    urgent = analysis_dict.get("urgent_flag", False)
    urgent_reason = analysis_dict.get("urgent_reason", "").strip()

    items = analysis_dict.get("items", [])
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
                if val_num < thresh["min"]:
                    critical_findings.append(f"{name} is critically low ({val_str})")
                elif val_num > thresh["max"]:
                    critical_findings.append(f"{name} is critically high ({val_str})")
                # Once matched to a critical threshold category, do not test other categories for this item
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
        if urgent_reason:
            if critical_msg not in urgent_reason:
                urgent_reason = f"{urgent_reason} - Critical alert: {critical_msg}"
        else:
            if language == "ur":
                urgent_reason = f"اہم انتباہ: فوری طور پر ڈاکٹر سے رابطہ کریں ({critical_msg})"
            elif language == "roman_ur":
                urgent_reason = f"Aham notice: Fori taur par doctor se ruju karein ({critical_msg})"
            else:
                urgent_reason = f"Urgent attention needed: please consult a doctor promptly ({critical_msg})"

    analysis_dict["urgent_flag"] = bool(urgent)
    analysis_dict["urgent_reason"] = urgent_reason if urgent else ""
    return analysis_dict
