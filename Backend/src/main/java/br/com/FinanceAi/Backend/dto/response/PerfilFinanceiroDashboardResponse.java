package br.com.FinanceAi.Backend.dto.response;

import java.time.LocalDateTime;

public record PerfilFinanceiroDashboardResponse(
        String tipo,
        LocalDateTime dataAnalise
) {
}