package br.com.FinanceAi.Backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "analises_financeiras")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnaliseFinanceira {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "saldo_calculado", nullable = false, precision = 12, scale = 2)
    private BigDecimal saldoCalculado;

    @Column(name = "total_receitas", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalReceitas;

    @Column(name = "total_despesas", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalDespesas;

    @Column(name = "percentual_economia", nullable = false, precision = 8, scale = 2)
    private BigDecimal percentualEconomia;

    @Column(name = "comprometimento_renda", nullable = false, precision = 8, scale = 2)
    private BigDecimal comprometimentoRenda;

    @Column(name = "data_processamento", nullable = false, updatable = false)
    private LocalDateTime dataProcessamento;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @PrePersist
    protected void aoPersistir() {
        if (dataProcessamento == null) {
            dataProcessamento = LocalDateTime.now();
        }
    }
}