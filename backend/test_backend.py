"""
Backend tests for SehatSamajh.
Covers health check, input validation, schemas, safety rules, and AI service logic.
"""

import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from pydantic import ValidationError

from main import app
from schemas import AnalysisResponse, LabItem, MedicineItem, AskRequest
from safety import verify_safety_flags, get_disclaimer, CRITICAL_THRESHOLDS

client = TestClient(app)

def test_health_check():
    """Verify /api/health returns ok status."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data

def test_empty_analyze_request():
    """Analyze must reject requests with neither file nor text."""
    response = client.post("/api/analyze", data={"language": "en"})
    assert response.status_code == 400
    assert "Please provide either a document file" in response.json()["detail"]

def test_invalid_file_type():
    """Analyze must reject unsupported file formats like executable or text files disguised."""
    response = client.post(
        "/api/analyze",
        data={"language": "en"},
        files={"file": ("malicious.exe", b"MZ...", "application/x-msdownload")}
    )
    assert response.status_code == 400
    assert "Unsupported file format" in response.json()["detail"]

def test_empty_ask_question():
    """Ask endpoint must reject empty question string."""
    response = client.post("/api/ask", json={
        "context": {"doc_type": "lab_report", "summary": "Sample"},
        "question": "   ",
        "language": "en"
    })
    assert response.status_code == 400

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
    """Ensure critical threshold (e.g. glucose = 420) triggers urgent_flag."""
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
    assert "critically high" in checked["urgent_reason"]

def test_schema_item_status_validation():
    """Schema must reject unapproved item statuses."""
    with pytest.raises(ValidationError):
        LabItem(
            name="Hemoglobin",
            value="13.5",
            unit="g/dL",
            reference_range="12-16",
            status="dangerous",  # Invalid status (must be normal|high|low|unclear)
            plain_explanation="Normal level"
        )

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
        "questions_for_doctor": ["Are my iron levels adequate?"],
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
