FROM python:3.11-slim

WORKDIR /app

# curl is needed by docker-compose.yml's healthcheck; python:3.11-slim
# doesn't ship it, so the healthcheck silently failed with "executable file
# not found" until this was added (found once another service was actually
# wired to depend on this one's health).
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY app/ ./app/

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
