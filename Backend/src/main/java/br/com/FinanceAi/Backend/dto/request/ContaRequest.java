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
public class ContaRequest {

    @NotBlank(message = "O nome da conta é obrigatório")
    @Size(min = 2, max = 100, message = "O nome da conta deve ter entre 2 e 100 caracteres")
    private String nome;

    @NotBlank(message = "A instituição é obrigatória")
    @Size(min = 2, max = 100, message = "A instituição deve ter entre 2 e 100 caracteres")
    private String instituicao;

    @NotBlank(message = "O tipo de conta é obrigatório")
    private String tipo;

    @Builder.Default
    private String moeda = "BRL";

    @NotNull(message = "O saldo é obrigatório")
    private BigDecimal saldo;

    @Builder.Default
    private BigDecimal limiteCredito = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal limiteChequeEspecial = BigDecimal.ZERO;
}
