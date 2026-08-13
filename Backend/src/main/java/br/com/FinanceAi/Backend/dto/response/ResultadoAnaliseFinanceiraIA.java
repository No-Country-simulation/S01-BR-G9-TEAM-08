package br.com.FinanceAi.Backend.dto.response;

import java.util.List;

public record ResultadoAnaliseFinanceiraIA(

        PerfilFinanceiroIA perfilFinanceiro,
        List<RecomendacaoFinanceiraIA> recomendacoes

) {
}