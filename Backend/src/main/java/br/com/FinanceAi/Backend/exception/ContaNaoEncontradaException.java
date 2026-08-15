package br.com.FinanceAi.Backend.exception;

public class ContaNaoEncontradaException extends RuntimeException {
    public ContaNaoEncontradaException(Long id) {
        super("Conta bancária não encontrada com id: " + id);
    }
}
