package br.com.FinanceAi.Backend.ai;

import br.com.FinanceAi.Backend.dto.response.ResultadoAnaliseIA;
import br.com.FinanceAi.Backend.entity.RecomendacaoIA.TipoResultadoIA;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class IaAnalyzer {

    private final ObjectMapper objectMapper;

    public IaAnalyzer(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public ResultadoAnaliseIA analisar(String respostaIaJson) {

        try {
            JsonNode json = objectMapper.readTree(respostaIaJson);

            TipoResultadoIA tipo = converterTipo(json);

            String descricao = json.hasNonNull("descricao")
                    ? json.get("descricao").asText()
                    : null;

            BigDecimal valor = json.hasNonNull("valor")
                    ? json.get("valor").decimalValue()
                    : null;

            String categoria = json.hasNonNull("categoria")
                    ? json.get("categoria").asText()
                    : null;

            return new ResultadoAnaliseIA(
                    tipo,
                    descricao,
                    valor,
                    categoria
            );

        } catch (Exception e) {

            return new ResultadoAnaliseIA(
                    TipoResultadoIA.ANOTACAO,
                    respostaIaJson,
                    null,
                    null
            );
        }
    }

    private TipoResultadoIA converterTipo(JsonNode json) {

        if (!json.hasNonNull("tipo")) {
            return TipoResultadoIA.ANOTACAO;
        }

        try {
            return TipoResultadoIA.valueOf(
                    json.get("tipo").asText().toUpperCase()
            );

        } catch (IllegalArgumentException e) {
            return TipoResultadoIA.ANOTACAO;
        }
    }
}