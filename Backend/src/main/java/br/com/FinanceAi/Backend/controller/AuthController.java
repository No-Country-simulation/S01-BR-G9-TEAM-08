package br.com.FinanceAi.Backend.controller;

import br.com.FinanceAi.Backend.dto.request.RegisterRequest;
import br.com.FinanceAi.Backend.dto.response.RegisterResponse;
import br.com.FinanceAi.Backend.entity.Usuario;
import br.com.FinanceAi.Backend.mapper.UsuarioMapper;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("usuarios")
public class AuthController {

    private UsuarioMapper usuarioMapper;

    public AuthController(UsuarioMapper usuarioMapper) {
        this.usuarioMapper = usuarioMapper;
    }

    @PostMapping("registrar")
    public ResponseEntity<RegisterResponse> registrar(@RequestBody @Valid RegisterRequest registerRequest, UriComponentsBuilder uri) {

        Usuario usuario = usuarioMapper.map(registerRequest);

        return
    }

}
