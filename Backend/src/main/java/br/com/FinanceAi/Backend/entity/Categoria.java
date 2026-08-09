package br.com.FinanceAi.Backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "categorias")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Categoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome; // ex: comida, transporte

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoCategoria tipo; // DESPESA ou RECEITA

    @Column(nullable = false)
    @Builder.Default
    private boolean padrao = false; // true = categoria do sistema, ex: Outros

    public enum TipoCategoria {
        DESPESA,
        RECEITA
    }
}