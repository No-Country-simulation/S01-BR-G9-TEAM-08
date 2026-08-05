package br.com.FinanceAi.Backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TextoIARequest {

    @NotBlank(message = "O texto não pode estar em branco")
    private String texto;
}