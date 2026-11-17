# SehatSamajh: Project Technical Report
**AI for Accessible Healthcare & Well-Being (UN Sustainable Development Goal 3)**

---

## Team Members
```
[Team Member 1: Full-Stack & AI Engineer - Name & Role Placeholder]
[Team Member 2: Healthcare & Product Lead - Name & Role Placeholder]
[Team Member 3: UI/UX & Accessibility Specialist - Name & Role Placeholder]
```

---

## 1. Abstract
**SehatSamajh** ("Understand Your Health") is a safety-first, bilingual healthcare literacy platform designed to bridge the communication gap between complex medical reports and everyday patients in Pakistan. Millions of patients in developing nations receive diagnostic laboratory results and physician prescriptions rendered in technical medical jargon and English clinical shorthand. This language barrier generates severe patient anxiety, medication non-compliance, and delayed treatment of life-threatening anomalies. 

SehatSamajh leverages Google Gemini Flash multimodal models via the `google-genai` SDK, FastAPI, and a mobile-first React frontend to translate photos, PDFs, and text of medical reports into plain 6th-grade language in Urdu (with Right-to-Left Nastaliq typography), Roman Urdu, and English. The system enforces strict non-diagnostic boundaries: it extracts numerical values and reference ranges strictly as printed, computes traffic-light indicators without inventing clinical ranges, formats prescription schedules, highlights urgent clinical anomalies calmly, formulates practical questions for the patient's physician, and sanitizes all generated narratives against medical diagnosis or treatment modification.

---

## 2. Problem Statement
In Pakistan and South Asia:
1. **Medical Jargon & Monolingual Reporting**: Diagnostic tests (CBC, lipid profiles, metabolic panels) and doctor prescriptions (Rx) are almost universally printed in English and filled with complex abbreviations (e.g., TLC, ESR, HbA1c, PCV, SOS, BD, OD).
2. **Language Disconnect**: A large portion of the population cannot read or comprehend English technical terms. Urdu (Pakistan's national language) and Roman Urdu (widely used in digital communications) are completely neglected in digital pathology and pharmacy outputs.
3. **Medication Mismanagement & Non-Compliance**: Patients frequently misunderstand antibiotic durations, dosage frequencies, or the necessity of antacids, leading to antibiotic resistance or adverse drug events.
4. **Disempowered Consultations**: During busy outpatient clinic visits, patients often remain silent because they do not know what questions to ask their physicians.
5. **UN SDG 3 Deficit**: Target 3.8 of UN SDG 3 calls for universal access to quality healthcare services and safe, effective, and affordable essential medicines. Health literacy is the foundational precursor to effective healthcare access.

---

## 3. Objectives
- **Multimodal Accessibility**: Enable patients to upload photos, scans, PDFs, or paste text of lab reports and prescriptions.
- **Multilingual Grade-6 Readability**: Provide empathetic, 6th-grade level explanations in English, Urdu (RTL script), and Roman Urdu.
- **Strictly Non-Diagnostic**: Never diagnose medical conditions or advise changing medication.
- **Traffic-Light Grading**: Categorize biomarkers into Normal (green), Low (amber), High (red), or Unclear (grey) strictly using printed reference intervals.
- **Prescription Structuring**: Extract drug names, dosages, frequencies, purposes, and important precautions into an easy-to-read schedule.
- **Doctor Empowerment**: Provide 3 to 5 practical, copyable questions to ask the doctor.
- **Audio Read-Aloud**: Provide browser-native Web Speech API audio for low-literacy or visually impaired users.
- **Calm Urgent Alerts**: Identify critical physiological outliers without creating panic.

---

## 4. Target Users
1. **Everyday Patients & Families**: Non-English speakers, elderly family members, and caregivers who need clear, simple guidance about what a medical document means.
2. **Urdu and Roman Urdu Speakers**: Users who communicate in Urdu script or colloquial Roman Urdu and require healthcare insights in their primary language.
3. **Patients with Low Literacy**: Users who benefit from large typography, high-contrast traffic-light visual cues, and the Web Speech API read-aloud functionality.
4. **Primary Care Clinicians & Diagnostic Laboratories**: Labs and clinics seeking to improve patient satisfaction, adherence to treatment, and doctor-patient communication.

---

## 5. System Architecture
```
+--------------------------------------------------------------------------+
|                            USER INTERFACE (React)                        |
|   +------------------------------------------------------------------+   |
|   |  - Mobile-First High Contrast UI (Tailwind CSS)                  |   |
|   |  - Language Switcher: English | Roman Urdu | Urdu (RTL Nastaliq) |   |
|   |  - Multimodal Upload: Drag-and-drop / Camera Capture / Text Paste|   |
|   |  - Web Speech API: Native Browser Read-Aloud Engine              |   |
|   |  - LocalStorage: Zero-Database Persistence of Last Result        |   |
|   +------------------------------------------------------------------+   |
+------------------------------------+-------------------------------------+
                                     | HTTP REST (VITE_API_URL / CORS)
                                     v
+--------------------------------------------------------------------------+
|                         BACKEND SERVICE (FastAPI)                        |
|   +------------------------------------------------------------------+   |
|   |  - Route Handlers: /api/health, /api/analyze, /api/ask           |   |
|   |  - File Validation: Max 8 MB, PNG/JPG/JPEG/WEBP/PDF Check        |   |
|   |  - Error Handlers: Standard JSON {"error": "..."} Formatting    |   |
|   +------------------------------------------------------------------+   |
|                                    |                                     |
|                                    v                                     |
|   +------------------------------------------------------------------+   |
|   |             AI ORCHESTRATION & SAFETY (ai_service.py)            |   |
|   |  - System Prompts: Grade-6 reading level, 3 languages            |   |
|   |  - Multimodal Parts: Image/PDF binary streams + text             |   |
|   |  - Pydantic v2 Structured Output: AnalysisResponse schema        |   |
|   |  - Single Retry on Schema Validation Failure                     |   |
|   +------------------------------------------------------------------+   |
|                                    |                                     |
|                                    v                                     |
|   +------------------------------------------------------------------+   |
|   |                 SAFETY GUARD ENGINE (safety.py)                  |   |
|   |  - Deterministic Critical Thresholds (glucose, Hb, K+, platelets)|   |
|   |  - Multilingual Mandatory Medical Disclaimers                    |   |
|   |  - Post-Check Sanitization: Rewrites diagnostic phrasing &       |   |
|   |    medicine modification instructions into safe advisory notices |   |
|   +------------------------------------------------------------------+   |
+------------------------------------+-------------------------------------+
                                     | google-genai SDK
                                     v
+--------------------------------------------------------------------------+
|                     GOOGLE GEMINI VISION & LANGUAGE API                  |
|   - Model: gemini-2.5-flash / gemini-2.0-flash (configurable via env)    |
|   - JSON Output Schema Enforcement & Multimodal Vision Analysis          |
+--------------------------------------------------------------------------+
```

---

## 6. Tech Stack
- **Backend**:
  - Python 3.11+
  - FastAPI (REST API with CORS, file upload handling, structured exception filters)
  - Pydantic v2 (Strict data validation, type normalization, schema enforcement)
  - Uvicorn (High-performance ASGI server)
  - `python-multipart` (Multipart form-data parsing for multimodal uploads)
  - `python-dotenv` (Secure environment configuration)
  - `google-genai` (Modern Google Gemini SDK with multimodal Part API)
  - `pytest` & `pytest-asyncio` (Automated unit and integration test suite)
  - Pillow (Synthetic medical document image generation)
- **Frontend**:
  - React 18 with Vite
  - Tailwind CSS (Mobile-first responsive styling, custom color scales, dark contrast)
  - Lucide React (Accessible semantic icons)
  - Google Fonts: *Inter* (English/Roman Urdu) & *Noto Nastaliq Urdu* (Urdu RTL)
  - Web Speech API (`speechSynthesis` for browser-native audio read-aloud)
  - LocalStorage (Client-side privacy-first persistence without a remote database)

---

## 7. Implementation Phases
1. **Phase 1: Backend Core & Contracts**: Implemented `/api/health`, `/api/analyze` for text, Pydantic schemas, and foundational safety rules.
2. **Phase 2: Multimodal Input & Synthetic Datasets**: Added image and PDF binary parsing via Gemini `Part.from_bytes`. Created 2 synthetic medical datasets (CBC report with critical hemoglobin and 3-medicine prescription) in text and PNG format.
3. **Phase 3: Frontend Scaffolding & API Integration**: Built mobile-responsive layout, drag-and-drop file upload, camera access, and text input flows connecting to the backend.
4. **Phase 4: Result Visualizations**: Implemented the traffic-light lab results table, medicine guide cards, urgent critical alert banner, and copyable doctor questions.
5. **Phase 5: Localization & Voice Accessibility**: Created centralized `src/i18n.js` with full English, Urdu, and Roman Urdu translations; enabled RTL layout switching and Noto Nastaliq font; integrated Web Speech API Read-Aloud with graceful fallback; built context-bounded interactive chat `/api/ask`.
6. **Phase 6: Error Handling & Defensive Hardening**: Enforced 8 MB file size cap, allowed only valid document formats (PNG, JPG, JPEG, WEBP, PDF), implemented global exception handlers returning uniform `{"error": "friendly message"}` JSON, added post-check sanitization in `safety.py`.
7. **Phase 7: Comprehensive Documentation & Quality Assurance**: Created `README.md`, `docs/PITCH.md`, `docs/DEMO_SCRIPT.md`, and this technical report.

---

## 8. AI Design, Guardrails & Safety Architecture
SehatSamajh follows a defense-in-depth safety paradigm:
1. **Grade-6 Reading Level Prompt Engineering**:
   The model is instructed to avoid latinized medical jargon and explain biological concepts in terms of daily bodily functions.
2. **Reference Interval Grounding**:
   The model evaluates "high", "low", or "normal" status **solely** against the printed reference ranges found on that specific document. It is strictly forbidden from assuming standard ranges when none are printed.
3. **Synthetic Deterministic Safety Check (`safety.py`)**:
   In addition to model outputs, a deterministic Python safety module scans extracted values against physiological boundaries:
   - Blood Glucose: < 50 mg/dL or > 350 mg/dL
   - Blood Hemoglobin: < 6.5 g/dL (while explicitly excluding HbA1c %)
   - Serum Potassium: < 2.8 mmol/L or > 6.2 mmol/L
   - Platelets: < 30,000 /cumm
   If breached, `urgent_flag` is automatically set to `True` with a calm advisory to see a doctor soon.
4. **Post-Check Sanitization Filter**:
   All AI-generated text is routed through regex-based sanitizers that rewrite diagnostic proclamations (*"You have diabetes"*) into objective biomarker descriptions (*"The report notes indicators related to blood sugar (confirm with your doctor)"*), and converts any drug modification instructions into reminders to adhere to the prescribing doctor.
5. **Context-Bounded Follow-Up Chat**:
   The `/api/ask` endpoint passes only the analyzed document JSON as context. The system prompt instructs Gemini to refuse diagnostic questions, refuse dosage alteration inquiries, and state when information is absent from the report.

---

## 9. Testing & Quality Verification Record
- **Automated Backend Tests (`pytest`)**: 19 tests executed and passing with 100% success rate:
  - Health check endpoint contract (`{"status": "ok"}`)
  - Empty input rejection (HTTP 400)
  - Zero-byte file upload rejection (HTTP 400)
  - Oversized file rejection (> 8 MB, HTTP 413)
  - Unsupported file format rejection (HTTP 400)
  - Empty question handling in `/api/ask` (HTTP 400)
  - Default medical disclaimers in `en`, `ur`, and `roman_ur`
  - Critical threshold alert verification (e.g. glucose = 420 mg/dL)
  - Sample lab report critical alert verification (Hemoglobin = 6.2 g/dL)
  - Exclusion verification (HbA1c 5.2% does not trigger blood hemoglobin alert)
  - Safety post-check sanitization of diagnostic statements and medication change commands
  - Pydantic schema casing normalization and null value coercion
  - Markdown code fence JSON extraction
  - Mocked multimodal analysis for Text, PNG images, and PDF documents
  - Safe conversational Q&A endpoint execution
  - Gemini API rate limit / quota error translation (HTTP 429)
- **Frontend Verification**:
  - Production build compiled cleanly with Vite (`npm run build`).
  - Tested language toggling across English, Urdu (RTL direction + Noto Nastaliq Urdu font), and Roman Urdu.
  - Tested Web Speech API read-aloud functionality with graceful degradation if no voice is available.
  - Tested clipboard copy functionality on doctor questions.
  - Verified responsive design on mobile and desktop viewports.
- **Security Check**:
  - Full codebase searched for API keys, hardcoded tokens, and secrets (`git grep` and pattern scanners confirm 0 secrets committed).
  - `.gitignore` verified to exclude `.env`, `node_modules`, `dist`, `__pycache__`, and `venv`.

---

## 10. Limitations
1. **Educational Only**: SehatSamajh is not a medical device, is not clinically validated for diagnostic decision support, and does not replace professional clinical evaluation.
2. **Handwriting Legibility**: Poorly handwritten prescriptions with extreme cursive ink distortion may result in `unclear` statuses.
3. **Camera Quality Dependence**: Shadows, severe skew, or low-resolution camera images may hinder optical character extraction.
4. **Offline Capability**: Requires an active internet connection to communicate with Google Gemini multimodal APIs.

---

## 11. Startup & Sustainability Model
*Disclaimer: The business model described below is an early hypothesis to be validated through structured pilot partnerships.*

### B2B Add-On Model (Primary Revenue)
- **Diagnostic Laboratory Networks**: Top Pakistani pathology labs (Chughtai, Excel, Shaukat Khanum, Essa, Al-Khidmat) deliver millions of digital PDF reports monthly via SMS and WhatsApp. SehatSamajh can be offered as a white-labeled value-added service (e.g., an automated "Aasan Urdu Summary" link) billed on a monthly tier or micro-fee per report.
- **Retail Pharmacy Chains**: Pharmacy chains (D.Watson, Servaid, Fazal Din) can integrate SehatSamajh into their point-of-sale software to print or SMS plain-language dosage instructions in Urdu, reducing medication errors.

### Patient Freemium Tier
- **Free Access**: Unlimited text paste and basic document analysis in English, Urdu, and Roman Urdu.
- **Future Premium Vault**: Optional longitudinal tracking (e.g. tracking fasting blood sugar or blood pressure over months) and WhatsApp bot integrations.

---

## 12. UN SDG 3 Impact (Good Health and Well-Being)
SehatSamajh directly supports:
- **Target 3.8**: Access to quality essential health-care services and safe, effective, quality and affordable essential medicines.
- **Health Literacy as an Equalizer**: Transforming medical reports into Urdu and Roman Urdu bridges the digital and linguistic divide for millions of non-English speaking citizens.
- **Reducing Medical Errors**: Clear instructions on antibiotic course completion and antacid timing prevent premature cessation and secondary complications.
- **Empowering Outpatient Consultations**: By providing 3 to 5 targeted questions, patients transition from passive, frightened bystanders into active participants in their clinical care.

---

## 13. Future Work & Roadmap
1. **Patient Privacy & Consent**: Implementation of end-to-end encrypted file pipelines with automated PII redaction (masking patient names and phone numbers before forwarding to LLMs) and zero-retention compliance.
2. **Clinical Validation Studies**: Formal partnership with academic teaching hospitals (e.g., King Edward Medical University, Aga Khan University) to evaluate patient comprehension scores before and after reading SehatSamajh explanations.
3. **Regional Languages**: Expansion to additional Pakistani languages including Punjabi, Sindhi, Pashto, and Balochi.
4. **WhatsApp Assistant**: Deployment of a lightweight WhatsApp bot interface allowing users in low-bandwidth rural areas to snap a photo and receive an audio explanation directly in WhatsApp voice notes.
