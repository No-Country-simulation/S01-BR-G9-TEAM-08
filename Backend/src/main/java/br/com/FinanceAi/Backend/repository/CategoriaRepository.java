package br.com.FinanceAi.Backend.repository;

import br.com.FinanceAi.Backend.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    List<Categoria> findByTipo(Categoria.TipoCategoria tipo);
}