package br.com.FinanceAi.Backend.entity;

import br.com.FinanceAi.Backend.ai.PerfilFinanceiroEnum;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "perfis_financeiros")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerfilFinanceiro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_perfil", nullable = false, length = 50)
    private PerfilFinanceiroEnum tipoPerfil;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String justificativa;

    @Column(name = "data_classificacao", nullable = false, updatable = false)
    private LocalDateTime dataClassificacao;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(name = "analise_id", nullable = false, unique = true)
    private Long analiseId;

    @PrePersist
    protected void aoPersistir() {
        if (dataClassificacao == null) {
            dataClassificacao = LocalDateTime.now();
        }
    }
}