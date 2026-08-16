package br.com.FinanceAi.Backend.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record DadosCompletosUsuario(

        // Indicadores financeiros básicos
        BigDecimal saldo,
        BigDecimal totalReceitas,
        BigDecimal totalDespesas,
        BigDecimal percentualEconomia,
        BigDecimal comprometimentoRenda,

        // Listas detalhadas
        List<DespesaDetalhada> despesas,
        List<ReceitaDetalhada> receitas,
        List<ItemCompraDetalhado> itensCompra,
        List<MovimentacaoDetalhada> movimentacoes,
        List<ContaDetalhada> contas,
        List<DividaDetalhada> dividas

) {

    public record DespesaDetalhada(
            Long id,
            String descricao,
            BigDecimal valor,
            LocalDate data,
            String categoria,
            boolean origemIA
    ) {}

    public record ReceitaDetalhada(
            Long id,
            String descricao,
            BigDecimal valor,
            LocalDate data
    ) {}

    public record ItemCompraDetalhado(
            Long id,
            String nome,
            String observacao,
            LocalDate data,
            Integer quantidade,
            String prioridade,
            BigDecimal precoEstimado,
            BigDecimal precoPago,
            boolean comprado
    ) {}

    public record MovimentacaoDetalhada(
            Long id,
            String tipo,
            String descricao,
            BigDecimal valor,
            LocalDate data,
            String categoria,
            String subcategoria,
            String contaOrigem,
            String contaDestino,
            String formaPagamento,
            String recorrencia,
            boolean origemIA
    ) {}

    public record ContaDetalhada(
            Long id,
            String nome,
            String instituicao,
            String tipo,
            String moeda,
            BigDecimal saldo,
            BigDecimal limiteCredito,
            BigDecimal limiteChequeEspecial,
            String status
    ) {}

    public record DividaDetalhada(
            Long id,
            String descricao,
            BigDecimal valorOriginal,
            BigDecimal saldoDevedor,
            BigDecimal valorParcela,
            Integer parcelasRestantes,
            BigDecimal taxaJuros,
            String dataVencimento,
            String status
    ) {}
}
