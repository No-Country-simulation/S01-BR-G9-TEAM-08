package br.com.FinanceAi.Backend.service;

import br.com.FinanceAi.Backend.dto.request.ItemCompraRequest;
import br.com.FinanceAi.Backend.entity.ItemCompra;
import br.com.FinanceAi.Backend.exception.ResourceNotFoundException;
import br.com.FinanceAi.Backend.repository.ItemCompraRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ItemCompraService {

    private final ItemCompraRepository itemCompraRepository;

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

        item.setAtivo(false);

        itemCompraRepository.save(item);
    }
}