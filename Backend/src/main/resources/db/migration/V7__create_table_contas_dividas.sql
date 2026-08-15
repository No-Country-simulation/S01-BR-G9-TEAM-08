CREATE TABLE IF NOT EXISTS contas (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    instituicao VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    moeda VARCHAR(10) NOT NULL DEFAULT 'BRL',
    saldo NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    limite_credito NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    limite_cheque_especial NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'Ativa',
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dividas (
    id BIGSERIAL PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    valor_original NUMERIC(14,2) NOT NULL,
    saldo_devedor NUMERIC(14,2) NOT NULL,
    valor_parcela NUMERIC(14,2) NOT NULL,
    parcelas_restantes INT NOT NULL,
    taxa_juros NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    data_vencimento VARCHAR(50),
    status VARCHAR(30) NOT NULL DEFAULT 'Em dia',
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);
