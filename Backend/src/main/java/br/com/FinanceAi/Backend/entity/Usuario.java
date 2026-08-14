package br.com.FinanceAi.Backend.entity;

import br.com.FinanceAi.Backend.entity.enums.SituacaoConta;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, length = 100, unique = true)
    private String email;

    @Column(nullable = false)
    private String senha;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private OffsetDateTime dataCadastro;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SituacaoConta situacaoConta = SituacaoConta.ATIVO;

}
