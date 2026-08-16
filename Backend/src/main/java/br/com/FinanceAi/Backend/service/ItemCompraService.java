package br.com.FinanceAi.Backend.service;

import br.com.FinanceAi.Backend.dto.request.ItemCompraRequest;
import br.com.FinanceAi.Backend.dto.request.LancamentoComprasRequest;
import br.com.FinanceAi.Backend.entity.Categoria;
import br.com.FinanceAi.Backend.entity.Despesa;
import br.com.FinanceAi.Backend.entity.ItemCompra;
import br.com.FinanceAi.Backend.exception.ResourceNotFoundException;
import br.com.FinanceAi.Backend.repository.CategoriaRepository;
import br.com.FinanceAi.Backend.repository.DespesaRepository;
import br.com.FinanceAi.Backend.repository.ItemCompraRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ItemCompraService {

    private final ItemCompraRepository itemCompraRepository;
    private final DespesaRepository despesaRepository;
    private final CategoriaRepository categoriaRepository;

    @Transactional
    public ItemCompra cadastrar(
            ItemCompraRequest request,
            Long usuarioId
    ) {

        ItemCompra item = ItemCompra.builder()
                .nome(request.nome())
                .observacao(request.observacao())
                .data(request.data())
                .quantidade(request.quantidade())
                .prioridade(request.prioridade())
                .precoEstimado(request.precoEstimado())
                .precoPago(request.precoPago())
                .comprado(request.comprado())
                .naoComprarNovamente(request.naoComprarNovamente())
                .usuarioId(usuarioId)
                .ativo(true)
                .build();

        return itemCompraRepository.save(item);
    }

    public List<ItemCompra> listar(Long usuarioId) {

        return itemCompraRepository
                .findByUsuarioIdAndAtivoTrueOrderByDataDescCriadoEmDesc(
                        usuarioId
                );
    }

    public ItemCompra buscarPorId(
            Long id,
            Long usuarioId
    ) {

        return itemCompraRepository
                .findByIdAndUsuarioIdAndAtivoTrue(id, usuarioId)
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Item da lista de compras não encontrado."
                        )
                );
    }

    @Transactional
    public ItemCompra atualizar(
            Long id,
            ItemCompraRequest request,
            Long usuarioId
    ) {

        ItemCompra item = buscarPorId(id, usuarioId);

        item.setNome(request.nome());
        item.setObservacao(request.observacao());
        item.setData(request.data());
        item.setQuantidade(request.quantidade());
        item.setPrioridade(request.prioridade());
        item.setPrecoEstimado(request.precoEstimado());
        item.setPrecoPago(request.precoPago());
        item.setComprado(request.comprado());
        item.setNaoComprarNovamente(
                request.naoComprarNovamente()
        );

        return itemCompraRepository.save(item);
    }

    @Transactional
    public void excluir(
            Long id,
            Long usuarioId
    ) {

        ItemCompra item = buscarPorId(id, usuarioId);

        itemCompraRepository.delete(item);
    }

    @Transactional
    public Despesa lancarItensPagos(
            LancamentoComprasRequest request,
            Long usuarioId
    ) {

        List<ItemCompra> itens =
                itemCompraRepository
                        .findByUsuarioIdAndAtivoTrueAndCompradoTrueAndNaoComprarNovamenteFalse(
                                usuarioId
                        );

        if (itens.isEmpty()) {
            throw new IllegalArgumentException(
                    "Nenhum item comprado disponível para lançamento."
            );
        }

        BigDecimal total = itens.stream()
                .map(item -> {

                    BigDecimal valorUnitario =
                            item.getPrecoPago().compareTo(BigDecimal.ZERO) > 0
                                    ? item.getPrecoPago()
                                    : item.getPrecoEstimado();

                    return valorUnitario.multiply(
                            BigDecimal.valueOf(item.getQuantidade())
                    );
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (total.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "O valor total da compra deve ser maior que zero."
            );
        }

        Categoria categoria = categoriaRepository
                .findByTipo(Categoria.TipoCategoria.DESPESA)
                .stream()
                .filter(item ->
                        item.getNome()
                                .equalsIgnoreCase(request.categoria())
                )
                .findFirst()
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Categoria de despesa não encontrada."
                        )
                );

        Despesa despesa = Despesa.builder()
                .descricao("Compras de Mercado (Lista de Compras)")
                .valor(total)
                .data(request.data())
                .categoria(categoria)
                .usuarioId(usuarioId)
                .origemIA(false)
                .ativo(true)
                .build();

        Despesa despesaSalva =
                despesaRepository.save(despesa);

        itens.forEach(item ->
                item.setAtivo(false)
        );

        itemCompraRepository.saveAll(itens);

        return despesaSalva;
    }
}