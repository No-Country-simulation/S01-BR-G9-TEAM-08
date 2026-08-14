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
    public ResponseEntity<Map<String, String>> handleValidation(
            MethodArgumentNotValidException ex
    ) {

        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult()
                .getFieldErrors()
                .forEach(error ->
                        errors.put(
                                error.getField(),
                                error.getDefaultMessage()
                        )
                );

        return ResponseEntity
                .badRequest()
                .body(errors);
    }

    @ExceptionHandler(EmailJaCadastradoException.class)
    public ResponseEntity<ErrorResponse> handleEmailDuplicado(
            EmailJaCadastradoException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(new ErrorResponse(
                        "EMAIL_DUPLICADO",
                        ex.getMessage(),
                        HttpStatus.CONFLICT
                ));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleJsonInvalido(
            HttpMessageNotReadableException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(
                        "JSON_INVALIDO",
                        "JSON inválido ou mal formatado.",
                        HttpStatus.BAD_REQUEST
                ));
    }

    @ExceptionHandler(UsuarioNaoEncontradoException.class)
    public ResponseEntity<ErrorResponse> handleUsuarioNaoEncontrado(
            UsuarioNaoEncontradoException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(
                        "USUARIO_NAO_ENCONTRADO",
                        ex.getMessage(),
                        HttpStatus.NOT_FOUND
                ));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(
            BadCredentialsException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse(
                        "CREDENCIAIS_INVALIDAS",
                        "Credenciais inválidas.",
                        HttpStatus.UNAUTHORIZED
                ));
    }

    @ExceptionHandler(NovaSenhaIgualAtualException.class)
    public ResponseEntity<ErrorResponse> handleNovaSenhaIgualAtual(
            NovaSenhaIgualAtualException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(
                        "NOVA_SENHA_IGUAL_ATUAL",
                        ex.getMessage(),
                        HttpStatus.BAD_REQUEST
                ));
    }

    @ExceptionHandler(SenhaAtualIncorretaException.class)
    public ResponseEntity<ErrorResponse> handleSenhaAtualIncorreta(
            SenhaAtualIncorretaException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(
                        "SENHA_ATUAL_INCORRETA",
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

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
            ResourceNotFoundException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(
                        "RECURSO_NAO_ENCONTRADO",
                        ex.getMessage(),
                        HttpStatus.NOT_FOUND
                ));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(
            IllegalArgumentException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(
                        "DADOS_INVALIDOS",
                        ex.getMessage(),
                        HttpStatus.BAD_REQUEST
                ));
    }
}