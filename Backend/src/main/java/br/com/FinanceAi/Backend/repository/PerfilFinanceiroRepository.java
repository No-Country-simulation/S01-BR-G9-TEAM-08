package br.com.FinanceAi.Backend.repository;

import br.com.FinanceAi.Backend.entity.PerfilFinanceiro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PerfilFinanceiroRepository
        extends JpaRepository<PerfilFinanceiro, Long> {

    Optional<PerfilFinanceiro>
    findTopByUsuarioIdOrderByDataClassificacaoDesc(Long usuarioId);

    Optional<PerfilFinanceiro>
    findByAnaliseId(Long analiseId);
}