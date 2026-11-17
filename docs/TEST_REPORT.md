# SehatSamajh: QA & Test Engineering Report

**Date**: 17 November 2026  
**System Tested**: SehatSamajh (FastAPI Backend + React Vite Frontend)  
**Branch**: `main`  
**Test Environment**: Python 3.14.4 / Node.js v22.22.3 / Windows 10 (Build 26300)

---

## 1. Test Execution Summary

| Test # | Test Scope / Scenario | Status | Result / One-Line Evidence |
|:---:|:---|:---:|:---|
| **T01** | Backend Health Check (`GET /api/health`) | **PASS** | HTTP 200 strictly returning `{"status": "ok"}`. |
| **T02** | Automated Backend Pytest Suite | **PASS** | 24 of 24 tests passed in 6.05s (`backend/test_backend.py`). |
| **T03** | Frontend Production Build (`npm run build`) | **PASS** | 1,591 modules transformed with 0 errors in 8.89s. |
| **T04** | Bad Input - Empty Request | **PASS** | HTTP 400 returning friendly JSON: `"Please provide either a document file (image/PDF) or paste the report text."` |
| **T05** | Bad Input - Unsupported Extension (`.exe`) | **PASS** | HTTP 400 returning friendly JSON: `"Unsupported file format '.exe'. Please upload only PNG, JPG, JPEG, WEBP, or PDF files."` |
| **T06** | Bad Input - File Exceeding 4 MB | **PASS** | HTTP 413 returning exact contract: `"File too large. Maximum size is 4 MB."` |
| **T07** | Bad Input - Empty Chat Follow-up Question | **PASS** | HTTP 422 returning structured validation error without server crash. |
| **T08** | Codebase Scan for Hard-Coded/Mocked AI Output | **PASS** | Production logic contains zero mocked responses; mocks isolated strictly to CI unit tests (`test_backend.py`). |
| **T09** | Live AI Inference (External Google Gemini API Roundtrip) | **NOT RUN** | Live calls to Google AI Studio require the operator's active personal `GEMINI_API_KEY` in `backend/.env`. Per testing protocol, live external tokens are not stored or printed in CI logs. |
| **T10** | Mocked Multimodal & Schema Validation Pipelines | **PASS** | End-to-end extraction tested for text, PNG image, and PDF documents. |
| **T11** | Critical Clinical Threshold & Urgent Flag | **PASS** | Abnormal values (e.g. Glucose > 350 mg/dL, Hb < 6.5 g/dL) set `urgent_flag: True` with calm advisory. |
| **T12** | Safety Exclusion - HbA1c False Positive Prevention | **PASS** | Word-boundary regex ensures HbA1c (4.0–5.6%) is never evaluated against whole blood hemoglobin thresholds. |
| **T13** | Post-Check Non-Diagnostic Sanitization | **PASS** | Replaces diagnostic claims and medicine alteration instructions with doctor-referral advice. |
| **T14** | Dynamic CORS Configuration | **PASS** | Reads `ALLOWED_ORIGINS` env var; verified via preflight OPTIONS request on `/api/health`. |
| **T15** | Frontend Canvas Image Compression (< 3 MB, <= 2000px) | **PASS** | Native HTML5 canvas resizes high-res images to <= 2000px and compresses to JPEG ~0.85 quality. |
| **T16** | Frontend PDF 4 MB Constraint Validation | **PASS** | Frontend displays friendly error in EN, UR, and Roman UR when PDF exceeds 4 MB. |
| **T17** | Multilingual UI & RTL Nastaliq Typography | **PASS** | Dynamic `<html dir="rtl" lang="ur">` switching with Google Fonts Noto Nastaliq Urdu. |
| **T18** | Web Speech API Read-Aloud Graceful Fallback | **PASS** | Audio control renders when voice is available and gracefully unmounts when unsupported. |
| **T19** | Zero Committed Secrets Audit | **PASS** | `git check-ignore` confirms `.env` files are ignored; `git grep` verified 0 real API keys. |
| **T20** | Vercel Deployment Configuration | **PASS** | `backend/vercel.json` configured with `@vercel/python` and 60-second `maxDuration`; `main.py` exposes `app`. |

---

## 2. Bugs Found and Fixed

1. **HbA1c False Positive Emergency Alert**:
   - *Problem*: Substring search `"hb" in name_lower` caused healthy HbA1c values (e.g., 5.2%) to trigger whole-blood hemoglobin critical alerts.
   - *Fix*: Structured categories with regex word boundaries (`\b`) and explicit exclusions (`r"\bhba1c\b"`, `r"glycated"`).

2. **Duplicate Alert Strings**:
   - *Problem*: Separate keys for `"hemoglobin"` and `"hb"` caused duplicated alerts for single abnormal markers.
   - *Fix*: Single-category resolution and deduplication set for critical alert findings.

3. **Pydantic Validation Crash on `null` Fields**:
   - *Problem*: Gemini outputting `null` for optional strings crashed non-nullable Pydantic fields.
   - *Fix*: Added `@field_validator(mode="before")` across all models to coerce `null` to `""` or `[]`.

4. **Vercel 4.5 MB Payload Limit Violation**:
   - *Problem*: Original 8 MB upload limit exceeded Vercel's serverless function request body limit (4.5 MB).
   - *Fix*: Lowered backend upload limit to 4 MB with exact error message `"File too large. Maximum size is 4 MB."`, and added client-side HTML5 Canvas JPEG compression (capping at 2000px and < 3 MB).

5. **RTL Chat Alignment Inversion**:
   - *Problem*: Directional class switching caused user and bot bubbles to align on the same side in RTL mode.
   - *Fix*: Standardized user messages to `flex-row-reverse` in both viewports for clear visual separation.

6. **Clipboard Security Exception**:
   - *Problem*: Restricted webviews threw unhandled promise rejections on `navigator.clipboard.writeText`.
   - *Fix*: Added standard DOM selection and `document.execCommand('copy')` fallback.

7. **Strict `/api/health` Contract**:
   - *Problem*: Health check included an unexpected `version` field.
   - *Fix*: Normalized response schema to return strictly `{"status": "ok"}`.

---

## 3. Known Limitations

1. **Illegible or Distorted Clinical Handwriting**:
   - Severely blurry photos or illegible cursive doctor shorthand will yield `status: "unclear"` and `doc_type: "unknown"`. The model is instructed never to hallucinate values.
2. **External API Rate Limits (Google Gemini Free Tier)**:
   - Free-tier API keys are subject to requests-per-minute (RPM) quotas. HTTP 429 quota exhaustion is trapped and returned as a friendly retry prompt.
3. **Synthetic Data Only**:
   - Per hackathon ethical standards and privacy constraints, only synthetic laboratory panels and prescriptions were used during testing.
4. **Browser Speech Voice Dependencies**:
   - Web Speech API Urdu synthesis relies on the operating system voice pack (e.g., Microsoft Asad/Gul or Google Urdu). If absent, the audio button gracefully unmounts.
