package br.com.FinanceAi.Backend.controller;

import br.com.FinanceAi.Backend.security.SecurityFilter;
import br.com.FinanceAi.Backend.security.UsuarioAutenticado;
import br.com.FinanceAi.Backend.dto.request.LoginRequest;
import br.com.FinanceAi.Backend.dto.request.usuario.UsuarioCadastraRequest;
import br.com.FinanceAi.Backend.dto.response.usuario.UsuarioCadastraResponse;
import br.com.FinanceAi.Backend.exception.EmailJaCadastradoException;
import br.com.FinanceAi.Backend.service.TokenService;
import br.com.FinanceAi.Backend.service.UsuarioService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UsuarioService usuarioService;

    @MockitoBean
    private TokenService tokenService;

    @MockitoBean
    private SecurityFilter securityFilter;

    @MockitoBean
    private AuthenticationManager authenticationManager;

    @Test
    @DisplayName("Deve retornar 201 e o location correto ao cadastrar com sucesso")
    void deveRetornar201eOLocationCorreto() throws Exception {

        UsuarioCadastraRequest request = new UsuarioCadastraRequest(
                "test",
                "test@email.com",
                "12345678"
        );
        UsuarioCadastraResponse response = new UsuarioCadastraResponse(
                1L,
                "test",
                "test@email.com"
        );

        when(usuarioService.cadastrar(request)).thenReturn(response);

        mockMvc.perform(post("/auth/register")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(header().string("Location", containsString("http://localhost/usuarios/1")))
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.nome").value("test"))
            .andExpect(jsonPath("$.email").value("test@email.com"));

    }

    @Test
    @DisplayName("Deve retornar 409 quando o email já estiver cadastrado")
    void deveRetornar409QuandoEmailJaCadastrado() throws Exception {
        UsuarioCadastraRequest request =
                new UsuarioCadastraRequest("test", "duplicado@email.com", "12345678");

        when(usuarioService.cadastrar(any(UsuarioCadastraRequest.class)))
                .thenThrow(new EmailJaCadastradoException("duplicado@email.com"));

        mockMvc.perform(post("/auth/register")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("Deve retornar 400 quando o request for inválido")
    void deveRetornar400QuandoRequestInvalido() throws Exception {
        UsuarioCadastraRequest requestInvalido =
                new UsuarioCadastraRequest("", "email-invalido", "123");

        mockMvc.perform(post("/auth/register")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(requestInvalido)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Deve retornar 200 com token quando login for bem-sucedido")
    void deveLogarComSucesso() throws Exception {
        LoginRequest request = new LoginRequest("test@email.com", "senha123");

        UsuarioAutenticado usuarioAutenticado = UsuarioAutenticado.builder()
                .nome("test")
                .email("test@email.com")
                .senha("hash")
                .build();

        Authentication authentication =
                new UsernamePasswordAuthenticationToken(usuarioAutenticado, null, usuarioAutenticado.getAuthorities());

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(tokenService.generateToken(usuarioAutenticado)).thenReturn("token-fake-jwt");

        mockMvc.perform(post("/auth/login")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("token-fake-jwt"))
                .andExpect(jsonPath("$.tipo").value("Bearer"))
                .andExpect(jsonPath("$.expiraEm").value(7200));
    }

    @Test
    @DisplayName("Deve retornar 401 quando as credenciais forem inválidas")
    void deveRetornar401QuandoCredenciaisInvalidas() throws Exception {
        LoginRequest request = new LoginRequest("test@email.com", "senhaErrada");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Credenciais inválidas"));

        mockMvc.perform(post("/auth/login")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Deve retornar 400 quando o request de login for inválido")
    void deveRetornar400QuandoLoginRequestInvalido() throws Exception {
        LoginRequest requestInvalido = new LoginRequest("", "");

        mockMvc.perform(post("/auth/login")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(requestInvalido)))
                .andExpect(status().isBadRequest());

        verify(authenticationManager, never()).authenticate(any());
    }
}
