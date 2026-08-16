package br.com.FinanceAi.Backend.service;

import br.com.FinanceAi.Backend.dto.request.DadosCompletosUsuario;
import br.com.FinanceAi.Backend.entity.*;
import br.com.FinanceAi.Backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ColetorDadosUsuarioService {

    private final DespesaRepository despesaRepository;
    private final ReceitaRepository receitaRepository;
    private final ItemCompraRepository itemCompraRepository;
    private final MovimentacaoRepository movimentacaoRepository;
    private final ContaRepository contaRepository;
    private final DividaRepository dividaRepository;

    @Transactional(readOnly = true)
    public DadosCompletosUsuario coletarDadosCompletos(Long usuarioId) {

        List<Despesa> despesas =
                despesaRepository.findByUsuarioIdAndAtivoTrueOrderByDataDesc(usuarioId);

        List<Receita> receitas =
                receitaRepository.findByUsuarioIdAndAtivoTrueOrderByDataDesc(usuarioId);

        List<ItemCompra> itensCompra =
                itemCompraRepository.findByUsuarioIdAndAtivoTrueOrderByDataDescCriadoEmDesc(usuarioId);

        List<Movimentacao> movimentacoes =
                movimentacaoRepository.findByUsuarioIdAndAtivoTrueOrderByDataDescCriadoEmDesc(usuarioId);

        List<Conta> contas =
                contaRepository.findByUsuarioIdOrderByNomeAsc(usuarioId);

        List<Divida> dividas =
                dividaRepository.findByUsuarioIdOrderByCriadoEmDesc(usuarioId);

        BigDecimal totalReceitas = receitas.stream()
                .map(Receita::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalDespesas = despesas.stream()
                .map(Despesa::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal saldo = totalReceitas.subtract(totalDespesas);

        BigDecimal percentualEconomia = calcularPercentualEconomia(totalReceitas, saldo);

        BigDecimal comprometimentoRenda = calcularComprometimentoRenda(totalReceitas, totalDespesas);

        return new DadosCompletosUsuario(
                saldo,
                totalReceitas,
                totalDespesas,
                percentualEconomia,
                comprometimentoRenda,
                converterDespesas(despesas),
                converterReceitas(receitas),
                converterItensCompra(itensCompra),
                converterMovimentacoes(movimentacoes),
                converterContas(contas),
                converterDividas(dividas)
        );
    }

    private BigDecimal calcularPercentualEconomia(BigDecimal totalReceitas, BigDecimal saldo) {
        if (totalReceitas.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO.setScale(2);
        }
        return saldo
                .multiply(BigDecimal.valueOf(100))
                .divide(totalReceitas, 2, RoundingMode.HALF_UP);
    }

    private BigDecimal calcularComprometimentoRenda(BigDecimal totalReceitas, BigDecimal totalDespesas) {
        if (totalReceitas.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO.setScale(2);
        }
        return totalDespesas
                .multiply(BigDecimal.valueOf(100))
                .divide(totalReceitas, 2, RoundingMode.HALF_UP);
    }

    private List<DadosCompletosUsuario.DespesaDetalhada> converterDespesas(List<Despesa> despesas) {
        return despesas.stream()
                .map(d -> new DadosCompletosUsuario.DespesaDetalhada(
                        d.getId(),
                        d.getDescricao(),
                        d.getValor(),
                        d.getData(),
                        d.getCategoria().getNome(),
                        d.isOrigemIA()
                ))
                .toList();
    }

    private List<DadosCompletosUsuario.ReceitaDetalhada> converterReceitas(List<Receita> receitas) {
        return receitas.stream()
                .map(r -> new DadosCompletosUsuario.ReceitaDetalhada(
                        r.getId(),
                        r.getDescricao(),
                        r.getValor(),
                        r.getData()
                ))
                .toList();
    }

    private List<DadosCompletosUsuario.ItemCompraDetalhado> converterItensCompra(List<ItemCompra> itens) {
        return itens.stream()
                .map(i -> new DadosCompletosUsuario.ItemCompraDetalhado(
                        i.getId(),
                        i.getNome(),
                        i.getObservacao(),
                        i.getData(),
                        i.getQuantidade(),
                        i.getPrioridade().name(),
                        i.getPrecoEstimado(),
                        i.getPrecoPago(),
                        i.isComprado()
                ))
                .toList();
    }

    private List<DadosCompletosUsuario.MovimentacaoDetalhada> converterMovimentacoes(List<Movimentacao> movimentacoes) {
        return movimentacoes.stream()
                .map(m -> new DadosCompletosUsuario.MovimentacaoDetalhada(
                        m.getId(),
                        m.getTipo().name(),
                        m.getDescricao(),
                        m.getValor(),
                        m.getData(),
                        m.getCategoria(),
                        m.getSubcategoria(),
                        m.getContaOrigemNome(),
                        m.getContaDestinoNome(),
                        m.getFormaPagamento(),
                        m.getRecorrencia(),
                        m.isOrigemIA()
                ))
                .toList();
    }

    private List<DadosCompletosUsuario.ContaDetalhada> converterContas(List<Conta> contas) {
        return contas.stream()
                .map(c -> new DadosCompletosUsuario.ContaDetalhada(
                        c.getId(),
                        c.getNome(),
                        c.getInstituicao(),
                        c.getTipo(),
                        c.getMoeda(),
                        c.getSaldo(),
                        c.getLimiteCredito(),
                        c.getLimiteChequeEspecial(),
                        c.getStatus()
                ))
                .toList();
    }

    private List<DadosCompletosUsuario.DividaDetalhada> converterDividas(List<Divida> dividas) {
        return dividas.stream()
                .map(d -> new DadosCompletosUsuario.DividaDetalhada(
                        d.getId(),
                        d.getDescricao(),
                        d.getValorOriginal(),
                        d.getSaldoDevedor(),
                        d.getValorParcela(),
                        d.getParcelasRestantes(),
                        d.getTaxaJuros(),
                        d.getDataVencimento(),
                        d.getStatus()
                ))
                .toList();
    }
}
