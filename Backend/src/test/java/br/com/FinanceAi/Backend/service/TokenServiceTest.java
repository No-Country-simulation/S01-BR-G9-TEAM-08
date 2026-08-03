package br.com.FinanceAi.Backend.service;

import br.com.FinanceAi.Backend.entity.Usuario;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

public class TokenServiceTest {

    private TokenService tokenService;

    @BeforeEach
    void setUp() {
        tokenService = new TokenService();
        ReflectionTestUtils.setField(tokenService, "secret", "test-secret-key");
        ReflectionTestUtils.setField(tokenService, "expirationHours", 2L);
    }

    private Usuario criarUsuarioTeste() {
        return Usuario.builder()
                .nome("test")
                .email("test@email.com")
                .senha("12345678")
                .build();
    }

    @Test
    @DisplayName("Deve gerar um token válido e não nulo")
    void deveGerarTokenValido() {

        Usuario usuario = criarUsuarioTeste();
        String token = tokenService.generateToken(usuario);

        assertThat(token).isNotBlank();
        assertThat(token.split("\\.")).hasSize(3);
    }

    @Test
    @DisplayName("Token gerado deve validar de volta com o subject correto")
    void tokenGeradoDeveSerValidoNoRoundTrip() {

        Usuario usuario = criarUsuarioTeste();
        String token = tokenService.generateToken(usuario);
        String subject = tokenService.validateToken(token);

        assertThat(subject).isEqualTo(usuario.getUsername());
    }

    @Test
    @DisplayName("Deve retornar string vazia para token inválido")
    void deveRetornarVazioParaTokenInvalido() {
        String resultado = tokenService.validateToken("token.invalido");

        assertThat(resultado).isEmpty();
    }

    @Test
    @DisplayName("Deve retornar string vazia para token expirado")
    void deveRetornarVazioParaTokenExpirado() {

        ReflectionTestUtils.setField(tokenService, "expirationHours", 0L);
        Usuario usuario = criarUsuarioTeste();
        String token = tokenService.generateToken(usuario);

        try {
            Thread.sleep(50);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        String resultado = tokenService.validateToken(token);

        assertThat(resultado).isEmpty();
    }
}
