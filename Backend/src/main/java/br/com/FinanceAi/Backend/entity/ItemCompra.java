package br.com.FinanceAi.Backend.entity;

import br.com.FinanceAi.Backend.entity.enums.PrioridadeCompraEnum;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "itens_compra")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemCompra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String nome;

    @Column(columnDefinition = "TEXT")
    private String observacao;

    @Column(nullable = false)
    private LocalDate data;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantidade = 1;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private PrioridadeCompraEnum prioridade;

    @Column(
            name = "preco_estimado",
            nullable = false,
            precision = 12,
            scale = 2
    )
    @Builder.Default
    private BigDecimal precoEstimado = BigDecimal.ZERO;

    @Column(
            name = "preco_pago",
            nullable = false,
            precision = 12,
            scale = 2
    )
    @Builder.Default
    private BigDecimal precoPago = BigDecimal.ZERO;

    @Column(nullable = false)
    @Builder.Default
    private boolean comprado = false;

    @Column(name = "nao_comprar_novamente", nullable = false)
    @Builder.Default
    private boolean naoComprarNovamente = false;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(nullable = false)
    @Builder.Default
    private boolean ativo = true;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    @PrePersist
    protected void aoPersistir() {

        if (criadoEm == null) {
            criadoEm = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void aoAtualizar() {
        atualizadoEm = LocalDateTime.now();
    }
}