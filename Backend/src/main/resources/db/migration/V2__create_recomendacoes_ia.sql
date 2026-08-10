CREATE TABLE recomendacoes_ia (
                                  id BIGSERIAL PRIMARY KEY,

                                  texto_original TEXT NOT NULL,

                                  resposta_ia_json TEXT NOT NULL,

                                  tipo_resultado VARCHAR(30) NOT NULL,

                                  data_hora TIMESTAMP NOT NULL,

                                  usuario_id BIGINT NOT NULL
);