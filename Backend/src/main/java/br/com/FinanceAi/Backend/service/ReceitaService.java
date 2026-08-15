package br.com.FinanceAi.Backend.service;

import br.com.FinanceAi.Backend.dto.request.ReceitaRequest;
import br.com.FinanceAi.Backend.entity.Receita;
import br.com.FinanceAi.Backend.repository.ReceitaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import br.com.FinanceAi.Backend.exception.ResourceNotFoundException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReceitaService {

    private final ReceitaRepository receitaRepository;

    @Transactional
    public Receita cadastrar(
            ReceitaRequest request,
            Long usuarioId
    ) {

        Receita receita = Receita.builder()
                .descricao(request.descricao())
                .valor(request.valor())
                .data(request.data())
                .usuarioId(usuarioId)
                .ativo(true)
                .build();

        return receitaRepository.save(receita);
    }

    public List<Receita> listar(Long usuarioId) {

        return receitaRepository
                .findByUsuarioIdAndAtivoTrueOrderByDataDesc(usuarioId);
    }

    public Receita buscarPorId(
            Long id,
            Long usuarioId
    ) {

        return receitaRepository
                .findByIdAndUsuarioIdAndAtivoTrue(id, usuarioId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Receita não encontrada."
                        )
                );
    }

    @Transactional
    public Receita atualizar(
            Long id,
            ReceitaRequest request,
            Long usuarioId
    ) {

        Receita receita = buscarPorId(id, usuarioId);

        receita.setDescricao(request.descricao());
        receita.setValor(request.valor());
        receita.setData(request.data());

        return receitaRepository.save(receita);
    }

    @Transactional
    public void excluir(
            Long id,
            Long usuarioId
    ) {

        Receita receita = buscarPorId(id, usuarioId);

        receita.setAtivo(false);

        receitaRepository.save(receita);
    }
}