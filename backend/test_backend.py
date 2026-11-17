"""
Backend tests for SehatSamajh.
Covers health check, input validation, schemas, safety rules, image/PDF multimodal,
safety post-check sanitization, and AI service logic.
"""

import io
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from google.genai.errors import APIError

from main import app
from schemas import AnalysisResponse, LabItem, MedicineItem, AskRequest
from safety import verify_safety_flags, get_disclaimer, sanitize_safety_text, CRITICAL_THRESHOLDS
from ai_service import extract_json_data

client = TestClient(app)

def test_health_check():
    """Verify /api/health strictly returns {"status": "ok"}."""
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_empty_analyze_request():
    """Analyze must reject requests with neither file nor text with friendly error."""
    response = client.post("/api/analyze", data={"language": "en"})
    assert response.status_code == 400
    res_json = response.json()
    assert "error" in res_json
    assert "Please provide either a document file" in res_json["error"]

def test_empty_file_upload():
    """Analyze must reject requests with a 0-byte file and no text."""
    response = client.post(
        "/api/analyze",
        data={"language": "en"},
        files={"file": ("empty.png", b"", "image/png")}
    )
    assert response.status_code == 400
    res_json = response.json()
    assert "error" in res_json
    assert "uploaded file is empty" in res_json["error"]

def test_file_size_exceeded_8mb():
    """Analyze must reject files larger than 8 MB with HTTP 413."""
    oversized = b"0" * (9 * 1024 * 1024)  # 9 MB
    response = client.post(
        "/api/analyze",
        data={"language": "en"},
        files={"file": ("big_report.pdf", oversized, "application/pdf")}
    )
    assert response.status_code == 413
    res_json = response.json()
    assert "error" in res_json
    assert "8 MB limit" in res_json["error"]

def test_invalid_file_type():
    """Analyze must reject unsupported file formats like executable or zip files."""
    response = client.post(
        "/api/analyze",
        data={"language": "en"},
        files={"file": ("malicious.exe", b"MZ...", "application/x-msdownload")}
    )
    assert response.status_code == 400
    res_json = response.json()
    assert "error" in res_json
    assert "Unsupported file format" in res_json["error"]

def test_empty_ask_question():
    """Ask endpoint must reject empty question string."""
    response = client.post("/api/ask", json={
        "context": {"doc_type": "lab_report", "summary": "Sample"},
        "question": "   ",
        "language": "en"
    })
    assert response.status_code == 400
    res_json = response.json()
    assert "error" in res_json
    assert "Question cannot be empty" in res_json["error"]

def test_safety_disclaimer_defaults():
    """Ensure safety module supplies proper disclaimers in all 3 languages."""
    for lang in ["en", "ur", "roman_ur"]:
        disc = get_disclaimer(lang)
        assert disc is not None and len(disc) > 30

    # Ensure safety function injects disclaimer if missing
    sample = {"doc_type": "lab_report", "summary": "Test summary", "items": []}
    verified = verify_safety_flags(sample, language="ur")
    assert "طبی دستبرداری" in verified["disclaimer"]

def test_safety_critical_threshold_detection():
    """Ensure critical threshold (e.g. glucose = 420 or Hb = 6.2) triggers urgent_flag."""
    data = {
        "doc_type": "lab_report",
        "summary": "High blood sugar noted",
        "items": [
            {
                "name": "Fasting Blood Glucose",
                "value": "420",
                "unit": "mg/dL",
                "reference_range": "70 - 99",
                "status": "high",
                "plain_explanation": "Blood sugar is extremely elevated."
            }
        ],
        "urgent_flag": False,
        "urgent_reason": ""
    }
    checked = verify_safety_flags(data, language="en")
    assert checked["urgent_flag"] is True
    assert "significantly above reference interval" in checked["urgent_reason"]

def test_safety_critical_hemoglobin_sample_flag():
    """Ensure sample lab report's Hemoglobin = 6.2 g/dL triggers calm urgent_flag."""
    data = {
        "doc_type": "lab_report",
        "summary": "Complete Blood Count",
        "items": [
            {
                "name": "Hemoglobin (Hb)",
                "value": "6.2",
                "unit": "g/dL",
                "reference_range": "13.0 - 17.0",
                "status": "low",
                "plain_explanation": "Hemoglobin measures oxygen carriage."
            }
        ],
        "urgent_flag": False,
        "urgent_reason": ""
    }
    checked = verify_safety_flags(data, language="en")
    assert checked["urgent_flag"] is True
    assert "significantly below reference interval" in checked["urgent_reason"]
    assert "Please schedule a prompt consultation" in checked["urgent_reason"]

def test_safety_hba1c_does_not_trigger_hemoglobin():
    """Ensure HbA1c (e.g. 5.2%) is NOT falsely flagged as critically low blood hemoglobin."""
    data = {
        "doc_type": "lab_report",
        "summary": "Routine metabolic panel",
        "items": [
            {
                "name": "HbA1c (Glycated Hemoglobin)",
                "value": "5.2",
                "unit": "%",
                "reference_range": "4.0 - 5.6",
                "status": "normal",
                "plain_explanation": "Good long-term glucose control."
            }
        ],
        "urgent_flag": False,
        "urgent_reason": ""
    }
    checked = verify_safety_flags(data, language="en")
    # Must NOT flag urgent for normal HbA1c
    assert checked["urgent_flag"] is False
    assert checked["urgent_reason"] == ""

def test_safety_post_check_sanitization():
    """Verify post-check sanitization rewrites diagnostic claims and medicine modification."""
    # Diagnostic assertion sanitization
    raw_diag = "You have diabetes and need treatment immediately."
    clean_diag = sanitize_safety_text(raw_diag, "en")
    assert "confirm with your doctor" in clean_diag
    assert not ("You have diabetes" in clean_diag)

    # Medicine alteration sanitization
    raw_med = "Stop taking Augmentin 625mg immediately."
    clean_med = sanitize_safety_text(raw_med, "en")
    assert "do not change medication without speaking to your doctor" in clean_med

    # Urdu medicine change sanitization
    raw_ur = "دوا کھانا چھوڑ دیں اور آرام کریں"
    clean_ur = sanitize_safety_text(raw_ur, "ur")
    assert "اپنے معالج یا ڈاکٹر سے رجوع کریں" in clean_ur

def test_schema_item_status_normalization():
    """Schema must normalize status casing and synonyms to approved literals."""
    item1 = LabItem(
        name="Hemoglobin",
        value="13.5",
        unit="g/dL",
        reference_range="12-16",
        status="HIGH",
        plain_explanation="Normal level"
    )
    assert item1.status == "high"

    item2 = LabItem(
        name="TLC",
        value="5000",
        status="Within Normal Limits",
        plain_explanation="Normal"
    )
    assert item2.status == "normal"

def test_schema_none_coercion():
    """Ensure null values in optional fields coerce safely to strings and lists."""
    item = LabItem(
        name="BUN/Creatinine Ratio",
        value="14.2",
        unit=None,
        reference_range=None,
        status="normal",
        plain_explanation="Healthy ratio"
    )
    assert item.unit == ""
    assert item.reference_range == ""

    med = MedicineItem(
        name="Panadol",
        dose=None,
        frequency=None,
        purpose=None,
        notes=None
    )
    assert med.dose == ""
    assert med.notes == ""

    resp = AnalysisResponse(
        doc_type="lab_report",
        summary="Test summary",
        items=None,
        medicines=None,
        questions_for_doctor=None,
        urgent_flag=False,
        urgent_reason=None,
        disclaimer="Test"
    )
    assert resp.items == []
    assert resp.medicines == []
    assert resp.urgent_reason == ""

def test_extract_json_with_markdown_fences():
    """Test extract_json_data safely extracts JSON wrapped in markdown blocks."""
    wrapped = "```json\n{\"doc_type\": \"lab_report\", \"summary\": \"Valid test\"}\n```"
    result = extract_json_data(wrapped)
    assert result["doc_type"] == "lab_report"
    assert result["summary"] == "Valid test"

def test_mocked_analyze_text():
    """Verify end-to-end text analysis with mocked Gemini response."""
    mock_response_data = {
        "doc_type": "lab_report",
        "summary": "This is a basic complete blood count test explaining red and white blood cells.",
        "items": [
            {
                "name": "Hemoglobin",
                "value": "13.2",
                "unit": "g/dL",
                "reference_range": "12.0 - 15.5",
                "status": "normal",
                "plain_explanation": "Hemoglobin carries oxygen in your blood. This number is in the standard healthy range."
            }
        ],
        "medicines": [],
        "questions_for_doctor": [
            "Are my iron levels adequate?",
            "Do I need any follow-up tests?",
            "Should I maintain any dietary changes?"
        ],
        "urgent_flag": False,
        "urgent_reason": "",
        "disclaimer": "Sample disclaimer"
    }

    mock_gemini_obj = MagicMock()
    mock_gemini_obj.text = AnalysisResponse(**mock_response_data).model_dump_json()

    with patch("ai_service.get_genai_client") as mock_client:
        mock_instance = MagicMock()
        mock_instance.models.generate_content.return_value = mock_gemini_obj
        mock_client.return_value = mock_instance

        response = client.post(
            "/api/analyze",
            data={
                "text": "Patient: Demo, Hemoglobin: 13.2 g/dL (12.0 - 15.5)",
                "language": "en"
            }
        )
        assert response.status_code == 200
        result = response.json()
        assert result["doc_type"] == "lab_report"
        assert len(result["items"]) == 1
        assert result["items"][0]["status"] == "normal"
        assert len(result["questions_for_doctor"]) >= 3

def test_mocked_analyze_image():
    """Verify multimodal image upload analysis."""
    mock_response_data = {
        "doc_type": "lab_report",
        "summary": "Image analysis of blood report.",
        "items": [
            {
                "name": "Fasting Glucose",
                "value": "184",
                "unit": "mg/dL",
                "reference_range": "70 - 99",
                "status": "high",
                "plain_explanation": "Blood sugar is higher than standard reference."
            }
        ],
        "medicines": [],
        "questions_for_doctor": ["Should we check HbA1c?", "What diet helps?", "When to retest?"],
        "urgent_flag": False,
        "urgent_reason": "",
        "disclaimer": "Sample disclaimer"
    }

    mock_gemini_obj = MagicMock()
    mock_gemini_obj.text = AnalysisResponse(**mock_response_data).model_dump_json()

    with patch("ai_service.get_genai_client") as mock_client:
        mock_instance = MagicMock()
        mock_instance.models.generate_content.return_value = mock_gemini_obj
        mock_client.return_value = mock_instance

        fake_image_bytes = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4"
        response = client.post(
            "/api/analyze",
            data={"language": "ur"},
            files={"file": ("test_report.png", fake_image_bytes, "image/png")}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["doc_type"] == "lab_report"
        assert data["items"][0]["name"] == "Fasting Glucose"

def test_mocked_analyze_pdf():
    """Verify multimodal PDF upload analysis."""
    mock_response_data = {
        "doc_type": "prescription",
        "summary": "Doctor prescription for infection.",
        "items": [],
        "medicines": [
            {
                "name": "Augmentin",
                "dose": "625mg",
                "frequency": "Twice daily",
                "purpose": "Antibiotic for bacterial infection",
                "notes": "Take after meals for 5 days"
            }
        ],
        "questions_for_doctor": ["Can I take this with dairy?", "Should I take it with food?", "Are there side effects?"],
        "urgent_flag": False,
        "urgent_reason": "",
        "disclaimer": "Sample disclaimer"
    }

    mock_gemini_obj = MagicMock()
    mock_gemini_obj.text = AnalysisResponse(**mock_response_data).model_dump_json()

    with patch("ai_service.get_genai_client") as mock_client:
        mock_instance = MagicMock()
        mock_instance.models.generate_content.return_value = mock_gemini_obj
        mock_client.return_value = mock_instance

        fake_pdf_bytes = b"%PDF-1.4\n%Fake PDF content for test\n%%EOF"
        response = client.post(
            "/api/analyze",
            data={"language": "roman_ur"},
            files={"file": ("prescription.pdf", fake_pdf_bytes, "application/pdf")}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["doc_type"] == "prescription"
        assert len(data["medicines"]) == 1
        assert data["medicines"][0]["name"] == "Augmentin"

def test_mocked_ask_question():
    """Verify safe Q&A response endpoint."""
    mock_gemini_obj = MagicMock()
    mock_gemini_obj.text = "Augmentin is an antibiotic used to clear bacterial infections. Always confirm with your doctor."

    with patch("ai_service.get_genai_client") as mock_client:
        mock_instance = MagicMock()
        mock_instance.models.generate_content.return_value = mock_gemini_obj
        mock_client.return_value = mock_instance

        response = client.post(
            "/api/ask",
            json={
                "context": {"doc_type": "prescription", "summary": "Sample"},
                "question": "What is Augmentin for?",
                "language": "en"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "Augmentin" in data["answer"]

def test_api_limit_error_handling():
    """Verify rate limit APIError translates to friendly HTTP 429 response."""
    with patch("ai_service.get_genai_client") as mock_client:
        mock_instance = MagicMock()
        api_error = APIError(429, {"error": {"message": "RESOURCE_EXHAUSTED: Quota exceeded for model", "code": 429}})
        mock_instance.models.generate_content.side_effect = api_error
        mock_client.return_value = mock_instance

        response = client.post(
            "/api/analyze",
            data={"text": "Hemoglobin 13.5", "language": "en"}
        )
        assert response.status_code == 429
        res_json = response.json()
        assert "error" in res_json
        assert "rate limit or quota exceeded" in res_json["error"]
