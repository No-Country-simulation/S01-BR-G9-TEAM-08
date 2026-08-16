package br.com.FinanceAi.Backend.controller;

import br.com.FinanceAi.Backend.dto.request.DiarioRequest;
import br.com.FinanceAi.Backend.dto.response.DiarioResponse;
import br.com.FinanceAi.Backend.entity.DiarioFinanceiro;
import br.com.FinanceAi.Backend.security.UsuarioAutenticado;
import br.com.FinanceAi.Backend.service.DiarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/diario")
@RequiredArgsConstructor
public class DiarioController {

    private final DiarioService diarioService;

    @PostMapping
    public ResponseEntity<DiarioResponse> cadastrar(
            @AuthenticationPrincipal UsuarioAutenticado usuarioAutenticado,
            @RequestBody @Valid DiarioRequest request
    ) {

        DiarioFinanceiro diario = diarioService.cadastrar(
                request,
                usuarioAutenticado.getId()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(DiarioResponse.fromEntity(diario));
    }

    @GetMapping
    public ResponseEntity<List<DiarioResponse>> listar(
            @AuthenticationPrincipal UsuarioAutenticado usuarioAutenticado
    ) {

        List<DiarioResponse> diarios = diarioService
                .listar(usuarioAutenticado.getId())
                .stream()
                .map(DiarioResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(diarios);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DiarioResponse> buscarPorId(
            @AuthenticationPrincipal UsuarioAutenticado usuarioAutenticado,
            @PathVariable Long id
    ) {

        DiarioFinanceiro diario = diarioService.buscarPorId(
                id,
                usuarioAutenticado.getId()
        );

        return ResponseEntity.ok(
                DiarioResponse.fromEntity(diario)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<DiarioResponse> atualizar(
            @AuthenticationPrincipal UsuarioAutenticado usuarioAutenticado,
            @PathVariable Long id,
            @RequestBody @Valid DiarioRequest request
    ) {

        DiarioFinanceiro diario = diarioService.atualizar(
                id,
                request,
                usuarioAutenticado.getId()
        );

        return ResponseEntity.ok(
                DiarioResponse.fromEntity(diario)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @AuthenticationPrincipal UsuarioAutenticado usuarioAutenticado,
            @PathVariable Long id
    ) {

        diarioService.excluir(
                id,
                usuarioAutenticado.getId()
        );

        return ResponseEntity.noContent().build();
    }
}