ALTER TABLE despesas
    ADD COLUMN ativo BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX idx_despesas_usuario_ativo
    ON despesas(usuario_id, ativo);