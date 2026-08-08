package br.com.FinanceAi.Backend.controller;

import br.com.FinanceAi.Backend.config.SecurityConfig;
import br.com.FinanceAi.Backend.config.SecurityEntryPoint;
import br.com.FinanceAi.Backend.config.UsuarioAutenticado;
import br.com.FinanceAi.Backend.dto.response.usuario.UsuarioResponse;
import br.com.FinanceAi.Backend.mapper.UsuarioMapper;
import br.com.FinanceAi.Backend.repository.UsuarioRepository;
import br.com.FinanceAi.Backend.service.TokenService;
import br.com.FinanceAi.Backend.service.UsuarioService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

@WebMvcTest(controllers = UsuarioController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(SecurityConfig.class)
public class UsuarioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UsuarioService usuarioService;

    @MockitoBean
    private UsuarioMapper usuarioMapper;

    @MockitoBean
    private TokenService tokenService;

    @MockitoBean
    private UsuarioRepository usuarioRepository;

    @MockitoBean
    private SecurityEntryPoint securityEntryPoint;

    @Test
    @DisplayName("Deve retornar perfil do usuário autenticado")
    void deveRetornarPerfilAutenticado() throws Exception {
        UsuarioAutenticado usuarioAutenticado = UsuarioAutenticado.builder()
                .id(1L)
                .nome("test")
                .email("test@email.com")
                .senha("hash")
                .build();

        var auth = new UsernamePasswordAuthenticationToken(
                usuarioAutenticado,
                null,
                usuarioAutenticado.getAuthorities()
        );

        SecurityContextHolder.getContext().setAuthentication(auth);

        UsuarioResponse responseEsperado = new UsuarioResponse(
                1L, "test", "test@email.com", OffsetDateTime.now()
        );

        when(usuarioService.buscarPerfil(1L)).thenReturn(responseEsperado);

        mockMvc.perform(get("/usuarios/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.nome").value("test"))
                .andExpect(jsonPath("$.email").value("test@email.com"));

        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Deve retornar status 401 Unauthorized quando o usuário não estiver autenticado")
    void deveRetornar401QuandoNaoAutenticado() throws Exception {

        mockMvc.perform(get("/usuarios/me"))
                .andExpect(status().isUnauthorized());
    }

//    @Test
//    @WithMockUsuario(id = 99L) // Simula um ID que não existe no banco
//    @DisplayName("Deve retornar 404 Not Found quando o usuário não for encontrado no serviço")
//    void deveRetornar404QuandoUsuarioNaoExiste() throws Exception {
//
//        when(usuarioService.buscarPerfil(99L))
//                .thenThrow(new EntityNotFoundException("Usuário não encontrado"));
//
//        mockMvc.perform(get("/usuarios/me"))
//                .andExpect(status().isNotFound());
//    }
}
