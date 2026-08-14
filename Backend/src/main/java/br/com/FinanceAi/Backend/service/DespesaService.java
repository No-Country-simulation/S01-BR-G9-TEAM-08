package br.com.FinanceAi.Backend.service;

import br.com.FinanceAi.Backend.dto.request.DespesaRequest;
import br.com.FinanceAi.Backend.entity.Categoria;
import br.com.FinanceAi.Backend.entity.Despesa;
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

    @Transactional
    public Despesa cadastrar(
            DespesaRequest request,
            Long usuarioId
    ) {

        Categoria categoria = buscarCategoriaDespesa(request.categoriaId());

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
                        new IllegalArgumentException(
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

        Categoria categoria = buscarCategoriaDespesa(
                request.categoriaId()
        );

        despesa.setDescricao(request.descricao());
        despesa.setValor(request.valor());
        despesa.setData(request.data());
        despesa.setCategoria(categoria);

        return despesaRepository.save(despesa);
    }

    @Transactional
    public void excluir(
            Long id,
            Long usuarioId
    ) {

        Despesa despesa = buscarPorId(id, usuarioId);

        despesa.setAtivo(false);

        despesaRepository.save(despesa);
    }

    private Categoria buscarCategoriaDespesa(Long categoriaId) {

        Categoria categoria = categoriaRepository
                .findById(categoriaId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Categoria não encontrada."
                        )
                );

        if (categoria.getTipo() != Categoria.TipoCategoria.DESPESA) {
            throw new IllegalArgumentException(
                    "A categoria informada não é uma categoria de despesa."
            );
        }

        return categoria;
    }
}