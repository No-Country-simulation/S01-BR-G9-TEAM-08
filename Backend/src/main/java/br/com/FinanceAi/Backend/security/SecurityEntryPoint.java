package br.com.FinanceAi.Backend.security;

import br.com.FinanceAi.Backend.dto.response.ErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class SecurityEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    public SecurityEntryPoint(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * Intercepta a requisição quando a autenticação falha ou está ausente,
     * retornando status 401 (Unauthorized) com um corpo JSON padronizado
     * em vez do comportamento HTML padrão do Spring Security.
     *
     * @param request       requisição que originou a falha de autenticação
     * @param response      resposta HTTP a ser escrita (status 401 + JSON)
     * @param authException exceção que descreve o motivo da falha de autenticação
     */
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException, ServletException {

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        ErrorResponse body = new ErrorResponse(
                "Unauthorized",
                authException.getMessage(),
                HttpStatus.UNAUTHORIZED
        );

        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}
