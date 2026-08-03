package br.com.FinanceAi.Backend.exception;

public class NovaSenhaIgualAtualException extends RuntimeException {
    public NovaSenhaIgualAtualException() {

        super("A nova senha deve ser diferente da senha atual.");
    }
}
