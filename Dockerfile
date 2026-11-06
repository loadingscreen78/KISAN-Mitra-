# Build the React frontend
FROM node:20-slim AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# Flask API, which also serves the built frontend
FROM python:3.11-slim
WORKDIR /app
ENV PYTHONUNBUFFERED=1 FLASK_ENV=production HF_HOME=/app/.hf-cache

COPY requirements.docker.txt ./
RUN pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu -r requirements.docker.txt

# Bake the plant disease model into the image so startup needs no download
RUN python -c "from transformers import pipeline; pipeline('image-classification', model='linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification', device=-1)"

COPY backend ./backend
COPY --from=frontend /app/dist ./dist

RUN useradd --create-home appuser && chown -R appuser /app/.hf-cache
USER appuser

EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=120s \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:5000/health', timeout=4)"

CMD ["gunicorn", "backend.plant_diagnosis_api:app", "--bind", "0.0.0.0:5000", "--workers", "1", "--threads", "4", "--timeout", "120"]
