package br.com.FinanceAi.Backend.repository;

import br.com.FinanceAi.Backend.entity.DiarioFinanceiro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DiarioRepository extends JpaRepository<DiarioFinanceiro, Long> {

    List<DiarioFinanceiro>
    findByUsuarioIdAndAtivoTrueOrderByDataDescCriadoEmDesc(
            Long usuarioId
    );

    Optional<DiarioFinanceiro>
    findByIdAndUsuarioIdAndAtivoTrue(
            Long id,
            Long usuarioId
    );
}