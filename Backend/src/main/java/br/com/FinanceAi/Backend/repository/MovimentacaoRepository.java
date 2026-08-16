package br.com.FinanceAi.Backend.repository;

import br.com.FinanceAi.Backend.entity.Movimentacao;
import br.com.FinanceAi.Backend.entity.enums.TipoMovimentacaoEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MovimentacaoRepository extends JpaRepository<Movimentacao, Long> {

    List<Movimentacao> findByUsuarioIdAndAtivoTrueOrderByDataDescCriadoEmDesc(Long usuarioId);

    List<Movimentacao> findByUsuarioIdAndTipoAndAtivoTrueOrderByDataDescCriadoEmDesc(Long usuarioId, TipoMovimentacaoEnum tipo);

    List<Movimentacao> findByUsuarioIdAndAtivoTrueAndDataBetweenOrderByDataDescCriadoEmDesc(Long usuarioId, LocalDate dataInicio, LocalDate dataFim);

    Optional<Movimentacao> findByIdAndUsuarioIdAndAtivoTrue(Long id, Long usuarioId);
}
