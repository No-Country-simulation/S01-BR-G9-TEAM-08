package br.com.FinanceAi.Backend.controller;

import br.com.FinanceAi.Backend.config.UsuarioAutenticado;
import br.com.FinanceAi.Backend.dto.request.LoginRequest;
import br.com.FinanceAi.Backend.dto.request.usuario.UsuarioCadastraRequest;
import br.com.FinanceAi.Backend.dto.response.LoginResponse;
import br.com.FinanceAi.Backend.dto.response.usuario.UsuarioCadastraResponse;
import br.com.FinanceAi.Backend.service.TokenService;
import br.com.FinanceAi.Backend.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.Duration;

@RestController
@RequestMapping("auth")
public class AuthController {

    private final TokenService tokenService;
    private UsuarioService usuarioService;
    private AuthenticationManager authenticationManager;

    public static final String TOKEN_TYPE = "Bearer";
    public static final long EXPIRA_TOKEN = Duration.ofHours(2).getSeconds(); // 7200

    public AuthController(
            UsuarioService usuarioService,
            TokenService tokenService,
            AuthenticationManager authenticationManager
    ) {
        this.usuarioService = usuarioService;
        this.tokenService = tokenService;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/register")
    public ResponseEntity<UsuarioCadastraResponse> cadastrar(@RequestBody @Valid UsuarioCadastraRequest request, UriComponentsBuilder uri) {

        UsuarioCadastraResponse response = usuarioService.cadastrar(request);

        URI location = uri
                .path("/usuarios/{id}")
                .buildAndExpand(response.id())
                .toUri();

        return ResponseEntity.created(location).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest request) {

        UsernamePasswordAuthenticationToken emailSenha = new UsernamePasswordAuthenticationToken(request.email(), request.senha());

        var auth = this.authenticationManager.authenticate(emailSenha);
        var token = tokenService.generateToken((UsuarioAutenticado) auth.getPrincipal());

        return ResponseEntity.ok(new LoginResponse(token, TOKEN_TYPE, EXPIRA_TOKEN));
    }

}
