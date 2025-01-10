# Start from the official Ubuntu base image
FROM ubuntu:20.04

# Set non-interactive mode to avoid being prompted for input during package installations
ENV DEBIAN_FRONTEND=noninteractive

# Update the package list and install dependencies
RUN apt-get update && \
    apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    tzdata \
    && rm -rf /var/lib/apt/lists/*

# Set the timezone to America/Chicago
ENV TZ=America/Chicago
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Create a directory for the Flask app
WORKDIR /app

# Copy the Flask app into the container
COPY backend /app/backend
COPY frontend /app/frontend

# Install dependencies from requirements.txt
RUN pip3 install --no-cache-dir -r /app/backend/requirements.txt

# Expose the port that Flask will run on
EXPOSE 5000

# Run the Flask app when the container starts
CMD ["gunicorn" . "wsgi:app". "-b". "0.0.0.0:5000"]
