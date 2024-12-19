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

# Install Flask and Flask-CORS (optional)
RUN pip3 install flask flask-cors

# Create a directory for the Flask app
WORKDIR /app

# Copy the Flask app into the container
COPY app.py /app

# Expose the port that Flask will run on
EXPOSE 5000

# Run the Flask app when the container starts
CMD ["python3", "app.py"]

