package br.com.FinanceAi.Backend.service;

import br.com.FinanceAi.Backend.dto.request.FinChatRequest;
import br.com.FinanceAi.Backend.dto.response.FinChatResponse;
import br.com.FinanceAi.Backend.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FinChatService {

    private final ChatClient.Builder chatClientBuilder;
    private final ObjectMapper objectMapper;
    private final ContaRepository contaRepository;
    private final MovimentacaoRepository movimentacaoRepository;
    private final DividaRepository dividaRepository;
    private final ItemCompraRepository itemCompraRepository;
    private final DiarioRepository diarioRepository;
    private final DespesaRepository despesaRepository;
    private final ReceitaRepository receitaRepository;

    public FinChatResponse chat(Long usuarioId, FinChatRequest request) {
        try {
            ChatClient chatClient = chatClientBuilder.build();

            // Coletar dados do banco do usuário (resumo para economizar tokens e ser mais direto)
            var contas = contaRepository.findByUsuarioIdOrderByNomeAsc(usuarioId);
            var movimentacoesRecentes = movimentacaoRepository.findByUsuarioIdAndAtivoTrueOrderByDataDescCriadoEmDesc(usuarioId)
                    .stream().limit(20).collect(Collectors.toList());
            var dividas = dividaRepository.findByUsuarioIdOrderByCriadoEmDesc(usuarioId);
            var itensCompra = itemCompraRepository.findByUsuarioIdAndAtivoTrueOrderByDataDescCriadoEmDesc(usuarioId);
            var diario = diarioRepository.findByUsuarioIdAndAtivoTrueOrderByDataDescCriadoEmDesc(usuarioId)
                    .stream().limit(5).collect(Collectors.toList());
            var receitasAtivas = receitaRepository.findByUsuarioIdAndAtivoTrueOrderByDataDesc(usuarioId);
            var despesasAtivas = despesaRepository.findByUsuarioIdAndAtivoTrueOrderByDataDesc(usuarioId);

            var dadosUsuario = Map.of(
                    "contas", contas.stream().map(c -> Map.<String, Object>of("nome", c.getNome(), "saldo", c.getSaldo())).collect(Collectors.toList()),
                    "movimentacoes_recentes", movimentacoesRecentes.stream().map(m -> Map.<String, Object>of("descricao", m.getDescricao(), "valor", m.getValor(), "tipo", m.getTipo().name())).collect(Collectors.toList()),
                    "dividas", dividas.stream().map(d -> Map.<String, Object>of("descricao", d.getDescricao(), "valor", d.getSaldoDevedor(), "valor_parcela", d.getValorParcela() != null ? d.getValorParcela() : 0, "status", d.getStatus())).collect(Collectors.toList()),
                    "lista_compras", itensCompra.stream().map(i -> Map.<String, Object>of("nome", i.getNome(), "valor_estimado", i.getPrecoEstimado(), "comprado", i.isComprado())).collect(Collectors.toList()),
                    "diario_recente", diario.stream().map(d -> Map.<String, Object>of("titulo", d.getTitulo(), "conteudo", d.getConteudo(), "tipo", d.getTipo().name())).collect(Collectors.toList()),
                    "receitas", receitasAtivas.stream().map(r -> Map.<String, Object>of("descricao", r.getDescricao(), "valor", r.getValor())).collect(Collectors.toList()),
                    "despesas", despesasAtivas.stream().map(d -> Map.<String, Object>of("descricao", d.getDescricao(), "valor", d.getValor())).collect(Collectors.toList())
            );

            String dadosJson = objectMapper.writeValueAsString(dadosUsuario);

            String systemText = """
                    Você é o Fin, um assistente de inteligência artificial financeira da plataforma FinanceAI.
                    Seu objetivo é ajudar o usuário a analisar sua saúde financeira, avaliar possibilidades de compras,
                    identificar economias e responder dúvidas sobre finanças pessoais.

                    Abaixo estão os DADOS FINANCEIROS atuais do usuário:
                    %s

                    Regras:
                    1. Use esses dados para basear sua resposta (veja o saldo, receitas e despesas).
                    2. Se o usuário perguntar se 'cabe no bolso' uma compra parcelada, avalie o saldo mensal (Receitas - Despesas - Parcelas de dívidas).
                    3. Seja conciso, direto e amigável.
                    4. Formate a resposta em Markdown legível.
                    """
                    .formatted(dadosJson);

            List<Message> mensagensIa = new ArrayList<>();
            mensagensIa.add(new SystemMessage(systemText));

            // Histórico (se houver)
            if (request.historico() != null) {
                for (var hist : request.historico()) {
                    if ("user".equalsIgnoreCase(hist.papel())) {
                        mensagensIa.add(new UserMessage(hist.conteudo()));
                    } else if ("assistant".equalsIgnoreCase(hist.papel())) {
                        mensagensIa.add(new AssistantMessage(hist.conteudo()));
                    }
                }
            }

            mensagensIa.add(new UserMessage(request.mensagem()));

            Prompt prompt = new Prompt(mensagensIa);

            String respostaIa = chatClient.prompt(prompt).call().content();

            return new FinChatResponse(respostaIa);

        } catch (Exception e) {
            throw new RuntimeException("Falha ao processar o chat com o Fin: " + e.getMessage(), e);
        }
    }
}
