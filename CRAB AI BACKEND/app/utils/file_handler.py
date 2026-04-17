import os, uuid, aiofiles
from fastapi import UploadFile
from ..config import settings

ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".txt"}

class FileHandler:
    @staticmethod
    def is_allowed(filename: str) -> bool:
        return os.path.splitext(filename)[1].lower() in ALLOWED_EXTENSIONS

    @staticmethod
    async def save(file: UploadFile, directory: str) -> tuple[str, str]:
        os.makedirs(directory, exist_ok=True)
        ext = os.path.splitext(file.filename)[1].lower()
        unique_name = f"{uuid.uuid4().hex}{ext}"
        path = os.path.join(directory, unique_name)
        content = await file.read()
        async with aiofiles.open(path, "wb") as f:
            await f.write(content)
        return path, file.filename

    @staticmethod
    def delete(path: str):
        if path and os.path.exists(path):
            os.remove(path)
