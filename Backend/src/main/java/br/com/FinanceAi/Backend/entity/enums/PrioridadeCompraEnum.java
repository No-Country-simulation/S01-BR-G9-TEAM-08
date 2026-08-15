package br.com.FinanceAi.Backend.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.text.Normalizer;
import java.util.Locale;

public enum PrioridadeCompraEnum {

    BAIXA("Baixa"),
    MEDIA("Média"),
    ALTA("Alta");

    private final String valor;

    PrioridadeCompraEnum(String valor) {
        this.valor = valor;
    }

    @JsonValue
    public String getValor() {
        return valor;
    }

    @JsonCreator
    public static PrioridadeCompraEnum fromValue(String value) {

        if (value == null) {
            return null;
        }

        String normalizado = normalizar(value);

        for (PrioridadeCompraEnum prioridade : values()) {

            if (normalizar(prioridade.valor).equals(normalizado)
                    || normalizar(prioridade.name()).equals(normalizado)) {
                return prioridade;
            }
        }

        throw new IllegalArgumentException(
                "Prioridade de compra inválida: " + value
        );
    }

    private static String normalizar(String value) {

        return Normalizer
                .normalize(
                        value.trim().toLowerCase(Locale.ROOT),
                        Normalizer.Form.NFD
                )
                .replaceAll("\\p{M}", "");
    }
}