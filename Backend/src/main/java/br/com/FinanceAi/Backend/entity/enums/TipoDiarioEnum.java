package br.com.FinanceAi.Backend.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.text.Normalizer;
import java.util.Locale;

public enum TipoDiarioEnum {

    ANOTACAO("anotacao"),
    LISTA_COMPRAS("lista_compras"),
    PLANEJAMENTO("planejamento"),
    REFLEXAO("reflexao"),
    META("meta"),
    LEMBRETE("lembrete"),
    GASTO_FUTURO("gasto_futuro"),
    NAO_COMPRAR_NOVAMENTE("nao_comprar_novamente");

    private final String valor;

    TipoDiarioEnum(String valor) {
        this.valor = valor;
    }

    @JsonValue
    public String getValor() {
        return valor;
    }

    @JsonCreator
    public static TipoDiarioEnum fromValue(String value) {

        if (value == null) {
            return null;
        }

        String valorNormalizado = normalizar(value);

        for (TipoDiarioEnum tipo : values()) {

            if (
                    normalizar(tipo.valor).equals(valorNormalizado)
                            || normalizar(tipo.name()).equals(valorNormalizado)
            ) {
                return tipo;
            }
        }

        throw new IllegalArgumentException(
                "Tipo de diário inválido: " + value
        );
    }

    private static String normalizar(String value) {

        return Normalizer
                .normalize(
                        value.trim()
                                .toLowerCase(Locale.ROOT)
                                .replace(" ", "_"),
                        Normalizer.Form.NFD
                )
                .replaceAll("\\p{M}", "");
    }
}