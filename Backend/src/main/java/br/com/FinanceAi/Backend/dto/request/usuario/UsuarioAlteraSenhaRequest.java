package br.com.FinanceAi.Backend.dto.request.usuario;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UsuarioAlteraSenhaRequest(
        @NotBlank(message = "Senha atual é obrigartória")
        String senhaAtual,

        @NotBlank(message = "Nova senha é obrigatória")
        @Size(min = 6, max = 100, message = "Senha deve ter no mínimo de 6 caracteres")
        String novaSenha
) {
}
