package br.com.FinanceAi.Backend.service;

import br.com.FinanceAi.Backend.ai.PerfilFinanceiroEnum;
import br.com.FinanceAi.Backend.dto.response.AnaliseFinanceiraResponse;
import br.com.FinanceAi.Backend.dto.response.IndicadoresFinanceiros;
import br.com.FinanceAi.Backend.dto.response.PerfilFinanceiroIA;
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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AnaliseFinanceiraServiceTest {

    @Mock
    private ReceitaRepository receitaRepository;

    @Mock
    private DespesaRepository despesaRepository;

    @Mock
    private AnaliseFinanceiraRepository analiseFinanceiraRepository;

    @Mock
    private PerfilFinanceiroRepository perfilFinanceiroRepository;

    @Mock
    private RecomendacaoFinanceiraRepository recomendacaoFinanceiraRepository;

    @Mock
    private AnaliseFinanceiraIAService analiseFinanceiraIAService;

    @InjectMocks
    private AnaliseFinanceiraService analiseFinanceiraService;


    @Test
    void deveLancarExcecaoQuandoDadosFinanceirosForemInsuficientes() {

        Long usuarioId = 1L;

        when(
                receitaRepository
                        .findByUsuarioIdAndAtivoTrueOrderByDataDesc(usuarioId)
        ).thenReturn(List.of());

        when(
                despesaRepository
                        .findByUsuarioIdAndAtivoTrueOrderByDataDesc(usuarioId)
        ).thenReturn(List.of());

        assertThatThrownBy(
                () -> analiseFinanceiraService.analisar(usuarioId)
        )
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage(
                        "Dados financeiros insuficientes para realizar a análise."
                );
    }


    @Test
    void deveCalcularIndicadoresESalvarAnalisePerfilERecomendacao() {

        Long usuarioId = 1L;

        Receita receita = Receita.builder()
                .id(1L)
                .descricao("Salário mensal")
                .valor(new BigDecimal("4000.00"))
                .data(LocalDate.of(2026, 8, 14))
                .usuarioId(usuarioId)
                .ativo(true)
                .build();

        Despesa despesa = Despesa.builder()
                .id(1L)
                .descricao("Compra no supermercado")
                .valor(new BigDecimal("1000.00"))
                .data(LocalDate.of(2026, 8, 14))
                .usuarioId(usuarioId)
                .ativo(true)
                .build();

        when(
                receitaRepository
                        .findByUsuarioIdAndAtivoTrueOrderByDataDesc(usuarioId)
        ).thenReturn(List.of(receita));

        when(
                despesaRepository
                        .findByUsuarioIdAndAtivoTrueOrderByDataDesc(usuarioId)
        ).thenReturn(List.of(despesa));


        PerfilFinanceiroIA perfilIA =
                new PerfilFinanceiroIA(
                        PerfilFinanceiroEnum.POUPADOR,
                        "O usuário possui boa capacidade de economia."
                );

        RecomendacaoFinanceiraIA recomendacaoIA =
                new RecomendacaoFinanceiraIA(
                        "MEDIA",
                        "Considere formar uma reserva de emergência."
                );

        ResultadoAnaliseFinanceiraIA resultadoIA =
                new ResultadoAnaliseFinanceiraIA(
                        perfilIA,
                        List.of(recomendacaoIA)
                );

        when(
                analiseFinanceiraIAService
                        .analisar(any(IndicadoresFinanceiros.class))
        ).thenReturn(resultadoIA);


        when(
                analiseFinanceiraRepository
                        .save(any(AnaliseFinanceira.class))
        ).thenAnswer(invocation -> {

            AnaliseFinanceira analise =
                    invocation.getArgument(0);

            analise.setId(10L);

            analise.setDataProcessamento(
                    LocalDateTime.of(
                            2026,
                            8,
                            14,
                            19,
                            0
                    )
            );

            return analise;
        });


        AnaliseFinanceiraResponse resultado =
                analiseFinanceiraService.analisar(usuarioId);


        assertThat(resultado)
                .isNotNull();

        assertThat(
                resultado.indicadores().saldo()
        ).isEqualByComparingTo(
                new BigDecimal("3000.00")
        );

        assertThat(
                resultado.indicadores().percentualEconomia()
        ).isEqualByComparingTo(
                new BigDecimal("75.00")
        );

        assertThat(
                resultado.indicadores().comprometimentoRenda()
        ).isEqualByComparingTo(
                new BigDecimal("25.00")
        );


        assertThat(
                resultado.perfilFinanceiro()
        ).isNotNull();

        assertThat(
                resultado.perfilFinanceiro().tipo()
        ).isEqualTo(
                PerfilFinanceiroEnum.POUPADOR
        );

        assertThat(
                resultado.perfilFinanceiro().justificativa()
        ).isEqualTo(
                "O usuário possui boa capacidade de economia."
        );


        assertThat(
                resultado.recomendacoes()
        ).hasSize(1);

        assertThat(
                resultado.recomendacoes()
                        .getFirst()
                        .prioridade()
        ).isEqualTo("MEDIA");

        assertThat(
                resultado.recomendacoes()
                        .getFirst()
                        .conteudo()
        ).isEqualTo(
                "Considere formar uma reserva de emergência."
        );


        ArgumentCaptor<IndicadoresFinanceiros>
                indicadoresCaptor =
                ArgumentCaptor.forClass(
                        IndicadoresFinanceiros.class
                );

        verify(
                analiseFinanceiraIAService
        ).analisar(
                indicadoresCaptor.capture()
        );

        IndicadoresFinanceiros indicadoresEnviadosParaIA =
                indicadoresCaptor.getValue();

        assertThat(
                indicadoresEnviadosParaIA.saldo()
        ).isEqualByComparingTo(
                new BigDecimal("3000.00")
        );

        assertThat(
                indicadoresEnviadosParaIA.totalReceitas()
        ).isEqualByComparingTo(
                new BigDecimal("4000.00")
        );

        assertThat(
                indicadoresEnviadosParaIA.totalDespesas()
        ).isEqualByComparingTo(
                new BigDecimal("1000.00")
        );

        assertThat(
                indicadoresEnviadosParaIA.percentualEconomia()
        ).isEqualByComparingTo(
                new BigDecimal("75.00")
        );

        assertThat(
                indicadoresEnviadosParaIA.comprometimentoRenda()
        ).isEqualByComparingTo(
                new BigDecimal("25.00")
        );


        ArgumentCaptor<AnaliseFinanceira>
                analiseCaptor =
                ArgumentCaptor.forClass(
                        AnaliseFinanceira.class
                );

        verify(
                analiseFinanceiraRepository
        ).save(
                analiseCaptor.capture()
        );

        AnaliseFinanceira analiseSalva =
                analiseCaptor.getValue();

        assertThat(
                analiseSalva.getSaldoCalculado()
        ).isEqualByComparingTo(
                new BigDecimal("3000.00")
        );

        assertThat(
                analiseSalva.getTotalReceitas()
        ).isEqualByComparingTo(
                new BigDecimal("4000.00")
        );

        assertThat(
                analiseSalva.getTotalDespesas()
        ).isEqualByComparingTo(
                new BigDecimal("1000.00")
        );

        assertThat(
                analiseSalva.getPercentualEconomia()
        ).isEqualByComparingTo(
                new BigDecimal("75.00")
        );

        assertThat(
                analiseSalva.getComprometimentoRenda()
        ).isEqualByComparingTo(
                new BigDecimal("25.00")
        );

        assertThat(
                analiseSalva.getUsuarioId()
        ).isEqualTo(usuarioId);


        ArgumentCaptor<PerfilFinanceiro>
                perfilCaptor =
                ArgumentCaptor.forClass(
                        PerfilFinanceiro.class
                );

        verify(
                perfilFinanceiroRepository
        ).save(
                perfilCaptor.capture()
        );

        PerfilFinanceiro perfilSalvo =
                perfilCaptor.getValue();

        assertThat(
                perfilSalvo.getTipoPerfil()
        ).isEqualTo(
                PerfilFinanceiroEnum.POUPADOR
        );

        assertThat(
                perfilSalvo.getUsuarioId()
        ).isEqualTo(usuarioId);

        assertThat(
                perfilSalvo.getAnaliseId()
        ).isEqualTo(10L);


        ArgumentCaptor<RecomendacaoFinanceira>
                recomendacaoCaptor =
                ArgumentCaptor.forClass(
                        RecomendacaoFinanceira.class
                );

        verify(
                recomendacaoFinanceiraRepository
        ).save(
                recomendacaoCaptor.capture()
        );

        RecomendacaoFinanceira recomendacaoSalva =
                recomendacaoCaptor.getValue();

        assertThat(
                recomendacaoSalva.getPrioridade()
        ).isEqualTo("MEDIA");

        assertThat(
                recomendacaoSalva.getConteudo()
        ).isEqualTo(
                "Considere formar uma reserva de emergência."
        );

        assertThat(
                recomendacaoSalva.getUsuarioId()
        ).isEqualTo(usuarioId);

        assertThat(
                recomendacaoSalva.getAnaliseId()
        ).isEqualTo(10L);
    }
}