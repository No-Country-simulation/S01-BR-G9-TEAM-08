package br.com.FinanceAi.Backend.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.text.Normalizer;
import java.util.Locale;

public enum TipoMovimentacaoEnum {

    RECEITA("RECEITA"),
    DESPESA("DESPESA"),
    TRANSFERENCIA("TRANSFERENCIA"),
    AJUSTE_SALDO("AJUSTE_SALDO");

    private final String valor;

    TipoMovimentacaoEnum(String valor) {
        this.valor = valor;
    }

    @JsonValue
    public String getValor() {
        return valor;
    }

    @JsonCreator
    public static TipoMovimentacaoEnum fromValue(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        String valorNormalizado = normalizar(value);

        for (TipoMovimentacaoEnum tipo : values()) {
            if (normalizar(tipo.valor).equals(valorNormalizado)
                    || normalizar(tipo.name()).equals(valorNormalizado)) {
                return tipo;
            }
        }

        throw new IllegalArgumentException("Tipo de movimentação inválido: " + value);
    }

    private static String normalizar(String value) {
        return Normalizer
                .normalize(
                        value.trim()
                                .toUpperCase(Locale.ROOT)
                                .replace(" ", "_"),
                        Normalizer.Form.NFD
                )
                .replaceAll("\\p{M}", "");
    }
}
