package br.com.FinanceAi.Backend.dto.response;

import java.math.BigDecimal;

public record IndicadoresFinanceiros(

        BigDecimal saldo,
        BigDecimal totalReceitas,
        BigDecimal totalDespesas,
        BigDecimal percentualEconomia,
        BigDecimal comprometimentoRenda

) {
}