package br.com.FinanceAi.Backend.dto.response;

import java.math.BigDecimal;

public record GastoPorCategoriaResponse(
        String categoria,
        BigDecimal valor,
        BigDecimal percentual
) {
}