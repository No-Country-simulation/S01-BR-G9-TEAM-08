package br.com.FinanceAi.Backend.exception;

public class DividaNaoEncontradaException extends RuntimeException {
    public DividaNaoEncontradaException(Long id) {
        super("Dívida/empréstimo não encontrado com id: " + id);
    }
}
