package br.com.FinanceAi.Backend.service;

import br.com.FinanceAi.Backend.dto.response.DashboardResponse;
import br.com.FinanceAi.Backend.dto.response.GastoPorCategoriaResponse;
import br.com.FinanceAi.Backend.dto.response.PerfilFinanceiroDashboardResponse;
import br.com.FinanceAi.Backend.entity.Despesa;
import br.com.FinanceAi.Backend.entity.Receita;
import br.com.FinanceAi.Backend.repository.DespesaRepository;
import br.com.FinanceAi.Backend.repository.PerfilFinanceiroRepository;
import br.com.FinanceAi.Backend.repository.ReceitaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ReceitaRepository receitaRepository;
    private final DespesaRepository despesaRepository;
    private final PerfilFinanceiroRepository perfilFinanceiroRepository;

    @Transactional(readOnly = true)
    public DashboardResponse gerarDashboard(Long usuarioId) {

        List<Receita> receitas =
                receitaRepository.findByUsuarioIdAndAtivoTrueOrderByDataDesc(usuarioId);

        List<Despesa> despesas =
                despesaRepository.findByUsuarioIdAndAtivoTrueOrderByDataDesc(usuarioId);

        BigDecimal totalReceitas = receitas.stream()
                .map(Receita::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalDespesas = despesas.stream()
                .map(Despesa::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal saldo = totalReceitas.subtract(totalDespesas);

        BigDecimal percentualEconomia =
                calcularPercentualEconomia(
                        totalReceitas,
                        saldo
                );

        List<GastoPorCategoriaResponse> gastosPorCategoria =
                calcularGastosPorCategoria(
                        despesas,
                        totalDespesas
                );

        PerfilFinanceiroDashboardResponse perfilFinanceiro =
                perfilFinanceiroRepository
                        .findTopByUsuarioIdOrderByDataClassificacaoDesc(usuarioId)
                        .map(perfil ->
                                new PerfilFinanceiroDashboardResponse(
                                        perfil.getTipoPerfil().name(),
                                        perfil.getDataClassificacao()
                                )
                        )
                        .orElse(null);

        return new DashboardResponse(
                dinheiro(saldo),
                dinheiro(totalReceitas),
                dinheiro(totalDespesas),
                percentualEconomia,
                gastosPorCategoria,
                perfilFinanceiro
        );
    }

    private BigDecimal calcularPercentualEconomia(
            BigDecimal totalReceitas,
            BigDecimal saldo
    ) {

        if (totalReceitas.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO.setScale(2);
        }

        return saldo
                .multiply(BigDecimal.valueOf(100))
                .divide(
                        totalReceitas,
                        2,
                        RoundingMode.HALF_UP
                );
    }

    private List<GastoPorCategoriaResponse> calcularGastosPorCategoria(
            List<Despesa> despesas,
            BigDecimal totalDespesas
    ) {

        if (despesas.isEmpty()) {
            return List.of();
        }

        Map<String, BigDecimal> totaisPorCategoria =
                new LinkedHashMap<>();

        for (Despesa despesa : despesas) {

            String nomeCategoria =
                    despesa.getCategoria().getNome();

            totaisPorCategoria.merge(
                    nomeCategoria,
                    despesa.getValor(),
                    BigDecimal::add
            );
        }

        return totaisPorCategoria.entrySet()
                .stream()
                .map(entry -> {

                    BigDecimal percentual =
                            calcularPercentualCategoria(
                                    entry.getValue(),
                                    totalDespesas
                            );

                    return new GastoPorCategoriaResponse(
                            entry.getKey(),
                            dinheiro(entry.getValue()),
                            percentual
                    );
                })
                .toList();
    }

    private BigDecimal calcularPercentualCategoria(
            BigDecimal valorCategoria,
            BigDecimal totalDespesas
    ) {

        if (totalDespesas.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO.setScale(2);
        }

        return valorCategoria
                .multiply(BigDecimal.valueOf(100))
                .divide(
                        totalDespesas,
                        2,
                        RoundingMode.HALF_UP
                );
    }

    private BigDecimal dinheiro(BigDecimal valor) {
        return valor.setScale(
                2,
                RoundingMode.HALF_UP
        );
    }
}