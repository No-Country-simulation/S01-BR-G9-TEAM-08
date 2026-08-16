package br.com.FinanceAi.Backend.service;

import br.com.FinanceAi.Backend.dto.request.MovimentacaoRequest;
import br.com.FinanceAi.Backend.dto.response.MovimentacaoResponse;
import br.com.FinanceAi.Backend.entity.Categoria;
import br.com.FinanceAi.Backend.entity.Conta;
import br.com.FinanceAi.Backend.entity.Despesa;
import br.com.FinanceAi.Backend.entity.Movimentacao;
import br.com.FinanceAi.Backend.entity.Receita;
import br.com.FinanceAi.Backend.entity.enums.TipoMovimentacaoEnum;
import br.com.FinanceAi.Backend.exception.MovimentacaoNaoEncontradaException;
import br.com.FinanceAi.Backend.repository.CategoriaRepository;
import br.com.FinanceAi.Backend.repository.ContaRepository;
import br.com.FinanceAi.Backend.repository.DespesaRepository;
import br.com.FinanceAi.Backend.repository.MovimentacaoRepository;
import br.com.FinanceAi.Backend.repository.ReceitaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MovimentacaoService {

    private final MovimentacaoRepository movimentacaoRepository;
    private final ContaRepository contaRepository;
    private final ReceitaRepository receitaRepository;
    private final DespesaRepository despesaRepository;
    private final CategoriaRepository categoriaRepository;

    @Transactional
    public MovimentacaoResponse cadastrar(MovimentacaoRequest request, Long usuarioId) {
        TipoMovimentacaoEnum tipo = request.tipo() != null ? request.tipo() : TipoMovimentacaoEnum.DESPESA;
        BigDecimal valor = request.valor() != null ? request.valor() : BigDecimal.ZERO;
        LocalDate data = request.data() != null ? request.data() : LocalDate.now();

        Conta contaOrigem = buscarOuCriarConta(request.contaOrigemId(), request.contaOrigemNome(), usuarioId, "Carteira Principal");
        Conta contaDestino = null;

        if (tipo == TipoMovimentacaoEnum.TRANSFERENCIA) {
            contaDestino = buscarOuCriarConta(request.contaDestinoId(), request.contaDestinoNome(), usuarioId, "Conta Destino");
        }

        // Aplicar efeito no saldo das contas
        aplicarEfeitoSaldo(tipo, valor, request.saldoReal(), contaOrigem, contaDestino, 1);

        String nomeOrigem = contaOrigem != null ? contaOrigem.getNome() : (request.contaOrigemNome() != null ? request.contaOrigemNome() : "Carteira Principal");
        String nomeDestino = contaDestino != null ? contaDestino.getNome() : request.contaDestinoNome();
        Long idOrigem = contaOrigem != null ? contaOrigem.getId() : request.contaOrigemId();
        Long idDestino = contaDestino != null ? contaDestino.getId() : request.contaDestinoId();

        Movimentacao movimentacao = Movimentacao.builder()
                .tipo(tipo)
                .descricao(request.descricao().trim())
                .valor(valor)
                .data(data)
                .categoria(request.categoria() != null && !request.categoria().isBlank() ? request.categoria().trim() : (tipo == TipoMovimentacaoEnum.RECEITA ? "Receita" : "Geral"))
                .subcategoria(request.subcategoria() != null ? request.subcategoria().trim() : null)
                .contaOrigemId(idOrigem)
                .contaOrigemNome(nomeOrigem)
                .contaDestinoId(idDestino)
                .contaDestinoNome(nomeDestino)
                .formaPagamento(request.formaPagamento() != null ? request.formaPagamento().trim() : "PIX")
                .recorrencia(request.recorrencia() != null ? request.recorrencia().trim() : "Única")
                .observacoes(request.observacoes() != null ? request.observacoes().trim() : null)
                .saldoReal(request.saldoReal())
                .motivoAjuste(request.motivoAjuste() != null ? request.motivoAjuste().trim() : null)
                .origemIA(Boolean.TRUE.equals(request.origemIA()))
                .ativo(true)
                .usuarioId(usuarioId)
                .build();

        Movimentacao salva = movimentacaoRepository.save(movimentacao);

        // Manter sincronismo com as tabelas legadas de receitas e despesas para IA e dashboard
        sincronizarReceitaOuDespesa(salva, usuarioId);

        return MovimentacaoResponse.fromEntity(salva);
    }

    @Transactional(readOnly = true)
    public List<MovimentacaoResponse> listar(Long usuarioId) {
        return movimentacaoRepository.findByUsuarioIdAndAtivoTrueOrderByDataDescCriadoEmDesc(usuarioId)
                .stream()
                .map(MovimentacaoResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MovimentacaoResponse> listarPorTipo(Long usuarioId, TipoMovimentacaoEnum tipo) {
        return movimentacaoRepository.findByUsuarioIdAndTipoAndAtivoTrueOrderByDataDescCriadoEmDesc(usuarioId, tipo)
                .stream()
                .map(MovimentacaoResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MovimentacaoResponse> listarPorPeriodo(Long usuarioId, LocalDate dataInicio, LocalDate dataFim) {
        return movimentacaoRepository.findByUsuarioIdAndAtivoTrueAndDataBetweenOrderByDataDescCriadoEmDesc(usuarioId, dataInicio, dataFim)
                .stream()
                .map(MovimentacaoResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public MovimentacaoResponse buscarPorId(Long id, Long usuarioId) {
        Movimentacao movimentacao = movimentacaoRepository.findByIdAndUsuarioIdAndAtivoTrue(id, usuarioId)
                .orElseThrow(() -> new MovimentacaoNaoEncontradaException(id));
        return MovimentacaoResponse.fromEntity(movimentacao);
    }

    @Transactional
    public MovimentacaoResponse atualizar(Long id, MovimentacaoRequest request, Long usuarioId) {
        Movimentacao movimentacao = movimentacaoRepository.findByIdAndUsuarioIdAndAtivoTrue(id, usuarioId)
                .orElseThrow(() -> new MovimentacaoNaoEncontradaException(id));

        if (request.tipo() != null) movimentacao.setTipo(request.tipo());
        if (request.descricao() != null) movimentacao.setDescricao(request.descricao().trim());
        if (request.valor() != null) movimentacao.setValor(request.valor());
        if (request.data() != null) movimentacao.setData(request.data());
        if (request.categoria() != null) movimentacao.setCategoria(request.categoria().trim());
        if (request.subcategoria() != null) movimentacao.setSubcategoria(request.subcategoria().trim());
        if (request.formaPagamento() != null) movimentacao.setFormaPagamento(request.formaPagamento().trim());
        if (request.recorrencia() != null) movimentacao.setRecorrencia(request.recorrencia().trim());
        if (request.observacoes() != null) movimentacao.setObservacoes(request.observacoes().trim());
        if (request.saldoReal() != null) movimentacao.setSaldoReal(request.saldoReal());
        if (request.motivoAjuste() != null) movimentacao.setMotivoAjuste(request.motivoAjuste().trim());

        return MovimentacaoResponse.fromEntity(movimentacao);
    }

    @Transactional
    public void excluir(Long id, Long usuarioId) {
        Movimentacao movimentacao = movimentacaoRepository.findByIdAndUsuarioIdAndAtivoTrue(id, usuarioId)
                .orElseThrow(() -> new MovimentacaoNaoEncontradaException(id));

        Conta contaOrigem = null;
        if (movimentacao.getContaOrigemId() != null) {
            contaOrigem = contaRepository.findByIdAndUsuarioId(movimentacao.getContaOrigemId(), usuarioId).orElse(null);
        }
        Conta contaDestino = null;
        if (movimentacao.getContaDestinoId() != null) {
            contaDestino = contaRepository.findByIdAndUsuarioId(movimentacao.getContaDestinoId(), usuarioId).orElse(null);
        }

        // Reverte efeito no saldo
        aplicarEfeitoSaldo(movimentacao.getTipo(), movimentacao.getValor(), movimentacao.getSaldoReal(), contaOrigem, contaDestino, -1);

        movimentacaoRepository.delete(movimentacao);

        // Limpar registro sincronizado nas tabelas legadas
        try {
            if (movimentacao.getTipo() == TipoMovimentacaoEnum.RECEITA) {
                receitaRepository.findByUsuarioIdAndAtivoTrueOrderByDataDesc(usuarioId).stream()
                        .filter(r -> r.getDescricao().equals(movimentacao.getDescricao()) && r.getValor().compareTo(movimentacao.getValor()) == 0 && r.getData().equals(movimentacao.getData()))
                        .findFirst().ifPresent(receitaRepository::delete);
            } else if (movimentacao.getTipo() == TipoMovimentacaoEnum.DESPESA) {
                despesaRepository.findByUsuarioIdAndAtivoTrueOrderByDataDesc(usuarioId).stream()
                        .filter(d -> d.getDescricao().equals(movimentacao.getDescricao()) && d.getValor().compareTo(movimentacao.getValor()) == 0 && d.getData().equals(movimentacao.getData()))
                        .findFirst().ifPresent(despesaRepository::delete);
            }
        } catch (Exception e) {
            // Não bloqueia caso falhe a exclusão sincronizada
        }
    }

    private Conta buscarOuCriarConta(Long contaId, String contaNome, Long usuarioId, String nomePadrao) {
        if (contaId != null) {
            Optional<Conta> encontrada = contaRepository.findByIdAndUsuarioId(contaId, usuarioId);
            if (encontrada.isPresent()) {
                return encontrada.get();
            }
        }

        String nome = (contaNome != null && !contaNome.isBlank()) ? contaNome.trim() : nomePadrao;
        Optional<Conta> porNome = contaRepository.findByUsuarioIdOrderByNomeAsc(usuarioId)
                .stream()
                .filter(c -> c.getNome().equalsIgnoreCase(nome))
                .findFirst();

        if (porNome.isPresent()) {
            return porNome.get();
        }

        // Cria conta automaticamente se não existir
        Conta novaConta = Conta.builder()
                .nome(nome)
                .instituicao(nome)
                .tipo("Conta Corrente")
                .moeda("BRL")
                .saldo(BigDecimal.ZERO)
                .limiteCredito(BigDecimal.ZERO)
                .limiteChequeEspecial(BigDecimal.ZERO)
                .status("Ativa")
                .usuarioId(usuarioId)
                .build();

        return contaRepository.save(novaConta);
    }

    private void aplicarEfeitoSaldo(TipoMovimentacaoEnum tipo, BigDecimal valor, BigDecimal saldoReal, Conta origem, Conta destino, int direcao) {
        if (origem == null && destino == null) return;

        BigDecimal multiplicador = BigDecimal.valueOf(direcao);

        if (tipo == TipoMovimentacaoEnum.RECEITA && origem != null) {
            origem.setSaldo(origem.getSaldo().add(valor.multiply(multiplicador)));
            contaRepository.save(origem);
        } else if (tipo == TipoMovimentacaoEnum.DESPESA && origem != null) {
            origem.setSaldo(origem.getSaldo().subtract(valor.multiply(multiplicador)));
            contaRepository.save(origem);
        } else if (tipo == TipoMovimentacaoEnum.TRANSFERENCIA) {
            if (origem != null) {
                origem.setSaldo(origem.getSaldo().subtract(valor.multiply(multiplicador)));
                contaRepository.save(origem);
            }
            if (destino != null) {
                destino.setSaldo(destino.getSaldo().add(valor.multiply(multiplicador)));
                contaRepository.save(destino);
            }
        } else if (tipo == TipoMovimentacaoEnum.AJUSTE_SALDO && origem != null && saldoReal != null && direcao == 1) {
            origem.setSaldo(saldoReal);
            contaRepository.save(origem);
        }
    }

    private void sincronizarReceitaOuDespesa(Movimentacao m, Long usuarioId) {
        try {
            if (m.getTipo() == TipoMovimentacaoEnum.RECEITA) {
                Receita receita = Receita.builder()
                        .descricao(m.getDescricao())
                        .valor(m.getValor())
                        .data(m.getData())
                        .usuarioId(usuarioId)
                        .ativo(true)
                        .build();
                receitaRepository.save(receita);
            } else if (m.getTipo() == TipoMovimentacaoEnum.DESPESA) {
                Categoria categoria = obterOuCriarCategoria(m.getCategoria());
                Despesa despesa = Despesa.builder()
                        .descricao(m.getDescricao())
                        .valor(m.getValor())
                        .data(m.getData())
                        .categoria(categoria)
                        .usuarioId(usuarioId)
                        .origemIA(m.isOrigemIA())
                        .ativo(true)
                        .build();
                despesaRepository.save(despesa);
            }
        } catch (Exception e) {
            // Sincronização não bloqueia a criação da movimentação
        }
    }

    private Categoria obterOuCriarCategoria(String categoriaNome) {
        List<Categoria> categorias = categoriaRepository.findByTipo(Categoria.TipoCategoria.DESPESA);

        if (categoriaNome != null && !categoriaNome.isBlank()) {
            for (Categoria c : categorias) {
                if (c.getNome().equalsIgnoreCase(categoriaNome.trim())) {
                    return c;
                }
            }
        }

        if (!categorias.isEmpty()) {
            for (Categoria c : categorias) {
                if (c.getNome().equalsIgnoreCase("Outros")) {
                    return c;
                }
            }
            return categorias.get(0);
        }

        Categoria nova = Categoria.builder()
                .nome(categoriaNome != null && !categoriaNome.isBlank() ? categoriaNome.trim() : "Outros")
                .tipo(Categoria.TipoCategoria.DESPESA)
                .padrao(true)
                .build();
        return categoriaRepository.save(nova);
    }
}
