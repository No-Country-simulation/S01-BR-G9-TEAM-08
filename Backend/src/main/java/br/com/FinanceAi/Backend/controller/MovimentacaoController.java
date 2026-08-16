package br.com.FinanceAi.Backend.controller;

import br.com.FinanceAi.Backend.dto.request.MovimentacaoRequest;
import br.com.FinanceAi.Backend.dto.response.MovimentacaoResponse;
import br.com.FinanceAi.Backend.entity.enums.TipoMovimentacaoEnum;
import br.com.FinanceAi.Backend.security.UsuarioAutenticado;
import br.com.FinanceAi.Backend.service.MovimentacaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/movimentacoes")
@RequiredArgsConstructor
public class MovimentacaoController {

    private final MovimentacaoService movimentacaoService;

    @PostMapping
    public ResponseEntity<MovimentacaoResponse> cadastrar(
            @AuthenticationPrincipal UsuarioAutenticado usuarioAutenticado,
            @RequestBody @Valid MovimentacaoRequest request
    ) {
        MovimentacaoResponse response = movimentacaoService.cadastrar(
                request,
                usuarioAutenticado.getId()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<MovimentacaoResponse>> listar(
            @AuthenticationPrincipal UsuarioAutenticado usuarioAutenticado,
            @RequestParam(required = false) TipoMovimentacaoEnum tipo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim
    ) {
        if (tipo != null) {
            return ResponseEntity.ok(movimentacaoService.listarPorTipo(usuarioAutenticado.getId(), tipo));
        }
        if (dataInicio != null && dataFim != null) {
            return ResponseEntity.ok(movimentacaoService.listarPorPeriodo(usuarioAutenticado.getId(), dataInicio, dataFim));
        }

        return ResponseEntity.ok(movimentacaoService.listar(usuarioAutenticado.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MovimentacaoResponse> buscarPorId(
            @AuthenticationPrincipal UsuarioAutenticado usuarioAutenticado,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(movimentacaoService.buscarPorId(id, usuarioAutenticado.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MovimentacaoResponse> atualizar(
            @AuthenticationPrincipal UsuarioAutenticado usuarioAutenticado,
            @PathVariable Long id,
            @RequestBody @Valid MovimentacaoRequest request
    ) {
        return ResponseEntity.ok(
                movimentacaoService.atualizar(id, request, usuarioAutenticado.getId())
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @AuthenticationPrincipal UsuarioAutenticado usuarioAutenticado,
            @PathVariable Long id
    ) {
        movimentacaoService.excluir(id, usuarioAutenticado.getId());
        return ResponseEntity.noContent().build();
    }
}
