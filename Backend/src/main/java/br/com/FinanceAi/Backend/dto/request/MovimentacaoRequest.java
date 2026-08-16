package br.com.FinanceAi.Backend.dto.request;

import br.com.FinanceAi.Backend.entity.enums.TipoMovimentacaoEnum;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MovimentacaoRequest(
        TipoMovimentacaoEnum tipo,

        @NotBlank(message = "A descrição é obrigatória.")
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
        Boolean origemIA
) {}
