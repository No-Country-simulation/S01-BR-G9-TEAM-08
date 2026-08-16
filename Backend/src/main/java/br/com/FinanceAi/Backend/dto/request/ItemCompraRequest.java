package br.com.FinanceAi.Backend.dto.request;

import br.com.FinanceAi.Backend.entity.enums.PrioridadeCompraEnum;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ItemCompraRequest(

        @NotBlank(message = "O nome do item é obrigatório")
        @Size(max = 255, message = "O nome do item deve ter no máximo 255 caracteres")
        String nome,

        @Size(max = 1000, message = "A observação deve ter no máximo 1000 caracteres")
        String observacao,

        @NotNull(message = "A data da lista é obrigatória")
        LocalDate data,

        @NotNull(message = "A quantidade é obrigatória")
        @Min(value = 1, message = "A quantidade deve ser pelo menos 1")
        Integer quantidade,

        @NotNull(message = "A prioridade é obrigatória")
        PrioridadeCompraEnum prioridade,

        @NotNull(message = "O preço estimado é obrigatório")
        @DecimalMin(value = "0.00", message = "O preço estimado não pode ser negativo")
        BigDecimal precoEstimado,

        @NotNull(message = "O preço pago é obrigatório")
        @DecimalMin(value = "0.00", message = "O preço pago não pode ser negativo")
        BigDecimal precoPago,

        boolean comprado,

        boolean naoComprarNovamente

) {
}