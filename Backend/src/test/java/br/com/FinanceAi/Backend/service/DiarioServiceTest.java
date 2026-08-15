package br.com.FinanceAi.Backend.service;

import br.com.FinanceAi.Backend.dto.request.DiarioRequest;
import br.com.FinanceAi.Backend.entity.DiarioFinanceiro;
import br.com.FinanceAi.Backend.entity.enums.TipoDiarioEnum;
import br.com.FinanceAi.Backend.exception.ResourceNotFoundException;
import br.com.FinanceAi.Backend.repository.DiarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DiarioServiceTest {

    @Mock
    private DiarioRepository diarioRepository;

    @InjectMocks
    private DiarioService diarioService;

    @Test
    void deveCadastrarEntradaDoDiario() {

        Long usuarioId = 1L;

        DiarioRequest request = new DiarioRequest(
                "Planejamento do mês",
                TipoDiarioEnum.PLANEJAMENTO,
                LocalDate.of(2026, 8, 15),
                "Organizar os gastos do próximo mês."
        );

        when(diarioRepository.save(any(DiarioFinanceiro.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        DiarioFinanceiro resultado =
                diarioService.cadastrar(request, usuarioId);

        assertEquals("Planejamento do mês", resultado.getTitulo());
        assertEquals(TipoDiarioEnum.PLANEJAMENTO, resultado.getTipo());
        assertEquals(
                LocalDate.of(2026, 8, 15),
                resultado.getData()
        );
        assertEquals(
                "Organizar os gastos do próximo mês.",
                resultado.getConteudo()
        );

        assertEquals(usuarioId, resultado.getUsuarioId());
        assertTrue(resultado.isAtivo());

        verify(diarioRepository)
                .save(any(DiarioFinanceiro.class));
    }

    @Test
    void deveRealizarExclusaoLogica() {

        Long usuarioId = 1L;
        Long diarioId = 10L;

        DiarioFinanceiro diario = DiarioFinanceiro.builder()
                .id(diarioId)
                .titulo("Anotação")
                .tipo(TipoDiarioEnum.ANOTACAO)
                .data(LocalDate.of(2026, 8, 15))
                .conteudo("Teste")
                .usuarioId(usuarioId)
                .ativo(true)
                .build();

        when(diarioRepository
                .findByIdAndUsuarioIdAndAtivoTrue(
                        diarioId,
                        usuarioId
                ))
                .thenReturn(Optional.of(diario));

        diarioService.excluir(diarioId, usuarioId);

        assertFalse(diario.isAtivo());

        verify(diarioRepository).save(diario);
    }

    @Test
    void deveFalharAoBuscarEntradaDeOutroUsuarioOuInexistente() {

        Long diarioId = 10L;
        Long usuarioId = 2L;

        when(diarioRepository
                .findByIdAndUsuarioIdAndAtivoTrue(
                        diarioId,
                        usuarioId
                ))
                .thenReturn(Optional.empty());

        ResourceNotFoundException exception =
                assertThrows(
                        ResourceNotFoundException.class,
                        () -> diarioService.buscarPorId(
                                diarioId,
                                usuarioId
                        )
                );

        assertEquals(
                "Entrada do diário não encontrada.",
                exception.getMessage()
        );
    }
}