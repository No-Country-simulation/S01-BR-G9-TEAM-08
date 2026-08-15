package br.com.FinanceAi.Backend.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClassificadorCategoriaIA {

    private final ChatClient chatClient;

    public ClassificadorCategoriaIA(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    /**
     * Recebe a descrição de uma despesa e as categorias
     * que existem no sistema.
     *
     * A IA deve escolher somente uma delas.
     *
     * Se houver qualquer problema, usamos "Outros".
     */
    public String classificar(
            String descricao,
            List<String> categoriasPermitidas
    ) {

        // Se não houver categorias disponíveis,
        // usamos a categoria padrão.
        if (categoriasPermitidas == null || categoriasPermitidas.isEmpty()) {
            return "Outros";
        }

        try {

            // Transforma a lista em texto para enviar no prompt.
            // Exemplo:
            // Alimentação, Transporte, Saúde, Outros
            String categorias =
                    String.join(", ", categoriasPermitidas);

            String resposta = chatClient.prompt()
                    .system("""
                            Você é responsável por classificar despesas
                            no sistema FinanceAI.

                            Escolha SOMENTE uma categoria da lista fornecida.

                            Regras:
                            - responda somente com o nome exato da categoria;
                            - não explique sua resposta;
                            - não retorne JSON;
                            - não invente categorias.
                            """)
                    .user("""
                            Descrição da despesa:
                            %s

                            Categorias permitidas:
                            %s
                            """.formatted(descricao, categorias))
                    .call()
                    .content();

            // Caso a IA não retorne nada.
            if (resposta == null || resposta.isBlank()) {
                return "Outros";
            }

            // Remove espaços e possíveis aspas.
            String respostaLimpa =
                    resposta.trim()
                            .replace("\"", "");

            /*
             * Confere se a resposta realmente pertence
             * à lista de categorias permitidas.
             *
             * Assim a IA não pode inventar uma categoria.
             */
            return categoriasPermitidas.stream()
                    .filter(categoria ->
                            categoria.equalsIgnoreCase(respostaLimpa))
                    .findFirst()
                    .orElse("Outros");

        } catch (Exception e) {

            /*
             * Se a API da IA estiver indisponível,
             * a despesa ainda poderá continuar o fluxo.
             */
            return "Outros";
        }
    }
}