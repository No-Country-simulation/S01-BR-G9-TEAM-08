package br.com.FinanceAi.Backend.service;

import br.com.FinanceAi.Backend.dto.request.usuario.UsuarioAlteraSenhaRequest;
import br.com.FinanceAi.Backend.dto.request.usuario.UsuarioAtualizaRequest;
import br.com.FinanceAi.Backend.dto.request.usuario.UsuarioCadastraRequest;
import br.com.FinanceAi.Backend.dto.request.usuario.UsuarioExcluiRequest;
import br.com.FinanceAi.Backend.dto.response.usuario.UsuarioAtualizaResponse;
import br.com.FinanceAi.Backend.dto.response.usuario.UsuarioCadastraResponse;
import br.com.FinanceAi.Backend.dto.response.usuario.UsuarioResponse;
import br.com.FinanceAi.Backend.entity.Usuario;
import br.com.FinanceAi.Backend.entity.enums.SituacaoConta;
import br.com.FinanceAi.Backend.exception.EmailJaCadastradoException;
import br.com.FinanceAi.Backend.exception.NovaSenhaIgualAtualException;
import br.com.FinanceAi.Backend.exception.SenhaAtualIncorretaException;
import br.com.FinanceAi.Backend.exception.UsuarioNaoEncontradoException;
import br.com.FinanceAi.Backend.mapper.UsuarioMapper;
import br.com.FinanceAi.Backend.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.OffsetDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private UsuarioMapper usuarioMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UsuarioService usuarioService;

    private UsuarioCadastraRequest request;
    private Usuario usuario;

    @BeforeEach
    void setUp() {

        request = new UsuarioCadastraRequest("test", "test@email.com", "12345678");
        usuario = Usuario.builder()
                .nome("test")
                .email("test@email.com")
                .senha("12345678")
                .build();

    }

    @Test
    @DisplayName("Deve retornar EmailJaCadastradoException caso o email já exista")
    void deveRetornarEmailJaCadastradoExceptionQuandoEmailJaCadastrado() {

        when(usuarioRepository.findByEmail(request.email()))
                .thenReturn(Optional.of(usuario));

        assertThatThrownBy(() -> usuarioService.cadastrar(request))
            .isInstanceOf(EmailJaCadastradoException.class);

        verify(usuarioRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve cadastrar o usuário com sucesso quando o email não existir")
    void deveCadastrarUsuarioComSucessoQuandoEmailNaoExistir() {

        String senhaCodificada = "senha-codificada-hash";
        Usuario usuarioSalvo = Usuario.builder()
                .nome("test")
                .email("test@email.com")
                .senha(senhaCodificada)
                .build();
        UsuarioCadastraResponse responseEsperado =
                new UsuarioCadastraResponse(1L,"test", "test@email.com");

        when(usuarioRepository.findByEmail(request.email()))
                .thenReturn(Optional.empty());
        when(usuarioMapper.toUsuario(request))
                .thenReturn(usuario);
        when(passwordEncoder.encode("12345678"))
                .thenReturn(senhaCodificada);
        when(usuarioRepository.save(usuario))
                .thenReturn(usuarioSalvo);
        when(usuarioMapper.toCadastraResponse(usuarioSalvo))
                .thenReturn(responseEsperado);

        UsuarioCadastraResponse resultado = usuarioService.cadastrar(request);

        assertThat(resultado).isEqualTo(responseEsperado);

        verify(usuarioRepository).save(argThat(u ->
                u.getNome().equals("test") &&
                u.getEmail().equals("test@email.com") &&
                u.getSenha().equals(senhaCodificada)
        ));
    }

    @Test
    @DisplayName("Deve codificar a senha antes de salvar, nunca salvar a senha crua")
    void deveCodificarSenhaAntesDeSalvar() {
        when(usuarioRepository.findByEmail(request.email()))
                .thenReturn(Optional.empty());
        when(usuarioMapper.toUsuario(request))
                .thenReturn(usuario);
        when(passwordEncoder.encode("12345678"))
                .thenReturn("hash-fake");
        when(usuarioRepository.save(any(Usuario.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        usuarioService.cadastrar(request);

        verify(usuarioRepository).save(argThat(u ->
                u.getSenha().equals("hash-fake")
        ));
    }

    @Test
    @DisplayName("Deve retornar perfil quando o usuário existir")
    void  deveRetornarPerfilQuandoUsuarioExistir() {

        Long id = 1l;
        UsuarioResponse responseEsperado = new UsuarioResponse(
                id,
                "test",
                "test@email.com",
                OffsetDateTime.now()
        );

        when(usuarioRepository.findById(id)).thenReturn(Optional.of(usuario));
        when(usuarioMapper.toUsuarioResponse(usuario)).thenReturn(responseEsperado);

        UsuarioResponse resultado = usuarioService.buscarPerfil(id);

        assertThat(resultado).isEqualTo(responseEsperado);
        verify(usuarioRepository).findById(id);
    }

    @Test
    @DisplayName("Deve lançar UsuarioNaoEncontradoException quando o usuário não existir")
    void deveLancarExcecaoQuandoUsuarioNaoExistir() {
        Long id = 999L;

        when(usuarioRepository.findById(id))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> usuarioService.buscarPerfil(id))
                .isInstanceOf(UsuarioNaoEncontradoException.class);

        verify(usuarioMapper, never()).toUsuarioResponse(any());
    }

    @Test
    @DisplayName("Deve atualizar nome e email quando ambos forem informados e válidos")
    void deveAtualizarNomeEmailQuandoAmbosForemInformados() {

        Long id = 1l;
        UsuarioAtualizaRequest request = new UsuarioAtualizaRequest("novoNome", "novoEmail@email.com");
        UsuarioAtualizaResponse responseEsperado =  new UsuarioAtualizaResponse(id,"novoNome", "novoEmail@email.com");

        when(usuarioRepository.findById(id)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.existsByEmail(request.email())).thenReturn(false);
        when(usuarioMapper.toUsuarioAtualizaRequest(usuario)).thenReturn(responseEsperado);

        UsuarioAtualizaResponse resultado = usuarioService.atualizaPerfil(id, request);

        assertThat(resultado).isEqualTo(responseEsperado);
        assertThat(usuario.getNome()).isEqualTo("novoNome");
        assertThat(usuario.getEmail()).isEqualTo("novoEmail@email.com");

    }

    @Test
    @DisplayName("Deve manter o nome original quando o nome não for informado (null)")
    void deveManterONomeOriginalQuandoONomeNaoForInformado() {

        Long id = 1l;

        UsuarioAtualizaRequest request = new UsuarioAtualizaRequest(null, "novoEmail@email.com");

        when(usuarioRepository.findById(id)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.existsByEmail(request.email())).thenReturn(false);

        UsuarioAtualizaResponse resultado = usuarioService.atualizaPerfil(id, request);

        assertThat(usuario.getNome()).isEqualTo("test");

    }

    @Test
    @DisplayName("Deve manter o nome original quando nome for string em branco")
    void deveManterONomeOriginalQuandoNomeForStringEmBranco() {

        Long id = 1l;

        UsuarioAtualizaRequest request = new UsuarioAtualizaRequest("    ", "novoEmail@email.com");

        when(usuarioRepository.findById(id)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.existsByEmail(request.email())).thenReturn(false);

        UsuarioAtualizaResponse resultado = usuarioService.atualizaPerfil(id, request);

        assertThat(usuario.getNome()).isEqualTo("test");

    }

    @Test
    @DisplayName("Deve manter o email original quando email não for informado (null)")
    void deveManterONemailOriginalQuandoEmailNaoForInformado() {

            Long id = 1L;
            UsuarioAtualizaRequest request = new UsuarioAtualizaRequest("novo nome", null);

            when(usuarioRepository.findById(id)).thenReturn(Optional.of(usuario));
            when(usuarioMapper.toUsuarioAtualizaRequest(usuario)).thenReturn(mock(UsuarioAtualizaResponse.class));

            usuarioService.atualizaPerfil(id, request);

            assertThat(usuario.getEmail()).isEqualTo("test@email.com");
            verify(usuarioRepository, never()).existsByEmail(any());

    }

    @Test
    @DisplayName("Não deve consultar repository quando o novo email for igual ao atual (case-insensitive)")
    void naoDeveConsultarRepositoryQuandoEmailIgualIgnorandoCase() {
        Long id = 1L;
        UsuarioAtualizaRequest request = new UsuarioAtualizaRequest(null, "test@email.com");

        when(usuarioRepository.findById(id)).thenReturn(Optional.of(usuario));
        when(usuarioMapper.toUsuarioAtualizaRequest(usuario)).thenReturn(mock(UsuarioAtualizaResponse.class));

        usuarioService.atualizaPerfil(id, request);

        assertThat(usuario.getEmail()).isEqualTo("test@email.com");
        verify(usuarioRepository, never()).existsByEmail(any());
    }

    @Test
    @DisplayName("Deve alterar a senha quando a senha atual estiver correta e nova senha for diferente")
    void deveAlterarASenhaAtualEstiverCorretaENovaSenhaForDiferente() {

        Long id = 1l;
        UsuarioAlteraSenhaRequest request =
                new UsuarioAlteraSenhaRequest("senhaAtual123", "novaSenha456");

        when(usuarioRepository.findById(id)).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("senhaAtual123", "12345678")).thenReturn(true);
        when(passwordEncoder.matches("novaSenha456", "12345678")).thenReturn(false);
        when(passwordEncoder.encode("novaSenha456")).thenReturn("hash-nova-senha");

        usuarioService.alteraSenha(id, request);

        assertThat(usuario.getSenha()).isEqualTo("hash-nova-senha");
        verify(usuarioRepository).save(usuario);
    }

    @Test
    @DisplayName("Deve lançar SenhaAtualIncorretaException quando a senha atual estiver incorreta")
    void deveLancarSenhaAtualIncorretaExceptionQuandoASenhaAtualEstiverIncorreta() {

        Long id = 1l;
        UsuarioAlteraSenhaRequest request = new UsuarioAlteraSenhaRequest("senhaErrada", "novaSenha456");

        when(usuarioRepository.findById(id)).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("senhaErrada", "12345678")).thenReturn(false);

        assertThatThrownBy(() -> usuarioService.alteraSenha(id, request))
            .isInstanceOf(SenhaAtualIncorretaException.class);

        assertThat(usuario.getSenha()).isEqualTo("12345678");
        verify(usuarioRepository, never()).save(any());
        verify(passwordEncoder, never()).encode(any());

    }

    @Test
    @DisplayName("Deve lançar NovaSenhaIgualAtualException quando a nova senha for igual a atual")
    void deveLancarNovaSenhaIgualExceptionQuandoANovaSenhaAtualEstiverIgual() {

        Long id = 1l;
        UsuarioAlteraSenhaRequest request = new UsuarioAlteraSenhaRequest("12345678", "novaSenha456");

        when(usuarioRepository.findById(id)).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches(request.senhaAtual(), "12345678")).thenReturn(true);
        when(passwordEncoder.matches(request.novaSenha(), "12345678")).thenReturn(true);

        assertThatThrownBy(() -> usuarioService.alteraSenha(id, request))
                .isInstanceOf(NovaSenhaIgualAtualException.class);

        assertThat(usuario.getSenha()).isEqualTo("12345678");
        verify(usuarioRepository, never()).save(any());
        verify(passwordEncoder, never()).encode(any());

    }

    @Test
    @DisplayName("Deve inativar a conta quando a senha estiver correta")
    void deveInativarContaQuandoSenhaCorreta() {
        Long id = 1L;
        UsuarioExcluiRequest request = new UsuarioExcluiRequest("senhaCorreta123");

        when(usuarioRepository.findById(id)).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("senhaCorreta123", "12345678")).thenReturn(true);

        usuarioService.excluiUsuario(id, request);

        assertThat(usuario.getSituacaoConta()).isEqualTo(SituacaoConta.INATIVO);
        verify(usuarioRepository).save(usuario);
    }

    @Test
    @DisplayName("Deve lançar SenhaAtualIncorretaException quando a senha estiver incorreta")
    void deveLancarExcecaoQuandoSenhaIncorreta() {
        Long id = 1L;
        UsuarioExcluiRequest request = new UsuarioExcluiRequest("senhaErrada");

        when(usuarioRepository.findById(id)).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("senhaErrada", "12345678")).thenReturn(false);

        assertThatThrownBy(() -> usuarioService.excluiUsuario(id, request))
                .isInstanceOf(SenhaAtualIncorretaException.class);

        assertThat(usuario.getSituacaoConta()).isEqualTo(SituacaoConta.ATIVO);
        verify(usuarioRepository, never()).save(any());
    }

}
