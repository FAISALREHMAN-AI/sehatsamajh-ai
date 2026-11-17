"""
AI Service for SehatSamajh using google-genai SDK.
Handles document analysis (text, image, PDF) and safe conversational Q&A.
"""

import os
import json
import logging
from typing import Optional, Tuple
from google import genai
from google.genai import types
from pydantic import ValidationError

from schemas import AnalysisResponse, DocType, ItemStatus, AskRequest, AskResponse
from safety import verify_safety_flags, get_disclaimer

logger = logging.getLogger(__name__)

# Model configuration from environment
DEFAULT_MODEL = "gemini-2.5-flash"

def get_model_name() -> str:
    return os.getenv("GEMINI_MODEL", DEFAULT_MODEL).strip() or DEFAULT_MODEL

def get_genai_client() -> genai.Client:
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        raise ValueError(
            "GEMINI_API_KEY is not configured. Please add GEMINI_API_KEY to your .env file or environment variables."
        )
    return genai.Client(api_key=api_key)

LANGUAGE_INSTRUCTIONS = {
    "en": "Respond strictly in simple, easy-to-read English (Grade 6 level).",
    "ur": "Respond strictly in simple everyday Urdu (اردو script) at a 6th-grade comprehension level that common Pakistani patients easily understand. Do not use overly complicated Persian or Arabic medical vocabulary.",
    "roman_ur": "Respond strictly in simple Roman Urdu (Urdu written in English alphabet, e.g., 'Yeh khoon ka test hai...'). Write clearly so an ordinary Pakistani speaker can easily read and understand."
}

def build_analysis_system_prompt(language: str) -> str:
    lang_rule = LANGUAGE_INSTRUCTIONS.get(language, LANGUAGE_INSTRUCTIONS["en"])
    return f"""You are SehatSamajh, an AI healthcare literacy assistant created for Pakistan to help everyday patients understand their lab reports and doctor prescriptions.

CORE ETHICAL & SAFETY DIRECTIVES:
1. Grade-6 Reading Level: Explain terms in plain, conversational language. Avoid dense medical jargon.
2. NEVER DIAGNOSE: You explain what tests and numbers mean generally in a healthy body. Never tell the patient 'You have diabetes' or 'You suffer from an infection'. Instead say: 'This test checks blood sugar levels.'
3. NEVER ALTER MEDICINE: Never advise changing, increasing, or stopping any medication. Always emphasize following the doctor's prescription.
4. EXACT VALUES & REFERENCE RANGES: Extract numbers and units exactly as printed on the document. Compare values ONLY with the reference range printed on the report itself. DO NOT invent or assume standard ranges if not provided on the sheet.
5. UNCLEAR OR UNREADABLE: If handwritten text, values, or names are blurry, cropped, stained, or illegible, set status to 'unclear' and note in plain_explanation that it could not be read clearly. NEVER guess.
6. URGENT FLAGS: Set 'urgent_flag' to true ONLY if a value is critically, dangerously far outside the printed range (e.g. extremely dangerous blood sugar, severe anemia, dangerously high potassium), and explain in 'urgent_reason' why prompt medical review is necessary.
7. LANGUAGE: {lang_rule}
8. DOCUMENT CLASSIFICATION:
   - 'lab_report': If the document is a laboratory blood test, urine test, imaging report, or pathology test.
   - 'prescription': If the document is a doctor's prescription, Rx slip, list of medicines, dosage instructions.
   - 'unknown': If neither or unidentifiable.
"""

def build_analysis_user_prompt(text_input: Optional[str], language: str) -> str:
    lang_name = "English" if language == "en" else ("Urdu" if language == "ur" else "Roman Urdu")
    prompt = f"Please analyze this medical document for a patient in {lang_name}.\n"
    if text_input:
        prompt += f"\n--- DOCUMENT TEXT ---\n{text_input}\n--- END DOCUMENT TEXT ---\n"
    prompt += "\nExtract all items, provide simple grade-6 explanations, list any medicines and dosages, craft 2-4 helpful questions for their doctor, and flag urgent values if any."
    return prompt

async def analyze_document(
    text_content: Optional[str] = None,
    file_bytes: Optional[bytes] = None,
    mime_type: Optional[str] = None,
    language: str = "en"
) -> AnalysisResponse:
    """
    Analyzes medical text or uploaded file (image/PDF) using Gemini.
    Retries once on invalid JSON/schema response.
    """
    if not text_content and not file_bytes:
        raise ValueError("Either document text or a valid file must be provided.")

    client = get_genai_client()
    model_name = get_model_name()
    system_prompt = build_analysis_system_prompt(language)
    user_prompt = build_analysis_user_prompt(text_content, language)

    # Build Gemini content parts
    contents = []
    if file_bytes and mime_type:
        contents.append(types.Part.from_bytes(data=file_bytes, mime_type=mime_type))
    contents.append(user_prompt)

    config = types.GenerateContentConfig(
        system_instruction=system_prompt,
        response_mime_type="application/json",
        response_schema=AnalysisResponse,
        temperature=0.1,
    )

    last_error: Optional[Exception] = None
    # Attempt with 1 retry on malformed JSON / validation failure
    for attempt in range(2):
        try:
            logger.info(f"Calling Gemini model {model_name} (attempt {attempt + 1}/2)...")
            response = client.models.generate_content(
                model=model_name,
                contents=contents,
                config=config,
            )

            raw_text = response.text or "{}"
            # Parse JSON
            parsed_data = json.loads(raw_text)

            # Apply safety rules (critical range check, disclaimer enforcement)
            safe_data = verify_safety_flags(parsed_data, language=language)

            # Validate against Pydantic schema
            validated = AnalysisResponse.model_validate(safe_data)
            return validated

        except (json.JSONDecodeError, ValidationError) as err:
            logger.warning(f"Schema validation / JSON error on attempt {attempt + 1}: {err}")
            last_error = err
            # Add guidance for retry
            contents.append("Notice: The previous response was not strictly valid JSON matching the exact schema. Please output strictly compliant JSON matching the requested structure.")
        except Exception as e:
            logger.error(f"Gemini API invocation failed: {e}")
            raise e

    raise ValueError(f"Failed to generate structured medical explanation after retry: {last_error}")

def build_ask_system_prompt(language: str) -> str:
    lang_rule = LANGUAGE_INSTRUCTIONS.get(language, LANGUAGE_INSTRUCTIONS["en"])
    return f"""You are SehatSamajh, a compassionate healthcare assistant explaining medical information to patients at a 6th-grade reading level.

CRITICAL RULES:
1. CONTEXT BOUND: Answer the patient's question ONLY using the facts present in the provided analysis context.
2. ABSOLUTELY NO DIAGNOSIS: If the user asks 'Do I have diabetes / cancer / illness?', politely refuse to diagnose. Explain what the report values say, and clearly advise them to consult their doctor for any diagnostic evaluation.
3. NEVER ADVISE DOSAGE OR MEDICATION CHANGES: If asked whether to stop, change, or take a medicine, politely refuse and state that only their prescribing physician can alter their prescription.
4. TONE: Empathetic, simple, clear, calm, and reassuring.
5. LANGUAGE: {lang_rule}
"""

async def answer_question(req: AskRequest) -> AskResponse:
    """
    Answers a patient follow-up question safely using the document context.
    """
    client = get_genai_client()
    model_name = get_model_name()
    system_prompt = build_ask_system_prompt(req.language)

    context_json = json.dumps(req.context, default=str, ensure_ascii=False)
    user_prompt = f"""DOCUMENT CONTEXT:
{context_json}

PATIENT QUESTION:
{req.question}

Please answer the patient's question according to the safety rules."""

    config = types.GenerateContentConfig(
        system_instruction=system_prompt,
        temperature=0.2,
    )

    try:
        response = client.models.generate_content(
            model=model_name,
            contents=[user_prompt],
            config=config,
        )
        answer_text = response.text or "I could not generate an answer. Please consult your doctor."
        return AskResponse(answer=answer_text.strip())
    except Exception as e:
        logger.error(f"Error in ask endpoint: {e}")
        raise e
