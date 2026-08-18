package br.com.FinanceAi.Backend.dto.request.usuario;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UsuarioCadastraRequest(
        @NotBlank
        @Size(min = 2, max = 100, message = "Nome deve ter entre 2 e 100 caracteres")
        String nome,

        @NotBlank
        @Email
        String email,

        @NotBlank
        @Size(min = 6, max = 100, message = "Senha deve ter no mínimo de 6 caracteres")
        String senha

) {
}
