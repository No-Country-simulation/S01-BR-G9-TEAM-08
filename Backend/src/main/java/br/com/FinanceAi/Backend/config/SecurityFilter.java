package br.com.FinanceAi.Backend.config;

import br.com.FinanceAi.Backend.repository.UsuarioRepository;
import br.com.FinanceAi.Backend.service.TokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    private final TokenService tokenService;
    private final UsuarioRepository usuarioRepository;

    public SecurityFilter(TokenService tokenService,  UsuarioRepository usuarioRepository) {
        this.tokenService = tokenService;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        recoverToken(request)
                .map(tokenService::validateToken)
                .filter(email -> !email.isEmpty())
                .flatMap(usuarioRepository::findByEmail)
                .map(usuario -> UsuarioAutenticado.builder()
                        .id(usuario.getId())
                        .nome(usuario.getNome())
                        .email(usuario.getEmail())
                        .senha(usuario.getSenha())
                        .build())
                .ifPresent(this::authenticateUser);

        filterChain.doFilter(request, response);
    }

    private void authenticateUser(UsuarioAutenticado usuarioAutenticado) {
        var auth = new UsernamePasswordAuthenticationToken(
                usuarioAutenticado,
                null,
                usuarioAutenticado.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    private Optional<String> recoverToken(HttpServletRequest request) {
        return Optional.ofNullable(request.getHeader("Authorization"))
                .filter(s -> s.startsWith("Bearer "))
                .map(s -> s.substring(s.indexOf(" ") + 1));
    }
}
