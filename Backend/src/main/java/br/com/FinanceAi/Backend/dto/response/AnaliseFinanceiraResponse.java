package br.com.FinanceAi.Backend.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record AnaliseFinanceiraResponse(

        LocalDateTime dataAnalise,
        PerfilFinanceiroIA perfilFinanceiro,
        IndicadoresAnaliseResponse indicadores,
        List<RecomendacaoFinanceiraIA> recomendacoes

) {
}