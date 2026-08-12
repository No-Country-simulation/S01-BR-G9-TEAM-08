package br.com.FinanceAi.Backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.client.ChatClient;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.RETURNS_DEEP_STUBS;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ClassificadorCategoriaIATest {

    private ClassificadorCategoriaIA classificador;
    private ChatClient chatClient;

    @BeforeEach
    void preparar() {

        ChatClient.Builder builder = mock(ChatClient.Builder.class);

        /*
         * RETURNS_DEEP_STUBS permite simular a sequência:
         *
         * chatClient
         *     .prompt()
         *     .system()
         *     .user()
         *     .call()
         *     .content()
         */
        chatClient = mock(ChatClient.class, RETURNS_DEEP_STUBS);

        when(builder.build()).thenReturn(chatClient);

        classificador = new ClassificadorCategoriaIA(builder);
    }

    @Test
    void deveRetornarOutrosQuandoListaDeCategoriasForVazia() {

        String resultado = classificador.classificar(
                "gastei 50 reais no mercado",
                List.of()
        );

        assertEquals("Outros", resultado);
    }

    @Test
    void deveRetornarOutrosQuandoListaDeCategoriasForNula() {

        String resultado = classificador.classificar(
                "gastei 50 reais no mercado",
                null
        );

        assertEquals("Outros", resultado);
    }

    @Test
    void deveRetornarOutrosQuandoIaInventarCategoria() {

        // Simula a IA retornando uma categoria
        // que não existe no sistema.
        when(
                chatClient.prompt()
                        .system(anyString())
                        .user(anyString())
                        .call()
                        .content()
        ).thenReturn("Categoria Inventada");

        List<String> categoriasPermitidas = List.of(
                "Alimentação",
                "Transporte",
                "Saúde",
                "Outros"
        );

        String resultado = classificador.classificar(
                "comprei um hambúrguer",
                categoriasPermitidas
        );

        assertEquals("Outros", resultado);
    }
    @Test
    void deveRetornarCategoriaValidaQuandoIaEscolherCategoriaPermitida() {

        when(
                chatClient.prompt()
                        .system(anyString())
                        .user(anyString())
                        .call()
                        .content()
        ).thenReturn("Alimentação");

        List<String> categoriasPermitidas = List.of(
                "Alimentação",
                "Transporte",
                "Saúde",
                "Outros"
        );

        String resultado = classificador.classificar(
                "comprei um hambúrguer",
                categoriasPermitidas
        );

        assertEquals("Alimentação", resultado);
    }
    @Test
    void deveRetornarOutrosQuandoIaFalhar() {

        when(
                chatClient.prompt()
                        .system(anyString())
                        .user(anyString())
                        .call()
                        .content()
        ).thenThrow(new RuntimeException("IA indisponível"));

        List<String> categoriasPermitidas = List.of(
                "Alimentação",
                "Transporte",
                "Saúde",
                "Outros"
        );

        String resultado = classificador.classificar(
                "gastei 50 reais no mercado",
                categoriasPermitidas
        );

        assertEquals("Outros", resultado);
    }
}