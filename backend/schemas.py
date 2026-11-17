from typing import Literal, List, Optional, Any
from pydantic import BaseModel, Field, field_validator

# Supported document types
DocType = Literal["lab_report", "prescription", "unknown"]

# Traffic-light status for lab report items
ItemStatus = Literal["normal", "high", "low", "unclear"]

# Supported output languages
Language = Literal["en", "ur", "roman_ur"]


class LabItem(BaseModel):
    name: str = Field(description="Name of the test or biomarker")
    value: str = Field(description="Patient value exactly as printed")
    unit: str = Field(default="", description="Measurement unit e.g. mg/dL, g/dL")
    reference_range: str = Field(default="", description="Printed reference range only")
    status: ItemStatus = Field(description="normal, high, low, or unclear")
    plain_explanation: str = Field(description="Simple 6th-grade explanation of what this test generally means")

    @field_validator("unit", "reference_range", mode="before")
    @classmethod
    def coerce_none_to_str(cls, v):
        return "" if v is None else str(v).strip()

    @field_validator("status", mode="before")
    @classmethod
    def normalize_status(cls, v):
        if not v:
            return "unclear"
        s = str(v).strip().lower()
        if s in ("normal", "high", "low", "unclear"):
            return s
        if "high" in s or "elevated" in s or "increased" in s:
            return "high"
        if "low" in s or "decreased" in s or "reduced" in s:
            return "low"
        if "normal" in s or "within" in s or "optimal" in s:
            return "normal"
        return "unclear"


class MedicineItem(BaseModel):
    name: str = Field(description="Brand or generic medicine name")
    dose: str = Field(default="", description="Dosage e.g. 500mg, 1 tablet")
    frequency: str = Field(default="", description="How often e.g. once daily after food, subah shaam")
    purpose: str = Field(default="", description="Simple explanation of what this medicine is generally used for")
    notes: str = Field(default="", description="Important directions or precautions e.g. complete full course")

    @field_validator("dose", "frequency", "purpose", "notes", mode="before")
    @classmethod
    def coerce_none_to_str(cls, v):
        return "" if v is None else str(v).strip()


class AnalysisResponse(BaseModel):
    doc_type: DocType = Field(description="Type of medical document: lab_report, prescription, or unknown")
    summary: str = Field(description="Grade-6 plain-language summary of the document")
    items: List[LabItem] = Field(default_factory=list, description="Extracted lab test items")
    medicines: List[MedicineItem] = Field(default_factory=list, description="Extracted prescription medicines")
    questions_for_doctor: List[str] = Field(default_factory=list, description="Helpful questions the user can ask their doctor")
    urgent_flag: bool = Field(default=False, description="True ONLY if a value is critically outside normal range")
    urgent_reason: str = Field(default="", description="Reason for urgent alert if urgent_flag is true, else empty")
    disclaimer: str = Field(description="Mandatory medical disclaimer")

    @field_validator("doc_type", mode="before")
    @classmethod
    def normalize_doc_type(cls, v):
        if not v:
            return "unknown"
        d = str(v).strip().lower()
        if d in ("lab_report", "prescription", "unknown"):
            return d
        if "lab" in d or "report" in d or "test" in d or "blood" in d:
            return "lab_report"
        if "presc" in d or "rx" in d or "med" in d:
            return "prescription"
        return "unknown"

    @field_validator("urgent_reason", mode="before")
    @classmethod
    def coerce_none_urgent_reason(cls, v):
        return "" if v is None else str(v).strip()

    @field_validator("items", "medicines", "questions_for_doctor", mode="before")
    @classmethod
    def coerce_none_lists(cls, v):
        return [] if v is None else v


class AskRequest(BaseModel):
    context: Any = Field(description="The analysis result JSON object previously returned")
    question: str = Field(min_length=1, description="The user's follow-up question")
    language: Language = Field(default="en", description="Output language: en, ur, or roman_ur")


class AskResponse(BaseModel):
    answer: str = Field(description="Direct, safe answer based solely on the context without medical diagnosis")


class HealthResponse(BaseModel):
    status: str = "ok"
