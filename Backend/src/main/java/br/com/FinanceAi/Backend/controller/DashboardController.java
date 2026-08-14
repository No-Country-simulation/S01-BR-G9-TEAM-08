package br.com.FinanceAi.Backend.controller;

import br.com.FinanceAi.Backend.dto.response.DashboardResponse;
import br.com.FinanceAi.Backend.security.UsuarioAutenticado;
import br.com.FinanceAi.Backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<DashboardResponse> dashboard(
            @AuthenticationPrincipal UsuarioAutenticado usuarioAutenticado
    ) {

        DashboardResponse response =
                dashboardService.gerarDashboard(
                        usuarioAutenticado.getId()
                );

        return ResponseEntity.ok(response);
    }
}