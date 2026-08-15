package br.com.FinanceAi.Backend.repository;

import br.com.FinanceAi.Backend.entity.RecomendacaoFinanceira;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecomendacaoFinanceiraRepository
        extends JpaRepository<RecomendacaoFinanceira, Long> {

    List<RecomendacaoFinanceira>
    findByUsuarioIdOrderByDataGeracaoDesc(Long usuarioId);

    List<RecomendacaoFinanceira>
    findByAnaliseIdAndUsuarioIdOrderByDataGeracaoDesc(
            Long analiseId,
            Long usuarioId
    );
}