"""
services/filtragem.py
Filtragem inteligente de doadores compatíveis com um pedido de transfusão.

Critérios:
  1. Compatibilidade de tipo sanguíneo (tabela universal)
  2. Intervalo mínimo desde a última doação (60 dias homem / 90 dias mulher)
  3. Elegibilidade por idade (18–69 anos)
  4. Probabilidade estimada de doação após notificação
"""
from datetime import datetime, date
import logging

logger = logging.getLogger(__name__)

# ─── COMPATIBILIDADE SANGUÍNEA ────────────────────────────────────────────────
# Chave = tipo necessário, Valor = tipos que podem doar
COMPATIBILIDADE = {
    "A+":  ["A+", "A-", "O+", "O-"],
    "A-":  ["A-", "O-"],
    "B+":  ["B+", "B-", "O+", "O-"],
    "B-":  ["B-", "O-"],
    "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    "AB-": ["A-", "B-", "AB-", "O-"],
    "O+":  ["O+", "O-"],
    "O-":  ["O-"],
}

# Intervalo mínimo em dias por gênero
INTERVALO_MINIMO = {"M": 60, "F": 90, "default": 90}

# Taxa base de conversão por nível de urgência (probabilidade de o doador aceitar)
TAXA_CONVERSAO_BASE = {
    "CRITICA": 0.55,
    "ALTA":    0.40,
    "MEDIA":   0.25,
    "BAIXA":   0.15,
}

# Multiplicador por nível do doador
MULTIPLICADOR_NIVEL = {"OURO": 1.4, "PRATA": 1.2, "BRONZE": 1.0}


def _dias_desde(data_str: str) -> int | None:
    """Retorna quantos dias se passaram desde data_str (YYYY-MM-DD). None se inválido."""
    if not data_str:
        return None
    try:
        d = datetime.strptime(data_str[:10], "%Y-%m-%d").date()
        return (date.today() - d).days
    except Exception:
        return None


def _intervalo_minimo(genero: str) -> int:
    return INTERVALO_MINIMO.get((genero or "").upper(), INTERVALO_MINIMO["default"])


def _elegivel(doador: dict) -> bool:
    """Verifica se o doador passa nos critérios básicos de elegibilidade."""
    idade = doador.get("idade")
    if idade and not (18 <= int(idade) <= 69):
        return False

    genero = doador.get("genero", "")
    ultima = doador.get("ultima_doacao")
    dias = _dias_desde(ultima)

    if dias is not None and dias < _intervalo_minimo(genero):
        return False

    return True


def _probabilidade(doador: dict, nivel_urgencia: str) -> float:
    """Estima a probabilidade de o doador aceitar o pedido (0.0 – 1.0)."""
    taxa = TAXA_CONVERSAO_BASE.get(nivel_urgencia.upper(), 0.20)
    mult = MULTIPLICADOR_NIVEL.get((doador.get("nivel") or "BRONZE").upper(), 1.0)

    # Bônus: doador que já doou antes tem +10%
    if doador.get("ultima_doacao"):
        taxa += 0.10

    return min(round(taxa * mult, 3), 1.0)


def filtrar_doadores(doadores: list[dict], tipo_necessario: str, nivel_urgencia: str) -> dict:
    """
    Retorna doadores elegíveis e estatísticas de probabilidade.

    Args:
        doadores: lista de dicts do banco (tabela doadores)
        tipo_necessario: ex. "A+"
        nivel_urgencia: ex. "ALTA"

    Returns:
        {
          "elegiveis": [...],          # doadores que passam em todos os critérios
          "total_compativeis": int,    # compatíveis antes do filtro de elegibilidade
          "total_elegiveis": int,
          "probabilidade_media": float,
          "doacoes_esperadas": float,  # estimativa de quantos vão de fato doar
        }
    """
    tipos_aceitos = COMPATIBILIDADE.get(tipo_necessario, [tipo_necessario])

    compativeis = [
        d for d in doadores
        if (d.get("tipo_sangue") or "") in tipos_aceitos
        and (d.get("tipo") or "").upper() == "DOADOR"
    ]

    elegiveis = []
    for d in compativeis:
        if _elegivel(d):
            prob = _probabilidade(d, nivel_urgencia)
            elegiveis.append({**d, "_probabilidade": prob})

    elegiveis.sort(key=lambda x: x["_probabilidade"], reverse=True)

    total = len(elegiveis)
    prob_media = round(sum(e["_probabilidade"] for e in elegiveis) / total, 3) if total else 0.0
    doacoes_esperadas = round(sum(e["_probabilidade"] for e in elegiveis), 1)

    logger.info(
        "[FILTRAGEM] tipo=%s nivel=%s compativeis=%d elegiveis=%d esperadas=%.1f",
        tipo_necessario, nivel_urgencia, len(compativeis), total, doacoes_esperadas,
    )

    return {
        "elegiveis": elegiveis,
        "total_compativeis": len(compativeis),
        "total_elegiveis": total,
        "probabilidade_media": prob_media,
        "doacoes_esperadas": doacoes_esperadas,
    }
