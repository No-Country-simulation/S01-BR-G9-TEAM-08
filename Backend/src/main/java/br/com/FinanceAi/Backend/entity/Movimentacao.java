package br.com.FinanceAi.Backend.entity;

import br.com.FinanceAi.Backend.entity.enums.TipoMovimentacaoEnum;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "movimentacoes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Movimentacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TipoMovimentacaoEnum tipo;

    @Column(nullable = false, length = 255)
    private String descricao;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal valor;

    @Column(nullable = false)
    private LocalDate data;

    @Column(length = 100)
    private String categoria;

    @Column(length = 100)
    private String subcategoria;

    @Column(name = "conta_origem_id")
    private Long contaOrigemId;

    @Column(name = "conta_origem_nome", length = 100)
    private String contaOrigemNome;

    @Column(name = "conta_destino_id")
    private Long contaDestinoId;

    @Column(name = "conta_destino_nome", length = 100)
    private String contaDestinoNome;

    @Column(name = "forma_pagamento", length = 50)
    private String formaPagamento;

    @Builder.Default
    @Column(length = 30)
    private String recorrencia = "Única";

    @Column(length = 500)
    private String observacoes;

    @Column(name = "saldo_real", precision = 14, scale = 2)
    private BigDecimal saldoReal;

    @Column(name = "motivo_ajuste", length = 255)
    private String motivoAjuste;

    @Builder.Default
    @Column(name = "origem_ia", nullable = false)
    private boolean origemIA = false;

    @Builder.Default
    @Column(nullable = false)
    private boolean ativo = true;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @CreationTimestamp
    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @PrePersist
    protected void aoPersistir() {
        if (criadoEm == null) {
            criadoEm = LocalDateTime.now();
        }
    }
}
