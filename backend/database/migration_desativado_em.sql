-- Adiciona coluna desativado_em na tabela doadores
-- Necessário para o job de limpeza de dados (LGPD)
ALTER TABLE doadores ADD COLUMN IF NOT EXISTS desativado_em TIMESTAMPTZ;

-- Preenche retroativamente contas já desativadas (data aproximada)
UPDATE doadores SET desativado_em = NOW() WHERE online = 0 AND desativado_em IS NULL;
