package br.com.FinanceAi.Backend.controller;

import br.com.FinanceAi.Backend.dto.request.TextoIARequest;
import br.com.FinanceAi.Backend.service.IAService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ia")
public class IAController {

    private final IAService iaService;

    public IAController(IAService iaService) {
        this.iaService = iaService;
    }

    @PostMapping("/processar-texto")
    public ResponseEntity<String> processarTexto(@RequestBody @Valid TextoIARequest request) {
        String resposta = iaService.processarTextoUsuario(request.getTexto());
        return ResponseEntity.ok(resposta);
    }
}