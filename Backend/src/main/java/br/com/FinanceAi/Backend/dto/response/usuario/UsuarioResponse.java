package br.com.FinanceAi.Backend.dto.response.usuario;

import java.time.OffsetDateTime;

public record UsuarioResponse(
     Long id,
     String nome,
     String email,
     OffsetDateTime dataCadastro
) {
}
