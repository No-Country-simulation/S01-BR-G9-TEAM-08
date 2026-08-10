package br.com.FinanceAi.Backend.repository;

import br.com.FinanceAi.Backend.entity.RecomendacaoIA;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecomendacaoIARepository
        extends JpaRepository<RecomendacaoIA, Long> {
}