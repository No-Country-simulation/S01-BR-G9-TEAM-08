package br.com.FinanceAi.Backend.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class IAService {

    private final ChatClient chatClient;

    public IAService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

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

            // Fallback temporário enquanto a IA real
            // não estiver disponível.
            return """
                    {
                      "tipo": "ANOTACAO",
                      "descricao": "%s",
                      "valor": null,
                      "categoria": null
                    }
                    """.formatted(texto);
        }
    }
}