# SehatSamajh (صحت سمجھ)
### AI for Accessible Healthcare & Well-Being (UN SDG 3)

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4+-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Gemini](https://img.shields.io/badge/Google%20GenAI-Gemini%20Flash-4285F4.svg?logo=google&logoColor=white)](https://ai.google.dev)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 1. Problem Statement
In Pakistan and across South Asia, millions of patients receive diagnostic lab reports and physician prescriptions that they cannot comprehend. These documents are overwhelmingly written in technical English medical jargon, abbreviated notations, and illegible clinical shorthand. As a result:
- Patients experience elevated anxiety and confusion regarding test results.
- Critical findings (e.g., severe hyperglycemia or acute infection) may go unaddressed until complications arise.
- Patients lack actionable, plain-language questions when meeting their doctors.
- Language barriers prevent Urdu and Roman Urdu readers from accessing equitable health literacy.

**SehatSamajh** addresses **UN Sustainable Development Goal 3 (Good Health and Well-Being)** by translating complex medical documents into simple, empathetic explanations in **Urdu (اردو)**, **Roman Urdu**, and **English** at a 6th-grade reading level.

---

## 2. Target Users
1. **Everyday Patients and Caregivers**: Families seeking to understand lab tests (blood counts, lipid profiles, glucose) or prescriptions without medical jargon.
2. **Urdu and Roman Urdu Speakers**: Users who are more comfortable reading in native Urdu script (with Noto Nastaliq font) or colloquial Roman Urdu.
3. **Elderly and Low-Literacy Patients**: Users who benefit from the integrated Web Speech API Read-Aloud audio explanation.
4. **Primary Healthcare Visitors**: Patients preparing for physician consultations who need 2–4 targeted questions to ask their doctor.

---

## 3. AI Stack & Architecture
- **Language Model**: Google Gemini Flash (`gemini-2.5-flash` or `gemini-2.0-flash`) via the modern `google-genai` SDK.
- **Multimodal Perception**: Accepts document photos (JPG, PNG, WEBP, HEIC) and PDF reports directly into Gemini's multimodal vision context.
- **Structured Validation**: Pydantic v2 schemas enforce typed JSON output containing document classification, summary, lab items with traffic-light status, medicines, doctor questions, and safety flags.
- **Self-Correction & Retry**: Automatic retry mechanism if the model produces non-compliant JSON.
- **Frontend**: React 18 (Vite), Tailwind CSS, Lucide icons, responsive mobile-first layout with native RTL support and Noto Nastaliq Urdu typography.

---

## 4. How the AI is Used
1. **Document Classification**: Distinguishes between `lab_report`, `prescription`, or `unknown`.
2. **Biomarker Extraction**: Extracts test names, patient values, units, and printed reference ranges exactly as printed on the document.
3. **Traffic-Light Grading**: Flags each item as `normal` (green), `high` (amber), `low` (sky), or `unclear` (slate).
4. **6th-Grade Explanations**: Explains the general role of each biomarker in the body without making diagnostic claims.
5. **Prescription Breakdown**: Formats medicines, dosages, frequencies, purposes, and important precautions.
6. **Doctor Question Generation**: Formulates 2–4 concise questions for the patient's next appointment.
7. **Context-Bounded Follow-up Chat**: A safe Q&A box where users can ask questions about the report. The AI answers strictly from the document context and refuses diagnostic or dosage alteration inquiries.

---

## 5. Safety Limits & Ethical Safeguards
SehatSamajh is engineered with strict clinical safety guardrails:
- **Strictly Non-Diagnostic**: The AI never tells a patient they "have" a disease or condition. It only describes what the numerical values mean relative to the printed reference interval.
- **No Medication Changes**: The AI never advises starting, pausing, or changing prescription doses, always emphasizing adherence to the prescribing doctor.
- **Urgent Value Detection**: An urgent banner is triggered only when critical thresholds are breached (e.g., blood glucose > 350 mg/dL or < 50 mg/dL, severe hemoglobin drop).
- **Mandatory Medical Disclaimer**: Every response enforces a clear medical disclaimer in the selected language.
- **Unclear Text Handling**: Blurry, unreadable, or cropped values are designated `unclear` instead of hallucinating.
- **Audio Read-Aloud**: Browser-native Web Speech API reads the plain summary aloud. The control gracefully hides if the voice is unsupported.

---

## 6. Startup & Business Model
SehatSamajh operates a sustainable dual-track model designed for Pakistan's healthcare ecosystem:

### B2B Add-on (Diagnostic Labs, Clinics & Pharmacies)
- **Lab Patient Portal Widget & API**: Integration into top Pakistani diagnostic networks (e.g., Chughtai Lab, Shaukat Khanum, Excel Labs, Al-Khidmat) to send an automated "Aasan Urdu Explanation" link alongside digital SMS/WhatsApp reports.
- **Pharmacy & Clinic Tele-Support**: Retail pharmacies (e.g., D.Watson, Fazal Din, Servaid) can print or QR-deliver plain-language medicine schedules to reduce medication errors.
- **Pricing**: Tiered B2B API subscription based on volume of report interpretations processed per month.

### Freemium for Patients
- **Free Tier**: Unlimited text paste and basic document analysis in English, Urdu, and Roman Urdu.
- **Premium Tier**: Digital family health vault, historical trend tracking (e.g., HbA1c over time), medication reminder alerts, and WhatsApp bot integration.

---

## 7. Project Folder Structure
```
sehatsamajh/
├── backend/
│   ├── main.py            # FastAPI app, CORS, routes (/api/health, /api/analyze, /api/ask)
│   ├── ai_service.py      # Gemini SDK integration, prompts, validation & retry logic
│   ├── schemas.py         # Pydantic models for structured output & validation
│   ├── safety.py          # Critical threshold rules and multilingual disclaimers
│   ├── test_backend.py    # Pytest unit & integration test suite (11 tests)
│   └── requirements.txt   # Python backend dependencies
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx       # Hero, value proposition, sample triggers
│   │   │   ├── Analyze.jsx    # Upload, camera, text paste, language switcher
│   │   │   └── Result.jsx     # Traffic-light table, urgent banner, chat, speech
│   │   ├── components/
│   │   │   ├── UploadBox.jsx       # Drag & drop, camera, paste text, presets
│   │   │   ├── ValueTable.jsx      # Traffic-light visual cards
│   │   │   ├── MedicineList.jsx    # Prescription cards & dosage guide
│   │   │   ├── DoctorQuestions.jsx # One-click copyable questions
│   │   │   ├── UrgentBanner.jsx    # High-contrast critical alert banner
│   │   │   ├── ChatBox.jsx         # Context-bounded interactive Q&A
│   │   │   ├── LanguageToggle.jsx  # Language switch (en, ur, roman_ur)
│   │   │   └── ReadAloud.jsx       # Web Speech API reader
│   │   ├── sampleData.js  # Embedded synthetic reports for one-click demo
│   │   ├── api.js         # Frontend fetch client
│   │   ├── App.jsx        # Routing, RTL management, localStorage persistence
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Tailwind directives & Noto Nastaliq styles
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── samples/
│   ├── sample_lab_report.txt       # Synthetic CBC & Metabolic panel
│   ├── sample_lab_report.png       # Rendered synthetic lab image
│   ├── sample_prescription.txt     # Synthetic Doctor Rx slip
│   └── sample_prescription.png     # Rendered synthetic prescription image
├── .env.example
├── .gitignore
└── README.md
```

---

## 8. Setup & Running the Application

### Prerequisites
- Python 3.10+ (tested on Python 3.14)
- Node.js 18+ (tested on Node.js v22)
- Google Gemini API Key ([Get one free from Google AI Studio](https://aistudio.google.com/))

### 1. Configure Environment Variables
Copy `.env.example` to `.env` in the project root:
```bash
cp .env.example .env
```
Open `.env` and set your Gemini API key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
PORT=8000
HOST=0.0.0.0
```

### 2. Start the Backend Server
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
Verify the backend is live:
```bash
curl http://127.0.0.1:8000/api/health
# Response: {"status":"ok","version":"1.0.0"}
```

To run the backend test suite:
```bash
cd backend
pytest -v
```

### 3. Start the Frontend Application
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Open your browser and navigate to **`http://localhost:5173`**.

---

## 9. Demo Walkthrough Steps

1. **Visit Home Screen**:
   - View the UN SDG 3 health literacy value proposition.
   - Click **"Try a Sample Report"** or **"Upload Medical Document"**.

2. **Test Synthetic Lab Report**:
   - In the Analyze screen, click the **"Sample 1: Blood Lab Report"** quick button.
   - Toggle language between **English**, **Roman Urdu**, and **اردو** (notice how Urdu switches to right-to-left layout and applies the Noto Nastaliq Urdu font).
   - Click **"Explain My Medical Document"**.
   - Review the **Traffic-Light table** showing normal, high (elevated fasting blood sugar & cholesterol), and grade-6 explanations.

3. **Test Synthetic Prescription**:
   - Return to Analyze and click **"Sample 2: Doctor Prescription"**.
   - Click **"Explain My Medical Document"**.
   - Review the **Medicine Guide** with Augmentin, Panadol, Risek, and Hydryllin, with dosage timings, purposes, and precautions.
   - Review **Questions to Ask Your Doctor** and use the one-click copy button.

4. **Test Multimodal Upload**:
   - Drag and drop `samples/sample_lab_report.png` or `samples/sample_prescription.png` into the upload zone.
   - Run the analysis to verify multimodal image vision extraction.

5. **Test Safe Follow-Up Chat**:
   - Type a question in the chat box: *"What should I ask my doctor about my blood sugar?"*
   - Test safety boundaries by asking: *"Do I have diabetes?"* or *"Can I stop taking Augmentin?"*
   - Verify that SehatSamajh politely refuses diagnosis and advises consulting a healthcare professional.

6. **Test Audio Read-Aloud**:
   - Click the **"Play"** button on the summary card to hear the Web Speech API read the summary.

7. **Test Error Handling**:
   - Try submitting without any file or text, or upload an unsupported file (e.g. `.exe` or `.zip`).
   - Notice the friendly, descriptive error messages that prevent app crashes.

---

## 10. Acceptance Verification Summary
- **Synthetic Lab Report**: Fully validated with live extraction and traffic-light classification.
- **Synthetic Prescription**: Extracted medicines with doses, schedule, and precautions.
- **Multilingual Support**: English, Urdu (RTL + Noto Nastaliq Urdu), and Roman Urdu.
- **No Hard-Coded AI**: Integrates directly with Google Gemini Flash.
- **No Secrets in Repo**: `.env` is gitignored; `.env.example` provided.
- **Safety Tested**: 11 automated Pytest unit and integration tests passing.
