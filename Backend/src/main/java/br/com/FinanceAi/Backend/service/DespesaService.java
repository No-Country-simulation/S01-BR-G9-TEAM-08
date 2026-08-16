package br.com.FinanceAi.Backend.service;

import br.com.FinanceAi.Backend.dto.request.DespesaRequest;
import br.com.FinanceAi.Backend.entity.Categoria;
import br.com.FinanceAi.Backend.entity.Despesa;
import br.com.FinanceAi.Backend.exception.ResourceNotFoundException;
import br.com.FinanceAi.Backend.repository.CategoriaRepository;
import br.com.FinanceAi.Backend.repository.DespesaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DespesaService {

    private final DespesaRepository despesaRepository;
    private final CategoriaRepository categoriaRepository;
    private final ClassificadorCategoriaIA classificadorCategoriaIA;

    @Transactional
    public Despesa cadastrar(
            DespesaRequest request,
            Long usuarioId
    ) {

        Categoria categoria =
                classificarCategoria(request.descricao());

        Despesa despesa = Despesa.builder()
                .descricao(request.descricao())
                .valor(request.valor())
                .data(request.data())
                .categoria(categoria)
                .usuarioId(usuarioId)
                .origemIA(false)
                .ativo(true)
                .build();

        return despesaRepository.save(despesa);
    }

    public List<Despesa> listar(Long usuarioId) {

        return despesaRepository
                .findByUsuarioIdAndAtivoTrueOrderByDataDesc(usuarioId);
    }

    public List<Despesa> listarPorPeriodo(
            Long usuarioId,
            LocalDate dataInicio,
            LocalDate dataFim
    ) {

        if (dataInicio == null || dataFim == null) {
            throw new IllegalArgumentException(
                    "As datas inicial e final são obrigatórias."
            );
        }

        if (dataInicio.isAfter(dataFim)) {
            throw new IllegalArgumentException(
                    "A data inicial não pode ser posterior à data final."
            );
        }

        return despesaRepository
                .findByUsuarioIdAndAtivoTrueAndDataBetweenOrderByDataDesc(
                        usuarioId,
                        dataInicio,
                        dataFim
                );
    }

    public Despesa buscarPorId(
            Long id,
            Long usuarioId
    ) {

        return despesaRepository
                .findByIdAndUsuarioIdAndAtivoTrue(id, usuarioId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Despesa não encontrada."
                        )
                );
    }

    @Transactional
    public Despesa atualizar(
            Long id,
            DespesaRequest request,
            Long usuarioId
    ) {

        Despesa despesa = buscarPorId(id, usuarioId);

        boolean descricaoAlterada =
                !despesa.getDescricao()
                        .equalsIgnoreCase(request.descricao());

        despesa.setDescricao(request.descricao());
        despesa.setValor(request.valor());
        despesa.setData(request.data());

        if (descricaoAlterada) {

            Categoria novaCategoria =
                    classificarCategoria(request.descricao());

            despesa.setCategoria(novaCategoria);
        }

        return despesaRepository.save(despesa);
    }

    @Transactional
    public void excluir(
            Long id,
            Long usuarioId
    ) {

        Despesa despesa = buscarPorId(id, usuarioId);

        despesaRepository.delete(despesa);
    }

    private Categoria classificarCategoria(String descricao) {

        List<Categoria> categorias =
                categoriaRepository.findByTipo(
                        Categoria.TipoCategoria.DESPESA
                );

        if (categorias.isEmpty()) {
            throw new IllegalStateException(
                    "Nenhuma categoria de despesa cadastrada."
            );
        }

        List<String> nomesCategorias = categorias.stream()
                .map(Categoria::getNome)
                .toList();

        String nomeClassificado =
                classificadorCategoriaIA.classificar(
                        descricao,
                        nomesCategorias
                );

        return categorias.stream()
                .filter(categoria ->
                        categoria.getNome()
                                .equalsIgnoreCase(nomeClassificado))
                .findFirst()
                .orElseGet(() ->
                        categorias.stream()
                                .filter(categoria ->
                                        categoria.getNome()
                                                .equalsIgnoreCase("Outros"))
                                .findFirst()
                                .orElseThrow(() ->
                                        new IllegalStateException(
                                                "Categoria Outros não encontrada."
                                        )
                                )
                );
    }
}