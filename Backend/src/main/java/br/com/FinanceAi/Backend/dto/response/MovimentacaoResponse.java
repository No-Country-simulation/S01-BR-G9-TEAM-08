package br.com.FinanceAi.Backend.dto.response;

import br.com.FinanceAi.Backend.entity.Movimentacao;
import br.com.FinanceAi.Backend.entity.enums.TipoMovimentacaoEnum;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record MovimentacaoResponse(
        Long id,
        TipoMovimentacaoEnum tipo,
        String descricao,
        BigDecimal valor,
        LocalDate data,
        String categoria,
        String subcategoria,
        Long contaOrigemId,
        String contaOrigemNome,
        Long contaDestinoId,
        String contaDestinoNome,
        String formaPagamento,
        String recorrencia,
        String observacoes,
        BigDecimal saldoReal,
        String motivoAjuste,
        boolean origemIA,
        boolean ativo,
        LocalDateTime criadoEm
) {
    public static MovimentacaoResponse fromEntity(Movimentacao m) {
        return new MovimentacaoResponse(
                m.getId(),
                m.getTipo(),
                m.getDescricao(),
                m.getValor(),
                m.getData(),
                m.getCategoria(),
                m.getSubcategoria(),
                m.getContaOrigemId(),
                m.getContaOrigemNome(),
                m.getContaDestinoId(),
                m.getContaDestinoNome(),
                m.getFormaPagamento(),
                m.getRecorrencia(),
                m.getObservacoes(),
                m.getSaldoReal(),
                m.getMotivoAjuste(),
                m.isOrigemIA(),
                m.isAtivo(),
                m.getCriadoEm()
        );
    }
}
