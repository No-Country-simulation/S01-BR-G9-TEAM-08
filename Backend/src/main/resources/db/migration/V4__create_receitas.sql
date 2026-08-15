CREATE TABLE receitas (
                          id BIGSERIAL PRIMARY KEY,
                          descricao VARCHAR(255) NOT NULL,
                          valor NUMERIC(12,2) NOT NULL,
                          data DATE NOT NULL,
                          ativo BOOLEAN NOT NULL DEFAULT TRUE,
                          data_cadastro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          usuario_id BIGINT NOT NULL REFERENCES usuarios(id)
);

CREATE INDEX idx_receitas_usuario_ativo
    ON receitas(usuario_id, ativo);