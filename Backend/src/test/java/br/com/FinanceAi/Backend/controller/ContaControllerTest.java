package br.com.FinanceAi.Backend.controller;

import br.com.FinanceAi.Backend.dto.request.AjusteSaldoRequest;
import br.com.FinanceAi.Backend.dto.request.ContaRequest;
import br.com.FinanceAi.Backend.dto.response.ContaResponse;
import br.com.FinanceAi.Backend.exception.ContaNaoEncontradaException;
import br.com.FinanceAi.Backend.repository.UsuarioRepository;
import br.com.FinanceAi.Backend.security.SecurityConfig;
import br.com.FinanceAi.Backend.security.SecurityEntryPoint;
import br.com.FinanceAi.Backend.security.UsuarioAutenticado;
import br.com.FinanceAi.Backend.service.ContaService;
import br.com.FinanceAi.Backend.service.TokenService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = ContaController.class)
@Import({SecurityConfig.class, SecurityEntryPoint.class})
public class ContaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ContaService contaService;

    @MockitoBean
    private TokenService tokenService;

    @MockitoBean
    private UsuarioRepository usuarioRepository;

    private UsuarioAutenticado usuarioAutenticadoMock() {
        return UsuarioAutenticado.builder()
                .id(1L)
                .nome("Test User")
                .email("test@email.com")
                .senha("hash")
                .build();
    }

    private UsernamePasswordAuthenticationToken authMock() {
        UsuarioAutenticado usuarioAutenticado = usuarioAutenticadoMock();
        return new UsernamePasswordAuthenticationToken(
                usuarioAutenticado, null, usuarioAutenticado.getAuthorities()
        );
    }

    private ContaResponse contaResponseMock() {
        return ContaResponse.builder()
                .id(10L)
                .nome("Nubank Principal")
                .instituicao("Nubank")
                .tipo("CORRENTE")
                .moeda("BRL")
                .saldo(new BigDecimal("1500.50"))
                .limiteCredito(new BigDecimal("5000.00"))
                .limiteChequeEspecial(new BigDecimal("500.00"))
                .status("Ativa")
                .criadoEm(LocalDateTime.of(2026, 8, 16, 10, 0))
                .build();
    }

    private ContaRequest contaRequestValido() {
        return ContaRequest.builder()
                .nome("Nubank Principal")
                .instituicao("Nubank")
                .tipo("CORRENTE")
                .moeda("BRL")
                .saldo(new BigDecimal("1500.50"))
                .limiteCredito(new BigDecimal("5000.00"))
                .limiteChequeEspecial(new BigDecimal("500.00"))
                .build();
    }

    @Test
    @DisplayName("Deve listar contas do usuário autenticado com status 200")
    void deveListarContasDoUsuarioAutenticado() throws Exception {
        when(contaService.listarContas(1L)).thenReturn(List.of(contaResponseMock()));

        mockMvc.perform(get("/api/contas")
                        .with(authentication(authMock())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(10))
                .andExpect(jsonPath("$[0].nome").value("Nubank Principal"))
                .andExpect(jsonPath("$[0].instituicao").value("Nubank"))
                .andExpect(jsonPath("$[0].tipo").value("CORRENTE"))
                .andExpect(jsonPath("$[0].saldo").value(1500.50))
                .andExpect(jsonPath("$[0].status").value("Ativa"));
    }

    @Test
    @DisplayName("Deve retornar 401 ao tentar listar contas sem autenticação")
    void deveRetornar401AoListarContasSemAutenticacao() throws Exception {
        mockMvc.perform(get("/api/contas"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Deve buscar conta por ID com status 200 quando existir")
    void deveBuscarContaPorIdComSucesso() throws Exception {
        when(contaService.buscarPorId(1L, 10L)).thenReturn(contaResponseMock());

        mockMvc.perform(get("/api/contas/10")
                        .with(authentication(authMock())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.nome").value("Nubank Principal"))
                .andExpect(jsonPath("$.instituicao").value("Nubank"))
                .andExpect(jsonPath("$.saldo").value(1500.50));
    }

    @Test
    @DisplayName("Deve retornar 404 ao buscar conta inexistente")
    void deveRetornar404AoBuscarContaInexistente() throws Exception {
        when(contaService.buscarPorId(1L, 999L)).thenThrow(new ContaNaoEncontradaException(999L));

        mockMvc.perform(get("/api/contas/999")
                        .with(authentication(authMock())))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("Conta inexistente"));
    }

    @Test
    @DisplayName("Deve criar conta com dados válidos e retornar status 201")
    void deveCriarContaComSucesso() throws Exception {
        ContaRequest request = contaRequestValido();
        ContaResponse response = contaResponseMock();

        when(contaService.criarConta(eq(1L), any(ContaRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/contas")
                        .with(authentication(authMock()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.nome").value("Nubank Principal"))
                .andExpect(jsonPath("$.instituicao").value("Nubank"))
                .andExpect(jsonPath("$.tipo").value("CORRENTE"))
                .andExpect(jsonPath("$.saldo").value(1500.50));
    }

    @Test
    @DisplayName("Deve retornar 400 ao criar conta com nome em branco")
    void deveRetornar400AoCriarContaComNomeEmBranco() throws Exception {
        ContaRequest request = contaRequestValido();
        request.setNome("");

        mockMvc.perform(post("/api/contas")
                        .with(authentication(authMock()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.nome").exists());
    }

    @Test
    @DisplayName("Deve retornar 400 ao criar conta com instituição em branco")
    void deveRetornar400AoCriarContaComInstituicaoEmBranco() throws Exception {
        ContaRequest request = contaRequestValido();
        request.setInstituicao("   ");

        mockMvc.perform(post("/api/contas")
                        .with(authentication(authMock()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.instituicao").exists());
    }

    @Test
    @DisplayName("Deve retornar 400 ao criar conta com tipo em branco")
    void deveRetornar400AoCriarContaComTipoEmBranco() throws Exception {
        ContaRequest request = contaRequestValido();
        request.setTipo(null);

        mockMvc.perform(post("/api/contas")
                        .with(authentication(authMock()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.tipo").exists());
    }

    @Test
    @DisplayName("Deve retornar 400 ao criar conta com saldo nulo")
    void deveRetornar400AoCriarContaComSaldoNulo() throws Exception {
        ContaRequest request = contaRequestValido();
        request.setSaldo(null);

        mockMvc.perform(post("/api/contas")
                        .with(authentication(authMock()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.saldo").exists());
    }

    @Test
    @DisplayName("Deve retornar 401 ao criar conta sem autenticação")
    void deveRetornar401AoCriarContaSemAutenticacao() throws Exception {
        ContaRequest request = contaRequestValido();

        mockMvc.perform(post("/api/contas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Deve atualizar conta com dados válidos e retornar status 200")
    void deveAtualizarContaComSucesso() throws Exception {
        ContaRequest request = contaRequestValido();
        ContaResponse response = contaResponseMock();
        response.setNome("Nubank Atualizada");

        when(contaService.atualizarConta(eq(1L), eq(10L), any(ContaRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/contas/10")
                        .with(authentication(authMock()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.nome").value("Nubank Atualizada"));
    }

    @Test
    @DisplayName("Deve retornar 404 ao atualizar conta inexistente")
    void deveRetornar404AoAtualizarContaInexistente() throws Exception {
        ContaRequest request = contaRequestValido();

        when(contaService.atualizarConta(eq(1L), eq(999L), any(ContaRequest.class)))
                .thenThrow(new ContaNaoEncontradaException(999L));

        mockMvc.perform(put("/api/contas/999")
                        .with(authentication(authMock()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("Conta inexistente"));
    }

    @Test
    @DisplayName("Deve ajustar saldo com sucesso e retornar status 200")
    void deveAjustarSaldoComSucesso() throws Exception {
        AjusteSaldoRequest request = new AjusteSaldoRequest(new BigDecimal("2500.00"), "Depósito");
        ContaResponse response = contaResponseMock();
        response.setSaldo(new BigDecimal("2500.00"));

        when(contaService.ajustarSaldo(eq(1L), eq(10L), any(AjusteSaldoRequest.class))).thenReturn(response);

        mockMvc.perform(patch("/api/contas/10/saldo")
                        .with(authentication(authMock()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.saldo").value(2500.00));
    }

    @Test
    @DisplayName("Deve retornar 400 ao ajustar saldo com novoSaldo nulo")
    void deveRetornar400AoAjustarSaldoComValorNulo() throws Exception {
        AjusteSaldoRequest request = new AjusteSaldoRequest(null, "Motivo");

        mockMvc.perform(patch("/api/contas/10/saldo")
                        .with(authentication(authMock()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.novoSaldo").exists());
    }

    @Test
    @DisplayName("Deve alternar status da conta com sucesso e retornar 200")
    void deveAlternarStatusComSucesso() throws Exception {
        ContaResponse response = contaResponseMock();
        response.setStatus("Inativa");

        when(contaService.alternarStatus(1L, 10L)).thenReturn(response);

        mockMvc.perform(patch("/api/contas/10/status")
                        .with(authentication(authMock())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.status").value("Inativa"));
    }

    @Test
    @DisplayName("Deve retornar 404 ao alternar status de conta inexistente")
    void deveRetornar404AoAlternarStatusDeContaInexistente() throws Exception {
        when(contaService.alternarStatus(1L, 999L)).thenThrow(new ContaNaoEncontradaException(999L));

        mockMvc.perform(patch("/api/contas/999/status")
                        .with(authentication(authMock())))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("Conta inexistente"));
    }

    @Test
    @DisplayName("Deve excluir conta com sucesso e retornar status 204")
    void deveExcluirContaComSucesso() throws Exception {
        doNothing().when(contaService).excluirConta(1L, 10L);

        mockMvc.perform(delete("/api/contas/10")
                        .with(authentication(authMock())))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Deve retornar 404 ao excluir conta inexistente")
    void deveRetornar404AoExcluirContaInexistente() throws Exception {
        doThrow(new ContaNaoEncontradaException(999L)).when(contaService).excluirConta(1L, 999L);

        mockMvc.perform(delete("/api/contas/999")
                        .with(authentication(authMock())))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("Conta inexistente"));
    }
}
