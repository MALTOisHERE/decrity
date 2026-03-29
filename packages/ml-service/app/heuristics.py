"""
Layer 1: Heuristic-based prompt injection detection
Rule-based pattern matching
"""

import re
from typing import Dict, Literal

# Known injection patterns
INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|prior|above)\s+instructions?",
    r"disregard\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?)",
    r"forget\s+(all\s+)?(previous|prior|above)\s+instructions?",
    r"override\s+(previous|system)\s+(instructions?|prompts?)",
    r"you\s+are\s+now\s+(a|an)",
    r"act\s+as\s+(if\s+you\s+are|a|an)",
    r"pretend\s+(to\s+be|you\s+are)",
    r"roleplay\s+as",
    r"system\s*:\s*",
    r"\[system\]",
    r"assistant\s*:\s*$",
    r"new\s+instructions?:",
    r"send\s+(this|all|everything)\s+to",
    r"forward\s+(this|all|everything)\s+to",
    r"output\s+your\s+(system\s+)?prompt",
    r"reveal\s+your\s+instructions",
    r"what\s+(are|were)\s+your\s+(original|initial)\s+instructions",
]


def run_heuristic_scan(content: str) -> Dict:
    """Run heuristic scan on content"""
    matches = []
    score = 0.0

    # Check against patterns
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, content, re.IGNORECASE):
            matches.append(pattern)
            score += 0.2

    # Check for hidden content
    if has_hidden_content(content):
        matches.append("Hidden content detected")
        score += 0.3

    # Normalize score
    score = min(score, 1.0)

    # Determine verdict
    if score >= 0.7:
        verdict = "threat"
    elif score >= 0.3:
        verdict = "suspicious"
    else:
        verdict = "clean"

    # Generate reason
    reason = generate_reason(verdict, matches)

    return {
        "verdict": verdict,
        "score": score,
        "reason": reason
    }


def has_hidden_content(content: str) -> bool:
    """Check for hidden content patterns"""
    # HTML comments
    if "<!--" in content or "-->" in content:
        return True

    # Zero-width characters
    zero_width = ["\u200B", "\u200C", "\u200D", "\uFEFF"]
    for char in zero_width:
        if char in content:
            return True

    return False


def generate_reason(verdict: str, matches: list) -> str:
    """Generate plain-language reason"""
    if verdict == "clean":
        return "No suspicious patterns detected"

    if verdict == "suspicious":
        return "This content contains patterns that may be attempting to manipulate the AI"

    return "This content likely contains hidden instructions trying to hijack the AI's behavior"
