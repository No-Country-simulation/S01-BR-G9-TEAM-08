# FinGuardian AI - Documentação da API REST

## 1. Visão Geral e Padronização
Esta documentação detalha os contratos da API REST do **FinGuardian AI**, sistema hospedado e acessível na URL oficial de produção: **https://finguardian.com.br/api**

### 1.1 Autenticação e Segurança
A API utiliza JSON Web Tokens (JWT). Com exceção dos endpoints de registro e login, todas as requisições exigem o cabeçalho:
`Authorization: Bearer <seu_token>`

O Backend garante o **isolamento de dados (Multi-tenancy)** interceptando o JWT, de forma que o usuário não precisa passar seu próprio `usuario_id` no corpo das requisições; a API descobre a identidade de forma segura a partir do token.

### 1.2 Formatos e Códigos HTTP
- O corpo das requisições e respostas utiliza JSON (`Content-Type: application/json`).
- Respostas de Erro (Ex: 400, 401, 404) retornam um objeto padronizado contendo `status`, `error`, e `message`, sem expor stack traces.

---

## 2. Endpoints de Autenticação e Usuário

### POST `/auth/register`
Cadastra um novo usuário no sistema.
- **Autenticação:** Não exigida.
- **Corpo da Requisição:**
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "senhaSegura123"
}
```
- **Respostas:** 
  - `201 Created`: Retorna o ID, nome e e-mail.
  - `400 Bad Request`: Dados inválidos.
  - `409 Conflict`: E-mail já utilizado.

### POST `/auth/login`
Autentica o usuário e retorna o token de acesso.
- **Autenticação:** Não exigida.
- **Corpo da Requisição:**
```json
{
  "email": "joao@email.com",
  "senha": "senhaSegura123"
}
```
- **Respostas:** 
  - `200 OK`: Retorna o token JWT e tempo de expiração (`{ "token": "...", "tipo": "Bearer" }`).
  - `401 Unauthorized`: Credenciais incorretas (sem expor se o erro foi no e-mail ou na senha).

### GET `/usuarios/me` e PUT `/usuarios/me`
Permite consultar os próprios dados cadastrais e atualizá-los. Exige JWT.

---

## 3. Endpoints de Receitas
Todos os endpoints exigem Autenticação (JWT) e isolam dados estritamente do usuário logado.

### GET `/receitas`
Lista todas as receitas ativas do usuário.
- **Resposta Sucesso (`200 OK`):** Lista JSON com id, descrição, valor monetário e data.

### POST `/receitas`
Cadastra uma nova receita vinculada ao usuário autenticado.
- **Corpo da Requisição:**
```json
{
  "descricao": "Salário Mensal",
  "valor": 4500.00,
  "data": "2026-08-01"
}
```
- **Regras:** A descrição e a data são obrigatórios. O valor deve ser numérico e > 0.
- **Respostas:**
  - `201 Created`: Objeto da receita criada com seu ID persistido.
  - `400 Bad Request`: Validação falhou (ex: valor negativo).

### PUT `/receitas/{id}`
Atualiza integralmente uma receita pertencente ao usuário.
- **Corpo da Requisição:** Semelhante ao POST.
- **Regras:** A receita `{id}` precisa pertencer ao usuário logado, estar ativa e o valor deve ser > 0.
- **Respostas:**
  - `200 OK`: Receita atualizada.
  - `403 Forbidden` / `404 Not Found`: Usuário não é dono da receita ou receita não existe.

### DELETE `/receitas/{id}`
Realiza a exclusão lógica de uma receita pertencente ao usuário.
- **Regras:** A receita perde a flag de ativo, não entra mais nos cálculos de saldo e desaparece do GET, mas não é deletada fisicamente.
- **Respostas:**
  - `204 No Content`: Exclusão bem-sucedida (sem corpo de resposta).
  - `404 Not Found`: Receita inexistente ou não pertencente ao usuário.

---

## 4. Endpoints de Despesas
Endpoints protegidos (exigem JWT). As despesas sofrem ações de inferência por IA.

### GET `/despesas`
Lista todas as despesas ativas.
- **Resposta Sucesso (`200 OK`):** Retorna JSON com as propriedades, incluindo a `categoria` designada pela IA.

### POST `/despesas`
Cadastra e categoriza automaticamente uma despesa.
- **Corpo da Requisição:**
```json
{
  "descricao": "Corrida de aplicativo Uber",
  "valor": 32.50,
  "data": "2026-08-15"
}
```
- **Regras Específicas (Integração com IA):** 
  Ao receber este Payload, o Backend submete a `descricao` ao módulo da Inteligência Artificial. A IA retorna a categoria inferida (ex: "Transporte"). Se a IA estiver fora do ar ou não entender, salva-se na categoria "Outros". A requisição aguarda este processamento sincronicamente sem quebrar a persistência.
- **Respostas:**
  - `201 Created`: Retorna a despesa com seu novo ID e a `categoria` resolvida.

### PUT `/despesas/{id}`
Edita uma despesa e submete a nova descrição a uma recategorização via IA.
- **Regras:** O mesmo fluxo de IA aplicado no POST ocorre aqui se a descrição foi modificada. Restringe edição para apenas donos do registro.
- **Respostas:** `200 OK`, `400 Bad Request`, `404 Not Found`.

### DELETE `/despesas/{id}`
Exclusão lógica da despesa (Soft Delete), removendo-a dos cálculos de gastos do Dashboard.
- **Respostas:** `204 No Content` ou `404 Not Found`.

---

## 5. Endpoints de Análise e Consultas Consolidadas

### GET `/dashboard`
Retorna os indicadores calculados em tempo real do usuário, utilizando as movimentações ativas (saldo, % de economia e gastos segmentados por categoria).
- **Resposta Sucesso (`200 OK`):**
```json
{
  "saldo": 3023.60,
  "totalReceitas": 4300.00,
  "totalDespesas": 1276.40,
  "percentualEconomia": 70.32,
  "gastosPorCategoria": [
    { "categoria": "Transporte", "valor": 32.50, "percentual": 2.5 }
  ],
  "perfilFinanceiro": { "tipo": "Poupador", "dataAnalise": "2026-08-10T10:30:00Z" }
}
```
*Nota: Se o usuário não executou análises via IA ainda, `perfilFinanceiro` retorna `null`.*

### POST `/analise-financeira`
Aciona a IA para uma análise profunda do histórico de transações ativas do usuário.
- **Corpo da Requisição:** Vazio. O Backend pesquisa o banco de dados baseado no token JWT, anonimiza se necessário, e submete à IA.
- **Respostas:**
  - `200 OK`: Retorna as conclusões (Perfil Financeiro e Recomendações).
  - `400 Bad Request`: Caso existam 0 transações para análise.
  - `503 Service Unavailable`: Falha de conexão com a IA (Transações do usuário permanecem intactas).

### GET `/recomendacoes`
Busca todas as dicas e orientações passadas pela IA após rodar a `analise-financeira`.
- **Resposta Sucesso (`200 OK`):** 
Retorna a lista das últimas orientações (ex: "Cuidado com gastos em Transporte"), com suas prioridades (`ALTA`, `MEDIA`, `BAIXA`).
