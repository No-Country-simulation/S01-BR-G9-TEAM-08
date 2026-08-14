package br.com.FinanceAi.Backend.exception;

import br.com.FinanceAi.Backend.dto.response.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
        return ResponseEntity.badRequest().body(errors);
    }

    @ExceptionHandler(EmailJaCadastradoException.class)
    public ResponseEntity<ErrorResponse> handleEmailDuplicado(EmailJaCadastradoException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse(
                        "Email duplicado",
                        ex.getMessage(),
                        HttpStatus.CONFLICT
                ));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleJsonInvalido(HttpMessageNotReadableException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(
                        "JSON inválido ou mal formatado",
                        ex.getMessage(),
                        HttpStatus.BAD_REQUEST
                ));
    }

    @ExceptionHandler(UsuarioNaoEncontradoException.class)
    public ResponseEntity<ErrorResponse> handleUsuarioNaoEncontrado(UsuarioNaoEncontradoException ex) {
        return ResponseEntity.status(
                HttpStatus.NOT_FOUND
        ).body(new ErrorResponse(
                "Usuário inexistente",
                ex.getMessage(),
                HttpStatus.NOT_FOUND
        ));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.status(
              HttpStatus.UNAUTHORIZED
        ).body(new ErrorResponse(
                "Credenciais inválidas",
                ex.getMessage(),
                HttpStatus.UNAUTHORIZED
        ));
    }

    @ExceptionHandler(NovaSenhaIgualAtualException.class)
    public ResponseEntity<ErrorResponse> handleSenhaIgualAtual(SenhaAtualIncorretaException ex) {
        return ResponseEntity.status(
                HttpStatus.BAD_REQUEST
        ).body(new ErrorResponse(
                "Erro Senha atual",
                ex.getMessage(),
                HttpStatus.BAD_REQUEST
        ));
    }

    @ExceptionHandler(SenhaAtualIncorretaException.class)
    public ResponseEntity<ErrorResponse> handleSenhaIgual(SenhaAtualIncorretaException ex) {
        return ResponseEntity.status(
                HttpStatus.BAD_REQUEST
        ).body(new ErrorResponse(
                "Erro Senha Igual",
                ex.getMessage(),
                HttpStatus.BAD_REQUEST
        ));
    }
    @ExceptionHandler(IaIndisponivelException.class)
    public ResponseEntity<ErrorResponse> handleIaIndisponivel(
            IaIndisponivelException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(new ErrorResponse(
                        "IA_INDISPONIVEL",
                        ex.getMessage(),
                        HttpStatus.SERVICE_UNAVAILABLE
                ));
    }
}
