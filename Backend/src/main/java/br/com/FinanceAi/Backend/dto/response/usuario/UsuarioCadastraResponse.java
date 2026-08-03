package br.com.FinanceAi.Backend.dto.response.usuario;

public record UsuarioCadastraResponse(
        Long id,
        String nome,
        String email
) {
}
