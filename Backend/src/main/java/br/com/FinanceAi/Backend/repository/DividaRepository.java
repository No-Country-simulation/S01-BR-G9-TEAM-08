package br.com.FinanceAi.Backend.repository;

import br.com.FinanceAi.Backend.entity.Divida;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DividaRepository extends JpaRepository<Divida, Long> {
    List<Divida> findByUsuarioIdOrderByCriadoEmDesc(Long usuarioId);
    Optional<Divida> findByIdAndUsuarioId(Long id, Long usuarioId);
}
