package br.com.FinanceAi.Backend.mapper;

import br.com.FinanceAi.Backend.dto.request.usuario.UsuarioCadastraRequest;
import br.com.FinanceAi.Backend.dto.response.usuario.UsuarioAtualizaResponse;
import br.com.FinanceAi.Backend.dto.response.usuario.UsuarioCadastraResponse;
import br.com.FinanceAi.Backend.dto.response.usuario.UsuarioResponse;
import br.com.FinanceAi.Backend.entity.Usuario;
import org.springframework.stereotype.Component;

@Component
public class UsuarioMapper {

    public Usuario toUsuario(UsuarioCadastraRequest request) {
        return Usuario.builder()
                .nome(request.nome())
                .email(request.email())
                .senha(request.senha())
                .build();
    }

    public UsuarioCadastraResponse toCadastraResponse(Usuario usuario) {
        return new UsuarioCadastraResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail()
        );
    }

    public UsuarioResponse toUsuarioResponse(Usuario usuarioAutenticado) {
        return new UsuarioResponse(
                usuarioAutenticado.getId(),
                usuarioAutenticado.getNome(),
                usuarioAutenticado.getEmail(),
                usuarioAutenticado.getDataCadastro()
        );
    }

    public UsuarioAtualizaResponse toUsuarioAtualizaRequest(Usuario usuario) {
        return new UsuarioAtualizaResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail()
        );
    }
}
