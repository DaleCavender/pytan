# Use a secure, lightweight Python base image
FROM python:3.11-slim

# Set environment variables to optimize Python performance in Docker
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Establish the working directory
WORKDIR /app

# Copy only the requirements first to leverage Docker's layer caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application source code
COPY . .

# Expose the port defined in your README/run scripts
EXPOSE 4567

# Command to launch the FastAPI server using Uvicorn
# We bind to 0.0.0.0 to allow traffic from outside the container
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "4567"]
