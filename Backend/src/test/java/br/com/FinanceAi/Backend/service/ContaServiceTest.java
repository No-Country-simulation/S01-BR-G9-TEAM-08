package br.com.FinanceAi.Backend.service;

import br.com.FinanceAi.Backend.dto.request.AjusteSaldoRequest;
import br.com.FinanceAi.Backend.dto.request.ContaRequest;
import br.com.FinanceAi.Backend.dto.response.ContaResponse;
import br.com.FinanceAi.Backend.entity.Conta;
import br.com.FinanceAi.Backend.exception.ContaNaoEncontradaException;
import br.com.FinanceAi.Backend.repository.ContaRepository;
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
public class ContaServiceTest {

    @Mock
    private ContaRepository contaRepository;

    @InjectMocks
    private ContaService contaService;

    private Long usuarioId;
    private Conta conta;
    private ContaRequest contaRequest;

    @BeforeEach
    void setUp() {
        usuarioId = 1L;

        conta = Conta.builder()
                .id(10L)
                .nome("Conta Corrente Nubank")
                .instituicao("Nubank")
                .tipo("CORRENTE")
                .moeda("BRL")
                .saldo(new BigDecimal("1500.50"))
                .limiteCredito(new BigDecimal("5000.00"))
                .limiteChequeEspecial(new BigDecimal("500.00"))
                .status("Ativa")
                .usuarioId(usuarioId)
                .criadoEm(LocalDateTime.now())
                .build();

        contaRequest = ContaRequest.builder()
                .nome("  Conta Corrente Nubank  ")
                .instituicao("  Nubank  ")
                .tipo("CORRENTE")
                .moeda("BRL")
                .saldo(new BigDecimal("1500.50"))
                .limiteCredito(new BigDecimal("5000.00"))
                .limiteChequeEspecial(new BigDecimal("500.00"))
                .build();
    }

    @Test
    @DisplayName("Deve listar contas do usuário ordenadas por nome")
    void deveListarContasDoUsuario() {
        Conta conta2 = Conta.builder()
                .id(11L)
                .nome("Poupança Itaú")
                .instituicao("Itaú")
                .tipo("POUPANCA")
                .moeda("BRL")
                .saldo(new BigDecimal("3000.00"))
                .limiteCredito(BigDecimal.ZERO)
                .limiteChequeEspecial(BigDecimal.ZERO)
                .status("Ativa")
                .usuarioId(usuarioId)
                .criadoEm(LocalDateTime.now())
                .build();

        when(contaRepository.findByUsuarioIdOrderByNomeAsc(usuarioId))
                .thenReturn(List.of(conta, conta2));

        List<ContaResponse> resultado = contaService.listarContas(usuarioId);

        assertThat(resultado).isNotNull().hasSize(2);
        assertThat(resultado.get(0).getId()).isEqualTo(10L);
        assertThat(resultado.get(0).getNome()).isEqualTo("Conta Corrente Nubank");
        assertThat(resultado.get(1).getId()).isEqualTo(11L);
        assertThat(resultado.get(1).getNome()).isEqualTo("Poupança Itaú");
        verify(contaRepository).findByUsuarioIdOrderByNomeAsc(usuarioId);
    }

    @Test
    @DisplayName("Deve retornar lista vazia quando usuário não possuir contas")
    void deveRetornarListaVaziaQuandoUsuarioNaoPossuirContas() {
        when(contaRepository.findByUsuarioIdOrderByNomeAsc(usuarioId))
                .thenReturn(Collections.emptyList());

        List<ContaResponse> resultado = contaService.listarContas(usuarioId);

        assertThat(resultado).isNotNull().isEmpty();
        verify(contaRepository).findByUsuarioIdOrderByNomeAsc(usuarioId);
    }

    @Test
    @DisplayName("Deve buscar conta por ID com sucesso")
    void deveBuscarContaPorIdComSucesso() {
        when(contaRepository.findByIdAndUsuarioId(10L, usuarioId))
                .thenReturn(Optional.of(conta));

        ContaResponse resultado = contaService.buscarPorId(usuarioId, 10L);

        assertThat(resultado).isNotNull();
        assertThat(resultado.getId()).isEqualTo(10L);
        assertThat(resultado.getNome()).isEqualTo("Conta Corrente Nubank");
        assertThat(resultado.getInstituicao()).isEqualTo("Nubank");
        assertThat(resultado.getTipo()).isEqualTo("CORRENTE");
        assertThat(resultado.getSaldo()).isEqualByComparingTo("1500.50");
        verify(contaRepository).findByIdAndUsuarioId(10L, usuarioId);
    }

    @Test
    @DisplayName("Deve lançar ContaNaoEncontradaException ao buscar por ID inexistente")
    void deveLancarExcecaoAoBuscarPorIdInexistente() {
        when(contaRepository.findByIdAndUsuarioId(999L, usuarioId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> contaService.buscarPorId(usuarioId, 999L))
                .isInstanceOf(ContaNaoEncontradaException.class);

        verify(contaRepository).findByIdAndUsuarioId(999L, usuarioId);
    }

    @Test
    @DisplayName("Deve criar conta com sucesso aplicando trim e valores informados")
    void deveCriarContaComSucesso() {
        when(contaRepository.save(any(Conta.class))).thenAnswer(invocation -> {
            Conta c = invocation.getArgument(0);
            c.setId(10L);
            c.setCriadoEm(LocalDateTime.now());
            return c;
        });

        ContaResponse resultado = contaService.criarConta(usuarioId, contaRequest);

        assertThat(resultado).isNotNull();
        assertThat(resultado.getId()).isEqualTo(10L);
        assertThat(resultado.getNome()).isEqualTo("Conta Corrente Nubank");
        assertThat(resultado.getInstituicao()).isEqualTo("Nubank");
        assertThat(resultado.getStatus()).isEqualTo("Ativa");

        ArgumentCaptor<Conta> captor = ArgumentCaptor.forClass(Conta.class);
        verify(contaRepository).save(captor.capture());
        Conta contaSalva = captor.getValue();
        assertThat(contaSalva.getNome()).isEqualTo("Conta Corrente Nubank");
        assertThat(contaSalva.getInstituicao()).isEqualTo("Nubank");
        assertThat(contaSalva.getTipo()).isEqualTo("CORRENTE");
        assertThat(contaSalva.getMoeda()).isEqualTo("BRL");
        assertThat(contaSalva.getSaldo()).isEqualByComparingTo("1500.50");
        assertThat(contaSalva.getLimiteCredito()).isEqualByComparingTo("5000.00");
        assertThat(contaSalva.getLimiteChequeEspecial()).isEqualByComparingTo("500.00");
        assertThat(contaSalva.getStatus()).isEqualTo("Ativa");
        assertThat(contaSalva.getUsuarioId()).isEqualTo(usuarioId);
    }

    @Test
    @DisplayName("Deve criar conta com valores default quando campos opcionais forem nulos")
    void deveCriarContaComValoresDefaultQuandoOpcionaisForemNulos() {
        ContaRequest requestComNulos = ContaRequest.builder()
                .nome("  Banco do Brasil  ")
                .instituicao("  BB  ")
                .tipo("SALARIO")
                .moeda(null)
                .saldo(null)
                .limiteCredito(null)
                .limiteChequeEspecial(null)
                .build();

        when(contaRepository.save(any(Conta.class))).thenAnswer(invocation -> {
            Conta c = invocation.getArgument(0);
            c.setId(12L);
            return c;
        });

        ContaResponse resultado = contaService.criarConta(usuarioId, requestComNulos);

        assertThat(resultado).isNotNull();
        ArgumentCaptor<Conta> captor = ArgumentCaptor.forClass(Conta.class);
        verify(contaRepository).save(captor.capture());
        Conta contaSalva = captor.getValue();
        assertThat(contaSalva.getMoeda()).isEqualTo("BRL");
        assertThat(contaSalva.getSaldo()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(contaSalva.getLimiteCredito()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(contaSalva.getLimiteChequeEspecial()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Deve atualizar conta com sucesso quando informados todos os dados")
    void deveAtualizarContaComSucesso() {
        ContaRequest requestAtualizacao = ContaRequest.builder()
                .nome("  Novo Nome Conta  ")
                .instituicao("  Novo Banco  ")
                .tipo("INVESTIMENTO")
                .moeda("USD")
                .saldo(new BigDecimal("2000.00"))
                .limiteCredito(new BigDecimal("10000.00"))
                .limiteChequeEspecial(new BigDecimal("1000.00"))
                .build();

        when(contaRepository.findByIdAndUsuarioId(10L, usuarioId))
                .thenReturn(Optional.of(conta));

        ContaResponse resultado = contaService.atualizarConta(usuarioId, 10L, requestAtualizacao);

        assertThat(resultado).isNotNull();
        assertThat(conta.getNome()).isEqualTo("Novo Nome Conta");
        assertThat(conta.getInstituicao()).isEqualTo("Novo Banco");
        assertThat(conta.getTipo()).isEqualTo("INVESTIMENTO");
        assertThat(conta.getMoeda()).isEqualTo("USD");
        assertThat(conta.getSaldo()).isEqualByComparingTo("2000.00");
        assertThat(conta.getLimiteCredito()).isEqualByComparingTo("10000.00");
        assertThat(conta.getLimiteChequeEspecial()).isEqualByComparingTo("1000.00");
    }

    @Test
    @DisplayName("Deve atualizar conta preservando valores quando campos opcionais forem nulos")
    void deveAtualizarContaPreservandoValoresQuandoOpcionaisForemNulos() {
        ContaRequest requestComNulos = ContaRequest.builder()
                .nome("  Nome Atualizado  ")
                .instituicao("  Instituição Atualizada  ")
                .tipo("CORRENTE")
                .moeda(null)
                .saldo(null)
                .limiteCredito(null)
                .limiteChequeEspecial(null)
                .build();

        when(contaRepository.findByIdAndUsuarioId(10L, usuarioId))
                .thenReturn(Optional.of(conta));

        contaService.atualizarConta(usuarioId, 10L, requestComNulos);

        assertThat(conta.getNome()).isEqualTo("Nome Atualizado");
        assertThat(conta.getInstituicao()).isEqualTo("Instituição Atualizada");
        assertThat(conta.getMoeda()).isEqualTo("BRL");
        assertThat(conta.getSaldo()).isEqualByComparingTo("1500.50");
        assertThat(conta.getLimiteCredito()).isEqualByComparingTo("5000.00");
        assertThat(conta.getLimiteChequeEspecial()).isEqualByComparingTo("500.00");
    }

    @Test
    @DisplayName("Deve lançar ContaNaoEncontradaException ao atualizar conta inexistente")
    void deveLancarExcecaoAoAtualizarContaInexistente() {
        when(contaRepository.findByIdAndUsuarioId(999L, usuarioId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> contaService.atualizarConta(usuarioId, 999L, contaRequest))
                .isInstanceOf(ContaNaoEncontradaException.class);
    }

    @Test
    @DisplayName("Deve ajustar saldo com sucesso")
    void deveAjustarSaldoComSucesso() {
        AjusteSaldoRequest ajusteRequest = new AjusteSaldoRequest(new BigDecimal("3500.75"), "Ajuste de rendimento");

        when(contaRepository.findByIdAndUsuarioId(10L, usuarioId))
                .thenReturn(Optional.of(conta));

        ContaResponse resultado = contaService.ajustarSaldo(usuarioId, 10L, ajusteRequest);

        assertThat(resultado).isNotNull();
        assertThat(conta.getSaldo()).isEqualByComparingTo("3500.75");
        assertThat(resultado.getSaldo()).isEqualByComparingTo("3500.75");
    }

    @Test
    @DisplayName("Deve lançar ContaNaoEncontradaException ao ajustar saldo de conta inexistente")
    void deveLancarExcecaoAoAjustarSaldoDeContaInexistente() {
        AjusteSaldoRequest ajusteRequest = new AjusteSaldoRequest(new BigDecimal("100.00"), "Ajuste");

        when(contaRepository.findByIdAndUsuarioId(999L, usuarioId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> contaService.ajustarSaldo(usuarioId, 999L, ajusteRequest))
                .isInstanceOf(ContaNaoEncontradaException.class);
    }

    @Test
    @DisplayName("Deve alternar status de Ativa para Inativa")
    void deveAlternarStatusDeAtivaParaInativa() {
        conta.setStatus("Ativa");

        when(contaRepository.findByIdAndUsuarioId(10L, usuarioId))
                .thenReturn(Optional.of(conta));

        ContaResponse resultado = contaService.alternarStatus(usuarioId, 10L);

        assertThat(resultado).isNotNull();
        assertThat(conta.getStatus()).isEqualTo("Inativa");
        assertThat(resultado.getStatus()).isEqualTo("Inativa");
    }

    @Test
    @DisplayName("Deve alternar status de Inativa para Ativa")
    void deveAlternarStatusDeInativaParaAtiva() {
        conta.setStatus("Inativa");

        when(contaRepository.findByIdAndUsuarioId(10L, usuarioId))
                .thenReturn(Optional.of(conta));

        ContaResponse resultado = contaService.alternarStatus(usuarioId, 10L);

        assertThat(resultado).isNotNull();
        assertThat(conta.getStatus()).isEqualTo("Ativa");
        assertThat(resultado.getStatus()).isEqualTo("Ativa");
    }

    @Test
    @DisplayName("Deve lançar ContaNaoEncontradaException ao alternar status de conta inexistente")
    void deveLancarExcecaoAoAlternarStatusDeContaInexistente() {
        when(contaRepository.findByIdAndUsuarioId(999L, usuarioId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> contaService.alternarStatus(usuarioId, 999L))
                .isInstanceOf(ContaNaoEncontradaException.class);
    }

    @Test
    @DisplayName("Deve excluir conta com sucesso")
    void deveExcluirContaComSucesso() {
        when(contaRepository.findByIdAndUsuarioId(10L, usuarioId))
                .thenReturn(Optional.of(conta));

        contaService.excluirConta(usuarioId, 10L);

        verify(contaRepository).delete(conta);
    }

    @Test
    @DisplayName("Deve lançar ContaNaoEncontradaException ao excluir conta inexistente")
    void deveLancarExcecaoAoExcluirContaInexistente() {
        when(contaRepository.findByIdAndUsuarioId(999L, usuarioId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> contaService.excluirConta(usuarioId, 999L))
                .isInstanceOf(ContaNaoEncontradaException.class);

        verify(contaRepository, never()).delete(any());
    }
}
