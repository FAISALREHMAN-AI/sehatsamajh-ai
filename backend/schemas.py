from typing import Literal, List, Optional, Any
from pydantic import BaseModel, Field

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


class MedicineItem(BaseModel):
    name: str = Field(description="Brand or generic medicine name")
    dose: str = Field(default="", description="Dosage e.g. 500mg, 1 tablet")
    frequency: str = Field(default="", description="How often e.g. once daily after food, subah shaam")
    purpose: str = Field(default="", description="Simple explanation of what this medicine is generally used for")
    notes: str = Field(default="", description="Important directions or precautions e.g. complete full course")


class AnalysisResponse(BaseModel):
    doc_type: DocType = Field(description="Type of medical document: lab_report, prescription, or unknown")
    summary: str = Field(description="Grade-6 plain-language summary of the document")
    items: List[LabItem] = Field(default_factory=list, description="Extracted lab test items")
    medicines: List[MedicineItem] = Field(default_factory=list, description="Extracted prescription medicines")
    questions_for_doctor: List[str] = Field(default_factory=list, description="Helpful questions the user can ask their doctor")
    urgent_flag: bool = Field(default=False, description="True ONLY if a value is critically outside normal range")
    urgent_reason: str = Field(default="", description="Reason for urgent alert if urgent_flag is true, else empty")
    disclaimer: str = Field(description="Mandatory medical disclaimer")


class AskRequest(BaseModel):
    context: Any = Field(description="The analysis result JSON object previously returned")
    question: str = Field(min_length=1, description="The user's follow-up question")
    language: Language = Field(default="en", description="Output language: en, ur, or roman_ur")


class AskResponse(BaseModel):
    answer: str = Field(description="Direct, safe answer based solely on the context without medical diagnosis")


class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "1.0.0"
