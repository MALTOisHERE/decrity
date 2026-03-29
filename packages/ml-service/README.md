# TrustLayer ML Service

Python FastAPI service for prompt injection detection using ML.

## Setup

```bash
# Create virtual environment
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate

# Activate (Unix/Mac)
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## Development

```bash
# Run with auto-reload
python -m uvicorn app.main:app --reload --port 8000

# Or use the convenience script
python app/main.py
```

## API Endpoints

- `GET /health` - Health check
- `POST /classify` - Classify content for prompt injection

## Model Training

The ML classifier uses DistilBERT fine-tuned on prompt injection examples.

Training data should be placed in `data/training/` with format:
```json
[
  {"text": "...", "label": 0},  // 0 = clean
  {"text": "...", "label": 1}   // 1 = injection
]
```

TODO: Add training script in v1.5

## Current Status

v1.0 uses heuristic-based detection. ML classifier is a placeholder.
Full ML implementation planned for v1.5.
