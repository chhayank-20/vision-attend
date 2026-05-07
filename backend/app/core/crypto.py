from cryptography.fernet import Fernet
from app.core.config import settings
import base64
import os

# Initialize Fernet with the encryption key from settings
# If the key is just a placeholder, we generate one for local dev safety, 
# but in production it MUST be provided via environment variable.
try:
    cipher_suite = Fernet(settings.ENCRYPTION_KEY.encode())
except Exception:
    # Fallback for dev if key is invalid/placeholder
    # WARNING: This means data encrypted with this fallback won't be decryptable after restart 
    # if the placeholder is still used. User should set a real key in .env
    fallback_key = base64.urlsafe_b64encode(b"a-temporary-dev-key-32-chars-long!")
    cipher_suite = Fernet(fallback_key)

def encrypt_string(plain_text: str) -> str:
    if not plain_text:
        return plain_text
    return cipher_suite.encrypt(plain_text.encode()).decode()

def decrypt_string(encrypted_text: str) -> str:
    if not encrypted_text:
        return encrypted_text
    try:
        return cipher_suite.decrypt(encrypted_text.encode()).decode()
    except Exception:
        # If decryption fails (e.g. key changed), return placeholder or error
        return "[DECRYPTION_ERROR]"
