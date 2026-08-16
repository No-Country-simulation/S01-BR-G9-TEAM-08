package br.com.FinanceAi.Backend.controller;

import br.com.FinanceAi.Backend.dto.request.TextoIARequest;
import br.com.FinanceAi.Backend.dto.response.ResultadoAnaliseIA;
import br.com.FinanceAi.Backend.service.IAService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import br.com.FinanceAi.Backend.security.UsuarioAutenticado;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequestMapping("/api/ia")
public class IAController {

    private final IAService iaService;

    public IAController(IAService iaService) {
        this.iaService = iaService;
    }

    @PostMapping("/processar-texto")
    public ResponseEntity<ResultadoAnaliseIA> processarTexto(
            @AuthenticationPrincipal UsuarioAutenticado usuarioAutenticado,
            @RequestBody @Valid TextoIARequest request
    ) {

        ResultadoAnaliseIA resultado =
                iaService.processarEInterpretarTexto(
                        request.getTexto(),
                        usuarioAutenticado.getId()
                );

        return ResponseEntity.ok(resultado);
    }
}