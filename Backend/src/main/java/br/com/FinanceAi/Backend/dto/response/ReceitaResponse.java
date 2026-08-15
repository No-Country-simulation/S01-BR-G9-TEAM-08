package br.com.FinanceAi.Backend.dto.response;

import br.com.FinanceAi.Backend.entity.Receita;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ReceitaResponse(

        Long id,
        String descricao,
        BigDecimal valor,
        LocalDate data

) {

    public static ReceitaResponse fromEntity(Receita receita) {
        return new ReceitaResponse(
                receita.getId(),
                receita.getDescricao(),
                receita.getValor(),
                receita.getData()
        );
    }
}