import base64
from django.db import models
from django.conf import settings
from cryptography.fernet import Fernet

class EncryptedCharField(models.CharField):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Ensure we have a valid 32-byte url-safe base64 key
        raw_key = getattr(settings, 'ENCRYPTION_KEY', settings.SECRET_KEY)
        key_32 = str(raw_key)[:32].ljust(32, 'x').encode('utf-8')
        fernet_key = base64.urlsafe_b64encode(key_32)
        
        self.fernet = Fernet(fernet_key)

    def get_prep_value(self, value):
        value = super().get_prep_value(value)
        if value is not None and value != '':
            return self.fernet.encrypt(value.encode('utf-8')).decode('utf-8')
        return value

    def from_db_value(self, value, expression, connection):
        if value is not None and value != '':
            try:
                return self.fernet.decrypt(value.encode('utf-8')).decode('utf-8')
            except Exception:
                return value
        return value

    def to_python(self, value):
        return super().to_python(value)
