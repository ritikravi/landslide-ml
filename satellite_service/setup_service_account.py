#!/usr/bin/env python3
"""
Setup Earth Engine with Service Account for Render deployment
"""
import ee
import json
import os
from pathlib import Path

def setup_service_account():
    """
    Initialize Earth Engine with service account credentials
    """
    # Check for service account key file or environment variable
    service_account_key = os.getenv('GEE_SERVICE_ACCOUNT_KEY')
    
    if service_account_key:
        print("✅ Found service account key in environment")
        
        # Parse JSON from environment variable
        try:
            credentials_dict = json.loads(service_account_key)
            service_account_email = credentials_dict['client_email']
            
            # Create credentials from dict
            credentials = ee.ServiceAccountCredentials(
                email=service_account_email,
                key_data=service_account_key
            )
            
            # Get project ID from key
            project_id = credentials_dict.get('project_id', 'spaceclub-501318')
            
            # Initialize Earth Engine
            ee.Initialize(credentials=credentials, project=project_id)
            
            print(f"✅ Earth Engine initialized with service account")
            print(f"📧 Email: {service_account_email}")
            print(f"📁 Project: {project_id}")
            
            return True
            
        except json.JSONDecodeError as e:
            print(f"❌ Invalid JSON in service account key: {e}")
            return False
        except Exception as e:
            print(f"❌ Error initializing with service account: {e}")
            return False
    
    # Fallback to regular authentication for local development
    else:
        print("⚠️  No service account key found")
        print("   Using local authentication for development")
        
        try:
            # Try multiple project IDs
            projects = ['spaceclub-501318', 'rmna-street-495308', 'verdant-abacus-480107-i9']
            
            for project_id in projects:
                try:
                    ee.Initialize(project=project_id)
                    print(f"✅ Earth Engine initialized with project: {project_id}")
                    return True
                except:
                    continue
            
            print("❌ Could not initialize with any project")
            return False
            
        except Exception as e:
            print(f"❌ Error: {e}")
            return False

if __name__ == '__main__':
    setup_service_account()
