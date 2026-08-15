package br.com.FinanceAi.Backend.ai;

import br.com.FinanceAi.Backend.dto.response.ResultadoAnaliseIA;
import br.com.FinanceAi.Backend.entity.RecomendacaoIA.TipoResultadoIA;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class IaAnalyzerTest {

    private final IaAnalyzer analyzer =
            new IaAnalyzer(new ObjectMapper());

    @Test
    void deveInterpretarTransacaoValida() {

        String json = """
                {
                  "tipo": "TRANSACAO",
                  "descricao": "Compra no mercado",
                  "valor": 50.00,
                  "categoria": "Alimentação"
                }
                """;

        ResultadoAnaliseIA resultado = analyzer.analisar(json);

        assertEquals(TipoResultadoIA.TRANSACAO, resultado.tipo());
        assertEquals("Compra no mercado", resultado.descricao());
        assertEquals(
                0,
                new BigDecimal("50.00").compareTo(resultado.valor())
        );
        assertEquals("Alimentação", resultado.categoria());
    }

    @Test
    void deveUsarAnotacaoQuandoTipoForInvalido() {

        String json = """
                {
                  "tipo": "TIPO_INVALIDO",
                  "descricao": "Teste",
                  "valor": 20,
                  "categoria": "Outros"
                }
                """;

        ResultadoAnaliseIA resultado = analyzer.analisar(json);

        assertEquals(TipoResultadoIA.ANOTACAO, resultado.tipo());
        assertEquals("Teste", resultado.descricao());
    }

    @Test
    void deveUsarAnotacaoQuandoRespostaNaoForJson() {

        String resposta = "A IA respondeu um texto qualquer";

        ResultadoAnaliseIA resultado = analyzer.analisar(resposta);

        assertEquals(TipoResultadoIA.ANOTACAO, resultado.tipo());
        assertEquals(resposta, resultado.descricao());
        assertNull(resultado.valor());
        assertNull(resultado.categoria());
    }
}