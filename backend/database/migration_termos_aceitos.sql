-- Adiciona colunas de consentimento LGPD na tabela doadores
-- Necessário para registrar aceite dos Termos e Política de Privacidade (Art. 11 LGPD)
ALTER TABLE doadores ADD COLUMN IF NOT EXISTS termos_aceitos BOOLEAN DEFAULT FALSE;
ALTER TABLE doadores ADD COLUMN IF NOT EXISTS termos_aceitos_em TIMESTAMPTZ;

-- Índice para auditoria de consentimento
CREATE INDEX IF NOT EXISTS idx_doadores_termos_aceitos ON doadores (termos_aceitos);
