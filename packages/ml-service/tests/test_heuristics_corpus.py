"""
Runs run_heuristic_scan() against the documented prompt-injection corpus
(test-fixtures/injection-corpus.json, shared with the extension's parallel
TS test). Each entry is either an attack example that must not score as
"clean", or a "hard negative", legitimate text resembling an attack that
must stay "clean".
"""

import json
from pathlib import Path

import pytest

from app.heuristics import run_heuristic_scan

CORPUS_PATH = (
    Path(__file__).resolve().parents[3] / "test-fixtures" / "injection-corpus.json"
)


def _corpus_cases():
    with open(CORPUS_PATH, encoding="utf-8") as f:
        categories = json.load(f)["categories"]

    cases = []
    for category, items in categories.items():
        for item in items:
            label = f"{category}:{item['text'][:40]}"
            cases.append(pytest.param(item["text"], item["expect"], id=label))
    return cases


@pytest.mark.parametrize("text,expect", _corpus_cases())
def test_corpus_entry(text, expect):
    result = run_heuristic_scan(text)
    if expect == "catch":
        assert result["verdict"] != "clean"
    else:
        assert result["verdict"] == "clean"
