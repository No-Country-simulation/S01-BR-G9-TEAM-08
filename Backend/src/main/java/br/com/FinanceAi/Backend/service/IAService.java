package br.com.FinanceAi.Backend.service;

import org.springframework.stereotype.Service;

@Service
public class IAService {

    public String processarTextoUsuario(String texto) {
        // Exemplo de resposta em JSON
        return """
               {
                 "perfil_financeiro": "Em observacao",
                 "probabilidade": 0.82,
                 "resumo_gastos": {
                   "alimentacao": 420,
                   "transporte": 300,
                   "entretenimento": 40
                 },
                 "recomendacoes": [
                   "Monitorar gastos recorrentes de entretenimento",
                   "Aumentar reserva financeira mensal"
                 ]
               }
               """;
    }
}