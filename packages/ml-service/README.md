# Decrity ML Service

Python/FastAPI service for prompt injection detection.

## Setup

```bash
python -m venv .venv

# activate (Windows)
.venv\Scripts\activate
# activate (Unix/Mac)
source .venv/bin/activate

pip install -r requirements.txt
```

## Development

```bash
python -m uvicorn app.main:app --reload --port 8000
```

## Docker

```bash
docker build -t decrity-ml-service .
```

In practice this runs as part of the full stack; see the root [`docker-compose.yml`](../../docker-compose.yml) for local development or [DEPLOY.md](../../DEPLOY.md) for production.

## API endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/classify` | Classify content for prompt injection |

## Current status

The classifier (`app/classifier.py`) is a placeholder: it returns a fixed score rather than running real inference. `torch`/`transformers`/`scikit-learn` were removed from `requirements.txt` since nothing imports them yet (they were adding ~2GB to every Docker build for no benefit); add them back there when real model loading is implemented. See that file's own comments for the planned DistilBERT approach.
