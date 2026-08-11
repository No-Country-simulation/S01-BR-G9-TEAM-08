package br.com.FinanceAi.Backend.dto.request.usuario;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UsuarioExcluiRequest (
        @NotBlank(message = "Senha é obrigatória para confirmar a exclusão")
        @Size(min = 6, max = 100, message = "Senha deve ter no mínimo de 6 caracteres")
        String senha
){
}
