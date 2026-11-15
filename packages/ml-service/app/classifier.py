"""
ML-based prompt injection classifier
Uses HuggingFace transformers (distilbert)
"""

import logging
from typing import Dict

logger = logging.getLogger(__name__)


class PromptInjectionClassifier:
    """
    Prompt injection classifier using distilbert
    For v1.0, this is a placeholder - model training needed
    """

    def __init__(self, model_path: str = None):
        """Initialize classifier"""
        logger.info("Initializing PromptInjectionClassifier")
        # TODO: Load fine-tuned model. torch/transformers/scikit-learn were
        # removed from requirements.txt since nothing used them yet (2026-11-07,
        # unused heavy deps were making every Docker build re-download ~2GB).
        # Add them back there when this is actually implemented.
        # from transformers import AutoTokenizer, AutoModelForSequenceClassification
        # self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        # self.model = AutoModelForSequenceClassification.from_pretrained(model_path)

        # For now, use heuristic-based scoring
        self.model = None
        logger.warning("ML model not loaded - using heuristic fallback")

    def classify(self, content: str) -> Dict:
        """
        Classify content
        Returns dict with verdict, score, reason
        """

        # TODO: Implement actual ML classification
        # For now, return neutral score
        # The heuristics will handle the heavy lifting until model is trained

        if self.model is None:
            # Fallback to basic scoring. reason is deliberately empty, not a
            # placeholder string: main.py's classify_content() does
            # `ml_result["reason"] or heuristic_result["reason"]`, which only
            # works as the graceful-degrade fallback it's meant to be if this
            # stays falsy. A non-empty placeholder here would always win that
            # `or`, so every real detection's actual reason would get
            # replaced by this internal-sounding message instead of showing
            # the user why their content was flagged, violating CLAUDE.md's
            # plain-language rule (no "classifier" in user-facing text) on
            # every single suspicious/threat result.
            return {"verdict": "suspicious", "score": 0.5, "reason": ""}

        # Future implementation:
        # inputs = self.tokenizer(content, return_tensors="pt", truncation=True, max_length=512)
        # outputs = self.model(**inputs)
        # probabilities = torch.nn.functional.softmax(outputs.logits, dim=-1)
        # score = probabilities[0][1].item()  # Probability of "injection" class

        # Determine verdict based on score
        # ...

        return {
            "verdict": "suspicious",
            "score": 0.5,
            "reason": "Potential prompt injection detected",
        }
