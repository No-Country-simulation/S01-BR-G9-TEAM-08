package br.com.FinanceAi.Backend.service;

import br.com.FinanceAi.Backend.dto.request.AjusteSaldoRequest;
import br.com.FinanceAi.Backend.dto.request.ContaRequest;
import br.com.FinanceAi.Backend.dto.response.ContaResponse;
import br.com.FinanceAi.Backend.entity.Conta;
import br.com.FinanceAi.Backend.exception.ContaNaoEncontradaException;
import br.com.FinanceAi.Backend.repository.ContaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContaService {

    private final ContaRepository contaRepository;

    @Transactional(readOnly = true)
    public List<ContaResponse> listarContas(Long usuarioId) {
        List<Conta> contas = contaRepository.findByUsuarioIdOrderByNomeAsc(usuarioId);
        
        // Se o usuário ainda não tiver nenhuma conta criada, provisiona a conta padrão
        if (contas.isEmpty()) {
            Conta contaPadrao = Conta.builder()
                    .nome("Carteira Principal")
                    .instituicao("Carteira")
                    .tipo("conta corrente")
                    .moeda("BRL")
                    .saldo(BigDecimal.ZERO)
                    .limiteCredito(BigDecimal.ZERO)
                    .limiteChequeEspecial(BigDecimal.ZERO)
                    .status("Ativa")
                    .usuarioId(usuarioId)
                    .build();
            contaPadrao = contaRepository.save(contaPadrao);
            contas = List.of(contaPadrao);
        }

        return contas.stream()
                .map(ContaResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ContaResponse buscarPorId(Long usuarioId, Long id) {
        Conta conta = contaRepository.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new ContaNaoEncontradaException(id));
        return ContaResponse.fromEntity(conta);
    }

    @Transactional
    public ContaResponse criarConta(Long usuarioId, ContaRequest request) {
        Conta conta = Conta.builder()
                .nome(request.getNome().trim())
                .instituicao(request.getInstituicao().trim())
                .tipo(request.getTipo())
                .moeda(request.getMoeda() != null ? request.getMoeda() : "BRL")
                .saldo(request.getSaldo() != null ? request.getSaldo() : BigDecimal.ZERO)
                .limiteCredito(request.getLimiteCredito() != null ? request.getLimiteCredito() : BigDecimal.ZERO)
                .limiteChequeEspecial(request.getLimiteChequeEspecial() != null ? request.getLimiteChequeEspecial() : BigDecimal.ZERO)
                .status("Ativa")
                .usuarioId(usuarioId)
                .build();

        Conta salva = contaRepository.save(conta);
        return ContaResponse.fromEntity(salva);
    }

    @Transactional
    public ContaResponse atualizarConta(Long usuarioId, Long id, ContaRequest request) {
        Conta conta = contaRepository.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new ContaNaoEncontradaException(id));

        conta.setNome(request.getNome().trim());
        conta.setInstituicao(request.getInstituicao().trim());
        conta.setTipo(request.getTipo());
        if (request.getMoeda() != null) conta.setMoeda(request.getMoeda());
        if (request.getSaldo() != null) conta.setSaldo(request.getSaldo());
        if (request.getLimiteCredito() != null) conta.setLimiteCredito(request.getLimiteCredito());
        if (request.getLimiteChequeEspecial() != null) conta.setLimiteChequeEspecial(request.getLimiteChequeEspecial());

        return ContaResponse.fromEntity(conta);
    }

    @Transactional
    public ContaResponse ajustarSaldo(Long usuarioId, Long id, AjusteSaldoRequest request) {
        Conta conta = contaRepository.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new ContaNaoEncontradaException(id));

        conta.setSaldo(request.getNovoSaldo());
        return ContaResponse.fromEntity(conta);
    }

    @Transactional
    public ContaResponse alternarStatus(Long usuarioId, Long id) {
        Conta conta = contaRepository.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new ContaNaoEncontradaException(id));

        String novoStatus = "Ativa".equalsIgnoreCase(conta.getStatus()) ? "Inativa" : "Ativa";
        conta.setStatus(novoStatus);
        return ContaResponse.fromEntity(conta);
    }

    @Transactional
    public void excluirConta(Long usuarioId, Long id) {
        Conta conta = contaRepository.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new ContaNaoEncontradaException(id));
        contaRepository.delete(conta);
    }
}
