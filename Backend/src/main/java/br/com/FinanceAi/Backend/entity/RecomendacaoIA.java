package br.com.FinanceAi.Backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "recomendacoes_ia")
@Getter
@Setter
public class RecomendacaoIA {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Texto que o usuário enviou para a IA
    @Column(nullable = false, columnDefinition = "TEXT")
    private String textoOriginal;

    // Resposta completa recebida da IA
    @Column(nullable = false, columnDefinition = "TEXT")
    private String respostaIaJson;

    // O que a IA entendeu que deve ser criado
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoResultadoIA tipoResultado;

    // Momento em que a interação aconteceu
    @Column(nullable = false)
    private LocalDateTime dataHora;

    // Temporário até a entidade Usuario do Jose estar disponível
    @Column(nullable = false)
    private Long usuarioId;

    @PrePersist
    public void prePersist() {
        if (dataHora == null) {
            dataHora = LocalDateTime.now();
        }
    }

    public enum TipoResultadoIA {
        TRANSACAO,
        LEMBRETE,
        ANOTACAO
    }
}