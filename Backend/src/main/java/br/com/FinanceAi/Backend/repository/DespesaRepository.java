package br.com.FinanceAi.Backend.repository;

import br.com.FinanceAi.Backend.entity.Despesa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DespesaRepository extends JpaRepository<Despesa, Long> {

    List<Despesa> findByUsuarioIdOrderByDataDesc(Long usuarioId);

    List<Despesa> findByUsuarioIdAndDataBetweenOrderByDataDesc(
            Long usuarioId,
            LocalDate dataInicio,
            LocalDate dataFim
    );
}