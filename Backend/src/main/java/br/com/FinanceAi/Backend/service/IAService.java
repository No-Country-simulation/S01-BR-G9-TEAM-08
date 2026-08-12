package br.com.FinanceAi.Backend.service;

import br.com.FinanceAi.Backend.ai.IaAnalyzer;
import br.com.FinanceAi.Backend.dto.response.ResultadoAnaliseIA;
import br.com.FinanceAi.Backend.entity.RecomendacaoIA;
import br.com.FinanceAi.Backend.repository.RecomendacaoIARepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class IAService {

    private final ChatClient chatClient;
    private final IaAnalyzer iaAnalyzer;
    private final RecomendacaoIARepository recomendacaoIARepository;
    private final ObjectMapper objectMapper;

    public IAService(
            ChatClient.Builder chatClientBuilder,
            IaAnalyzer iaAnalyzer,
            RecomendacaoIARepository recomendacaoIARepository,
            ObjectMapper objectMapper
    ) {
        this.chatClient = chatClientBuilder.build();
        this.iaAnalyzer = iaAnalyzer;
        this.recomendacaoIARepository = recomendacaoIARepository;
        this.objectMapper = objectMapper;
    }

    /*
     * Envia o texto para a IA.
     *
     * Se a API real não estiver disponível,
     * retorna um JSON de fallback.
     */
    public String processarTextoUsuario(String texto) {

        try {

            return chatClient.prompt()
                    .system("""
                            Você é um assistente financeiro do sistema FinanceAI.

                            Analise o texto do usuário e responda SOMENTE com JSON.

                            O formato obrigatório é:

                            {
                              "tipo": "TRANSACAO",
                              "descricao": "descrição da movimentação",
                              "valor": 0.00,
                              "categoria": "categoria"
                            }

                            Valores permitidos para tipo:
                            - TRANSACAO
                            - LEMBRETE
                            - ANOTACAO

                            Se não existir valor, use null.
                            Se não existir categoria, use null.

                            Não escreva nenhum texto fora do JSON.
                            """)
                    .user(texto)
                    .call()
                    .content();

        } catch (Exception e) {

            // Cria um JSON válido de fallback.
            // Usamos ObjectMapper para evitar problema
            // caso o texto do usuário tenha aspas, barras etc.
            try {

                ObjectNode fallback = objectMapper.createObjectNode();

                fallback.put("tipo", "ANOTACAO");
                fallback.put("descricao", texto);
                fallback.putNull("valor");
                fallback.putNull("categoria");

                return objectMapper.writeValueAsString(fallback);

            } catch (Exception erroJson) {

                // Último fallback caso até a criação
                // do JSON apresente algum problema.
                return """
                        {
                          "tipo": "ANOTACAO",
                          "descricao": "Não foi possível processar o texto.",
                          "valor": null,
                          "categoria": null
                        }
                        """;
            }
        }
    }

    /*
     * Versão usada AGORA.
     *
     * Processa a resposta da IA e transforma
     * o JSON em ResultadoAnaliseIA.
     *
     * Ainda não salva log porque o usuário não ta comp.
     */
    public ResultadoAnaliseIA processarEInterpretarTexto(String texto) {

        String respostaIa = processarTextoUsuario(texto);

        return iaAnalyzer.analisar(respostaIa);
    }

    /*
     * Versão que será usada quando tivermos
     * o ID do usuário autenticado.
     *
     * Além de interpretar a resposta,
     * salva também o histórico da interação.
     */
    public ResultadoAnaliseIA processarEInterpretarTexto(
            String texto,
            Long usuarioId
    ) {

        // 1. Chama IA / fallback
        String respostaIa = processarTextoUsuario(texto);

        // 2. Interpreta o JSON
        ResultadoAnaliseIA resultado =
                iaAnalyzer.analisar(respostaIa);

        // 3. Salva o histórico da interação
        salvarLog(
                texto,
                respostaIa,
                resultado,
                usuarioId
        );

        // 4. Retorna o resultado interpretado
        return resultado;
    }

    /*
     * Responsável somente por persistir
     * o histórico da interação com a IA.
     */
    private void salvarLog(
            String texto,
            String respostaIa,
            ResultadoAnaliseIA resultado,
            Long usuarioId
    ) {

        RecomendacaoIA log = new RecomendacaoIA();

        log.setTextoOriginal(texto);
        log.setRespostaIaJson(respostaIa);
        log.setTipoResultado(resultado.tipo());
        log.setUsuarioId(usuarioId);

        recomendacaoIARepository.save(log);
    }
}