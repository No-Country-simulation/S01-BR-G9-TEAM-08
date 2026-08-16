package br.com.FinanceAi.Backend.dto.response;

import br.com.FinanceAi.Backend.entity.ItemCompra;
import br.com.FinanceAi.Backend.entity.enums.PrioridadeCompraEnum;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ItemCompraResponse(

        Long id,
        String nome,
        String observacao,
        LocalDate data,
        Integer quantidade,
        PrioridadeCompraEnum prioridade,
        BigDecimal precoEstimado,
        BigDecimal precoPago,
        boolean comprado,
        boolean naoComprarNovamente,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm

) {

    public static ItemCompraResponse fromEntity(ItemCompra item) {

        return new ItemCompraResponse(
                item.getId(),
                item.getNome(),
                item.getObservacao(),
                item.getData(),
                item.getQuantidade(),
                item.getPrioridade(),
                item.getPrecoEstimado(),
                item.getPrecoPago(),
                item.isComprado(),
                item.isNaoComprarNovamente(),
                item.getCriadoEm(),
                item.getAtualizadoEm()
        );
    }
}