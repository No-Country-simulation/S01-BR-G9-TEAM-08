package br.com.FinanceAi.Backend.controller;

import br.com.FinanceAi.Backend.dto.request.DividaRequest;
import br.com.FinanceAi.Backend.dto.response.DividaResponse;
import br.com.FinanceAi.Backend.exception.DividaNaoEncontradaException;
import br.com.FinanceAi.Backend.repository.UsuarioRepository;
import br.com.FinanceAi.Backend.security.SecurityConfig;
import br.com.FinanceAi.Backend.security.SecurityEntryPoint;
import br.com.FinanceAi.Backend.security.UsuarioAutenticado;
import br.com.FinanceAi.Backend.service.DividaService;
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

@WebMvcTest(controllers = DividaController.class)
@Import({SecurityConfig.class, SecurityEntryPoint.class})
public class DividaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private DividaService dividaService;

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

    private DividaResponse dividaResponseMock() {
        return DividaResponse.builder()
                .id(20L)
                .descricao("Empréstimo Caixa")
                .valorOriginal(new BigDecimal("10000.00"))
                .saldoDevedor(new BigDecimal("7500.00"))
                .valorParcela(new BigDecimal("500.00"))
                .parcelasRestantes(15)
                .taxaJuros(new BigDecimal("2.50"))
                .dataVencimento("2026-12-10")
                .status("Em dia")
                .criadoEm(LocalDateTime.of(2026, 8, 16, 10, 0))
                .build();
    }

    private DividaRequest dividaRequestValido() {
        return DividaRequest.builder()
                .descricao("Empréstimo Caixa")
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
    @DisplayName("Deve listar dívidas do usuário autenticado com status 200")
    void deveListarDividasDoUsuarioAutenticado() throws Exception {
        when(dividaService.listarDividas(1L)).thenReturn(List.of(dividaResponseMock()));

        mockMvc.perform(get("/api/dividas")
                        .with(authentication(authMock())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(20))
                .andExpect(jsonPath("$[0].descricao").value("Empréstimo Caixa"))
                .andExpect(jsonPath("$[0].valorOriginal").value(10000.00))
                .andExpect(jsonPath("$[0].saldoDevedor").value(7500.00))
                .andExpect(jsonPath("$[0].valorParcela").value(500.00))
                .andExpect(jsonPath("$[0].parcelasRestantes").value(15))
                .andExpect(jsonPath("$[0].taxaJuros").value(2.50))
                .andExpect(jsonPath("$[0].status").value("Em dia"));
    }

    @Test
    @DisplayName("Deve retornar 401 ao tentar listar dívidas sem autenticação")
    void deveRetornar401AoListarDividasSemAutenticacao() throws Exception {
        mockMvc.perform(get("/api/dividas"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Deve buscar dívida por ID com status 200 quando existir")
    void deveBuscarDividaPorIdComSucesso() throws Exception {
        when(dividaService.buscarPorId(1L, 20L)).thenReturn(dividaResponseMock());

        mockMvc.perform(get("/api/dividas/20")
                        .with(authentication(authMock())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(20))
                .andExpect(jsonPath("$.descricao").value("Empréstimo Caixa"))
                .andExpect(jsonPath("$.valorOriginal").value(10000.00))
                .andExpect(jsonPath("$.saldoDevedor").value(7500.00));
    }

    @Test
    @DisplayName("Deve retornar 404 ao buscar dívida inexistente")
    void deveRetornar404AoBuscarDividaInexistente() throws Exception {
        when(dividaService.buscarPorId(1L, 999L)).thenThrow(new DividaNaoEncontradaException(999L));

        mockMvc.perform(get("/api/dividas/999")
                        .with(authentication(authMock())))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("Dívida inexistente"));
    }

    @Test
    @DisplayName("Deve criar dívida com dados válidos e retornar status 201")
    void deveCriarDividaComSucesso() throws Exception {
        DividaRequest request = dividaRequestValido();
        DividaResponse response = dividaResponseMock();

        when(dividaService.criarDivida(eq(1L), any(DividaRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/dividas")
                        .with(authentication(authMock()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(20))
                .andExpect(jsonPath("$.descricao").value("Empréstimo Caixa"))
                .andExpect(jsonPath("$.valorOriginal").value(10000.00))
                .andExpect(jsonPath("$.saldoDevedor").value(7500.00))
                .andExpect(jsonPath("$.valorParcela").value(500.00))
                .andExpect(jsonPath("$.parcelasRestantes").value(15));
    }

    @Test
    @DisplayName("Deve retornar 400 ao criar dívida com descrição em branco")
    void deveRetornar400AoCriarDividaComDescricaoEmBranco() throws Exception {
        DividaRequest request = dividaRequestValido();
        request.setDescricao("");

        mockMvc.perform(post("/api/dividas")
                        .with(authentication(authMock()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.descricao").exists());
    }

    @Test
    @DisplayName("Deve retornar 400 ao criar dívida com valorOriginal nulo")
    void deveRetornar400AoCriarDividaComValorOriginalNulo() throws Exception {
        DividaRequest request = dividaRequestValido();
        request.setValorOriginal(null);

        mockMvc.perform(post("/api/dividas")
                        .with(authentication(authMock()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.valorOriginal").exists());
    }

    @Test
    @DisplayName("Deve retornar 400 ao criar dívida com saldoDevedor nulo")
    void deveRetornar400AoCriarDividaComSaldoDevedorNulo() throws Exception {
        DividaRequest request = dividaRequestValido();
        request.setSaldoDevedor(null);

        mockMvc.perform(post("/api/dividas")
                        .with(authentication(authMock()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.saldoDevedor").exists());
    }

    @Test
    @DisplayName("Deve retornar 400 ao criar dívida com valorParcela nulo")
    void deveRetornar400AoCriarDividaComValorParcelaNulo() throws Exception {
        DividaRequest request = dividaRequestValido();
        request.setValorParcela(null);

        mockMvc.perform(post("/api/dividas")
                        .with(authentication(authMock()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.valorParcela").exists());
    }

    @Test
    @DisplayName("Deve retornar 400 ao criar dívida com parcelasRestantes nulo")
    void deveRetornar400AoCriarDividaComParcelasRestantesNulo() throws Exception {
        DividaRequest request = dividaRequestValido();
        request.setParcelasRestantes(null);

        mockMvc.perform(post("/api/dividas")
                        .with(authentication(authMock()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.parcelasRestantes").exists());
    }

    @Test
    @DisplayName("Deve retornar 401 ao criar dívida sem autenticação")
    void deveRetornar401AoCriarDividaSemAutenticacao() throws Exception {
        DividaRequest request = dividaRequestValido();

        mockMvc.perform(post("/api/dividas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Deve atualizar dívida com dados válidos e retornar status 200")
    void deveAtualizarDividaComSucesso() throws Exception {
        DividaRequest request = dividaRequestValido();
        DividaResponse response = dividaResponseMock();
        response.setDescricao("Empréstimo Renegociado");

        when(dividaService.atualizarDivida(eq(1L), eq(20L), any(DividaRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/dividas/20")
                        .with(authentication(authMock()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(20))
                .andExpect(jsonPath("$.descricao").value("Empréstimo Renegociado"));
    }

    @Test
    @DisplayName("Deve retornar 404 ao atualizar dívida inexistente")
    void deveRetornar404AoAtualizarDividaInexistente() throws Exception {
        DividaRequest request = dividaRequestValido();

        when(dividaService.atualizarDivida(eq(1L), eq(999L), any(DividaRequest.class)))
                .thenThrow(new DividaNaoEncontradaException(999L));

        mockMvc.perform(put("/api/dividas/999")
                        .with(authentication(authMock()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("Dívida inexistente"));
    }

    @Test
    @DisplayName("Deve excluir dívida com sucesso e retornar status 204")
    void deveExcluirDividaComSucesso() throws Exception {
        doNothing().when(dividaService).excluirDivida(1L, 20L);

        mockMvc.perform(delete("/api/dividas/20")
                        .with(authentication(authMock())))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Deve retornar 404 ao excluir dívida inexistente")
    void deveRetornar404AoExcluirDividaInexistente() throws Exception {
        doThrow(new DividaNaoEncontradaException(999L)).when(dividaService).excluirDivida(1L, 999L);

        mockMvc.perform(delete("/api/dividas/999")
                        .with(authentication(authMock())))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("Dívida inexistente"));
    }
}
