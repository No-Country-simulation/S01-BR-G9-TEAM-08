package br.com.FinanceAi.Backend.dto.request;

import br.com.FinanceAi.Backend.entity.enums.TipoDiarioEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record DiarioRequest(

        @NotBlank(message = "O título é obrigatório")
        @Size(max = 255, message = "O título deve ter no máximo 255 caracteres")
        String titulo,

        TipoDiarioEnum tipo,

        LocalDate data,

        @NotBlank(message = "O conteúdo é obrigatório")
        String conteudo

) {
}