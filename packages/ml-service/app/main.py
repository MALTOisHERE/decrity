"""
Decrity ML Service
FastAPI service for prompt injection classification
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Literal
import logging

from .classifier import PromptInjectionClassifier
from .heuristics import run_heuristic_scan

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Decrity ML Service",
    description="Prompt injection detection using ML",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize classifier (lazy loading)
classifier = None

def get_classifier():
    global classifier
    if classifier is None:
        logger.info("Loading ML classifier...")
        classifier = PromptInjectionClassifier()
        logger.info("Classifier loaded successfully")
    return classifier


class ClassifyRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=50000)


class ClassifyResponse(BaseModel):
    verdict: Literal["clean", "suspicious", "threat"]
    score: float = Field(..., ge=0.0, le=1.0)
    reason: str


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "ml"}


@app.post("/classify", response_model=ClassifyResponse)
async def classify_content(request: ClassifyRequest):
    """
    Classify content for prompt injection
    Combines heuristic and ML-based detection
    """
    try:
        # Layer 1: Fast heuristic scan
        heuristic_result = run_heuristic_scan(request.content)

        # If heuristics say clean, trust it
        if heuristic_result["verdict"] == "clean":
            return ClassifyResponse(**heuristic_result)

        # Layer 2: ML classification for suspicious/threat cases
        clf = get_classifier()
        ml_result = clf.classify(request.content)

        # Combine heuristic and ML results
        final_score = max(heuristic_result["score"], ml_result["score"])

        # Determine final verdict
        if final_score >= 0.7:
            verdict = "threat"
        elif final_score >= 0.3:
            verdict = "suspicious"
        else:
            verdict = "clean"

        reason = ml_result["reason"] or heuristic_result["reason"]

        return ClassifyResponse(
            verdict=verdict,
            score=final_score,
            reason=reason
        )

    except Exception as e:
        logger.error(f"Classification failed: {e}")
        raise HTTPException(status_code=500, detail="Classification failed")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
