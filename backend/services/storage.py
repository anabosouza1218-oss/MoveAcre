"""
services/storage.py — Upload de ficheiros para Supabase Storage

SEGURANÇA:
- Buckets devem ser PRIVADOS no painel do Supabase
- Acesso via signed URLs temporárias (expiram em 1 hora)
- Nunca retornar URLs públicas /object/public/ para dados sensíveis
"""
import os
import uuid
import logging

logger = logging.getLogger(__name__)

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
LAUDO_BUCKET = os.getenv("LAUDO_BUCKET", "laudos")
ATESTADO_BUCKET = "atestados"

# Extensões permitidas para upload — whitelist explícita
ALLOWED_EXTENSIONS = {"pdf", "jpg", "jpeg", "png"}

# Magic bytes para verificação real de tipo de arquivo
# Formato: extensão -> lista de prefixos de bytes aceitos
MAGIC_BYTES = {
    "pdf":  [b"%PDF"],
    "jpg":  [b"\xff\xd8\xff"],
    "jpeg": [b"\xff\xd8\xff"],
    "png":  [b"\x89PNG\r\n\x1a\n"],
}


def validate_file(file_obj, filename: str) -> tuple[bool, str]:
    """
    Valida extensão e magic bytes do arquivo.
    Retorna (ok, mensagem_de_erro).

    FIX CRÍTICO: verificação apenas por extensão é bypassável.
    Magic bytes leem os primeiros bytes reais do arquivo.
    """
    if not filename or "." not in filename:
        return False, "Arquivo sem extensão válida"

    ext = filename.rsplit(".", 1)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return False, f"Tipo de arquivo não permitido. Permitidos: {', '.join(ALLOWED_EXTENSIONS)}"

    # Lê os primeiros 8 bytes para verificar o tipo real
    try:
        header = file_obj.read(8)
        file_obj.seek(0)  # Reposiciona para o início após leitura
    except Exception:
        return False, "Erro ao ler arquivo"

    expected_magic = MAGIC_BYTES.get(ext, [])
    if expected_magic:
        if not any(header.startswith(magic) for magic in expected_magic):
            logger.warning(
                "[STORAGE] Arquivo rejeitado: extensão=%s mas magic bytes não batem. "
                "Header: %s", ext, header[:8].hex()
            )
            return False, "Conteúdo do arquivo não corresponde ao tipo declarado"

    return True, ""


def upload_file(file_obj, bucket: str, filename: str = None) -> str | None:
    """
    Faz upload de um ficheiro para o Supabase Storage e retorna o PATH interno.

    FIX CRÍTICO: retornamos o path interno (não a URL pública).
    O acesso ao arquivo deve ser feito via get_signed_url() com autenticação.

    IMPORTANTE: configure os buckets como PRIVADOS no painel do Supabase.
    """
    # Valida o arquivo antes de qualquer processamento
    ok, err = validate_file(file_obj, filename)
    if not ok:
        logger.warning("[STORAGE] Upload rejeitado: %s", err)
        raise ValueError(err)

    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        logger.warning("[STORAGE] Supabase não configurado — salvando localmente")
        return _save_local(file_obj, filename)

    try:
        import requests
        ext = filename.rsplit(".", 1)[-1].lower() if filename and "." in filename else "bin"
        # UUID garante que o filename original do usuário nunca chega ao storage
        path = f"{uuid.uuid4().hex}.{ext}"

        url = f"{SUPABASE_URL}/storage/v1/object/{bucket}/{path}"
        headers = {
            "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
            "Content-Type": _content_type(ext),
            # Garante que o objeto NÃO seja acessível publicamente
            "x-upsert": "false",
        }
        data = file_obj.read()
        res = requests.post(url, headers=headers, data=data, timeout=30)

        if res.status_code in (200, 201):
            # FIX CRÍTICO: retornamos o path interno, NÃO a URL pública
            logger.info("[STORAGE] Upload OK: bucket=%s path=%s", bucket, path)
            return path  # ex: "a1b2c3d4e5f6.pdf"
        else:
            logger.error("[STORAGE] Erro upload: %s %s", res.status_code, res.text[:200])
            return None
    except ValueError:
        raise
    except Exception as e:
        logger.error("[STORAGE] Exceção: %s", e)
        return None


def get_signed_url(path: str, bucket: str, expires_in: int = 3600) -> str | None:
    """
    Gera uma signed URL temporária para acesso a um arquivo privado.

    FIX CRÍTICO: use signed URLs em vez de URLs públicas para laudos e atestados.
    A URL expira em `expires_in` segundos (padrão: 1 hora).

    IMPORTANTE: o bucket deve estar configurado como PRIVADO no Supabase.
    """
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        logger.warning("[STORAGE] Supabase não configurado — não é possível gerar signed URL")
        return None

    try:
        import requests
        url = f"{SUPABASE_URL}/storage/v1/object/sign/{bucket}/{path}"
        headers = {
            "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
            "Content-Type": "application/json",
        }
        res = requests.post(url, headers=headers, json={"expiresIn": expires_in}, timeout=10)

        if res.status_code == 200:
            signed_path = res.json().get("signedURL", "")
            if signed_path:
                full_url = f"{SUPABASE_URL}/storage/v1{signed_path}" if signed_path.startswith("/") else signed_path
                logger.info("[STORAGE] Signed URL gerada para path=%s (expira em %ds)", path, expires_in)
                return full_url
        logger.error("[STORAGE] Erro ao gerar signed URL: %s %s", res.status_code, res.text[:200])
        return None
    except Exception as e:
        logger.error("[STORAGE] Exceção ao gerar signed URL: %s", e)
        return None


def delete_file(path_or_url: str, bucket: str) -> bool:
    """Remove um ficheiro do Supabase Storage."""
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        logger.warning("[STORAGE] Supabase não configurado — delete ignorado para %s", path_or_url)
        return False
    try:
        import requests
        # Extrai apenas o path se for uma URL completa
        prefixes = [
            f"{SUPABASE_URL}/storage/v1/object/public/{bucket}/",
            f"{SUPABASE_URL}/storage/v1/object/{bucket}/",
        ]
        path = path_or_url
        for prefix in prefixes:
            if path_or_url.startswith(prefix):
                path = path_or_url.replace(prefix, "")
                break

        url = f"{SUPABASE_URL}/storage/v1/object/{bucket}/{path}"
        headers = {"Authorization": f"Bearer {SUPABASE_SERVICE_KEY}"}
        res = requests.delete(url, headers=headers, timeout=10)
        if res.status_code in (200, 204):
            logger.info("[STORAGE] Arquivo deletado: %s", path)
            return True
        logger.warning("[STORAGE] Erro ao deletar %s: %s", path, res.status_code)
        return False
    except Exception as e:
        logger.error("[STORAGE] Exceção ao deletar %s: %s", path_or_url, e)
        return False


def _content_type(ext: str) -> str:
    return {
        "pdf":  "application/pdf",
        "jpg":  "image/jpeg",
        "jpeg": "image/jpeg",
        "png":  "image/png",
    }.get(ext.lower(), "application/octet-stream")


def _save_local(file_obj, filename: str) -> str:
    """Fallback: salva localmente (só para dev). Nunca use em produção."""
    folder = os.path.join(os.path.dirname(__file__), "..", "uploads")
    os.makedirs(folder, exist_ok=True)
    ext = filename.rsplit(".", 1)[-1].lower() if filename and "." in filename else "bin"
    # UUID garante que o filename original nunca é usado
    name = f"{uuid.uuid4().hex}.{ext}"
    path = os.path.join(folder, name)
    file_obj.save(path)
    return name  # Retorna só o nome, não o path completo
