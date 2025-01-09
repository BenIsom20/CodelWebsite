#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Ensure AWS credentials are set
if [[ -z "$AWS_ACCESS_KEY_ID" || -z "$AWS_SECRET_ACCESS_KEY" || -z "$AWS_DEFAULT_REGION" ]]; then
  echo "AWS credentials or region not set. Exiting."
  exit 1
fi

# Python script to fetch secrets and export as environment variables
python3 <<EOF
import boto3
import os
import json
from botocore.exceptions import ClientError

def fetch_and_export_secrets(secret_name):
    region_name = os.getenv("AWS_DEFAULT_REGION", "us-east-1")
    session = boto3.session.Session()
    client = session.client(service_name='secretsmanager', region_name=region_name)
    
    try:
        response = client.get_secret_value(SecretId=secret_name)
        secret_string = response['SecretString']
        secrets = json.loads(secret_string)
        
        for key, value in secrets.items():
            print(f"export {key}='{value}'")
    
    except ClientError as e:
        print(f"Error fetching secrets: {e}")
        exit(1)

# Replace 'my-secret-name' with your AWS Secrets Manager secret name
fetch_and_export_secrets("database_secrets")
EOF
