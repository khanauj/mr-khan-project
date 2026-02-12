FROM python:3.11-slim

WORKDIR /app

# Copy requirements
COPY ml/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy ML code
COPY ml/ .

# Expose port
EXPOSE 8000

# Start the application
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]
