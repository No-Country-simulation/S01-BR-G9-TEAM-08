package br.com.FinanceAi.Backend.controller;

import br.com.FinanceAi.Backend.security.SecurityConfig;
import br.com.FinanceAi.Backend.security.SecurityEntryPoint;
import br.com.FinanceAi.Backend.security.UsuarioAutenticado;
import br.com.FinanceAi.Backend.dto.request.usuario.UsuarioAlteraSenhaRequest;
import br.com.FinanceAi.Backend.dto.request.usuario.UsuarioAtualizaRequest;
import br.com.FinanceAi.Backend.dto.request.usuario.UsuarioExcluiRequest;
import br.com.FinanceAi.Backend.dto.response.usuario.UsuarioAtualizaResponse;
import br.com.FinanceAi.Backend.dto.response.usuario.UsuarioResponse;
import br.com.FinanceAi.Backend.mapper.UsuarioMapper;
import br.com.FinanceAi.Backend.repository.UsuarioRepository;
import br.com.FinanceAi.Backend.service.TokenService;
import br.com.FinanceAi.Backend.service.UsuarioService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;

@WebMvcTest(controllers = UsuarioController.class)
@Import({SecurityConfig.class, SecurityEntryPoint.class})
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

    private UsuarioAutenticado usuarioAutenticadoMock() {
        return UsuarioAutenticado.builder()
                .id(1L)
                .nome("test")
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

    @Test
    @DisplayName("Deve retornar perfil do usuário autenticado")
    void deveRetornarPerfilAutenticado() throws Exception {

        var auth = new UsernamePasswordAuthenticationToken(
                usuarioAutenticadoMock(),
                null,
                usuarioAutenticadoMock().getAuthorities()
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
    void deveRetornar401QuandoNaoAutenticadoMethodGET() throws Exception {

        mockMvc.perform(get("/usuarios/me"))
                .andExpect(status().isUnauthorized());
    }


    @Test
    @DisplayName("Deve retornar 200 e o perfil atualizado quando os dados forem válidos")
    void deveAtualizarPerfilComDadosValidos() throws Exception {
        UsuarioAutenticado usuarioAutenticado = usuarioAutenticadoMock();
        var auth = new UsernamePasswordAuthenticationToken(
                usuarioAutenticado, null, usuarioAutenticado.getAuthorities()
        );

        UsuarioAtualizaRequest request = new UsuarioAtualizaRequest("Novo Nome", "novo@email.com");
        UsuarioAtualizaResponse responseEsperado = new UsuarioAtualizaResponse(1L, "Novo Nome", "novo@email.com");

        when(usuarioService.atualizaPerfil(eq(1L), any(UsuarioAtualizaRequest.class)))
                .thenReturn(responseEsperado);

        mockMvc.perform(put("/usuarios/me")
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.nome").value("Novo Nome"))
                .andExpect(jsonPath("$.email").value("novo@email.com"));
    }

    @Test
    @DisplayName("Deve retornar 401 quando não houver autenticação")
    void deveRetornar401QuandoNaoAutenticadoMethodPUT() throws Exception {
        UsuarioAtualizaRequest request = new UsuarioAtualizaRequest("Novo Nome", "novo@email.com");

        mockMvc.perform(put("/usuarios/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Deve retornar 400 quando o nome tiver menos de 6 caracteres")
    void deveRetornar400QuandoNomeInvalido() throws Exception {
        UsuarioAutenticado usuarioAutenticado = usuarioAutenticadoMock();
        var auth = new UsernamePasswordAuthenticationToken(
                usuarioAutenticado, null, usuarioAutenticado.getAuthorities()
        );

        UsuarioAtualizaRequest request = new UsuarioAtualizaRequest("abc", "valido@email.com");

        mockMvc.perform(put("/usuarios/me")
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Deve retornar 400 quando o email for inválido")
    void deveRetornar400QuandoEmailInvalido() throws Exception {
        UsuarioAutenticado usuarioAutenticado = usuarioAutenticadoMock();
        var auth = new UsernamePasswordAuthenticationToken(
                usuarioAutenticado, null, usuarioAutenticado.getAuthorities()
        );

        UsuarioAtualizaRequest request = new UsuarioAtualizaRequest("Nome Valido", "nao-e-um-email");

        mockMvc.perform(put("/usuarios/me")
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Deve retornar 204 quando a senha for alterada com sucesso")
    void deveAlterarSenhaComDadosValidos() throws Exception {
        UsuarioAlteraSenhaRequest request = new UsuarioAlteraSenhaRequest("senhaAtual123", "senhaNova123");

        doNothing().when(usuarioService).alteraSenha(eq(1L), any(UsuarioAlteraSenhaRequest.class));

        mockMvc.perform(patch("/usuarios/me/senha")
                        .with(authentication(authMock()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Deve retornar 401 quando não houver autenticação")
    void deveRetornar401QuandoNaoAutenticado() throws Exception {
        UsuarioAlteraSenhaRequest request = new UsuarioAlteraSenhaRequest("senhaAtual123", "senhaNova123");

        mockMvc.perform(patch("/usuarios/me/senha")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Deve retornar 400 quando a senha atual estiver em branco")
    void deveRetornar400QuandoSenhaAtualEmBranco() throws Exception {
        UsuarioAlteraSenhaRequest request = new UsuarioAlteraSenhaRequest("", "senhaNova123");

        mockMvc.perform(patch("/usuarios/me/senha")
                        .with(authentication(authMock()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Deve retornar 400 quando a nova senha estiver em branco")
    void deveRetornar400QuandoNovaSenhaEmBranco() throws Exception {
        UsuarioAlteraSenhaRequest request = new UsuarioAlteraSenhaRequest("senhaAtual123", "");

        mockMvc.perform(patch("/usuarios/me/senha")
                        .with(authentication(authMock()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Deve retornar 400 quando a nova senha tiver menos de 6 caracteres")
    void deveRetornar400QuandoNovaSenhaMuitoCurta() throws Exception {
        UsuarioAlteraSenhaRequest request = new UsuarioAlteraSenhaRequest("senhaAtual123", "123");

        mockMvc.perform(patch("/usuarios/me/senha")
                        .with(authentication(authMock()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Deve retornar 204 quando o perfil for removido com sucesso")
    void deveRemoverPerfilComSenhaValida() throws Exception {
        UsuarioExcluiRequest request = new UsuarioExcluiRequest("senhaAtual123");

        doNothing().when(usuarioService).excluiUsuario(eq(1L), any(UsuarioExcluiRequest.class));

        mockMvc.perform(delete("/usuarios/me")
                        .with(authentication(authMock()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Deve retornar 400 quando a senha estiver em branco")
    void deveRetornar400QuandoSenhaEmBranco() throws Exception {
        UsuarioExcluiRequest request = new UsuarioExcluiRequest("");

        mockMvc.perform(delete("/usuarios/me")
                        .with(authentication(authMock()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Deve retornar 400 quando a senha tiver menos de 6 caracteres")
    void deveRetornar400QuandoSenhaMuitoCurta() throws Exception {
        UsuarioExcluiRequest request = new UsuarioExcluiRequest("123");

        mockMvc.perform(delete("/usuarios/me")
                        .with(authentication(authMock()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

}
