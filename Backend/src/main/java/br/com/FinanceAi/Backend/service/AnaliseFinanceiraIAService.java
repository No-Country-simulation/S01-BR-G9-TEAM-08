package br.com.FinanceAi.Backend.service;

import br.com.FinanceAi.Backend.dto.response.IndicadoresFinanceiros;
import br.com.FinanceAi.Backend.dto.response.ResultadoAnaliseFinanceiraIA;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class AnaliseFinanceiraIAService {

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    public AnaliseFinanceiraIAService(
            ChatClient.Builder chatClientBuilder,
            ObjectMapper objectMapper
    ) {
        this.chatClient = chatClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    public ResultadoAnaliseFinanceiraIA analisar(
            IndicadoresFinanceiros indicadores
    ) {

        try {

            String indicadoresJson =
                    objectMapper.writeValueAsString(indicadores);

            String respostaIa = chatClient.prompt()
                    .system("""
                            Você é o módulo de análise financeira do sistema FinanceAI.

                            Analise os indicadores financeiros recebidos.

                            Você NÃO deve recalcular os indicadores.
                            Utilize somente os valores fornecidos.

                            Classifique o perfil financeiro usando SOMENTE um destes valores:

                            - POUPADOR
                            - EQUILIBRADO
                            - MODERADO
                            - GASTADOR
                            - ENDIVIDADO

                            Gere também recomendações financeiras objetivas.

                            Responda SOMENTE com JSON válido no seguinte formato:

                            {
                              "perfilFinanceiro": {
                                "tipo": "POUPADOR",
                                "justificativa": "Justificativa do perfil"
                              },
                              "recomendacoes": [
                                {
                                  "prioridade": "MEDIA",
                                  "conteudo": "Recomendação financeira"
                                }
                              ]
                            }

                            Não escreva nenhum texto fora do JSON.
                            """)
                    .user("""
                            Indicadores financeiros do usuário:

                            %s
                            """.formatted(indicadoresJson))
                    .call()
                    .content();

            if (respostaIa == null || respostaIa.isBlank()) {
                throw new IllegalStateException(
                        "A IA retornou uma resposta vazia."
                );
            }

            String respostaLimpa = limparRespostaJson(respostaIa);

            return objectMapper.readValue(
                    respostaLimpa,
                    ResultadoAnaliseFinanceiraIA.class
            );

        } catch (Exception e) {

            throw new IllegalStateException(
                    "Não foi possível concluir a análise financeira com IA.",
                    e
            );
        }
    }

    private String limparRespostaJson(String resposta) {

        return resposta
                .trim()
                .replaceFirst("^```json\\s*", "")
                .replaceFirst("^```\\s*", "")
                .replaceFirst("\\s*```$", "")
                .trim();
    }
}