package br.com.FinanceAi.Backend.repository;

import br.com.FinanceAi.Backend.entity.Conta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContaRepository extends JpaRepository<Conta, Long> {
    List<Conta> findByUsuarioIdOrderByNomeAsc(Long usuarioId);
    Optional<Conta> findByIdAndUsuarioId(Long id, Long usuarioId);
    boolean existsByNomeIgnoreCaseAndUsuarioId(String nome, Long usuarioId);
}
