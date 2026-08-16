package br.com.FinanceAi.Backend.controller;

import br.com.FinanceAi.Backend.dto.request.ItemCompraRequest;
import br.com.FinanceAi.Backend.dto.response.ItemCompraResponse;
import br.com.FinanceAi.Backend.entity.ItemCompra;
import br.com.FinanceAi.Backend.security.UsuarioAutenticado;
import br.com.FinanceAi.Backend.service.ItemCompraService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import br.com.FinanceAi.Backend.dto.request.LancamentoComprasRequest;
import br.com.FinanceAi.Backend.dto.response.DespesaResponse;
import br.com.FinanceAi.Backend.entity.Despesa;

import java.util.List;

@RestController
@RequestMapping("/lista-compras")
@RequiredArgsConstructor
public class ItemCompraController {

    private final ItemCompraService itemCompraService;

    @PostMapping
    public ResponseEntity<ItemCompraResponse> cadastrar(
            @AuthenticationPrincipal UsuarioAutenticado usuarioAutenticado,
            @RequestBody @Valid ItemCompraRequest request
    ) {

        ItemCompra item = itemCompraService.cadastrar(
                request,
                usuarioAutenticado.getId()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ItemCompraResponse.fromEntity(item));
    }

    @GetMapping
    public ResponseEntity<List<ItemCompraResponse>> listar(
            @AuthenticationPrincipal UsuarioAutenticado usuarioAutenticado
    ) {

        List<ItemCompraResponse> itens =
                itemCompraService.listar(usuarioAutenticado.getId())
                        .stream()
                        .map(ItemCompraResponse::fromEntity)
                        .toList();

        return ResponseEntity.ok(itens);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemCompraResponse> buscarPorId(
            @AuthenticationPrincipal UsuarioAutenticado usuarioAutenticado,
            @PathVariable Long id
    ) {

        ItemCompra item = itemCompraService.buscarPorId(
                id,
                usuarioAutenticado.getId()
        );

        return ResponseEntity.ok(
                ItemCompraResponse.fromEntity(item)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ItemCompraResponse> atualizar(
            @AuthenticationPrincipal UsuarioAutenticado usuarioAutenticado,
            @PathVariable Long id,
            @RequestBody @Valid ItemCompraRequest request
    ) {

        ItemCompra item = itemCompraService.atualizar(
                id,
                request,
                usuarioAutenticado.getId()
        );

        return ResponseEntity.ok(
                ItemCompraResponse.fromEntity(item)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @AuthenticationPrincipal UsuarioAutenticado usuarioAutenticado,
            @PathVariable Long id
    ) {

        itemCompraService.excluir(
                id,
                usuarioAutenticado.getId()
        );

        return ResponseEntity.noContent().build();
    }
    @PostMapping("/lancar-pagos")
    public ResponseEntity<DespesaResponse> lancarItensPagos(
            @AuthenticationPrincipal UsuarioAutenticado usuarioAutenticado,
            @RequestBody @Valid LancamentoComprasRequest request
    ) {

        Despesa despesa = itemCompraService.lancarItensPagos(
                request,
                usuarioAutenticado.getId()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(DespesaResponse.fromEntity(despesa));
    }
}