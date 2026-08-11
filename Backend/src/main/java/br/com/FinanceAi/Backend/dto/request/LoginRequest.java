package br.com.FinanceAi.Backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record LoginRequest(
    @Email
    String email,

    @Size(min = 6, max = 100, message = "Senha deve ter no mínimo de 6 caracteres")
    String senha
) {

}
