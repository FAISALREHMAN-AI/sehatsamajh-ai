"""
Safety guardrails and medical disclaimers for SehatSamajh.
Enforces non-diagnostic explanations and urgent value detection.
"""

from typing import Dict, Tuple

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

# Well-known critical clinical thresholds that warrant an urgent warning
# Formatted as (low_critical, high_critical) in standard units
CRITICAL_THRESHOLDS = {
    "glucose": {"min": 50.0, "max": 350.0, "unit": "mg/dl"},
    "blood sugar": {"min": 50.0, "max": 350.0, "unit": "mg/dl"},
    "hemoglobin": {"min": 6.5, "max": 20.0, "unit": "g/dl"},
    "hb": {"min": 6.5, "max": 20.0, "unit": "g/dl"},
    "potassium": {"min": 2.8, "max": 6.2, "unit": "mmol/l"},
    "platelets": {"min": 30000.0, "max": 1000000.0, "unit": "/cumm"},
    "systolic": {"min": 80.0, "max": 180.0, "unit": "mmhg"},
    "diastolic": {"min": 50.0, "max": 120.0, "unit": "mmhg"},
}

def verify_safety_flags(analysis_dict: dict, language: str = "en") -> dict:
    """
    Validate and enforce safety rules:
    1. Ensure disclaimer is populated in the proper language.
    2. Check items for critical laboratory anomalies.
    3. Ensure urgent_reason is populated if urgent_flag is true.
    """
    # Enforce disclaimer
    if not analysis_dict.get("disclaimer"):
        analysis_dict["disclaimer"] = get_disclaimer(language)

    # Check for rule-based critical alerts if urgent_flag isn't already set
    urgent = analysis_dict.get("urgent_flag", False)
    urgent_reason = analysis_dict.get("urgent_reason", "").strip()

    items = analysis_dict.get("items", [])
    critical_findings = []

    for item in items:
        name_lower = str(item.get("name", "")).lower()
        val_str = str(item.get("value", "")).strip()
        status = item.get("status", "")

        # Try to parse numerical value
        try:
            # Clean common non-numeric chars
            clean_num = "".join([c for c in val_str if c.isdigit() or c == "."])
            if clean_num:
                val_num = float(clean_num)
                for key, thresh in CRITICAL_THRESHOLDS.items():
                    if key in name_lower:
                        if val_num < thresh["min"]:
                            critical_findings.append(f"{item.get('name')} is critically low ({val_str})")
                        elif val_num > thresh["max"]:
                            critical_findings.append(f"{item.get('name')} is critically high ({val_str})")
        except Exception:
            pass

    if critical_findings:
        urgent = True
        critical_msg = "; ".join(critical_findings)
        if urgent_reason:
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
