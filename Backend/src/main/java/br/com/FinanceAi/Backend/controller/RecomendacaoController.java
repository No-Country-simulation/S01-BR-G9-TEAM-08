package br.com.FinanceAi.Backend.controller;

import br.com.FinanceAi.Backend.dto.response.RecomendacaoResponse;
import br.com.FinanceAi.Backend.security.UsuarioAutenticado;
import br.com.FinanceAi.Backend.service.RecomendacaoFinanceiraService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/recomendacoes")
@RequiredArgsConstructor
public class RecomendacaoController {

    private final RecomendacaoFinanceiraService recomendacaoFinanceiraService;

    @GetMapping
    public ResponseEntity<List<RecomendacaoResponse>> listar(
            @AuthenticationPrincipal UsuarioAutenticado usuarioAutenticado
    ) {

        List<RecomendacaoResponse> recomendacoes =
                recomendacaoFinanceiraService.listar(
                        usuarioAutenticado.getId()
                );

        return ResponseEntity.ok(recomendacoes);
    }
}