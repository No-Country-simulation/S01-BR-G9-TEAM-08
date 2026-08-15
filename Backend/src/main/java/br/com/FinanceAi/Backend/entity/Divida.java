package br.com.FinanceAi.Backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "dividas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Divida {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String descricao;

    @Column(name = "valor_original", nullable = false, precision = 14, scale = 2)
    private BigDecimal valorOriginal;

    @Column(name = "saldo_devedor", nullable = false, precision = 14, scale = 2)
    private BigDecimal saldoDevedor;

    @Column(name = "valor_parcela", nullable = false, precision = 14, scale = 2)
    private BigDecimal valorParcela;

    @Column(name = "parcelas_restantes", nullable = false)
    private Integer parcelasRestantes;

    @Builder.Default
    @Column(name = "taxa_juros", nullable = false, precision = 5, scale = 2)
    private BigDecimal taxaJuros = BigDecimal.ZERO;

    @Column(name = "data_vencimento", length = 50)
    private String dataVencimento;

    @Builder.Default
    @Column(nullable = false, length = 30)
    private String status = "Em dia";

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @CreationTimestamp
    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;
}
