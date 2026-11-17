# SehatSamajh: 6-Minute Pitch Script

**Title**: SehatSamajh (صحت سمجھ) – Accessible Health Literacy for Every Pakistani  
**Track**: AI for Accessible Healthcare & Well-Being (UN SDG 3)  
**Presenter**: Senior Full-Stack Engineer / Founder  
**Target Duration**: Exactly 6 minutes (360 seconds)  
**Style**: Conversational, empathetic, grounded English. No made-up statistics.

---

### [0:00 - 1:00] The Human Story & Problem

"Good morning everyone.

Let me introduce you to Tariq, a 48-year-old shopkeeper in Lahore. Last Tuesday, he felt unusually fatigued and had a routine blood test done at a local lab. That afternoon, he received a printed paper covered in abbreviated columns: TLC 16,800 /cumm, Hemoglobin 6.2 g/dL, ESR 42 mm/1st hr.

Tariq does not speak English, and he has never taken a biology course. Like millions of everyday citizens across Pakistan, he stared at that paper with anxiety. Is 6.2 high? Is 16,800 dangerous? When his family tried to help, they couldn't decipher it either.

In our country, diagnostic reports and doctor prescriptions are written almost exclusively in clinical English jargon and doctor shorthand. Patients walk out of clinics and labs overwhelmed, confused, and fearful. They miss critical warning signs, they make errors with their medicine schedules, and when they return to see their doctor, they don't even know what questions to ask.

This directly impedes **UN Sustainable Development Goal 3: Good Health and Well-Being**. Health literacy is fundamental to health equity."

---

### [1:00 - 1:45] The Users We Serve

"We built **SehatSamajh** to solve this exact communication gap.

Our primary users are:
1. **Everyday Patients & Families**: Non-English speakers, elderly family members, and caregivers who need clear, simple guidance about what a medical document means.
2. **Urdu & Roman Urdu Readers**: People who think and communicate in Urdu or colloquial Roman Urdu, and deserve medical explanations in the language they naturally speak.
3. **Primary Care Clinicians & Diagnostic Labs**: Labs and clinics that want their patients to be informed, adherent to medications, and empowered with practical questions before their follow-up visit."

---

### [1:45 - 2:45] The Solution: What SehatSamajh Does

"**SehatSamajh** ('Understand Your Health') is a bilingual, safety-first web application.

A patient simply uploads a photo of their lab report or prescription, uploads a PDF, or pastes the text.

In seconds, the system transforms that confusing document into:
1. **A Grade-6 Plain Language Summary**: In Urdu, Roman Urdu, or English.
2. **A Traffic-Light Test Results Table**: Highlighting normal values in green, low in amber, high in red, and unclear in grey—evaluated strictly against the printed reference ranges.
3. **A Clear Medicine Schedule**: Grouping prescription drugs by dosage, frequency, and general purpose.
4. **Focused Doctor Questions**: 3 to 5 practical, copyable questions the patient can take into the examination room.
5. **Urgent Safety Alerts**: If a biomarker is dangerously out of range, like Tariq's severe hemoglobin drop, a calm urgent banner advises them to see a doctor promptly.

And crucially: **SehatSamajh never diagnoses.** It is strictly educational."

---

### [2:45 - 4:00] Live Demo Cue Points

*(Presenter switches to the live screen)*

**[Cue 1: Home Page & RTL Switch]**  
"Notice the interface. We designed it mobile-first with high-contrast accessibility. With one click on the language toggle, the entire interface dynamically shifts to native right-to-left Nastaliq Urdu typography.

**[Cue 2: Analyzing Tariq's Sample CBC Report]**  
Let's test Tariq's real CBC report. I click 'Try Sample Lab Report' and click 'Analyze Document Now'.  
In seconds, Gemini's multimodal vision model extracts the printed markers.  
Notice:
- The urgent banner immediately appears: Tariq's hemoglobin of 6.2 g/dL is dangerously below the 13–17 reference range, triggering a calm, prompt advisory to visit a doctor.
- The traffic-light table clearly explains TLC and ESR in plain words.
- The audio 'Read Aloud' button reads the entire summary aloud for low-literacy patients.

**[Cue 3: Prescription Analysis]**  
Next, let's load a prescription with 3 medicines: Augmentin, Panadol, and Risek.  
The AI extracts each drug, organizes daily timing (twice daily after meals, before breakfast), explains what each is generally used for, and provides 3 practical questions for the physician.

**[Cue 4: Safe Context-Bounded Chat]**  
Let's ask a follow-up question: *'Can I stop taking Augmentin once my fever goes down?'*  
Watch the AI response: It strictly refuses to alter medication and explains: *'Always finish the prescribed course as directed by your physician and confirm with your doctor.'*"

---

### [4:00 - 4:45] AI Approach & Ethical Safety Architecture

"How does this work under the hood?

We use Google Gemini Flash via the new `google-genai` SDK for multimodal perception across images, PDFs, and text.

Our safety pipeline has four strict defensive layers:
1. **Multimodal Extraction**: Text and printed reference intervals are extracted exactly as written. The AI is barred from inventing standard ranges.
2. **Pydantic Schema Validation**: Every output must strictly match our structured schema with an automated retry loop.
3. **Deterministic Safety Filter**: A Python rule engine screens critical physiological thresholds (such as extreme hypoglycemia or severe anemia).
4. **Post-Check Sanitization**: Our `safety.py` module inspects every generated sentence. Any phrase sounding like a medical diagnosis ('You have condition X') or medicine change instruction ('Stop taking drug Y') is automatically rewritten or removed before reaching the user."

---

### [4:45 - 5:30] Business & Sustainability Model

"How is SehatSamajh sustainable?

We are piloting a **B2B SaaS Add-On Model** for Pakistan's healthcare ecosystem:
- **Diagnostic Labs (Chughtai, Excel, Shaukat Khanum, Al-Khidmat)**: Labs pay a small monthly or per-report API fee to send patients an automated 'SehatSamajh Aasan Urdu Report' link alongside their SMS/WhatsApp test results. This cuts patient support calls and builds brand loyalty.
- **Clinics & Pharmacies (D.Watson, Servaid, Fazal Din)**: Pharmacies license our plain-language prescription printouts to reduce medication errors.
- **Free Patient Tier**: Patients always have free access to paste text and upload documents on the web app.

*Note: This business model is an early hypothesis to validate through initial pilot partnerships with local diagnostic centers.*"

---

### [5:30 - 6:00] The Ask & Conclusion

"Our team has built a working, fully tested, multimodal prototype from scratch today. 19 unit and integration tests are passing, mobile and RTL Urdu support is fully operational, and the system is live.

Our ask today:
1. Mentorship from clinical informatics specialists to refine our safety guardrail terminology.
2. Pilot partnerships with Pakistani diagnostic laboratories to test user comprehension in outpatient waiting rooms.

Health literacy is not a luxury; it is a fundamental human right. With SehatSamajh, we are making healthcare understandable for everyone.

Thank you. We welcome your questions."
