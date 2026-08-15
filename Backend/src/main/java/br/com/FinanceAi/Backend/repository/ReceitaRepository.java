package br.com.FinanceAi.Backend.repository;

import br.com.FinanceAi.Backend.entity.Receita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReceitaRepository extends JpaRepository<Receita, Long> {

    List<Receita> findByUsuarioIdAndAtivoTrueOrderByDataDesc(Long usuarioId);

    Optional<Receita> findByIdAndUsuarioIdAndAtivoTrue(
            Long id,
            Long usuarioId
    );
}