package br.com.FinanceAi.Backend.service;

import br.com.FinanceAi.Backend.entity.Usuario;
import br.com.FinanceAi.Backend.entity.enums.SituacaoConta;
import br.com.FinanceAi.Backend.repository.UsuarioRepository;
import br.com.FinanceAi.Backend.security.UsuarioAutenticado;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private AuthService authService;

    @Test
    @DisplayName("Deve retornar UserDetails quando o email existir")
    void deveRetornarUserDetailsQuandoEmailExistir() {

        String email = "test@email.com";

        Usuario usuario = Usuario.builder()
                .id(1L)
                .nome("test")
                .email(email)
                .senha("12345678")
                .situacaoConta(SituacaoConta.ATIVO)
                .build();

        when(usuarioRepository.findByEmail(email))
                .thenReturn(Optional.of(usuario));

        UserDetails resultado =
                authService.loadUserByUsername(email);

        assertThat(resultado)
                .isInstanceOf(UsuarioAutenticado.class);

        UsuarioAutenticado usuarioAutenticado =
                (UsuarioAutenticado) resultado;

        assertThat(usuarioAutenticado.getId())
                .isEqualTo(usuario.getId());

        assertThat(usuarioAutenticado.getNome())
                .isEqualTo(usuario.getNome());

        assertThat(usuarioAutenticado.getUsername())
                .isEqualTo(usuario.getEmail());

        assertThat(usuarioAutenticado.getPassword())
                .isEqualTo(usuario.getSenha());

        assertThat(usuarioAutenticado.getSituacaoConta())
                .isEqualTo(SituacaoConta.ATIVO);

        verify(usuarioRepository)
                .findByEmail(email);
    }

    @Test
    @DisplayName("Deve lançar UsernameNotFoundException quando o email não existir")
    void deveLancarExcecaoQuandoEmailNaoExistir() {

        String email = "naoexiste@email.com";

        when(usuarioRepository.findByEmail(email))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> authService.loadUserByUsername(email)
        )
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessageContaining(email);

        verify(usuarioRepository)
                .findByEmail(email);
    }
}