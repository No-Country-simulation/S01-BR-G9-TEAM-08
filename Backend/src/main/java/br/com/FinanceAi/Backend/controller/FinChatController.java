package br.com.FinanceAi.Backend.controller;

import br.com.FinanceAi.Backend.dto.request.FinChatRequest;
import br.com.FinanceAi.Backend.dto.response.FinChatResponse;
import br.com.FinanceAi.Backend.security.UsuarioAutenticado;
import br.com.FinanceAi.Backend.service.FinChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/fin/chat")
@RequiredArgsConstructor
public class FinChatController {

    private final FinChatService finChatService;

    @PostMapping
    public ResponseEntity<FinChatResponse> chat(
            @AuthenticationPrincipal UsuarioAutenticado usuarioAutenticado,
            @RequestBody @Valid FinChatRequest request
    ) {
        FinChatResponse response = finChatService.chat(usuarioAutenticado.getId(), request);
        return ResponseEntity.ok(response);
    }
}
