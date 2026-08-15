package br.com.FinanceAi.Backend.dto.response;

import br.com.FinanceAi.Backend.entity.Despesa;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record DespesaResponse(

        Long id,
        String descricao,
        BigDecimal valor,
        LocalDate data,
        Long categoriaId,
        String categoriaNome,
        boolean origemIA,
        LocalDateTime criadoEm

) {

    public static DespesaResponse fromEntity(Despesa despesa) {
        return new DespesaResponse(
                despesa.getId(),
                despesa.getDescricao(),
                despesa.getValor(),
                despesa.getData(),
                despesa.getCategoria().getId(),
                despesa.getCategoria().getNome(),
                despesa.isOrigemIA(),
                despesa.getCriadoEm()
        );
    }
}