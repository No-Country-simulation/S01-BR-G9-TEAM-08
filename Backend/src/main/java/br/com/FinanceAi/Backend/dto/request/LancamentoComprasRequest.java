package br.com.FinanceAi.Backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record LancamentoComprasRequest(

        @NotBlank(message = "A categoria é obrigatória")
        String categoria,

        @NotNull(message = "A data da compra é obrigatória")
        LocalDate data

) {
}