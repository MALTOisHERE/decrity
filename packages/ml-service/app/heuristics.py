"""
Layer 1: Heuristic-based prompt injection detection
Rule-based pattern matching
"""

import re
from typing import Dict

# Known injection patterns, covering: direct instruction overrides,
# role-manipulation jailbreaks, system prompt extraction, data exfiltration,
# indirect injection (content addressed at "the AI" rather than the human
# reader), and fake system/role tags. Kept in parity with
# packages/extension/src/shared/heuristics.ts's INJECTION_PATTERNS, verified
# against the same corpus (see test-fixtures/injection-corpus.json and
# tests/test_heuristics_corpus.py); a prior, narrower version of this list
# caught under a third of that corpus.
#
# The role-manipulation pattern only scores when a jailbreak-style framing
# ("act as", "pretend you are", ...) is paired with a nearby "unrestricted"
# qualifier, not on the framing alone: "act as a professional editor" and
# "pretend you're explaining this to a 5-year-old" are common, entirely
# benign phrasings and must not be flagged just for using those words. Same
# reasoning kept the forward-to-URL pattern scoped to targets that look like
# a URL, domain, or email, not just "forward X to Y" (which would otherwise
# flag "forward this to my colleague"), and kept platform names (ChatGPT,
# Claude, ...) out of the indirect-injection pattern, since "Dear ChatGPT" /
# "Hey Claude" is just how people normally address these products.
INJECTION_PATTERNS = [
    # Direct instruction overrides
    r"ignore\s+(all\s+|any\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?|directives?|guidelines?)",
    r"disregard\s+(all\s+|any\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?|constraints?)",
    r"disregard\s+(everything|anything|the)\s+(above|before|prior)",
    r"reveal\s+what\s+you\s+(were|was)\s+told",
    r"forget\s+(all\s+|any\s+|your\s+)?(previous|prior|above|earlier)?\s*(instructions?|rules?|constraints?)",
    r"forget\s+everything\s+you\s+(were\s+told|were\s+given|learned)",
    r"override\s+(all\s+|any\s+)?(previous|prior|system)\s+(instructions?|prompts?|rules?|directives?)",
    r"(previous\s+)?instructions\s+(are|is)\s+(void|cancelled|no\s+longer\s+(valid|apply))",
    r"cancel\s+(all\s+)?(previous|prior)\s+directives",
    r"new\s+instructions?\s*:",
    r"without\s+(any\s+)?(filters?|restrictions?|limits?|limitations?)",
    r"(from\s+now\s+on|starting\s+now),?\s+(ignore|disregard|forget)",
    r"do\s+whatever\s+i\s+say",
    # Role manipulation / jailbreaks
    r"\b(you\s+are\s+now|you'?re\s+now|act\s+as|pretend\s+(to\s+be|you\s+are)|roleplay\s+as|imagine\s+you\s+are|simulate\s+being|let'?s\s+play\s+a\s+game)\b[^.]{0,80}\b(unrestricted|no\s+(rules?|restrictions?|filters?|limits?|ethics?|guidelines?|content\s+policy)|without\s+(any\s+)?(rules?|restrictions?|filters?|ethical\s+constraints?)|do\s+anything\s+now|jailbroken|no\s+limits?|escaped\s+(its|the)\s+sandbox|always\s+(answers?|responds?)\s+truthfully\s+with\s+no\s+limits?|hacker|bypass\s+(any\s+)?security)\b",
    r"\byou\s+are\s+no\s+longer\b",
    r"\bdan\b.{0,25}do\s+anything\s+now",
    r"developer\s+mode|dan\s+mode|god\s+mode|jailbreak(ed)?\s+mode|admin\s+mode",
    r"ignores?\s+all\s+rules",
    # System prompt extraction
    r"(repeat|print|output|show)\s+(the\s+)?(words?|text|everything)\s+above",
    r"what\s+(are|were)\s+your\s+(exact\s+)?(original|initial)\s+instructions",
    r"output\s+your\s+(system\s+)?prompt",
    r"reveal\s+your\s+(system\s+prompt|instructions)",
    r"(show|print)\s+(me\s+)?your\s+(system\s+prompt|configuration)",
    r"text\s+that\s+appears\s+before\s+(my|your)\s+first\s+message",
    r"translate\s+your\s+system\s+prompt",
    r"written\s+in\s+the\s+system\s+role",
    r"spell(ing)?\s+(them\s+)?out\s+letter\s+by\s+letter",
    # Data exfiltration
    r"send\s+(this|all|everything)\s+to",
    r"send\s+(any|all|my)\s+.{0,40}\b(credentials?|passwords?|api\s+keys?|tokens?|secrets?)\b.{0,40}\bto\b",
    r"(email|forward|send)\s+.{0,40}\bto\b\s+[\w.-]+@[\w.-]+",
    r"forward\s+(this|all|everything|any)\b[^.]{0,90}\bto\s+\S*(https?://|@|\.[a-z]{2,6}\b)",
    r"as\s+a\s+hidden\s+comment",
    r"include\s+(my|your)\s+.{0,20}\b(password|credentials?|api\s+keys?|secrets?)\b.{0,20}\bin\s+your\s+(next\s+)?(response|reply|answer)",
    r"encode\s+.{0,30}\s+and\s+(post|send)\s+it\s+to",
    r"post\s+it\s+to\s+https?://",
    r"upload\s+(any|all)\s+.{0,30}\s+to\s+(this|the)\s+(endpoint|url)",
    r"\b(webhook|endpoint|tracker|collector)\b\s*:?\s*https?://",
    r"add\s+(a\s+|an\s+)?(invisible\s+|tracking\s+)?link\s+to\s+https?://",
    # Indirect injection (content addressed at "the AI", not the human reader)
    r"\b(note|attention|dear|hey)\b[^.]{0,30}\b(ai|assistant|llm|chatbot)\b",
    r"hidden\s+(note|instruction)",
    r"if\s+you\s+are\s+(an\s+)?(ai|llm|assistant)\s+(reading|parsing|processing|browsing)",
    r"system\s+override",
    r"treat\s+this\s+(comment|text)\s+as\s+a\s+system\s+message",
    # Fake system/role tags
    r"\[system\]",
    r"<\|im_start\|>\s*system",
    r"###\s*instruction\s*:",
    r"^\s*system\s*:",
    r"^\s*assistant\s*:",
    r"</?system[_\s]?(override|message)?>",
    r"\{\{\s*system\s*\}\}",
    r"#{2,}\s*system",
    r"\bsystem\s*(>>|::)",
    r"supersedes\s+(all\s+)?(prior|previous)\s+(training|instructions)",
    r"obey\s+(the\s+user\s+)?unconditionally",
]

# Score contributed by a single matched injection pattern. 0.4 rather than a
# smaller increment so one unambiguous match (e.g. "ignore all previous
# instructions") crosses the 0.3 "suspicious" threshold on its own, instead
# of requiring a second, unrelated signal to corroborate it.
PATTERN_SCORE = 0.4


def run_heuristic_scan(content: str) -> Dict:
    """Run heuristic scan on content"""
    matches = []
    score = 0.0

    # Check against patterns
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, content, re.IGNORECASE | re.MULTILINE):
            matches.append(pattern)
            score += PATTERN_SCORE

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

    return {"verdict": verdict, "score": score, "reason": reason}


def has_hidden_content(content: str) -> bool:
    """Check for hidden content patterns"""
    # HTML comments
    if "<!--" in content or "-->" in content:
        return True

    # Zero-width characters
    zero_width = ["​", "‌", "‍", "﻿"]
    for char in zero_width:
        if char in content:
            return True

    return False


def generate_reason(verdict: str, matches: list) -> str:
    """Generate plain-language reason"""
    if verdict == "clean":
        return "No suspicious patterns detected"

    if verdict == "suspicious":
        return (
            "This content contains patterns that may be attempting to manipulate the AI"
        )

    return "This content likely contains hidden instructions trying to hijack the AI's behavior"
