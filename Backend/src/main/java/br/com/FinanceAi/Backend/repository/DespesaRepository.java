package br.com.FinanceAi.Backend.repository;

import br.com.FinanceAi.Backend.entity.Despesa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DespesaRepository extends JpaRepository<Despesa, Long> {

    List<Despesa> findByUsuarioIdAndAtivoTrueOrderByDataDesc(Long usuarioId);

    List<Despesa> findByUsuarioIdAndAtivoTrueAndDataBetweenOrderByDataDesc(
            Long usuarioId,
            LocalDate dataInicio,
            LocalDate dataFim
    );

    Optional<Despesa> findByIdAndUsuarioIdAndAtivoTrue(
            Long id,
            Long usuarioId
    );
}