package br.com.FinanceAi.Backend.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;

@Getter
public class ErrorResponse {

    private final String code;
    private final String message;
    private final int status;
    private final LocalDateTime timestamp;

    public ErrorResponse(String code, String message, HttpStatus status) {
        this.code = code;
        this.message = message;
        this.status = status.value();
        this.timestamp = LocalDateTime.now();
    }

}
