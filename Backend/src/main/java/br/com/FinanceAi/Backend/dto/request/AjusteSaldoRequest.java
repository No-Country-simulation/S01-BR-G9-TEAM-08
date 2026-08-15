package br.com.FinanceAi.Backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AjusteSaldoRequest {

    @NotNull(message = "O novo saldo é obrigatório")
    private BigDecimal novoSaldo;

    private String motivo;
}
