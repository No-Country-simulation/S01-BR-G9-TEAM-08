package br.com.FinanceAi.Backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class QrCodeResponseDTO {

    private String conteudo;
    private String formato;

}