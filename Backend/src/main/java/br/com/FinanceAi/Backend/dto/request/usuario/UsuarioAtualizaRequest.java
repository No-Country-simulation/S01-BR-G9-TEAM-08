package br.com.FinanceAi.Backend.dto.request.usuario;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UsuarioAtualizaRequest(
        @Size(min = 6, max = 100, message = "Nome deve ter entre 2 e 100 caracteres")
        String nome,

        @Email
        String email
) {
}
