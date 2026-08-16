package br.com.FinanceAi.Backend.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record ResultadoAnaliseDetalhadaIA(

        // Perfil financeiro detalhado
        PerfilFinanceiroDetalhado perfilFinanceiro,

        // Análises específicas
        AnaliseGastos analiseGastos,
        AnaliseReceitas analiseReceitas,
        AnaliseContas analiseContas,
        AnaliseDividas analiseDividas,
        AnaliseListaCompras analiseListaCompras,

        // Recomendações priorizadas
        List<RecomendacaoDetalhada> recomendacoes

) {

    public record PerfilFinanceiroDetalhado(
            String tipo,
            String justificativa,
            String pontuacaoSaude,
            List<String> pontosFortes,
            List<String> pontosMelhoria
    ) {}

    public record AnaliseGastos(
            String resumo,
            List<CategoriaAnalise> categoriasCriticas,
            List<CategoriaAnalise> categoriasDestaque,
            String padraoComportamental
    ) {}

    public record CategoriaAnalise(
            String categoria,
            String analise,
            String recomendacao
    ) {}

    public record AnaliseReceitas(
            String resumo,
            String estabilidade,
            List<String> oportunidadesAumento
    ) {}

    public record AnaliseContas(
            String resumo,
            List<String> alertas,
            List<String> otimizacoes
    ) {}

    public record AnaliseDividas(
            String resumo,
            String nivelEndividamento,
            List<String> estrategiaPagamento,
            List<String> alertasVencimento
    ) {}

    public record AnaliseListaCompras(
            String resumo,
            BigDecimal impactoOrcamentario,
            List<String> itensPrioritarios,
            List<String> itensAdiaveis
    ) {}

    public record RecomendacaoDetalhada(
            String prioridade,
            String categoria,
            String titulo,
            String descricao,
            String impactoEsperado,
            List<String> acoesSugeridas
    ) {}
}
