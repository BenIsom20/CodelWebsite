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
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements.txt file into the container
COPY requirements.txt /app/

# Install dependencies from requirements.txt
RUN pip3 install --no-cache-dir -r /app/requirements.txt

# Create a directory for the Flask app
WORKDIR /app

# Copy the Flask app into the container
COPY app.py /app
COPY db_helper.py /app
COPY challenges /app
COPY challenger /app

# Expose the port that Flask will run on
EXPOSE 5000

# Run the Flask app when the container starts
CMD ["python3", "app.py"]
