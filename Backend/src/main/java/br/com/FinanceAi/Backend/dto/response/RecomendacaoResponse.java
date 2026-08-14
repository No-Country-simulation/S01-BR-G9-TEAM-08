package br.com.FinanceAi.Backend.dto.response;

import br.com.FinanceAi.Backend.entity.RecomendacaoFinanceira;

import java.time.LocalDateTime;

public record RecomendacaoResponse(

        Long id,
        String conteudo,
        String prioridade,
        String categoriaRelacionada,
        LocalDateTime dataGeracao,
        Long analiseId

) {

    public static RecomendacaoResponse fromEntity(
            RecomendacaoFinanceira recomendacao
    ) {

        return new RecomendacaoResponse(
                recomendacao.getId(),
                recomendacao.getConteudo(),
                recomendacao.getPrioridade(),
                recomendacao.getCategoriaRelacionada(),
                recomendacao.getDataGeracao(),
                recomendacao.getAnaliseId()
        );
    }
}