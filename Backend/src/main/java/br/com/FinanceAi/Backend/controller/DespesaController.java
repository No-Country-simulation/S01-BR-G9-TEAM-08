package br.com.FinanceAi.Backend.controller;

import br.com.FinanceAi.Backend.dto.request.DespesaRequest;
import br.com.FinanceAi.Backend.dto.response.DespesaResponse;
import br.com.FinanceAi.Backend.entity.Despesa;
import br.com.FinanceAi.Backend.security.UsuarioAutenticado;
import br.com.FinanceAi.Backend.service.DespesaService;
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
@RequestMapping("/api/despesas")
@RequiredArgsConstructor
public class DespesaController {

    private final DespesaService despesaService;

    @PostMapping
    public ResponseEntity<DespesaResponse> cadastrar(
            @AuthenticationPrincipal UsuarioAutenticado usuarioAutenticado,
            @RequestBody @Valid DespesaRequest request
    ) {

        Despesa despesa = despesaService.cadastrar(
                request,
                usuarioAutenticado.getId()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(DespesaResponse.fromEntity(despesa));
    }

    @GetMapping
    public ResponseEntity<List<DespesaResponse>> listar(
            @AuthenticationPrincipal UsuarioAutenticado usuarioAutenticado,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate dataInicio,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate dataFim
    ) {

        List<Despesa> despesas;

        if (dataInicio != null || dataFim != null) {

            if (dataInicio == null || dataFim == null) {
                throw new IllegalArgumentException(
                        "Para filtrar por período, informe dataInicio e dataFim."
                );
            }

            despesas = despesaService.listarPorPeriodo(
                    usuarioAutenticado.getId(),
                    dataInicio,
                    dataFim
            );

        } else {

            despesas = despesaService.listar(
                    usuarioAutenticado.getId()
            );
        }

        List<DespesaResponse> response = despesas.stream()
                .map(DespesaResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DespesaResponse> buscarPorId(
            @AuthenticationPrincipal UsuarioAutenticado usuarioAutenticado,
            @PathVariable Long id
    ) {

        Despesa despesa = despesaService.buscarPorId(
                id,
                usuarioAutenticado.getId()
        );

        return ResponseEntity.ok(
                DespesaResponse.fromEntity(despesa)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<DespesaResponse> atualizar(
            @AuthenticationPrincipal UsuarioAutenticado usuarioAutenticado,
            @PathVariable Long id,
            @RequestBody @Valid DespesaRequest request
    ) {

        Despesa despesa = despesaService.atualizar(
                id,
                request,
                usuarioAutenticado.getId()
        );

        return ResponseEntity.ok(
                DespesaResponse.fromEntity(despesa)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @AuthenticationPrincipal UsuarioAutenticado usuarioAutenticado,
            @PathVariable Long id
    ) {

        despesaService.excluir(
                id,
                usuarioAutenticado.getId()
        );

        return ResponseEntity.noContent().build();
    }
}