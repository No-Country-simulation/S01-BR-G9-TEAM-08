package br.com.FinanceAi.Backend.service;

import br.com.FinanceAi.Backend.ai.PerfilFinanceiroEnum;
import br.com.FinanceAi.Backend.dto.response.IndicadoresFinanceiros;
import br.com.FinanceAi.Backend.dto.response.ResultadoAnaliseFinanceiraIA;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.client.ChatClient;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.RETURNS_DEEP_STUBS;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AnaliseFinanceiraIAServiceTest {

    private AnaliseFinanceiraIAService analiseService;
    private ChatClient chatClient;

    @BeforeEach
    void preparar() {

        ChatClient.Builder builder =
                mock(ChatClient.Builder.class);

        chatClient =
                mock(ChatClient.class, RETURNS_DEEP_STUBS);

        when(builder.build())
                .thenReturn(chatClient);

        ObjectMapper objectMapper =
                new ObjectMapper();

        analiseService =
                new AnaliseFinanceiraIAService(
                        builder,
                        objectMapper
                );
    }

    @Test
    void deveInterpretarAnaliseFinanceiraValida() {

        String respostaIa = """
                {
                  "perfilFinanceiro": {
                    "tipo": "POUPADOR",
                    "justificativa": "O usuário possui boa capacidade de economia."
                  },
                  "recomendacoes": [
                    {
                      "prioridade": "MEDIA",
                      "conteudo": "Considere criar uma reserva de emergência."
                    }
                  ]
                }
                """;

        when(
                chatClient.prompt()
                        .system(anyString())
                        .user(anyString())
                        .call()
                        .content()
        ).thenReturn(respostaIa);

        IndicadoresFinanceiros indicadores =
                criarIndicadores();

        ResultadoAnaliseFinanceiraIA resultado =
                analiseService.analisar(indicadores);

        assertNotNull(resultado);

        assertNotNull(
                resultado.perfilFinanceiro()
        );

        assertEquals(
                PerfilFinanceiroEnum.POUPADOR,
                resultado.perfilFinanceiro().tipo()
        );

        assertEquals(
                "O usuário possui boa capacidade de economia.",
                resultado.perfilFinanceiro().justificativa()
        );

        assertEquals(
                1,
                resultado.recomendacoes().size()
        );

        assertEquals(
                "MEDIA",
                resultado.recomendacoes()
                        .getFirst()
                        .prioridade()
        );

        assertEquals(
                "Considere criar uma reserva de emergência.",
                resultado.recomendacoes()
                        .getFirst()
                        .conteudo()
        );
    }

    @Test
    void deveAceitarJsonDentroDeBlocoMarkdown() {

        String respostaIa = """
                ```json
                {
                  "perfilFinanceiro": {
                    "tipo": "EQUILIBRADO",
                    "justificativa": "As receitas e despesas estão equilibradas."
                  },
                  "recomendacoes": [
                    {
                      "prioridade": "BAIXA",
                      "conteudo": "Continue acompanhando seus gastos."
                    }
                  ]
                }
                ```
                """;

        when(
                chatClient.prompt()
                        .system(anyString())
                        .user(anyString())
                        .call()
                        .content()
        ).thenReturn(respostaIa);

        ResultadoAnaliseFinanceiraIA resultado =
                analiseService.analisar(
                        criarIndicadores()
                );

        assertEquals(
                PerfilFinanceiroEnum.EQUILIBRADO,
                resultado.perfilFinanceiro().tipo()
        );

        assertEquals(
                "BAIXA",
                resultado.recomendacoes()
                        .getFirst()
                        .prioridade()
        );
    }

    @Test
    void deveLancarExcecaoQuandoIaRetornarRespostaVazia() {

        when(
                chatClient.prompt()
                        .system(anyString())
                        .user(anyString())
                        .call()
                        .content()
        ).thenReturn("");

        IndicadoresFinanceiros indicadores =
                criarIndicadores();

        IllegalStateException exception =
                assertThrows(
                        IllegalStateException.class,
                        () -> analiseService.analisar(
                                indicadores
                        )
                );

        assertEquals(
                "Não foi possível concluir a análise financeira com IA.",
                exception.getMessage()
        );
    }

    @Test
    void deveLancarExcecaoQuandoIaRetornarJsonInvalido() {

        when(
                chatClient.prompt()
                        .system(anyString())
                        .user(anyString())
                        .call()
                        .content()
        ).thenReturn("isso não é um JSON");

        IndicadoresFinanceiros indicadores =
                criarIndicadores();

        assertThrows(
                IllegalStateException.class,
                () -> analiseService.analisar(
                        indicadores
                )
        );
    }

    private IndicadoresFinanceiros criarIndicadores() {

        return new IndicadoresFinanceiros(
                new BigDecimal("3023.60"),
                new BigDecimal("4300.00"),
                new BigDecimal("1276.40"),
                new BigDecimal("70.32"),
                new BigDecimal("29.68")
        );
    }
}