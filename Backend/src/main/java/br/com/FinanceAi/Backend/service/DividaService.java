package br.com.FinanceAi.Backend.service;

import br.com.FinanceAi.Backend.dto.request.DividaRequest;
import br.com.FinanceAi.Backend.dto.response.DividaResponse;
import br.com.FinanceAi.Backend.entity.Divida;
import br.com.FinanceAi.Backend.exception.DividaNaoEncontradaException;
import br.com.FinanceAi.Backend.repository.DividaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DividaService {

    private final DividaRepository dividaRepository;

    @Transactional(readOnly = true)
    public List<DividaResponse> listarDividas(Long usuarioId) {
        return dividaRepository.findByUsuarioIdOrderByCriadoEmDesc(usuarioId).stream()
                .map(DividaResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DividaResponse buscarPorId(Long usuarioId, Long id) {
        Divida divida = dividaRepository.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new DividaNaoEncontradaException(id));
        return DividaResponse.fromEntity(divida);
    }

    @Transactional
    public DividaResponse criarDivida(Long usuarioId, DividaRequest request) {
        Divida divida = Divida.builder()
                .descricao(request.getDescricao().trim())
                .valorOriginal(request.getValorOriginal())
                .saldoDevedor(request.getSaldoDevedor())
                .valorParcela(request.getValorParcela())
                .parcelasRestantes(request.getParcelasRestantes())
                .taxaJuros(request.getTaxaJuros() != null ? request.getTaxaJuros() : BigDecimal.ZERO)
                .dataVencimento(request.getDataVencimento())
                .status(request.getStatus() != null ? request.getStatus() : "Em dia")
                .usuarioId(usuarioId)
                .build();

        Divida salva = dividaRepository.save(divida);
        return DividaResponse.fromEntity(salva);
    }

    @Transactional
    public DividaResponse atualizarDivida(Long usuarioId, Long id, DividaRequest request) {
        Divida divida = dividaRepository.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new DividaNaoEncontradaException(id));

        divida.setDescricao(request.getDescricao().trim());
        divida.setValorOriginal(request.getValorOriginal());
        divida.setSaldoDevedor(request.getSaldoDevedor());
        divida.setValorParcela(request.getValorParcela());
        divida.setParcelasRestantes(request.getParcelasRestantes());
        if (request.getTaxaJuros() != null) divida.setTaxaJuros(request.getTaxaJuros());
        if (request.getDataVencimento() != null) divida.setDataVencimento(request.getDataVencimento());
        if (request.getStatus() != null) divida.setStatus(request.getStatus());

        return DividaResponse.fromEntity(divida);
    }

    @Transactional
    public void excluirDivida(Long usuarioId, Long id) {
        Divida divida = dividaRepository.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new DividaNaoEncontradaException(id));
        dividaRepository.delete(divida);
    }
}
