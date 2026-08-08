package br.com.FinanceAi.Backend.controller;

import br.com.FinanceAi.Backend.config.UsuarioAutenticado;
import br.com.FinanceAi.Backend.dto.request.usuario.UsuarioAlteraSenhaRequest;
import br.com.FinanceAi.Backend.dto.request.usuario.UsuarioAtualizaRequest;
import br.com.FinanceAi.Backend.dto.request.usuario.UsuarioExcluiRequest;
import br.com.FinanceAi.Backend.dto.response.usuario.UsuarioAtualizaResponse;
import br.com.FinanceAi.Backend.dto.response.usuario.UsuarioResponse;
import br.com.FinanceAi.Backend.mapper.UsuarioMapper;
import br.com.FinanceAi.Backend.service.UsuarioService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping("/me")
    public ResponseEntity<UsuarioResponse> obterPerfil(@AuthenticationPrincipal UsuarioAutenticado usuarioAutenticado) {
        UsuarioResponse response = usuarioService.buscarPerfil(usuarioAutenticado.getId());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    public ResponseEntity<UsuarioAtualizaResponse> atualizarPerfil(
            @AuthenticationPrincipal UsuarioAutenticado usuarioAutenticado,
            @RequestBody @Valid UsuarioAtualizaRequest request
    ) {
        UsuarioAtualizaResponse response = usuarioService.atualizaPerfil(usuarioAutenticado.getId(), request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/me/senha")
    public ResponseEntity<Void> alterarSenha(
            @AuthenticationPrincipal UsuarioAutenticado usuarioAutenticado,
            @RequestBody @Valid UsuarioAlteraSenhaRequest request
    ) {
        usuarioService.alteraSenha(usuarioAutenticado.getId(), request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> removerPerfil(
            @AuthenticationPrincipal UsuarioAutenticado usuarioAutenticado,
            @RequestBody @Valid UsuarioExcluiRequest request
    ) {
        usuarioService.excluiUsuario(usuarioAutenticado.getId(), request);
        return ResponseEntity.noContent().build();
    }
}
