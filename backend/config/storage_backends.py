import os
from django.core.files.storage import Storage
from django.utils.deconstruct import deconstructible
from supabase import create_client, Client
from django.core.files.base import ContentFile

@deconstructible
class SupabaseStorage(Storage):
    def __init__(self):
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        if not url or not key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables to use SupabaseStorage.")
        self.supabase: Client = create_client(url, key)
        self.bucket_name = 'media'

    def _save(self, name, content):
        content.seek(0)
        file_bytes = content.read()
        
        # Determine content type based on extension
        content_type = 'application/octet-stream'
        if name.lower().endswith('.pdf'):
            content_type = 'application/pdf'
        elif name.lower().endswith('.png'):
            content_type = 'image/png'
        elif name.lower().endswith('.jpg') or name.lower().endswith('.jpeg'):
            content_type = 'image/jpeg'
            
        try:
            # Overwrite if exists
            self.supabase.storage.from_(self.bucket_name).upload(
                file=file_bytes,
                path=name,
                file_options={"content-type": content_type, "upsert": "true"}
            )
        except Exception as e:
            # Fallback if something goes wrong, though supabase-py might raise dict errors
            print(f"Failed to upload {name} to Supabase: {e}")
            raise e
        return name

    def exists(self, name):
        # We use upsert=true in _save, so we can always return False to tell Django to go ahead and save
        return False

    def url(self, name):
        return self.supabase.storage.from_(self.bucket_name).get_public_url(name)

    def _open(self, name, mode='rb'):
        res = self.supabase.storage.from_(self.bucket_name).download(name)
        return ContentFile(res)
