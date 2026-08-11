package br.com.FinanceAi.Backend.exception;

public class SenhaAtualIncorretaException extends RuntimeException {
    public SenhaAtualIncorretaException() {

        super("A senha atual informada está incorreta.");
    }
}
