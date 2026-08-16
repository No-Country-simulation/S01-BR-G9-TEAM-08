package br.com.FinanceAi.Backend.service;

import br.com.FinanceAi.Backend.dto.request.DadosCompletosUsuario;
import br.com.FinanceAi.Backend.dto.response.ResultadoAnaliseDetalhadaIA;
import br.com.FinanceAi.Backend.exception.IaIndisponivelException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class AnaliseDetalhadaIAService {

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    public AnaliseDetalhadaIAService(
            ChatClient.Builder chatClientBuilder,
            ObjectMapper objectMapper
    ) {
        this.chatClient = chatClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    public ResultadoAnaliseDetalhadaIA analisar(DadosCompletosUsuario dados) {

        try {

            String dadosJson = objectMapper.writeValueAsString(dados);

            String respostaIa = chatClient.prompt()
                    .system("""
                            Você é o analista financeiro avançado do sistema FinanceAI.

                            Você receberá dados financeiros completos e detalhados de um usuário, incluindo:
                            - Indicadores financeiros (saldo, receitas, despesas, economia, comprometimento)
                            - Lista detalhada de despesas (com categorias, datas, valores)
                            - Lista detalhada de receitas
                            - Lista de compras planejadas (itens, prioridades, preços)
                            - Movimentações financeiras (transações, transferências)
                            - Contas bancárias (saldos, limites)
                            - Dívidas (valores, parcelas, juros, vencimentos)

                            SUA TAREFA:
                            Analise todos esses dados de forma holística e gere insights detalhados.

                            CLASSIFICAÇÃO DO PERFIL FINANCEIRO:
                            Use SOMENTE um destes valores para o tipo:
                            - POUPADOR: Economia consistente, baixo endividamento
                            - EQUILIBRADO: Equilíbrio entre gastos e economia
                            - MODERADO: Alguns gastos supérfluos, mas controlado
                            - GASTADOR: Alta taxa de gastos, pouca economia
                            - ENDIVIDADO: Endividamento elevado, dificuldade de pagamento

                            Forneça:
                            - Justificativa detalhada do perfil
                            - Pontuação de saúde financeira (0-100)
                            - Lista de pontos fortes
                            - Lista de pontos de melhoria

                            ANÁLISE DE GASTOS:
                            - Identifique categorias críticas (gastos excessivos)
                            - Identifique categorias de destaque (bem controladas)
                            - Descreva o padrão comportamental de gastos

                            ANÁLISE DE RECEITAS:
                            - Avalie a estabilidade das receitas
                            - Sugira oportunidades de aumento

                            ANÁLISE DE CONTAS:
                            - Identifique alertas (contas negativas, limites próximos)
                            - Sugira otimizações (redução de tarifas, melhor uso de limites)

                            ANÁLISE DE DÍVIDAS:
                            - Classifique o nível de endividamento (Baixo/Moderado/Alto/Crítico)
                            - Sugira estratégia de pagamento (ex: bola de neve, avalanche)
                            - Alerte sobre vencimentos próximos

                            ANÁLISE DE LISTA DE COMPRAS:
                            - Calcule o impacto orçamentário total
                            - Identifique itens prioritários
                            - Identifique itens que podem ser adiados

                            RECOMENDAÇÕES:
                            Gere recomendações práticas e acionáveis com:
                            - Prioridade (ALTA/MEDIA/BAIXA)
                            - Categoria (gastos, receitas, contas, dívidas, compras)
                            - Título conciso
                            - Descrição detalhada
                            - Impacto esperado
                            - Lista de ações sugeridas (passos concretos)

                            Responda SOMENTE com JSON válido no seguinte formato:

                            {
                              "perfilFinanceiro": {
                                "tipo": "POUPADOR",
                                "justificativa": "Análise detalhada...",
                                "pontuacaoSaude": "85/100",
                                "pontosFortes": ["ponto 1", "ponto 2"],
                                "pontosMelhoria": ["ponto 1", "ponto 2"]
                              },
                              "analiseGastos": {
                                "resumo": "Resumo da análise de gastos...",
                                "categoriasCriticas": [
                                  {
                                    "categoria": "Alimentação",
                                    "analise": "Análise específica...",
                                    "recomendacao": "Recomendação..."
                                  }
                                ],
                                "categoriasDestaque": [
                                  {
                                    "categoria": "Transporte",
                                    "analise": "Análise específica...",
                                    "recomendacao": "Recomendação..."
                                  }
                                ],
                                "padraoComportamental": "Descrição do padrão..."
                              },
                              "analiseReceitas": {
                                "resumo": "Resumo da análise...",
                                "estabilidade": "Estável/Instável/Em crescimento",
                                "oportunidadesAumento": ["oportunidade 1", "oportunidade 2"]
                              },
                              "analiseContas": {
                                "resumo": "Resumo da análise...",
                                "alertas": ["alerta 1", "alerta 2"],
                                "otimizacoes": ["otimização 1", "otimização 2"]
                              },
                              "analiseDividas": {
                                "resumo": "Resumo da análise...",
                                "nivelEndividamento": "Baixo/Moderado/Alto/Crítico",
                                "estrategiaPagamento": ["estratégia 1", "estratégia 2"],
                                "alertasVencimento": ["alerta 1", "alerta 2"]
                              },
                              "analiseListaCompras": {
                                "resumo": "Resumo da análise...",
                                "impactoOrcamentario": 1500.00,
                                "itensPrioritarios": ["item 1", "item 2"],
                                "itensAdiaveis": ["item 1", "item 2"]
                              },
                              "recomendacoes": [
                                {
                                  "prioridade": "ALTA",
                                  "categoria": "gastos",
                                  "titulo": "Título da recomendação",
                                  "descricao": "Descrição detalhada...",
                                  "impactoEsperado": "Descrição do impacto...",
                                  "acoesSugeridas": ["ação 1", "ação 2", "ação 3"]
                                }
                              ]
                            }

                            IMPORTANTE:
                            - Não recalcule indicadores, use os valores fornecidos
                            - Seja específico e use dados reais nas análises
                            - Se uma lista estiver vazia, retorne array vazio []
                            - Não escreva nenhum texto fora do JSON
                            - Use valores monetários com 2 casas decimais
                            """)
                    .user("""
                            Dados financeiros completos do usuário:

                            %s
                            """.formatted(dadosJson))
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
                    ResultadoAnaliseDetalhadaIA.class
            );

        } catch (Exception e) {

            throw new IaIndisponivelException(
                    "Não foi possível concluir a análise financeira detalhada com IA.",
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
