CREATE TABLE categorias (
                            id BIGSERIAL PRIMARY KEY,
                            nome VARCHAR(100) NOT NULL,
                            tipo VARCHAR(20) NOT NULL,
                            padrao BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE despesas (
                          id BIGSERIAL PRIMARY KEY,
                          descricao VARCHAR(255) NOT NULL,
                          valor NUMERIC(12,2) NOT NULL,
                          data DATE NOT NULL,
                          categoria_id BIGINT NOT NULL REFERENCES categorias(id),
                          usuario_id BIGINT NOT NULL,
                          origem_ia BOOLEAN NOT NULL DEFAULT FALSE,
                          criado_em TIMESTAMP NOT NULL
);

-- Categorias padrão iniciais
INSERT INTO categorias (nome, tipo, padrao) VALUES
                                                ('Alimentação', 'DESPESA', TRUE),
                                                ('Transporte', 'DESPESA', TRUE),
                                                ('Moradia', 'DESPESA', TRUE),
                                                ('Saúde', 'DESPESA', TRUE),
                                                ('Lazer', 'DESPESA', TRUE),
                                                ('Outros', 'DESPESA', TRUE);