package br.com.FinanceAi.Backend.service;

import br.com.FinanceAi.Backend.dto.request.LancamentoComprasRequest;
import br.com.FinanceAi.Backend.entity.Categoria;
import br.com.FinanceAi.Backend.entity.Despesa;
import br.com.FinanceAi.Backend.entity.ItemCompra;
import br.com.FinanceAi.Backend.repository.CategoriaRepository;
import br.com.FinanceAi.Backend.repository.DespesaRepository;
import br.com.FinanceAi.Backend.repository.ItemCompraRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ItemCompraServiceTest {

    @Mock
    private ItemCompraRepository itemCompraRepository;

    @Mock
    private DespesaRepository despesaRepository;

    @Mock
    private CategoriaRepository categoriaRepository;

    @InjectMocks
    private ItemCompraService itemCompraService;

    @Test
    void deveLancarItensPagosComoUmaUnicaDespesa() {

        Long usuarioId = 1L;

        ItemCompra item = ItemCompra.builder()
                .id(1L)
                .nome("Azeite Extra Virgem")
                .quantidade(2)
                .precoEstimado(new BigDecimal("35.00"))
                .precoPago(new BigDecimal("32.50"))
                .comprado(true)
                .naoComprarNovamente(false)
                .usuarioId(usuarioId)
                .ativo(true)
                .build();

        Categoria categoria = Categoria.builder()
                .id(1L)
                .nome("Alimentação")
                .tipo(Categoria.TipoCategoria.DESPESA)
                .build();

        LancamentoComprasRequest request =
                new LancamentoComprasRequest(
                        "Alimentação",
                        LocalDate.of(2026, 8, 15)
                );

        when(itemCompraRepository
                .findByUsuarioIdAndAtivoTrueAndCompradoTrueAndNaoComprarNovamenteFalse(usuarioId))
                .thenReturn(List.of(item));

        when(categoriaRepository
                .findByTipo(Categoria.TipoCategoria.DESPESA))
                .thenReturn(List.of(categoria));

        when(despesaRepository.save(any(Despesa.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Despesa resultado =
                itemCompraService.lancarItensPagos(
                        request,
                        usuarioId
                );

        assertEquals(
                0,
                resultado.getValor()
                        .compareTo(new BigDecimal("65.00"))
        );

        assertEquals(
                "Compras de Mercado (Lista de Compras)",
                resultado.getDescricao()
        );

        assertEquals(
                "Alimentação",
                resultado.getCategoria().getNome()
        );

        assertFalse(item.isAtivo());

        verify(despesaRepository).save(any(Despesa.class));
        verify(itemCompraRepository).saveAll(List.of(item));
    }

    @Test
    void deveFalharQuandoNaoExistiremItensComprados() {

        Long usuarioId = 1L;

        when(itemCompraRepository
                .findByUsuarioIdAndAtivoTrueAndCompradoTrueAndNaoComprarNovamenteFalse(usuarioId))
                .thenReturn(List.of());

        LancamentoComprasRequest request =
                new LancamentoComprasRequest(
                        "Alimentação",
                        LocalDate.of(2026, 8, 15)
                );

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> itemCompraService
                                .lancarItensPagos(
                                        request,
                                        usuarioId
                                )
                );

        assertEquals(
                "Nenhum item comprado disponível para lançamento.",
                exception.getMessage()
        );

        verifyNoInteractions(
                despesaRepository,
                categoriaRepository
        );
    }
}