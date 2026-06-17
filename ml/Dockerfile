FROM python:3.11-slim

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY ml_api.py .
COPY landslide_model.pkl .

# Expose port
EXPOSE 5001

# Set environment variable
ENV ML_API_PORT=5001

# Run the application
CMD ["python", "ml_api.py"]
