# Use light verion of python
FROM python:3.11-slim

# Keep logs fast and folders clean
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Copy and install only what we need
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the app folder
COPY . .

# Start the service
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]