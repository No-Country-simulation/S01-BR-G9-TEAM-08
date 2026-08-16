package br.com.FinanceAi.Backend.service;

import br.com.FinanceAi.Backend.dto.request.DiarioRequest;
import br.com.FinanceAi.Backend.entity.DiarioFinanceiro;
import br.com.FinanceAi.Backend.entity.enums.TipoDiarioEnum;
import br.com.FinanceAi.Backend.exception.ResourceNotFoundException;
import br.com.FinanceAi.Backend.repository.DiarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
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
        TipoDiarioEnum tipo = request.tipo() != null ? request.tipo() : TipoDiarioEnum.ANOTACAO;
        LocalDate data = request.data() != null ? request.data() : LocalDate.now();

        DiarioFinanceiro diario = DiarioFinanceiro.builder()
                .titulo(request.titulo().trim())
                .tipo(tipo)
                .data(data)
                .conteudo(request.conteudo().trim())
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

        if (request.titulo() != null) diario.setTitulo(request.titulo().trim());
        if (request.tipo() != null) diario.setTipo(request.tipo());
        if (request.data() != null) diario.setData(request.data());
        if (request.conteudo() != null) diario.setConteudo(request.conteudo().trim());

        return diarioRepository.save(diario);
    }

    @Transactional
    public void excluir(
            Long id,
            Long usuarioId
    ) {

        DiarioFinanceiro diario =
                buscarPorId(id, usuarioId);

        diarioRepository.delete(diario);
    }
}