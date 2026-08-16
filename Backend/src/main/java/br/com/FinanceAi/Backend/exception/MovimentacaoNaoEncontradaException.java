package br.com.FinanceAi.Backend.exception;

public class MovimentacaoNaoEncontradaException extends RuntimeException {
    public MovimentacaoNaoEncontradaException(Long id) {
        super("Movimentação não encontrada com id: " + id);
    }
}
