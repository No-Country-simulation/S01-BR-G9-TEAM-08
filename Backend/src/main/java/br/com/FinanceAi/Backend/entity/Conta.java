package br.com.FinanceAi.Backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "contas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Conta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, length = 100)
    private String instituicao;

    @Column(nullable = false, length = 50)
    private String tipo;

    @Builder.Default
    @Column(nullable = false, length = 10)
    private String moeda = "BRL";

    @Builder.Default
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal saldo = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "limite_credito", nullable = false, precision = 14, scale = 2)
    private BigDecimal limiteCredito = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "limite_cheque_especial", nullable = false, precision = 14, scale = 2)
    private BigDecimal limiteChequeEspecial = BigDecimal.ZERO;

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String status = "Ativa";

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @CreationTimestamp
    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;
}
