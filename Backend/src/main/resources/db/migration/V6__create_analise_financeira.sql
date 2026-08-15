CREATE TABLE analises_financeiras (
                                      id BIGSERIAL PRIMARY KEY,
                                      saldo_calculado NUMERIC(12,2) NOT NULL,
                                      total_receitas NUMERIC(12,2) NOT NULL,
                                      total_despesas NUMERIC(12,2) NOT NULL,
                                      percentual_economia NUMERIC(8,2) NOT NULL,
                                      comprometimento_renda NUMERIC(8,2) NOT NULL,
                                      data_processamento TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                      usuario_id BIGINT NOT NULL REFERENCES usuarios(id)
);

CREATE TABLE perfis_financeiros (
                                    id BIGSERIAL PRIMARY KEY,
                                    tipo_perfil VARCHAR(50) NOT NULL,
                                    justificativa TEXT NOT NULL,
                                    data_classificacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                    usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
                                    analise_id BIGINT NOT NULL UNIQUE
                                        REFERENCES analises_financeiras(id)
);

CREATE TABLE recomendacoes_financeiras (
                                           id BIGSERIAL PRIMARY KEY,
                                           conteudo TEXT NOT NULL,
                                           prioridade VARCHAR(30) NOT NULL,
                                           categoria_relacionada VARCHAR(100),
                                           data_geracao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                           usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
                                           analise_id BIGINT NOT NULL
                                               REFERENCES analises_financeiras(id)
);

CREATE INDEX idx_analises_usuario
    ON analises_financeiras(usuario_id);

CREATE INDEX idx_perfis_usuario
    ON perfis_financeiros(usuario_id);

CREATE INDEX idx_recomendacoes_usuario
    ON recomendacoes_financeiras(usuario_id);