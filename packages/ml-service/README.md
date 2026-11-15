# Decrity ML Service

Python/FastAPI service for prompt injection detection.

## Setup

Uses [`uv`](https://docs.astral.sh/uv/) rather than plain `pip`/`venv`: faster, and installs from prebuilt wheels instead of trying to compile `pydantic-core` from source (which needs a Rust toolchain plain `pip` doesn't set up for you).

```bash
uv venv .venv
uv pip install --python .venv -r requirements.txt

# activate (Windows)
.venv\Scripts\activate
# activate (Unix/Mac)
source .venv/bin/activate
```

For running tests or linting, install the dev extras instead (pulls in `requirements.txt` too):

```bash
uv pip install --python .venv -r requirements-dev.txt
```

## Development

```bash
python -m uvicorn app.main:app --reload --port 8000
```

## Testing and linting

```bash
pytest          # runs tests/ (pythonpath is set in pyproject.toml, so "from app.x import y" resolves)
ruff check .    # lint
ruff format .   # format
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
