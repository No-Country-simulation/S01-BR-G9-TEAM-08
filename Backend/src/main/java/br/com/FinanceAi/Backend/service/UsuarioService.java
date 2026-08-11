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
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final PasswordEncoder passwordEncoder;
    private final UsuarioMapper usuarioMapper;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public UsuarioCadastraResponse cadastrar(UsuarioCadastraRequest request) {

        if (usuarioRepository.findByEmail(request.email()).isPresent()) {
            throw new EmailJaCadastradoException(request.email());
        }
        Usuario usuario = usuarioMapper.toUsuario(request);
        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));

        Usuario usuarioSalvo = usuarioRepository.save(usuario);

        return usuarioMapper.toCadastraResponse(usuarioSalvo);

    }

    public UsuarioResponse buscarPerfil(Long id) {
        Usuario usuario = buscaUsuarioOuFalha(id);

        return usuarioMapper.toUsuarioResponse(usuario);
    }

    @Transactional
    public UsuarioAtualizaResponse atualizaPerfil(Long id,  UsuarioAtualizaRequest request) {
        Usuario usuario = buscaUsuarioOuFalha(id);

        atualizaNomeSeInformado(usuario, request.nome());
        atualizaEmailSeInformado(usuario, request.email());

        return usuarioMapper.toUsuarioAtualizaRequest(usuario);

    }

    @Transactional
    public void alteraSenha(Long id, @Valid UsuarioAlteraSenhaRequest request) {
        Usuario usuario = buscaUsuarioOuFalha(id);

        boolean senhaAtualCorreta =
                passwordEncoder.matches(request.senhaAtual(), usuario.getSenha());

        if (!senhaAtualCorreta) {
            throw new SenhaAtualIncorretaException();
        }

        boolean novaSenhaIgualAtual =
                passwordEncoder.matches(request.novaSenha(), usuario.getSenha());

        if (novaSenhaIgualAtual) {
            throw new NovaSenhaIgualAtualException();
        }

        usuario.setSenha(passwordEncoder.encode(request.novaSenha()));
        usuarioRepository.save(usuario);
    }

    @Transactional
    public void excluiUsuario(Long id, @Valid UsuarioExcluiRequest request) {
        Usuario usuario = buscaUsuarioOuFalha(id);
        validaSenhaAtual(usuario, request.senha());

        usuario.setSituacaoConta(SituacaoConta.INATIVO);
        usuarioRepository.save(usuario);
    }

    private void validaSenhaAtual(Usuario usuario, String senha) {
        if (!passwordEncoder.matches(senha, usuario.getSenha())) {
            throw new SenhaAtualIncorretaException();
        }
    }

    private Usuario buscaUsuarioOuFalha(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new UsuarioNaoEncontradoException(id));
    }

    private void atualizaNomeSeInformado(Usuario usuario, String novoNome) {
        if (novoNome != null && !novoNome.isBlank()) {
            usuario.setNome(novoNome);
        }
    }

    private void atualizaEmailSeInformado(Usuario usuario, String novoEmail) {

        if (novoEmail == null || novoEmail.isBlank()) {
            return;
        }

        if (usuario.getEmail().equalsIgnoreCase(novoEmail)) {
            return;
        }

        if (usuarioRepository.existsByEmail(novoEmail)) {
            throw new EmailJaCadastradoException(novoEmail);
        }
        usuario.setEmail(novoEmail.trim());
    }
}
