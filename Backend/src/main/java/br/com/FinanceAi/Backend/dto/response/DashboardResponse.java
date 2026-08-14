package br.com.FinanceAi.Backend.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record DashboardResponse(
        BigDecimal saldo,
        BigDecimal totalReceitas,
        BigDecimal totalDespesas,
        BigDecimal percentualEconomia,
        List<GastoPorCategoriaResponse> gastosPorCategoria,
        PerfilFinanceiroDashboardResponse perfilFinanceiro
) {
}