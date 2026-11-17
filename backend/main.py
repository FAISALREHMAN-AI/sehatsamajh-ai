"""
FastAPI application for SehatSamajh.
Provides healthcare document analysis and patient Q&A endpoints.
"""

import os
import logging
from contextlib import asynccontextmanager
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from google.genai.errors import APIError

# Load environment variables (.env in backend or project root)
load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from schemas import AnalysisResponse, AskRequest, AskResponse, HealthResponse, Language
from ai_service import analyze_document, answer_question

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("sehatsamajh")

app = FastAPI(
    title="SehatSamajh API",
    description="Accessible AI for medical reports and prescriptions in Urdu, Roman Urdu, and English.",
    version="1.0.0"
)

# CORS configuration for local React dev server and production clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/heic",
    "application/pdf"
}

MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB limit

@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint confirming API service is running."""
    return HealthResponse(status="ok")

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_report(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    language: str = Form("en")
):
    """
    Analyzes uploaded medical report (image/PDF) or pasted text.
    Returns structured grade-6 explanation in English, Urdu, or Roman Urdu.
    """
    # Validate language
    if language not in ("en", "ur", "roman_ur"):
        language = "en"

    # Validate input presence
    has_text = bool(text and text.strip())
    has_file = file is not None and bool(file.filename)

    if not has_text and not has_file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide either a document file (image/PDF) or paste the report text."
        )

    file_bytes: Optional[bytes] = None
    mime_type: Optional[str] = None

    if has_file and file:
        content_type = file.content_type or ""
        # Handle some mobile browsers sending generic octet-stream with image extensions
        filename = (file.filename or "").lower()
        if content_type == "application/octet-stream":
            if filename.endswith((".jpg", ".jpeg")):
                content_type = "image/jpeg"
            elif filename.endswith(".png"):
                content_type = "image/png"
            elif filename.endswith(".webp"):
                content_type = "image/webp"
            elif filename.endswith(".pdf"):
                content_type = "application/pdf"

        if content_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file format '{content_type}'. Please upload a clear photo (JPG, PNG, WEBP) or a PDF."
            )

        file_bytes = await file.read()
        if len(file_bytes) == 0:
            if not has_text:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="The uploaded file is empty. Please upload a valid medical report file or paste the text."
                )
            file_bytes = None
            mime_type = None
        elif len(file_bytes) > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="File size exceeds the 15 MB limit. Please upload a smaller image or document."
            )
        else:
            mime_type = content_type

    try:
        result = await analyze_document(
            text_content=text.strip() if text else None,
            file_bytes=file_bytes,
            mime_type=mime_type,
            language=language
        )
        return result
    except ValueError as ve:
        err_msg = str(ve)
        logger.warning(f"Validation or configuration error: {err_msg}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=err_msg
        )
    except APIError as api_err:
        err_str = str(api_err).lower()
        logger.error(f"Gemini APIError in analyze_report: {api_err}")
        if getattr(api_err, "code", None) == 429 or "429" in err_str or "resource_exhausted" in err_str or "quota" in err_str:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Gemini AI rate limit or quota exceeded. Please wait a moment and try again."
            )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Google Gemini AI service error: {str(api_err)}"
        )
    except Exception as e:
        logger.exception("Unexpected error processing document analysis")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )

@app.post("/api/ask", response_model=AskResponse)
async def ask_question_endpoint(req: AskRequest):
    """
    Safely answers follow-up questions from the user based only on the analyzed report.
    Politely refuses diagnosis or dosage change advice.
    """
    if not req.question or not req.question.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question cannot be empty."
        )

    try:
        response = await answer_question(req)
        return response
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except APIError as api_err:
        err_str = str(api_err).lower()
        logger.error(f"Gemini APIError in ask_question: {api_err}")
        if getattr(api_err, "code", None) == 429 or "429" in err_str or "resource_exhausted" in err_str or "quota" in err_str:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Gemini AI rate limit or quota exceeded. Please wait a moment and try again."
            )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Google Gemini AI service error: {str(api_err)}"
        )
    except Exception as e:
        logger.exception("Error answering follow-up question")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to answer question: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host=host, port=port, reload=True)
