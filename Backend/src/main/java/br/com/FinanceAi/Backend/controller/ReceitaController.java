package br.com.FinanceAi.Backend.controller;

import br.com.FinanceAi.Backend.dto.request.ReceitaRequest;
import br.com.FinanceAi.Backend.dto.response.ReceitaResponse;
import br.com.FinanceAi.Backend.entity.Receita;
import br.com.FinanceAi.Backend.security.UsuarioAutenticado;
import br.com.FinanceAi.Backend.service.ReceitaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/receitas")
@RequiredArgsConstructor
public class ReceitaController {

    private final ReceitaService receitaService;

    @PostMapping
    public ResponseEntity<ReceitaResponse> cadastrar(
            @AuthenticationPrincipal UsuarioAutenticado usuarioAutenticado,
            @RequestBody @Valid ReceitaRequest request
    ) {

        Receita receita = receitaService.cadastrar(
                request,
                usuarioAutenticado.getId()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ReceitaResponse.fromEntity(receita));
    }

    @GetMapping
    public ResponseEntity<List<ReceitaResponse>> listar(
            @AuthenticationPrincipal UsuarioAutenticado usuarioAutenticado
    ) {

        List<ReceitaResponse> receitas = receitaService
                .listar(usuarioAutenticado.getId())
                .stream()
                .map(ReceitaResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(receitas);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReceitaResponse> atualizar(
            @AuthenticationPrincipal UsuarioAutenticado usuarioAutenticado,
            @PathVariable Long id,
            @RequestBody @Valid ReceitaRequest request
    ) {

        Receita receita = receitaService.atualizar(
                id,
                request,
                usuarioAutenticado.getId()
        );

        return ResponseEntity.ok(
                ReceitaResponse.fromEntity(receita)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @AuthenticationPrincipal UsuarioAutenticado usuarioAutenticado,
            @PathVariable Long id
    ) {

        receitaService.excluir(
                id,
                usuarioAutenticado.getId()
        );

        return ResponseEntity.noContent().build();
    }
}