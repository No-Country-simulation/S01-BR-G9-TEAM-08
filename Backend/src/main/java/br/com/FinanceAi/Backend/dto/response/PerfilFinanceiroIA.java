package br.com.FinanceAi.Backend.dto.response;

import br.com.FinanceAi.Backend.ai.PerfilFinanceiroEnum;

public record PerfilFinanceiroIA(

        PerfilFinanceiroEnum tipo,
        String justificativa

) {
}