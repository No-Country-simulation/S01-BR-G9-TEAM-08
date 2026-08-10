package br.com.FinanceAi.Backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IAResponse {

    private String tipoTransacao; // "DESPESA", "RECEITA" ou "OUTRO"
    private BigDecimal valor;
    private String categoria;
    private String descricao;
    private LocalDate data;
    private String analiseDiario; // Comentário/insight da IA
}