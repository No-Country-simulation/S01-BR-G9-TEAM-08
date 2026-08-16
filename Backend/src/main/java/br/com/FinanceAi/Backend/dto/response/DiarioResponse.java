package br.com.FinanceAi.Backend.dto.response;

import br.com.FinanceAi.Backend.entity.DiarioFinanceiro;
import br.com.FinanceAi.Backend.entity.enums.TipoDiarioEnum;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record DiarioResponse(

        Long id,
        String titulo,
        TipoDiarioEnum tipo,
        LocalDate data,
        String conteudo,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm

) {

    public static DiarioResponse fromEntity(DiarioFinanceiro diario) {

        return new DiarioResponse(
                diario.getId(),
                diario.getTitulo(),
                diario.getTipo(),
                diario.getData(),
                diario.getConteudo(),
                diario.getCriadoEm(),
                diario.getAtualizadoEm()
        );
    }
}