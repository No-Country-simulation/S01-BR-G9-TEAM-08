package br.com.FinanceAi.Backend.service;

import br.com.FinanceAi.Backend.config.UsuarioAutenticado;
import br.com.FinanceAi.Backend.entity.Usuario;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;


@Service
public class TokenService {

    @Value("${JWT_SECRET:my-secret-key}")
    private String secret;

    @Value("${JWT_EXPIRATION_HOURS:2}")
    private long expirationHours;

    public String generateToken(UsuarioAutenticado usuarioAutenticado) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.create()
                    .withIssuer("auth-api")
                    .withSubject(usuarioAutenticado.getUsername())
                    .withExpiresAt(genExpirationDate())
                    .sign(algorithm);
        } catch (JWTCreationException exception) {
            throw new RuntimeException("Erro ao gerar o token", exception);
        }
    }

    public String validateToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.require(algorithm)
                    .withIssuer("auth-api")
                    .build()
                    .verify(token)
                    .getSubject();
        } catch (JWTVerificationException exception) {
            return "";
        }
    }

    private Instant genExpirationDate() {
        return Instant.now().plus(Duration.ofHours(expirationHours));
    }
}
