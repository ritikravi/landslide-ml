#!/usr/bin/env python3
"""
Fix SSL certificate issue and authenticate Earth Engine
"""
import ssl
import certifi
import ee

# Fix SSL certificate verification
ssl._create_default_https_context = ssl._create_unverified_context

print("🔐 Authenticating Earth Engine...")
print("   Browser will open - sign in and authorize")

try:
    # Authenticate with Earth Engine
    ee.Authenticate()
    print("\n✅ Authentication successful!")
    
    # Test initialization with project
    ee.Initialize(project='ee-ritikraushanrr')
    print("✅ Earth Engine initialized!")
    
    # Test a simple query
    test_num = ee.Number(42).getInfo()
    print(f"✅ Connection test passed: {test_num}")
    
    print("\n🎉 All set! You can now run: python earth_engine_api.py")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    print("\nTry installing Python certificates:")
    print("   /Applications/Python\\ 3.11/Install\\ Certificates.command")
