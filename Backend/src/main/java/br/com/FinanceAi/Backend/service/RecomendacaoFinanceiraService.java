package br.com.FinanceAi.Backend.service;

import br.com.FinanceAi.Backend.dto.response.RecomendacaoResponse;
import br.com.FinanceAi.Backend.repository.RecomendacaoFinanceiraRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecomendacaoFinanceiraService {

    private final RecomendacaoFinanceiraRepository
            recomendacaoFinanceiraRepository;

    public List<RecomendacaoResponse> listar(Long usuarioId) {

        return recomendacaoFinanceiraRepository
                .findByUsuarioIdOrderByDataGeracaoDesc(usuarioId)
                .stream()
                .map(RecomendacaoResponse::fromEntity)
                .toList();
    }
}