package br.com.FinanceAi.Backend.service;

import br.com.FinanceAi.Backend.dto.request.DividaRequest;
import br.com.FinanceAi.Backend.dto.response.DividaResponse;
import br.com.FinanceAi.Backend.entity.Divida;
import br.com.FinanceAi.Backend.exception.DividaNaoEncontradaException;
import br.com.FinanceAi.Backend.repository.DividaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DividaServiceTest {

    @Mock
    private DividaRepository dividaRepository;

    @InjectMocks
    private DividaService dividaService;

    private Long usuarioId;
    private Divida divida;
    private DividaRequest dividaRequest;

    @BeforeEach
    void setUp() {
        usuarioId = 1L;

        divida = Divida.builder()
                .id(20L)
                .descricao("Empréstimo Caixa")
                .valorOriginal(new BigDecimal("10000.00"))
                .saldoDevedor(new BigDecimal("7500.00"))
                .valorParcela(new BigDecimal("500.00"))
                .parcelasRestantes(15)
                .taxaJuros(new BigDecimal("2.50"))
                .dataVencimento("2026-12-10")
                .status("Em dia")
                .usuarioId(usuarioId)
                .criadoEm(LocalDateTime.now())
                .build();

        dividaRequest = DividaRequest.builder()
                .descricao("  Empréstimo Caixa  ")
                .valorOriginal(new BigDecimal("10000.00"))
                .saldoDevedor(new BigDecimal("7500.00"))
                .valorParcela(new BigDecimal("500.00"))
                .parcelasRestantes(15)
                .taxaJuros(new BigDecimal("2.50"))
                .dataVencimento("2026-12-10")
                .status("Em dia")
                .build();
    }

    @Test
    @DisplayName("Deve listar dívidas do usuário ordenadas por criadoEm desc")
    void deveListarDividasDoUsuario() {
        Divida divida2 = Divida.builder()
                .id(21L)
                .descricao("Financiamento Carro")
                .valorOriginal(new BigDecimal("30000.00"))
                .saldoDevedor(new BigDecimal("20000.00"))
                .valorParcela(new BigDecimal("1000.00"))
                .parcelasRestantes(20)
                .taxaJuros(new BigDecimal("1.80"))
                .dataVencimento("2027-05-15")
                .status("Em dia")
                .usuarioId(usuarioId)
                .criadoEm(LocalDateTime.now())
                .build();

        when(dividaRepository.findByUsuarioIdOrderByCriadoEmDesc(usuarioId))
                .thenReturn(List.of(divida, divida2));

        List<DividaResponse> resultado = dividaService.listarDividas(usuarioId);

        assertThat(resultado).isNotNull().hasSize(2);
        assertThat(resultado.get(0).getId()).isEqualTo(20L);
        assertThat(resultado.get(0).getDescricao()).isEqualTo("Empréstimo Caixa");
        assertThat(resultado.get(1).getId()).isEqualTo(21L);
        assertThat(resultado.get(1).getDescricao()).isEqualTo("Financiamento Carro");
        verify(dividaRepository).findByUsuarioIdOrderByCriadoEmDesc(usuarioId);
    }

    @Test
    @DisplayName("Deve retornar lista vazia quando usuário não possuir dívidas")
    void deveRetornarListaVaziaQuandoUsuarioNaoPossuirDividas() {
        when(dividaRepository.findByUsuarioIdOrderByCriadoEmDesc(usuarioId))
                .thenReturn(Collections.emptyList());

        List<DividaResponse> resultado = dividaService.listarDividas(usuarioId);

        assertThat(resultado).isNotNull().isEmpty();
        verify(dividaRepository).findByUsuarioIdOrderByCriadoEmDesc(usuarioId);
    }

    @Test
    @DisplayName("Deve buscar dívida por ID com sucesso")
    void deveBuscarDividaPorIdComSucesso() {
        when(dividaRepository.findByIdAndUsuarioId(20L, usuarioId))
                .thenReturn(Optional.of(divida));

        DividaResponse resultado = dividaService.buscarPorId(usuarioId, 20L);

        assertThat(resultado).isNotNull();
        assertThat(resultado.getId()).isEqualTo(20L);
        assertThat(resultado.getDescricao()).isEqualTo("Empréstimo Caixa");
        assertThat(resultado.getValorOriginal()).isEqualByComparingTo("10000.00");
        assertThat(resultado.getSaldoDevedor()).isEqualByComparingTo("7500.00");
        assertThat(resultado.getValorParcela()).isEqualByComparingTo("500.00");
        assertThat(resultado.getParcelasRestantes()).isEqualTo(15);
        verify(dividaRepository).findByIdAndUsuarioId(20L, usuarioId);
    }

    @Test
    @DisplayName("Deve lançar DividaNaoEncontradaException ao buscar por ID inexistente")
    void deveLancarExcecaoAoBuscarPorIdInexistente() {
        when(dividaRepository.findByIdAndUsuarioId(999L, usuarioId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> dividaService.buscarPorId(usuarioId, 999L))
                .isInstanceOf(DividaNaoEncontradaException.class);

        verify(dividaRepository).findByIdAndUsuarioId(999L, usuarioId);
    }

    @Test
    @DisplayName("Deve criar dívida com sucesso aplicando trim e valores informados")
    void deveCriarDividaComSucesso() {
        when(dividaRepository.save(any(Divida.class))).thenAnswer(invocation -> {
            Divida d = invocation.getArgument(0);
            d.setId(20L);
            d.setCriadoEm(LocalDateTime.now());
            return d;
        });

        DividaResponse resultado = dividaService.criarDivida(usuarioId, dividaRequest);

        assertThat(resultado).isNotNull();
        assertThat(resultado.getId()).isEqualTo(20L);
        assertThat(resultado.getDescricao()).isEqualTo("Empréstimo Caixa");
        assertThat(resultado.getStatus()).isEqualTo("Em dia");

        ArgumentCaptor<Divida> captor = ArgumentCaptor.forClass(Divida.class);
        verify(dividaRepository).save(captor.capture());
        Divida dividaSalva = captor.getValue();
        assertThat(dividaSalva.getDescricao()).isEqualTo("Empréstimo Caixa");
        assertThat(dividaSalva.getValorOriginal()).isEqualByComparingTo("10000.00");
        assertThat(dividaSalva.getSaldoDevedor()).isEqualByComparingTo("7500.00");
        assertThat(dividaSalva.getValorParcela()).isEqualByComparingTo("500.00");
        assertThat(dividaSalva.getParcelasRestantes()).isEqualTo(15);
        assertThat(dividaSalva.getTaxaJuros()).isEqualByComparingTo("2.50");
        assertThat(dividaSalva.getDataVencimento()).isEqualTo("2026-12-10");
        assertThat(dividaSalva.getStatus()).isEqualTo("Em dia");
        assertThat(dividaSalva.getUsuarioId()).isEqualTo(usuarioId);
    }

    @Test
    @DisplayName("Deve criar dívida com valores default quando taxaJuros e status forem nulos")
    void deveCriarDividaComValoresDefaultQuandoOpcionaisForemNulos() {
        DividaRequest requestComNulos = DividaRequest.builder()
                .descricao("  Cartão de Crédito  ")
                .valorOriginal(new BigDecimal("2000.00"))
                .saldoDevedor(new BigDecimal("2000.00"))
                .valorParcela(new BigDecimal("200.00"))
                .parcelasRestantes(10)
                .taxaJuros(null)
                .dataVencimento(null)
                .status(null)
                .build();

        when(dividaRepository.save(any(Divida.class))).thenAnswer(invocation -> {
            Divida d = invocation.getArgument(0);
            d.setId(22L);
            return d;
        });

        DividaResponse resultado = dividaService.criarDivida(usuarioId, requestComNulos);

        assertThat(resultado).isNotNull();
        ArgumentCaptor<Divida> captor = ArgumentCaptor.forClass(Divida.class);
        verify(dividaRepository).save(captor.capture());
        Divida dividaSalva = captor.getValue();
        assertThat(dividaSalva.getTaxaJuros()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(dividaSalva.getStatus()).isEqualTo("Em dia");
        assertThat(dividaSalva.getDataVencimento()).isNull();
    }

    @Test
    @DisplayName("Deve atualizar dívida com sucesso quando informados todos os dados")
    void deveAtualizarDividaComSucesso() {
        DividaRequest requestAtualizacao = DividaRequest.builder()
                .descricao("  Empréstimo Renegociado  ")
                .valorOriginal(new BigDecimal("8000.00"))
                .saldoDevedor(new BigDecimal("4000.00"))
                .valorParcela(new BigDecimal("400.00"))
                .parcelasRestantes(10)
                .taxaJuros(new BigDecimal("1.50"))
                .dataVencimento("2026-11-20")
                .status("Atrasado")
                .build();

        when(dividaRepository.findByIdAndUsuarioId(20L, usuarioId))
                .thenReturn(Optional.of(divida));

        DividaResponse resultado = dividaService.atualizarDivida(usuarioId, 20L, requestAtualizacao);

        assertThat(resultado).isNotNull();
        assertThat(divida.getDescricao()).isEqualTo("Empréstimo Renegociado");
        assertThat(divida.getValorOriginal()).isEqualByComparingTo("8000.00");
        assertThat(divida.getSaldoDevedor()).isEqualByComparingTo("4000.00");
        assertThat(divida.getValorParcela()).isEqualByComparingTo("400.00");
        assertThat(divida.getParcelasRestantes()).isEqualTo(10);
        assertThat(divida.getTaxaJuros()).isEqualByComparingTo("1.50");
        assertThat(divida.getDataVencimento()).isEqualTo("2026-11-20");
        assertThat(divida.getStatus()).isEqualTo("Atrasado");
    }

    @Test
    @DisplayName("Deve atualizar dívida preservando valores quando campos opcionais forem nulos")
    void deveAtualizarDividaPreservandoValoresQuandoOpcionaisForemNulos() {
        DividaRequest requestComNulos = DividaRequest.builder()
                .descricao("  Descrição Atualizada  ")
                .valorOriginal(new BigDecimal("9000.00"))
                .saldoDevedor(new BigDecimal("6000.00"))
                .valorParcela(new BigDecimal("600.00"))
                .parcelasRestantes(10)
                .taxaJuros(null)
                .dataVencimento(null)
                .status(null)
                .build();

        when(dividaRepository.findByIdAndUsuarioId(20L, usuarioId))
                .thenReturn(Optional.of(divida));

        dividaService.atualizarDivida(usuarioId, 20L, requestComNulos);

        assertThat(divida.getDescricao()).isEqualTo("Descrição Atualizada");
        assertThat(divida.getValorOriginal()).isEqualByComparingTo("9000.00");
        assertThat(divida.getSaldoDevedor()).isEqualByComparingTo("6000.00");
        assertThat(divida.getValorParcela()).isEqualByComparingTo("600.00");
        assertThat(divida.getParcelasRestantes()).isEqualTo(10);
        assertThat(divida.getTaxaJuros()).isEqualByComparingTo("2.50");
        assertThat(divida.getDataVencimento()).isEqualTo("2026-12-10");
        assertThat(divida.getStatus()).isEqualTo("Em dia");
    }

    @Test
    @DisplayName("Deve lançar DividaNaoEncontradaException ao atualizar dívida inexistente")
    void deveLancarExcecaoAoAtualizarDividaInexistente() {
        when(dividaRepository.findByIdAndUsuarioId(999L, usuarioId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> dividaService.atualizarDivida(usuarioId, 999L, dividaRequest))
                .isInstanceOf(DividaNaoEncontradaException.class);
    }

    @Test
    @DisplayName("Deve excluir dívida com sucesso")
    void deveExcluirDividaComSucesso() {
        when(dividaRepository.findByIdAndUsuarioId(20L, usuarioId))
                .thenReturn(Optional.of(divida));

        dividaService.excluirDivida(usuarioId, 20L);

        verify(dividaRepository).delete(divida);
    }

    @Test
    @DisplayName("Deve lançar DividaNaoEncontradaException ao excluir dívida inexistente")
    void deveLancarExcecaoAoExcluirDividaInexistente() {
        when(dividaRepository.findByIdAndUsuarioId(999L, usuarioId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> dividaService.excluirDivida(usuarioId, 999L))
                .isInstanceOf(DividaNaoEncontradaException.class);

        verify(dividaRepository, never()).delete(any());
    }
}
