package br.com.FinanceAi.Backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "recomendacoes_financeiras")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecomendacaoFinanceira {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String conteudo;

    @Column(nullable = false, length = 30)
    private String prioridade;

    @Column(name = "categoria_relacionada", length = 100)
    private String categoriaRelacionada;

    @Column(name = "data_geracao", nullable = false, updatable = false)
    private LocalDateTime dataGeracao;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(name = "analise_id", nullable = false)
    private Long analiseId;

    @PrePersist
    protected void aoPersistir() {
        if (dataGeracao == null) {
            dataGeracao = LocalDateTime.now();
        }
    }
}