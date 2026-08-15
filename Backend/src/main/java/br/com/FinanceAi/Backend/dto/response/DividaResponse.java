package br.com.FinanceAi.Backend.dto.response;

import br.com.FinanceAi.Backend.entity.Divida;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DividaResponse {

    private Long id;
    private String descricao;
    private BigDecimal valorOriginal;
    private BigDecimal saldoDevedor;
    private BigDecimal valorParcela;
    private Integer parcelasRestantes;
    private BigDecimal taxaJuros;
    private String dataVencimento;
    private String status;
    private LocalDateTime criadoEm;

    public static DividaResponse fromEntity(Divida divida) {
        return DividaResponse.builder()
                .id(divida.getId())
                .descricao(divida.getDescricao())
                .valorOriginal(divida.getValorOriginal())
                .saldoDevedor(divida.getSaldoDevedor())
                .valorParcela(divida.getValorParcela())
                .parcelasRestantes(divida.getParcelasRestantes())
                .taxaJuros(divida.getTaxaJuros())
                .dataVencimento(divida.getDataVencimento())
                .status(divida.getStatus())
                .criadoEm(divida.getCriadoEm())
                .build();
    }
}
