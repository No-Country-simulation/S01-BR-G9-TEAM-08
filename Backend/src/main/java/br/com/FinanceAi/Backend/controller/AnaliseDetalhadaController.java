package br.com.FinanceAi.Backend.controller;

import br.com.FinanceAi.Backend.dto.response.ResultadoAnaliseDetalhadaIA;
import br.com.FinanceAi.Backend.security.UsuarioAutenticado;
import br.com.FinanceAi.Backend.service.AnaliseDetalhadaIAService;
import br.com.FinanceAi.Backend.service.ColetorDadosUsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ia/analise-detalhada")
@RequiredArgsConstructor
public class AnaliseDetalhadaController {

    private final ColetorDadosUsuarioService coletorDadosUsuarioService;
    private final AnaliseDetalhadaIAService analiseDetalhadaIAService;

    @GetMapping
    public ResponseEntity<ResultadoAnaliseDetalhadaIA> analisar(
            @AuthenticationPrincipal UsuarioAutenticado usuarioAutenticado
    ) {

        var dadosCompletos = coletorDadosUsuarioService.coletarDadosCompletos(
                usuarioAutenticado.getId()
        );

        ResultadoAnaliseDetalhadaIA resultado =
                analiseDetalhadaIAService.analisar(dadosCompletos);

        return ResponseEntity.ok(resultado);
    }
}
