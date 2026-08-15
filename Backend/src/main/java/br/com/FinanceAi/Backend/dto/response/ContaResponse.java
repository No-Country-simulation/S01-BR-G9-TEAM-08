package br.com.FinanceAi.Backend.dto.response;

import br.com.FinanceAi.Backend.entity.Conta;
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
public class ContaResponse {

    private Long id;
    private String nome;
    private String instituicao;
    private String tipo;
    private String moeda;
    private BigDecimal saldo;
    private BigDecimal limiteCredito;
    private BigDecimal limiteChequeEspecial;
    private String status;
    private LocalDateTime criadoEm;

    public static ContaResponse fromEntity(Conta conta) {
        return ContaResponse.builder()
                .id(conta.getId())
                .nome(conta.getNome())
                .instituicao(conta.getInstituicao())
                .tipo(conta.getTipo())
                .moeda(conta.getMoeda())
                .saldo(conta.getSaldo())
                .limiteCredito(conta.getLimiteCredito())
                .limiteChequeEspecial(conta.getLimiteChequeEspecial())
                .status(conta.getStatus())
                .criadoEm(conta.getCriadoEm())
                .build();
    }
}
