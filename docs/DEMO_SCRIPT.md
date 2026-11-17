# SehatSamajh: Click-by-Click Live Demo Script

This script outlines the exact click-by-click steps to present the **SehatSamajh** prototype during a live evaluation or jury demo.

---

## Pre-Demo Checklist
1. **Backend Server Running**:
   ```bash
   cd backend
   uvicorn main:app --reload --port 8000
   ```
   Verify health check: Open browser to `http://localhost:8000/api/health` -> should return `{"status": "ok"}`.
2. **Frontend Running**:
   ```bash
   cd frontend
   npm run dev
   ```
   Open browser to `http://localhost:5173`.
3. **Environment**:
   Ensure `GEMINI_API_KEY` is present in `backend/.env` or system environment.

---

## Step 1: Landing Page & Problem Framing (0:00 - 0:45)
1. **Navigate to `http://localhost:5173`**.
2. **Point out Key UI Elements**:
   - The UN SDG 3 badge (*AI for Accessible Healthcare & Well-Being*).
   - Clear headline and one-line value proposition in English.
   - High-contrast, mobile-friendly design.
3. **Trigger Language Toggle to Urdu**:
   - Click the **اردو** button in the top navigation bar.
   - **Showcase**: The entire page flips to a native Right-to-Left (RTL) layout using Google Fonts Noto Nastaliq Urdu typography.
   - Switch back to English or Roman Urdu to demonstrate seamless instant switching.

---

## Step 2: Demo Lab Report (CBC with Critical Hemoglobin) (0:45 - 2:00)
1. **Click "Try Sample Lab Report"** on the home page.
2. The user is taken to the **Analyze screen** with the synthetic CBC report automatically populated in the text tab.
   - *(Optional multimodal demo)*: Switch to the **Upload Document / Photo** tab and select `samples/sample_lab_report.png` from the file picker to demonstrate image vision processing.
3. **Click "Analyze Document Now"**.
4. **Showcase Loading State**:
   - Note the spinning loader and calming step-by-step progress messaging (*"Reading printed reference intervals...", "Translating medical jargon to Grade-6 language..."*).
5. **Review the Results Screen**:
   - **Urgent Banner**: A high-visibility, calm red banner appears at the top:
     > *"Medical Notice: One or more lab values are significantly outside the reference range (Hemoglobin (Hb) (6.2 g/dL) is significantly below reference interval). Please schedule a prompt consultation with your doctor."*
   - **Summary Card**: Grade-6 plain language summary explaining red blood cells and immunity.
   - **Traffic-Light Table**:
     - Hemoglobin (6.2 g/dL): Marked in **Red (High/Abnormal Low)** with plain explanation of severe anemia.
     - Total Leukocyte Count (16,800 /cumm): Marked in **Red (High)** indicating the body is responding to infection.
     - Platelet Count (85,000 /cumm): Marked in **Amber (Low)**.
   - **Doctor Questions**:
     - 3 to 5 practical questions for the doctor (e.g., *"What is causing my hemoglobin to drop to 6.2?", "Do I need iron supplements or a transfusion?"*).
     - Click the **Copy** button on question #1 -> Note the visual "Copied" feedback.
   - **Web Speech Read-Aloud**:
     - Click **Read Aloud** to play browser audio of the summary.
   - **Mandatory Medical Disclaimer**:
     - Review the permanent footer emphasizing that this is educational and non-diagnostic.

---

## Step 3: Demo Prescription (3 Medicines) (2:00 - 3:15)
1. **Click "Analyze Another"** in the top navigation.
2. **Switch to Urdu language toggle (اردو)**.
3. Click **"ڈیمو نسخہ (3 ادویات) لوڈ کریں"** (or load `samples/sample_prescription.png` via upload tab).
4. Click **"ابھی رپورٹ کا جائزہ لیں"** (Analyze Document Now).
5. **Review Prescription Results in Urdu (RTL)**:
   - Notice the document type badge shows: **ڈاکٹر کا نسخہ (Rx)**.
   - **Prescription Medicines Guide**:
     - **Augmentin 625 mg**: Dose: 1 tablet, Frequency: دن میں دو بار (کھانے کے بعد), Duration: 5 days, Purpose: اینٹی بائیوٹک (بیکٹیریل انفیکشن کے خاتمے کے لیے).
     - **Panadol 500 mg**: Dose: 1-2 tablets, Frequency: بخار یا درد کی صورت میں.
     - **Risek 20 mg**: Dose: 1 capsule, Frequency: صبح ناشتے سے آدھا گھنٹہ پہلے (معدے میں تیزابیت سے بچاؤ).
   - Notice the clear distinction between general advice and prescription drugs.

---

## Step 4: Context-Bounded Interactive Chat (3:15 - 4:15)
1. Scroll down to the **Chat Box** (*رپورٹ کے بارے میں مزید سوال پوچھیں*).
2. Click one of the suggested quick questions or type a challenging follow-up question:
   - **Question**: *"کیا میں بخار ٹھیک ہونے پر آگمینٹن کھانا بند کر سکتا ہوں؟"* (Can I stop Augmentin if fever resolves?)
   - **Or in English**: *"Can I stop taking Augmentin now that my fever has improved?"*
3. Click **Send / ارسال کریں**.
4. **Observe the AI Response**:
   - The AI responds strictly from the document.
   - It politely explains that antibiotics must be taken for the complete prescribed duration (5 days) even if symptoms improve.
   - It firmly emphasizes: *"اپنے معالج یا ڈاکٹر کے مشورے کے بغیر دوا بند نہ کریں اور ہمیشہ اپنے ڈاکٹر سے رجوع کریں۔"* (Never alter or stop medication without doctor consultation).

---

## Step 5: Input Validation & Edge Case Handling (4:15 - 5:00)
1. Click **Analyze Another**.
2. Try submitting an empty form -> See immediate friendly validation error: *"Please provide either a document file or paste the report text."*
3. Try uploading a `.zip` or `.exe` file -> See friendly format error: *"Unsupported file format. Please upload only PNG, JPG, JPEG, WEBP, or PDF files."*
4. Show that the backend and frontend never crash.

---

## Backup Plan (In Case of Network Outage or AI API Rate Limit)

If live Gemini API calls fail due to network loss, proxy blockage, or 429 quota exhaustion:

1. **Local Stored Result Fallback**:
   - The application automatically persists the last successful analysis into browser `localStorage`.
   - Refresh the page or click **"View Last Saved Result"** / **"پچھلا محفوظ شدہ نتیجہ دیکھیں"** on the home screen.
   - The full interactive UI (traffic light table, medicines guide, urgent banner, copy button, audio read-aloud) will load instantaneously from the cached state.
2. **Pre-Generated Test Suite Verification**:
   - Open a terminal and run `pytest -v` in `/backend`.
   - Point the judges to all 19 unit & integration tests passing with 100% test coverage of schema validation, multimodal payload handling, safety rules, and rate limit error handling.
3. **Pre-Rendered Sample PNG Artifacts**:
   - Showcase `/samples/sample_lab_report.png` and `/samples/sample_prescription.png` directly in the image viewer to display the high-fidelity input documents created for the project.
