package br.com.FinanceAi.Backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record FinChatRequest(
        @NotBlank(message = "A mensagem não pode estar em branco")
        String mensagem,
        List<HistoricoMensagem> historico
) {
    public record HistoricoMensagem(String papel, String conteudo) {}
}
