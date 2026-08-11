package br.com.FinanceAi.Backend.dto.response;

public record LoginResponse(
    String token,
    String tipo,
    long expiraEm
) {
}
