package br.com.FinanceAi.Backend.service;

import br.com.FinanceAi.Backend.dto.request.DiarioRequest;
import br.com.FinanceAi.Backend.entity.DiarioFinanceiro;
import br.com.FinanceAi.Backend.exception.ResourceNotFoundException;
import br.com.FinanceAi.Backend.repository.DiarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DiarioService {

    private final DiarioRepository diarioRepository;

    @Transactional
    public DiarioFinanceiro cadastrar(
            DiarioRequest request,
            Long usuarioId
    ) {

        DiarioFinanceiro diario = DiarioFinanceiro.builder()
                .titulo(request.titulo())
                .tipo(request.tipo())
                .data(request.data())
                .conteudo(request.conteudo())
                .usuarioId(usuarioId)
                .ativo(true)
                .build();

        return diarioRepository.save(diario);
    }

    public List<DiarioFinanceiro> listar(Long usuarioId) {

        return diarioRepository
                .findByUsuarioIdAndAtivoTrueOrderByDataDescCriadoEmDesc(
                        usuarioId
                );
    }

    public DiarioFinanceiro buscarPorId(
            Long id,
            Long usuarioId
    ) {

        return diarioRepository
                .findByIdAndUsuarioIdAndAtivoTrue(
                        id,
                        usuarioId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Entrada do diário não encontrada."
                        )
                );
    }

    @Transactional
    public DiarioFinanceiro atualizar(
            Long id,
            DiarioRequest request,
            Long usuarioId
    ) {

        DiarioFinanceiro diario =
                buscarPorId(id, usuarioId);

        diario.setTitulo(request.titulo());
        diario.setTipo(request.tipo());
        diario.setData(request.data());
        diario.setConteudo(request.conteudo());

        return diarioRepository.save(diario);
    }

    @Transactional
    public void excluir(
            Long id,
            Long usuarioId
    ) {

        DiarioFinanceiro diario =
                buscarPorId(id, usuarioId);

        diario.setAtivo(false);

        diarioRepository.save(diario);
    }
}