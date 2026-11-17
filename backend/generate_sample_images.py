"""
Generates clean, realistic synthetic PNG medical images for SehatSamajh samples:
1. sample_lab_report.png (CBC report with critical low Hb and out of range values)
2. sample_prescription.png (Prescription with 3 medicines)
"""

import os
from PIL import Image, ImageDraw, ImageFont

def get_font(size: int, bold: bool = False):
    font_names = [
        "arialbd.ttf" if bold else "arial.ttf",
        "segoeuib.ttf" if bold else "segoeui.ttf",
        "tahomabd.ttf" if bold else "tahoma.ttf",
        "calibrib.ttf" if bold else "calibri.ttf",
    ]
    for name in font_names:
        try:
            return ImageFont.truetype(name, size)
        except Exception:
            continue
    return ImageFont.load_default()

def generate_lab_report_png(output_path: str):
    width, height = 900, 1150
    image = Image.new("RGB", (width, height), color=(255, 255, 255))
    draw = ImageDraw.Draw(image)

    # Fonts
    title_font = get_font(22, bold=True)
    subtitle_font = get_font(14, bold=False)
    section_font = get_font(15, bold=True)
    body_bold = get_font(13, bold=True)
    body_font = get_font(13, bold=False)
    small_font = get_font(11, bold=False)

    # Header Banner
    draw.rectangle([(20, 20), (width - 20, 110)], fill=(15, 76, 129))
    draw.text((40, 32), "AL-KHIDMAT DIAGNOSTIC & RESEARCH LABS", fill=(255, 255, 255), font=title_font)
    draw.text((40, 68), "ISO 15189 Certified Clinical Pathology & Molecular Diagnostic Center", fill=(220, 235, 252), font=subtitle_font)
    draw.text((40, 88), "SYNTHETIC SAMPLE REPORT - FOR HEALTHCARE AI DEMO ONLY", fill=(254, 215, 170), font=small_font)

    # Patient Details Box
    draw.rectangle([(20, 120), (width - 20, 210)], outline=(200, 210, 220), width=2, fill=(248, 250, 252))
    draw.text((35, 130), "Patient Name:", font=body_bold, fill=(30, 41, 59))
    draw.text((140, 130), "Tariq Mahmood", font=body_font, fill=(15, 23, 42))
    draw.text((500, 130), "Age / Gender:", font=body_bold, fill=(30, 41, 59))
    draw.text((610, 130), "48 Y / Male", font=body_font, fill=(15, 23, 42))

    draw.text((35, 155), "Patient ID:", font=body_bold, fill=(30, 41, 59))
    draw.text((140, 155), "AK-2026-98124", font=body_font, fill=(15, 23, 42))
    draw.text((500, 155), "Ref By:", font=body_bold, fill=(30, 41, 59))
    draw.text((610, 155), "Dr. Sarah Ahmad", font=body_font, fill=(15, 23, 42))

    draw.text((35, 180), "Sample Date:", font=body_bold, fill=(30, 41, 59))
    draw.text((140, 180), "15-Nov-2026 08:30 AM", font=body_font, fill=(15, 23, 42))
    draw.text((500, 180), "Report Date:", font=body_bold, fill=(30, 41, 59))
    draw.text((610, 180), "15-Nov-2026 02:15 PM", font=body_font, fill=(15, 23, 42))

    # Table Header
    y = 230
    draw.rectangle([(20, y), (width - 20, y + 36)], fill=(226, 232, 240))
    draw.text((35, y + 10), "TEST / INVESTIGATION", font=body_bold, fill=(15, 23, 42))
    draw.text((340, y + 10), "RESULT", font=body_bold, fill=(15, 23, 42))
    draw.text((450, y + 10), "UNIT", font=body_bold, fill=(15, 23, 42))
    draw.text((560, y + 10), "REFERENCE INTERVAL", font=body_bold, fill=(15, 23, 42))
    draw.text((750, y + 10), "STATUS", font=body_bold, fill=(15, 23, 42))

    # Section Title
    y += 45
    draw.text((35, y), "COMPLETE BLOOD COUNT (CBC)", font=section_font, fill=(15, 76, 129))
    draw.line([(35, y + 22), (width - 20, y + 22)], fill=(15, 76, 129), width=1)
    y += 30

    cbc_items = [
        ("Hemoglobin (Hb)", "6.2", "g/dL", "13.0 - 17.0", "CRITICALLY LOW", True),
        ("Total Leukocyte Count (TLC)", "16,800", "/cumm", "4,000 - 11,000", "HIGH", False),
        ("Platelet Count", "85,000", "/cumm", "150,000 - 450,000", "LOW", False),
        ("Erythrocyte Sed. Rate (ESR)", "42", "mm/1st hr", "0 - 15", "HIGH", False),
        ("Red Blood Cell (RBC) Count", "2.85", "mil/cumm", "4.50 - 5.50", "LOW", False),
        ("Hematocrit (PCV)", "22.0", "%", "40.0 - 50.0", "LOW", False),
    ]

    for name, val, unit, ref, status, is_critical in cbc_items:
        bg_color = (254, 242, 242) if is_critical else ((255, 251, 235) if status in ("HIGH", "LOW") else (255, 255, 255))
        draw.rectangle([(25, y - 4), (width - 25, y + 28)], fill=bg_color)
        
        draw.text((40, y + 2), name, font=body_bold if is_critical else body_font, fill=(15, 23, 42))
        
        val_color = (185, 28, 28) if (is_critical or status in ("HIGH", "LOW")) else (15, 23, 42)
        draw.text((340, y + 2), val, font=body_bold, fill=val_color)
        draw.text((450, y + 2), unit, font=body_font, fill=(71, 85, 105))
        draw.text((560, y + 2), ref, font=body_font, fill=(71, 85, 105))
        
        status_color = (185, 28, 28) if is_critical else ((217, 119, 6) if status in ("HIGH", "LOW") else (22, 101, 52))
        draw.text((750, y + 2), status, font=body_bold, fill=status_color)
        
        draw.line([(25, y + 30), (width - 25, y + 30)], fill=(241, 245, 249), width=1)
        y += 38

    # Clinical Comments
    y += 20
    draw.rectangle([(25, y), (width - 25, y + 130)], outline=(226, 232, 240), fill=(248, 250, 252))
    draw.text((40, y + 12), "PATHOLOGY COMMENTS & INTERPRETATION:", font=body_bold, fill=(15, 23, 42))
    draw.text((40, y + 36), "- Critical Finding: Severe microcytic anemia with Hemoglobin at 6.2 g/dL.", font=body_bold, fill=(185, 28, 28))
    draw.text((40, y + 60), "- Leukocytosis (elevated TLC at 16,800) and moderate thrombocytopenia observed.", font=body_font, fill=(51, 65, 85))
    draw.text((40, y + 84), "- Clinical correlation required. Immediate physician consultation strongly advised.", font=body_bold, fill=(15, 23, 42))
    draw.text((40, y + 104), "- Repeat sample or peripheral blood film recommended if clinically indicated.", font=small_font, fill=(100, 116, 139))

    # Doctor Signature Footer
    y += 160
    draw.line([(550, y + 40), (width - 50, y + 40)], fill=(71, 85, 105), width=1)
    draw.text((550, y + 48), "Dr. Khalid Mansoor (MBBS, M.Phil Hematology)", font=body_bold, fill=(30, 41, 59))
    draw.text((550, y + 68), "Chief Consultant Pathologist | PMDC # 38291-P", font=small_font, fill=(100, 116, 139))

    # Disclaimer Footer
    draw.rectangle([(20, height - 60), (width - 20, height - 20)], fill=(241, 245, 249))
    draw.text((35, height - 48), "DISCLAIMER: This is a synthetic demonstration report created for hackathon AI testing. All names and values are simulated.", font=small_font, fill=(100, 116, 139))

    image.save(output_path, "PNG")
    print(f"Generated lab report image: {output_path}")

def generate_prescription_png(output_path: str):
    width, height = 900, 1150
    image = Image.new("RGB", (width, height), color=(255, 255, 255))
    draw = ImageDraw.Draw(image)

    # Fonts
    clinic_font = get_font(24, bold=True)
    doctor_font = get_font(15, bold=True)
    sub_font = get_font(13, bold=False)
    rx_font = get_font(28, bold=True)
    med_font = get_font(15, bold=True)
    inst_font = get_font(13, bold=False)
    small_font = get_font(11, bold=False)

    # Clinic Header
    draw.rectangle([(20, 20), (width - 20, 115)], fill=(16, 149, 108))
    draw.text((40, 30), "SHIFA FAMILY CLINIC & CARE CENTER", fill=(255, 255, 255), font=clinic_font)
    draw.text((40, 68), "Dr. Sarah Ahmad | MBBS, FCPS (Internal Medicine) | PMDC Reg # 45291-P", fill=(236, 253, 245), font=doctor_font)
    draw.text((40, 90), "Main Boulevard, Gulberg III, Lahore | Tel: 042-35789123 | Emergency: 1122", fill=(209, 250, 229), font=sub_font)

    # Patient Header
    draw.rectangle([(20, 125), (width - 20, 205)], outline=(209, 250, 229), width=2, fill=(240, 253, 244))
    draw.text((35, 135), "Patient Name:", font=doctor_font, fill=(15, 23, 42))
    draw.text((150, 135), "Zainab Bibi", font=sub_font, fill=(15, 23, 42))
    draw.text((420, 135), "Age / Gender:", font=doctor_font, fill=(15, 23, 42))
    draw.text((530, 135), "36 Y / Female", font=sub_font, fill=(15, 23, 42))
    draw.text((700, 135), "Date:", font=doctor_font, fill=(15, 23, 42))
    draw.text((750, 135), "16-Nov-2026", font=sub_font, fill=(15, 23, 42))

    draw.text((35, 165), "Vitals:", font=doctor_font, fill=(15, 23, 42))
    draw.text((150, 165), "BP: 125/82 mmHg | Temp: 100.4 F | Wt: 62 kg", font=sub_font, fill=(15, 23, 42))
    draw.text((35, 185), "Diagnosis:", font=doctor_font, fill=(15, 23, 42))
    draw.text((150, 185), "Acute upper respiratory tract infection, productive cough, fever", font=sub_font, fill=(15, 23, 42))

    # Rx Symbol
    y = 225
    draw.text((35, y), "Rx", font=rx_font, fill=(16, 149, 108))
    draw.line([(35, y + 42), (width - 20, y + 42)], fill=(16, 149, 108), width=2)
    y += 55

    # Exactly 3 Medicines
    medicines = [
        (
            "1. Tab Augmentin (Co-amoxiclav) 625 mg",
            "Dose: 1 tablet",
            "Frequency: Twice daily (every 12 hours) after food",
            "Duration: 5 days",
            "Directions: Complete full 5-day course even if feeling better. Do not skip doses."
        ),
        (
            "2. Tab Panadol (Paracetamol) 500 mg",
            "Dose: 1 to 2 tablets",
            "Frequency: 3 times a day as needed for fever or headache (SOS)",
            "Duration: 3 days",
            "Directions: Maximum 8 tablets in 24 hours. Drink plenty of water."
        ),
        (
            "3. Cap Risek (Omeprazole) 20 mg",
            "Dose: 1 capsule",
            "Frequency: Once daily, 30 minutes before breakfast",
            "Duration: 5 days",
            "Directions: To protect stomach from acidity while on antibiotics."
        )
    ]

    for title, dose, freq, dur, direct in medicines:
        draw.rectangle([(25, y), (width - 25, y + 130)], outline=(226, 232, 240), fill=(255, 255, 255), width=1)
        draw.rectangle([(25, y), (width - 25, y + 34)], fill=(248, 250, 252))
        
        draw.text((40, y + 8), title, font=med_font, fill=(16, 149, 108))
        draw.text((40, y + 42), f"- {dose}  |  {freq}  |  Duration: {dur}", font=doctor_font, fill=(30, 41, 59))
        draw.text((40, y + 70), f"  Instructions: {direct}", font=inst_font, fill=(71, 85, 105))
        draw.text((40, y + 96), "  Important: Take strictly as prescribed. Do not stop midway.", font=small_font, fill=(185, 28, 28))
        y += 145

    # General Advice Box
    draw.rectangle([(25, y), (width - 25, y + 100)], fill=(240, 253, 244), outline=(187, 247, 208))
    draw.text((40, y + 12), "GENERAL ADVICE & CARE INSTRUCTIONS:", font=doctor_font, fill=(16, 149, 108))
    draw.text((40, y + 36), "• Warm water saline gargles 3 times daily.", font=inst_font, fill=(15, 23, 42))
    draw.text((40, y + 56), "• Adequate hydration (warm soups, boiled water, green tea with honey).", font=inst_font, fill=(15, 23, 42))
    draw.text((40, y + 76), "• Follow up in clinic if fever persists beyond 3 days or breathing difficulty develops.", font=inst_font, fill=(185, 28, 28))

    # Doctor Signature Footer
    y += 125
    draw.line([(550, y + 40), (width - 50, y + 40)], fill=(71, 85, 105), width=1)
    draw.text((550, y + 48), "Dr. Sarah Ahmad (MBBS, FCPS)", font=doctor_font, fill=(30, 41, 59))
    draw.text((550, y + 68), "Consultant Family Physician | PMDC Reg # 45291-P", font=small_font, fill=(100, 116, 139))

    # Disclaimer
    draw.rectangle([(20, height - 60), (width - 20, height - 20)], fill=(241, 245, 249))
    draw.text((35, height - 48), "DISCLAIMER: This is a synthetic medical prescription for hackathon demo purposes only. Fictitious doctor & patient.", font=small_font, fill=(100, 116, 139))

    image.save(output_path, "PNG")
    print(f"Generated prescription image: {output_path}")

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    samples_dir = os.path.join(base_dir, "samples")
    os.makedirs(samples_dir, exist_ok=True)
    generate_lab_report_png(os.path.join(samples_dir, "sample_lab_report.png"))
    generate_prescription_png(os.path.join(samples_dir, "sample_prescription.png"))
