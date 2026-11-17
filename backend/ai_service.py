"""
AI Service for SehatSamajh using google-genai SDK.
Handles multimodal document analysis (text, image, PDF) and safe conversational Q&A.
Strictly adheres to grade-6 readability, non-diagnostic guidelines, and safety post-checks.
"""

import os
import re
import json
import logging
import asyncio
from typing import Optional, Any, Dict
from google import genai
from google.genai import types
from google.genai.errors import APIError
from pydantic import ValidationError

from schemas import AnalysisResponse, AskRequest, AskResponse
from safety import verify_safety_flags, sanitize_safety_text

logger = logging.getLogger(__name__)

# Model configuration from environment with default
DEFAULT_MODEL = "gemini-2.5-flash"
FALLBACK_MODEL = "gemini-3.5-flash-lite"

def get_model_name() -> str:
    """Read model from GEMINI_MODEL env var with a modern flash default."""
    return os.getenv("GEMINI_MODEL", DEFAULT_MODEL).strip() or DEFAULT_MODEL

def get_model_candidates() -> list[str]:
    """Return primary configured model and secondary fallback if quota exhausted."""
    primary = get_model_name()
    if primary == FALLBACK_MODEL:
        return [primary]
    return [primary, FALLBACK_MODEL]

def get_genai_client() -> genai.Client:
    """Initialize google-genai Client using environment variable."""
    api_key = os.getenv("GEMINI_API_KEY", "").strip() or os.getenv("GOOGLE_API_KEY", "").strip()
    if not api_key:
        raise ValueError(
            "GEMINI_API_KEY is not configured. Please set GEMINI_API_KEY in your .env file or environment."
        )
    return genai.Client(api_key=api_key)

LANGUAGE_INSTRUCTIONS = {
    "en": "Respond strictly in simple, clear English at about a Grade 6 reading level for an everyday patient.",
    "ur": "Respond strictly in simple, everyday Urdu (اردو script) at a 6th-grade comprehension level that common Pakistani patients easily understand. Do not use overly complicated archaic vocabulary.",
    "roman_ur": "Respond strictly in simple Roman Urdu (Urdu written in English script, e.g., 'Yeh khoon ka test hai...'). Keep the tone friendly and easy for an ordinary Pakistani reader."
}

def build_analysis_system_prompt(language: str) -> str:
    lang_rule = LANGUAGE_INSTRUCTIONS.get(language, LANGUAGE_INSTRUCTIONS["en"])
    return f"""You are SehatSamajh, an AI healthcare literacy assistant created for Pakistan to help everyday patients understand their lab reports and prescriptions.

CORE ETHICAL & SAFETY DIRECTIVES:
1. GRADE-6 READING LEVEL: Explain every medical term in plain, conversational language at approximately a 6th-grade reading level. Avoid dense jargon.
2. NEVER DIAGNOSE: You explain what markers and numbers generally measure in human biology and what high or low generally means. NEVER state clinical claims or diagnoses as facts about this person (never say 'You have diabetes', 'You have an infection'). Always conclude summaries and explanations with a reminder to confirm with your doctor.
3. NEVER ALTER MEDICINE: Never advise starting, changing, increasing, or stopping any medication. Always emphasize adhering to the prescribing doctor.
4. EXACT VALUES & PRINTED REFERENCE RANGES: Extract all test names and values into the 'items' list, even if no reference interval or clinic header is printed. Determine status ('normal', 'high', 'low', 'unclear') ONLY by comparing with the printed reference interval on the document itself. DO NOT invent, assume, or guess standard ranges if none are printed. If a test has no printed reference range, ALWAYS set its status to 'unclear' and reference_range to null or empty string.
5. UNREADABLE OR UNRELATED INPUT: If the input is unreadable, blurry, corrupted, or completely unrelated to healthcare (e.g. a landscape, invoice, random object), set doc_type to 'unknown', items to [], medicines to [], status to 'unclear', and provide a polite summary stating that this document cannot be identified as a medical report or prescription. NEVER guess or hallucinate values.
6. MEDICINES: For prescriptions, list each medicine's name, dose, frequency, general purpose, and important directions/notes. If handwriting or details are unclear, explicitly state so in notes.
7. DOCTOR QUESTIONS: Provide 3 to 5 practical, focused questions the patient can ask their doctor during their next visit.
8. URGENT FLAGS: Set 'urgent_flag' to true ONLY if a biomarker value is very far outside the printed range (e.g., severe critical anemia, dangerously high glucose). Set 'urgent_reason' to a calm, non-alarmist sentence advising the user to see a doctor soon. If no urgent anomaly is present, set urgent_flag to false and urgent_reason to "".
9. LANGUAGE REQUIREMENT: {lang_rule}
10. MANDATORY DISCLAIMER: Always provide the standard medical disclaimer reminding the patient to confirm with their doctor.
"""

def build_analysis_user_prompt(text_input: Optional[str], language: str) -> str:
    lang_name = "English" if language == "en" else ("Urdu" if language == "ur" else "Roman Urdu")
    prompt = f"Please analyze this medical document for a patient in {lang_name}.\n"
    if text_input:
        prompt += f"\n--- DOCUMENT CONTENT ---\n{text_input}\n--- END DOCUMENT CONTENT ---\n"
    prompt += "\nExtract printed values and reference ranges, provide simple grade-6 explanations, list 3 to 5 practical questions for the doctor, and flag urgent critical values if any."
    return prompt

def extract_json_data(raw_text: str) -> Dict[str, Any]:
    """
    Robustly parses JSON data from LLM output, handling markdown code fences
    and extra wrapper characters gracefully.
    """
    cleaned = (raw_text or "").strip()
    if not cleaned:
        return {}

    # Strip markdown code blocks (e.g. ```json ... ```)
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
        cleaned = cleaned.strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start != -1 and end != -1 and end > start:
            return json.loads(cleaned[start:end + 1])
        raise

async def analyze_document(
    text_content: Optional[str] = None,
    file_bytes: Optional[bytes] = None,
    mime_type: Optional[str] = None,
    language: str = "en"
) -> AnalysisResponse:
    """
    Analyzes medical text or uploaded file (image/PDF) using Gemini multimodal.
    Validates structured output with Pydantic and retries once if validation fails.
    """
    if not text_content and not file_bytes:
        raise ValueError("Either document text or a valid file must be provided.")

    client = get_genai_client()
    system_prompt = build_analysis_system_prompt(language)
    user_prompt = build_analysis_user_prompt(text_content, language)

    # Build Gemini multimodal parts
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

    models_to_try = get_model_candidates()
    last_error: Optional[Exception] = None

    for model_name in models_to_try:
        for attempt in range(3):
            try:
                logger.info(f"Calling Gemini model {model_name} (attempt {attempt + 1}/3)...")
                response = client.models.generate_content(
                    model=model_name,
                    contents=contents,
                    config=config,
                )

                raw_text = response.text or "{}"
                parsed_data = extract_json_data(raw_text)

                # Apply safety rules (critical range check, disclaimer enforcement, post-check sanitization)
                safe_data = verify_safety_flags(parsed_data, language=language)

                # Validate against Pydantic schema
                validated = AnalysisResponse.model_validate(safe_data)
                return validated

            except (json.JSONDecodeError, ValidationError) as err:
                logger.warning(f"Schema validation / JSON error on {model_name} attempt {attempt + 1}: {err}")
                last_error = err
                contents.append(
                    "Correction: The previous response did not strictly conform to the required JSON schema. "
                    "Ensure valid JSON matching the exact schema without extra keys."
                )
            except (APIError, Exception) as transient_err:
                err_str = str(transient_err).lower()
                logger.warning(f"Error on {model_name} attempt {attempt + 1}: {transient_err}")
                last_error = transient_err
                if "resource_exhausted" in err_str or "quota" in err_str:
                    logger.info(f"Quota exhausted on {model_name}, falling back if alternative model exists.")
                    break
                if attempt < 2:
                    await asyncio.sleep(2.0 * (attempt + 1))
                else:
                    break

    if isinstance(last_error, APIError):
        raise last_error
    raise ValueError(f"Failed to generate structured medical explanation after retry: {last_error}")

def build_ask_system_prompt(language: str) -> str:
    lang_rule = LANGUAGE_INSTRUCTIONS.get(language, LANGUAGE_INSTRUCTIONS["en"])
    return f"""You are SehatSamajh, a compassionate healthcare literacy assistant for patients.

CRITICAL RULES:
1. CONTEXT BOUND: Answer the patient's question ONLY using facts from the provided analysis context.
2. ABSOLUTELY NO DIAGNOSIS: If the user asks 'Do I have diabetes / infection / cancer / disease?', politely refuse to diagnose. Explain what the report values say objectively, and remind them that only their doctor can diagnose conditions.
3. NEVER ADVISE DOSAGE OR MEDICATION CHANGES: If asked whether to take, stop, reduce, or increase medicine, politely refuse and instruct them to consult their prescribing physician.
4. UNKNOWN FACTS: If the answer is not present in the document context, clearly and politely say that the information is not in the document.
5. ALWAYS END WITH: 'Always confirm with your doctor.' (or its equivalent in Urdu / Roman Urdu).
6. LANGUAGE: {lang_rule}
"""

async def answer_question(req: AskRequest) -> AskResponse:
    """
    Safely answers follow-up questions from the user based only on the analyzed report.
    Applies post-check sanitization to remove diagnostic or prescriptive statements.
    """
    client = get_genai_client()
    system_prompt = build_ask_system_prompt(req.language)

    context_json = json.dumps(req.context, default=str, ensure_ascii=False)
    user_prompt = f"""DOCUMENT CONTEXT:
{context_json}

PATIENT QUESTION:
{req.question}

Please answer the patient's question according to all safety rules."""

    config = types.GenerateContentConfig(
        system_instruction=system_prompt,
        temperature=0.2,
    )

    fallback_answers = {
        "ur": "یہ معلومات اس دستاویز میں موجود نہیں ہیں۔ برائے مہربانی اپنے معالج یا ڈاکٹر سے رجوع کر کے تصدیق کریں۔",
        "roman_ur": "Yeh maloomat is report mein mojood nahi hain. Baraye meharbani hamesha apnay doctor se tasdeeq karein.",
        "en": "This information is not available in the document. Always confirm with your doctor."
    }
    fallback_text = fallback_answers.get(req.language, fallback_answers["en"])

    models_to_try = get_model_candidates()
    last_err: Optional[Exception] = None

    for model_name in models_to_try:
        for attempt in range(2):
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=[user_prompt],
                    config=config,
                )
                answer_text = response.text or fallback_text
                sanitized = sanitize_safety_text(answer_text, req.language)
                return AskResponse(answer=sanitized.strip())
            except APIError as api_err:
                err_str = str(api_err).lower()
                logger.warning(f"Gemini API error in ask on {model_name} attempt {attempt + 1}: {api_err}")
                last_err = api_err
                if "resource_exhausted" in err_str or "quota" in err_str:
                    break
                if attempt == 0:
                    await asyncio.sleep(1.0)
                else:
                    break
            except Exception as e:
                logger.warning(f"Error in ask on {model_name} attempt {attempt + 1}: {e}")
                last_err = e
                if attempt == 0:
                    await asyncio.sleep(1.0)
                else:
                    break

    if last_err:
        raise last_err
    return AskResponse(answer=fallback_text)
