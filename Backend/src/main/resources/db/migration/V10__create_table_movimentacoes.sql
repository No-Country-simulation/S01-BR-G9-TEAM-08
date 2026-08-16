CREATE TABLE IF NOT EXISTS movimentacoes (
    id BIGSERIAL PRIMARY KEY,
    tipo VARCHAR(30) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    valor NUMERIC(14,2) NOT NULL,
    data DATE NOT NULL,
    categoria VARCHAR(100),
    subcategoria VARCHAR(100),
    conta_origem_id BIGINT REFERENCES contas(id) ON DELETE SET NULL,
    conta_origem_nome VARCHAR(100),
    conta_destino_id BIGINT REFERENCES contas(id) ON DELETE SET NULL,
    conta_destino_nome VARCHAR(100),
    forma_pagamento VARCHAR(50),
    recorrencia VARCHAR(30) DEFAULT 'Única',
    observacoes VARCHAR(500),
    saldo_real NUMERIC(14,2),
    motivo_ajuste VARCHAR(255),
    origem_ia BOOLEAN NOT NULL DEFAULT FALSE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_movimentacoes_usuario_data ON movimentacoes(usuario_id, data DESC);
