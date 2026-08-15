package br.com.FinanceAi.Backend.dto.response;

import java.math.BigDecimal;

public record IndicadoresAnaliseResponse(

        BigDecimal saldo,
        BigDecimal percentualEconomia,
        BigDecimal comprometimentoRenda

) {
}