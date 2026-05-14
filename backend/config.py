"""
config.py — Configuração do banco de dados
Usa PostgreSQL (Supabase) em produção via DATABASE_URL,
e SQLite como fallback para desenvolvimento local.
"""
import os
import logging

logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv("DATABASE_URL", "")

# Detecta se é Postgres ou SQLite
USE_POSTGRES = bool(DATABASE_URL and "postgresql" in DATABASE_URL)


class Config:
    @staticmethod
    def validate():
        pass


# ─── POSTGRES ─────────────────────────────────────────────────────────────────

def _get_pg():
    import psycopg2
    import psycopg2.extras
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = False
    return conn


class PgCursor:
    """Wrapper que imita sqlite3.Row — acesso por nome de coluna."""
    def __init__(self, conn):
        self._conn = conn
        self._cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    def execute(self, sql, params=()):
        # Converte ? para %s (Postgres)
        sql = sql.replace("?", "%s")
        self._cur.execute(sql, params)

    def fetchone(self):
        row = self._cur.fetchone()
        return dict(row) if row else None

    def fetchall(self):
        return [dict(r) for r in self._cur.fetchall()]

    @property
    def lastrowid(self):
        self._cur.execute("SELECT lastval()")
        return self._cur.fetchone()["lastval"]


class PgConn:
    """Wrapper de conexão Postgres compatível com a interface SQLite usada no código."""
    def __init__(self):
        import psycopg2
        import psycopg2.extras
        self._conn = psycopg2.connect(DATABASE_URL)
        self._conn.autocommit = False

    def cursor(self):
        import psycopg2.extras
        cur = self._conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        return _PgCursorWrapper(cur, self._conn)

    def execute(self, sql, params=()):
        sql = sql.replace("?", "%s")
        cur = self._conn.cursor()
        cur.execute(sql, params)

    def commit(self):
        self._conn.commit()

    def close(self):
        self._conn.close()

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self._conn.commit()
        self._conn.close()


class _PgCursorWrapper:
    def __init__(self, cur, conn):
        self._cur  = cur
        self._conn = conn

    def execute(self, sql, params=()):
        sql = sql.replace("?", "%s")
        self._cur.execute(sql, params)

    def fetchone(self):
        row = self._cur.fetchone()
        return dict(row) if row else None

    def fetchall(self):
        rows = self._cur.fetchall()
        return [dict(r) for r in rows] if rows else []

    def commit(self):
        self._conn.commit()


# ─── SQLITE ───────────────────────────────────────────────────────────────────

def _get_sqlite():
    import sqlite3
    conn = sqlite3.connect("moveacre.db")
    conn.row_factory = sqlite3.Row
    return conn


# ─── INTERFACE PÚBLICA ────────────────────────────────────────────────────────

def get_db():
    if USE_POSTGRES:
        return PgConn()
    return _get_sqlite()


def get_user_db(verified_claims: dict):
    """
    Retorna conexão Postgres com RLS ativo para o usuário autenticado.
    Recebe claims já verificados por _verify_token — nunca o token bruto.
    """
    if not USE_POSTGRES:
        return _get_sqlite()

    conn = PgConn()
    try:
        cur = conn._conn.cursor()
        cur.execute("SET LOCAL role = authenticated")
        cur.execute(
            "SELECT set_config('request.jwt.claims', %s, true)",
            (json.dumps(verified_claims),)
        )
        cur.execute(
            "SELECT set_config('request.jwt.claim.sub', %s, true)",
            (verified_claims.get("sub", ""),)
        )
        conn._conn.commit()
    except Exception as e:
        logger.warning("[DB] Erro ao configurar RLS user context: %s", e)
    return conn


def init_supabase():
    """Cria tabelas se não existirem (SQLite local apenas — Postgres já tem schema no Supabase)."""
    if USE_POSTGRES:
        logger.info("[DB] Usando PostgreSQL — pulando init_supabase")
        _ensure_pg_columns()
        return

    import sqlite3
    conn = sqlite3.connect("moveacre.db")
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS doadores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome_completo TEXT, email TEXT UNIQUE,
            tipo_sangue TEXT, genero TEXT, telefone TEXT,
            idade INTEGER, cidade TEXT, ultima_doacao TEXT,
            tipo TEXT, nivel TEXT DEFAULT 'BRONZE', online BOOLEAN DEFAULT 1
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS urgencias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            paciente_nome TEXT, hospital_nome TEXT DEFAULT 'Hospital Geral',
            tipo_necessario TEXT, idade INTEGER, motivo TEXT,
            nivel_urgencia_sugerido TEXT, status TEXT DEFAULT 'Pendente',
            laudo_url TEXT, user_id TEXT, contato_solicitante TEXT,
            motivo_recusa TEXT,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS doacoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            doador_email TEXT, data_doacao TEXT, atestado_url TEXT,
            status TEXT DEFAULT 'Pendente',
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()

    migrations = [
        "ALTER TABLE urgencias ADD COLUMN contato_solicitante TEXT",
        "ALTER TABLE urgencias ADD COLUMN criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
        "ALTER TABLE urgencias ADD COLUMN motivo_recusa TEXT",
        "ALTER TABLE doacoes ADD COLUMN criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
        "ALTER TABLE doacoes ADD COLUMN status TEXT DEFAULT 'Pendente'",
        "ALTER TABLE doadores ADD COLUMN termos_aceitos BOOLEAN DEFAULT 0",
        "ALTER TABLE doadores ADD COLUMN termos_aceitos_em TIMESTAMP",
    ]
    for sql in migrations:
        try:
            cursor.execute(sql)
            conn.commit()
        except Exception:
            pass

    conn.close()


def _ensure_pg_columns():
    """Garante que colunas e tabelas novas existam no Postgres."""
    try:
        conn = _get_pg()
        cur = conn.cursor()

        # Cria tabela doacoes se não existir
        cur.execute("""
            CREATE TABLE IF NOT EXISTS doacoes (
                id SERIAL PRIMARY KEY,
                doador_email TEXT,
                data_doacao DATE,
                atestado_url TEXT,
                status TEXT DEFAULT 'Pendente',
                criado_em TIMESTAMPTZ DEFAULT NOW()
            )
        """)

        # Migrations seguras
        migrations = [
            "ALTER TABLE pedidos_emergentes ADD COLUMN IF NOT EXISTS motivo_recusa TEXT",
            "ALTER TABLE pedidos_emergentes ADD COLUMN IF NOT EXISTS nivel_urgencia VARCHAR",
            # LGPD — consentimento explícito (Art. 11)
            "ALTER TABLE doadores ADD COLUMN IF NOT EXISTS termos_aceitos BOOLEAN DEFAULT FALSE",
            "ALTER TABLE doadores ADD COLUMN IF NOT EXISTS termos_aceitos_em TIMESTAMPTZ",
        ]
        for sql in migrations:
            try:
                cur.execute(sql)
            except Exception as e:
                logger.warning("[DB] Migration ignorada: %s", e)

        conn.commit()
        conn.close()
        logger.info("[DB] Migrations Postgres concluídas")
    except Exception as e:
        logger.error("[DB] Erro nas migrations Postgres: %s", e)
