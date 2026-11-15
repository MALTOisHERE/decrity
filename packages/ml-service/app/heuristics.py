"""
Layer 1: Heuristic-based prompt injection detection
Rule-based pattern matching
"""

import re
import unicodedata
from typing import Dict, List

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

# Digit substitutions commonly used to dodge literal string/regex matching
# while reading identically to a human (and parsing identically to the
# target AI, which is the actual threat model here). '@' and '$' are
# deliberately excluded: several data-exfiltration patterns rely on a
# literal '@' to recognize an email-address target (`[\w.-]+@[\w.-]+`), and
# substituting it away to also catch leetspeak like "p@ssword" would break
# that structurally more important detection.
LEETSPEAK_MAP = str.maketrans(
    {
        "0": "o",
        "1": "i",
        "3": "e",
        "4": "a",
        "5": "s",
        "7": "t",
    }
)

_INVISIBLE_CHARS_PATTERN = re.compile(r"[\u200B-\u200D\uFEFF\u2060-\u2069\u00AD]")


def normalize_for_matching(content: str) -> str:
    """
    Builds a scratch copy of the content for pattern matching only (never
    shown to the user, never sent anywhere) that closes three cheap,
    regex-defeating evasions:

    1. NFKC Unicode normalization collapses lookalike character sets back to
       plain ASCII, e.g. the Mathematical Alphanumeric block ("ignore" spelled
       in bold-script Unicode) or full-width Latin letters, which read as
       ordinary text but don't match an i/g/n/... literal in a regex.
    2. Stripping zero-width/invisible formatting characters lets a pattern's
       \\s+/word-boundary matching see through "ignore[ZWSP]all[ZWSP]previous
       [ZWSP]instructions" as the phrase it actually renders as.
       has_hidden_content() below still flags the presence of these
       characters as its own separate signal; this just stops them from also
       acting as a matching bypass.
    3. Leetspeak digit substitution ("1gn0r3" -> "ignore") catches the most
       common deliberate obfuscation idiom cheaply.

    This deliberately does NOT attempt general typo tolerance (e.g. a
    transposed "ignroe", or a missing letter) via edit-distance/fuzzy
    matching: that class of input has no fixed set of substitutions to
    normalize away, and a fuzzy-matching threshold loose enough to catch
    typos on long trigger phrases starts false-flagging ordinary misspelled
    benign text. Genuine typo/paraphrase robustness needs real semantic
    understanding (Layer 2), not a wider regex.
    """
    normalized = unicodedata.normalize("NFKC", content)
    normalized = _INVISIBLE_CHARS_PATTERN.sub("", normalized)
    return normalized.translate(LEETSPEAK_MAP)


def run_heuristic_scan(content: str) -> Dict:
    """Run heuristic scan on content"""
    matches: List[str] = []
    score = 0.0
    normalized = normalize_for_matching(content)

    # Check against patterns
    for pattern in INJECTION_PATTERNS:
        match = re.search(pattern, normalized, re.IGNORECASE | re.MULTILINE)
        if match:
            matches.append(match.group(0))
            score += PATTERN_SCORE

    # Check for hidden content patterns
    if has_hidden_content(content):
        matches.append("Hidden content detected")
        score += 0.3

    # Check for suspicious repetition (common in jailbreak attempts)
    if has_suspicious_repetition(content):
        matches.append("Suspicious repetition pattern")
        score += 0.15

    # Check for excessive punctuation (obfuscation technique)
    if has_excessive_punctuation(content):
        matches.append("Excessive punctuation detected")
        score += 0.1

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
    """Check for hidden content (HTML comments, zero-width chars, etc.)"""
    # HTML comments
    if "<!--" in content or "-->" in content:
        return True

    # Zero-width and other invisible formatting characters often used for hiding
    if re.search(r"[\u200B-\u200D\uFEFF\u2060-\u2069]", content):
        return True

    return False


def has_suspicious_repetition(content: str) -> bool:
    """Check for suspicious repetition patterns"""
    words = content.lower().split()
    word_counts: Dict[str, int] = {}

    for word in words:
        if len(word) < 3:
            continue  # Skip short words
        word_counts[word] = word_counts.get(word, 0) + 1

    # If any word appears more than 20% of total words, suspicious. A short
    # sample makes that ratio noisy on its own: two incidental repeats of an
    # ordinary word ("Some text ... more text" is 2/7, 29%) can cross it in
    # completely benign content. Require enough words that the ratio is
    # actually meaningful.
    total_words = sum(1 for w in words if len(w) >= 3)
    if total_words < 10:
        return False

    for count in word_counts.values():
        if count / total_words > 0.2:
            return True

    return False


def has_excessive_punctuation(content: str) -> bool:
    """Check for excessive punctuation (obfuscation)"""
    punctuation_chars = set("!?.,;:'\"")
    punctuation_count = sum(1 for c in content if c in punctuation_chars)
    total_chars = len(content)

    if total_chars == 0:
        return False

    # If more than 10% punctuation, suspicious
    return punctuation_count / total_chars > 0.1


def generate_reason(verdict: str, matches: List[str]) -> str:
    """Generate plain-language reason"""
    if verdict == "clean":
        return "No suspicious patterns detected"

    if verdict == "suspicious":
        suffix = f": {matches[0]}" if matches else ""
        return f"This content contains patterns that may be attempting to manipulate the AI{suffix}"

    # threat
    suffix = f": {', '.join(matches[:2])}" if matches else ""
    return f"This content likely contains hidden instructions trying to hijack the AI's behavior{suffix}"
