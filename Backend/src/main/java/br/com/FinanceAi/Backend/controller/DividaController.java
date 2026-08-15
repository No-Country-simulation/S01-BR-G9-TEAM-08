package br.com.FinanceAi.Backend.controller;

import br.com.FinanceAi.Backend.dto.request.DividaRequest;
import br.com.FinanceAi.Backend.dto.response.DividaResponse;
import br.com.FinanceAi.Backend.security.UsuarioAutenticado;
import br.com.FinanceAi.Backend.service.DividaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/dividas", "/dividas"})
@RequiredArgsConstructor
public class DividaController {

    private final DividaService dividaService;

    @GetMapping
    public ResponseEntity<List<DividaResponse>> listarDividas(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        List<DividaResponse> dividas = dividaService.listarDividas(usuario.getId());
        return ResponseEntity.ok(dividas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DividaResponse> buscarPorId(
            @AuthenticationPrincipal UsuarioAutenticado usuario,
            @PathVariable Long id
    ) {
        DividaResponse divida = dividaService.buscarPorId(usuario.getId(), id);
        return ResponseEntity.ok(divida);
    }

    @PostMapping
    public ResponseEntity<DividaResponse> criarDivida(
            @AuthenticationPrincipal UsuarioAutenticado usuario,
            @RequestBody @Valid DividaRequest request
    ) {
        DividaResponse response = dividaService.criarDivida(usuario.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DividaResponse> atualizarDivida(
            @AuthenticationPrincipal UsuarioAutenticado usuario,
            @PathVariable Long id,
            @RequestBody @Valid DividaRequest request
    ) {
        DividaResponse response = dividaService.atualizarDivida(usuario.getId(), id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirDivida(
            @AuthenticationPrincipal UsuarioAutenticado usuario,
            @PathVariable Long id
    ) {
        dividaService.excluirDivida(usuario.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
