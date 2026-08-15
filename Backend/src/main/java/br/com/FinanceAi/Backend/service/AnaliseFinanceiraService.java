package br.com.FinanceAi.Backend.service;

import br.com.FinanceAi.Backend.dto.response.AnaliseFinanceiraResponse;
import br.com.FinanceAi.Backend.dto.response.IndicadoresAnaliseResponse;
import br.com.FinanceAi.Backend.dto.response.IndicadoresFinanceiros;
import br.com.FinanceAi.Backend.dto.response.RecomendacaoFinanceiraIA;
import br.com.FinanceAi.Backend.dto.response.ResultadoAnaliseFinanceiraIA;
import br.com.FinanceAi.Backend.entity.AnaliseFinanceira;
import br.com.FinanceAi.Backend.entity.Despesa;
import br.com.FinanceAi.Backend.entity.PerfilFinanceiro;
import br.com.FinanceAi.Backend.entity.Receita;
import br.com.FinanceAi.Backend.entity.RecomendacaoFinanceira;
import br.com.FinanceAi.Backend.repository.AnaliseFinanceiraRepository;
import br.com.FinanceAi.Backend.repository.DespesaRepository;
import br.com.FinanceAi.Backend.repository.PerfilFinanceiroRepository;
import br.com.FinanceAi.Backend.repository.ReceitaRepository;
import br.com.FinanceAi.Backend.repository.RecomendacaoFinanceiraRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnaliseFinanceiraService {

    private final ReceitaRepository receitaRepository;
    private final DespesaRepository despesaRepository;

    private final AnaliseFinanceiraRepository analiseFinanceiraRepository;
    private final PerfilFinanceiroRepository perfilFinanceiroRepository;
    private final RecomendacaoFinanceiraRepository recomendacaoFinanceiraRepository;

    private final AnaliseFinanceiraIAService analiseFinanceiraIAService;

    @Transactional
    public AnaliseFinanceiraResponse analisar(Long usuarioId) {

        List<Receita> receitas =
                receitaRepository
                        .findByUsuarioIdAndAtivoTrueOrderByDataDesc(usuarioId);

        List<Despesa> despesas =
                despesaRepository
                        .findByUsuarioIdAndAtivoTrueOrderByDataDesc(usuarioId);

        validarDadosSuficientes(receitas, despesas);

        BigDecimal totalReceitas = receitas.stream()
                .map(Receita::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalDespesas = despesas.stream()
                .map(Despesa::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal saldo =
                totalReceitas.subtract(totalDespesas);

        BigDecimal percentualEconomia =
                calcularPercentual(
                        saldo,
                        totalReceitas
                );

        BigDecimal comprometimentoRenda =
                calcularPercentual(
                        totalDespesas,
                        totalReceitas
                );

        IndicadoresFinanceiros indicadores =
                new IndicadoresFinanceiros(
                        dinheiro(saldo),
                        dinheiro(totalReceitas),
                        dinheiro(totalDespesas),
                        percentualEconomia,
                        comprometimentoRenda
                );

        /*
         * A IA NÃO calcula os indicadores.
         * Ela recebe os valores já calculados pelo backend
         * e apenas gera perfil + recomendações.
         */
        ResultadoAnaliseFinanceiraIA resultadoIA =
                analiseFinanceiraIAService.analisar(indicadores);

        validarRespostaIA(resultadoIA);

        AnaliseFinanceira analise =
                AnaliseFinanceira.builder()
                        .saldoCalculado(indicadores.saldo())
                        .totalReceitas(indicadores.totalReceitas())
                        .totalDespesas(indicadores.totalDespesas())
                        .percentualEconomia(indicadores.percentualEconomia())
                        .comprometimentoRenda(indicadores.comprometimentoRenda())
                        .usuarioId(usuarioId)
                        .build();

        analise =
                analiseFinanceiraRepository.save(analise);

        PerfilFinanceiro perfilFinanceiro =
                PerfilFinanceiro.builder()
                        .tipoPerfil(
                                resultadoIA
                                        .perfilFinanceiro()
                                        .tipo()
                        )
                        .justificativa(
                                resultadoIA
                                        .perfilFinanceiro()
                                        .justificativa()
                        )
                        .usuarioId(usuarioId)
                        .analiseId(analise.getId())
                        .build();

        perfilFinanceiroRepository.save(perfilFinanceiro);

        List<RecomendacaoFinanceiraIA> recomendacoesIA =
                resultadoIA.recomendacoes() == null
                        ? List.of()
                        : resultadoIA.recomendacoes();

        for (RecomendacaoFinanceiraIA recomendacaoIA : recomendacoesIA) {

            RecomendacaoFinanceira recomendacao =
                    RecomendacaoFinanceira.builder()
                            .conteudo(recomendacaoIA.conteudo())
                            .prioridade(recomendacaoIA.prioridade())
                            .categoriaRelacionada(null)
                            .usuarioId(usuarioId)
                            .analiseId(analise.getId())
                            .build();

            recomendacaoFinanceiraRepository.save(recomendacao);
        }

        IndicadoresAnaliseResponse indicadoresResponse =
                new IndicadoresAnaliseResponse(
                        indicadores.saldo(),
                        indicadores.percentualEconomia(),
                        indicadores.comprometimentoRenda()
                );

        return new AnaliseFinanceiraResponse(
                analise.getDataProcessamento(),
                resultadoIA.perfilFinanceiro(),
                indicadoresResponse,
                recomendacoesIA
        );
    }

    private void validarDadosSuficientes(
            List<Receita> receitas,
            List<Despesa> despesas
    ) {

        if (receitas.isEmpty() || despesas.isEmpty()) {
            throw new IllegalArgumentException(
                    "Dados financeiros insuficientes para realizar a análise."
            );
        }
    }

    private void validarRespostaIA(
            ResultadoAnaliseFinanceiraIA resultadoIA
    ) {

        if (resultadoIA == null
                || resultadoIA.perfilFinanceiro() == null
                || resultadoIA.perfilFinanceiro().tipo() == null
                || resultadoIA.perfilFinanceiro().justificativa() == null
                || resultadoIA.perfilFinanceiro().justificativa().isBlank()) {

            throw new IllegalStateException(
                    "A IA retornou uma análise financeira inválida."
            );
        }
    }

    private BigDecimal calcularPercentual(
            BigDecimal valor,
            BigDecimal total
    ) {

        if (total.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO.setScale(2);
        }

        return valor
                .multiply(BigDecimal.valueOf(100))
                .divide(
                        total,
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