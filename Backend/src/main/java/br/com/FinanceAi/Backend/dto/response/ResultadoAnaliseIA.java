package br.com.FinanceAi.Backend.dto.response;

import br.com.FinanceAi.Backend.entity.RecomendacaoIA.TipoResultadoIA;

import java.math.BigDecimal;

public record ResultadoAnaliseIA(

        TipoResultadoIA tipo,

        String descricao,

        BigDecimal valor,

        String categoria

) {
}