package br.com.FinanceAi.Backend.config;

import br.com.FinanceAi.Backend.entity.Usuario;
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

    private TokenService tokenService;
    private UsuarioRepository usuarioRepository;

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
                .ifPresent(this::authenticateUser);

        filterChain.doFilter(request, response);
    }

    private void authenticateUser(Usuario usuario) {
        var auth = new UsernamePasswordAuthenticationToken(
                usuario,
                null,
                usuario.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    private Optional<String> recoverToken(HttpServletRequest request) {
        return Optional.ofNullable(request.getHeader("Authorization"))
                .filter(s -> s.startsWith("Bearer "))
                .map(s -> s.substring(s.indexOf(" ") + 1));
    }
}
