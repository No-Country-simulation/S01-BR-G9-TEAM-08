package br.com.FinanceAi.Backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DividaRequest {

    @NotBlank(message = "A descrição da dívida é obrigatória")
    @Size(min = 2, max = 255, message = "A descrição deve ter entre 2 e 255 caracteres")
    private String descricao;

    @NotNull(message = "O valor original é obrigatório")
    private BigDecimal valorOriginal;

    @NotNull(message = "O saldo devedor é obrigatório")
    private BigDecimal saldoDevedor;

    @NotNull(message = "O valor da parcela é obrigatório")
    private BigDecimal valorParcela;

    @NotNull(message = "A quantidade de parcelas restantes é obrigatória")
    private Integer parcelasRestantes;

    @Builder.Default
    private BigDecimal taxaJuros = BigDecimal.ZERO;

    private String dataVencimento;

    @Builder.Default
    private String status = "Em dia";
}
