package br.com.FinanceAi.Backend.repository;

import br.com.FinanceAi.Backend.entity.ItemCompra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemCompraRepository extends JpaRepository<ItemCompra, Long> {

    List<ItemCompra>
    findByUsuarioIdAndAtivoTrueOrderByDataDescCriadoEmDesc(
            Long usuarioId
    );

    Optional<ItemCompra>
    findByIdAndUsuarioIdAndAtivoTrue(
            Long id,
            Long usuarioId
    );

    List<ItemCompra>
    findByUsuarioIdAndAtivoTrueAndCompradoTrueAndNaoComprarNovamenteFalse(
            Long usuarioId
    );
}