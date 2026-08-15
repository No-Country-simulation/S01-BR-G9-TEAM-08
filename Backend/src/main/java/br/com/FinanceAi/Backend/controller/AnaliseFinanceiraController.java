package br.com.FinanceAi.Backend.controller;

import br.com.FinanceAi.Backend.dto.response.AnaliseFinanceiraResponse;
import br.com.FinanceAi.Backend.security.UsuarioAutenticado;
import br.com.FinanceAi.Backend.service.AnaliseFinanceiraService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/analise-financeira")
@RequiredArgsConstructor
public class AnaliseFinanceiraController {

    private final AnaliseFinanceiraService analiseFinanceiraService;

    @PostMapping
    public ResponseEntity<AnaliseFinanceiraResponse> analisar(
            @AuthenticationPrincipal UsuarioAutenticado usuarioAutenticado
    ) {

        AnaliseFinanceiraResponse response =
                analiseFinanceiraService.analisar(
                        usuarioAutenticado.getId()
                );

        return ResponseEntity.ok(response);
    }
}