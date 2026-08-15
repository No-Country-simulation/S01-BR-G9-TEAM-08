package br.com.FinanceAi.Backend.repository;

import br.com.FinanceAi.Backend.entity.AnaliseFinanceira;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AnaliseFinanceiraRepository
        extends JpaRepository<AnaliseFinanceira, Long> {

    Optional<AnaliseFinanceira>
    findTopByUsuarioIdOrderByDataProcessamentoDesc(Long usuarioId);
}