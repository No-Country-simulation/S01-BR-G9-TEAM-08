package br.com.FinanceAi.Backend.controller;

import br.com.FinanceAi.Backend.dto.request.AjusteSaldoRequest;
import br.com.FinanceAi.Backend.dto.request.ContaRequest;
import br.com.FinanceAi.Backend.dto.response.ContaResponse;
import br.com.FinanceAi.Backend.security.UsuarioAutenticado;
import br.com.FinanceAi.Backend.service.ContaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/contas", "/contas"})
@RequiredArgsConstructor
public class ContaController {

    private final ContaService contaService;

    @GetMapping
    public ResponseEntity<List<ContaResponse>> listarContas(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        List<ContaResponse> contas = contaService.listarContas(usuario.getId());
        return ResponseEntity.ok(contas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContaResponse> buscarPorId(
            @AuthenticationPrincipal UsuarioAutenticado usuario,
            @PathVariable Long id
    ) {
        ContaResponse conta = contaService.buscarPorId(usuario.getId(), id);
        return ResponseEntity.ok(conta);
    }

    @PostMapping
    public ResponseEntity<ContaResponse> criarConta(
            @AuthenticationPrincipal UsuarioAutenticado usuario,
            @RequestBody @Valid ContaRequest request
    ) {
        ContaResponse response = contaService.criarConta(usuario.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContaResponse> atualizarConta(
            @AuthenticationPrincipal UsuarioAutenticado usuario,
            @PathVariable Long id,
            @RequestBody @Valid ContaRequest request
    ) {
        ContaResponse response = contaService.atualizarConta(usuario.getId(), id, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/saldo")
    public ResponseEntity<ContaResponse> ajustarSaldo(
            @AuthenticationPrincipal UsuarioAutenticado usuario,
            @PathVariable Long id,
            @RequestBody @Valid AjusteSaldoRequest request
    ) {
        ContaResponse response = contaService.ajustarSaldo(usuario.getId(), id, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ContaResponse> alternarStatus(
            @AuthenticationPrincipal UsuarioAutenticado usuario,
            @PathVariable Long id
    ) {
        ContaResponse response = contaService.alternarStatus(usuario.getId(), id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirConta(
            @AuthenticationPrincipal UsuarioAutenticado usuario,
            @PathVariable Long id
    ) {
        contaService.excluirConta(usuario.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
