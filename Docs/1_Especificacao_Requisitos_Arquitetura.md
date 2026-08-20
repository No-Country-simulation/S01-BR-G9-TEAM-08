# FinGuardian AI - Especificação de Requisitos e Arquitetura do Sistema

## 1. Visão Geral
Esta seção apresenta os requisitos funcionais e não funcionais do FinGuardian AI.
Cada requisito funcional possui identificador único, nome, descrição, prioridade, dependências, critérios de aceitação e regras de negócio relacionadas.

A aplicação encontra-se atualmente em produção, hospedada em uma máquina virtual (VM) na Oracle Cloud Infrastructure (OCI), acessível através do domínio **finguardian.com.br** gerenciado pelo Cloudflare.

## 2. Requisitos Funcionais

### RF01 — Cadastrar Usuário
- **Prioridade:** Alta
- **Dependências:** Banco de dados e mecanismo seguro de hash de senhas.
- **Descrição:** O sistema deve permitir que novos usuários criem uma conta informando nome, endereço de e-mail válido e senha. Após a validação, os dados devem ser armazenados de forma segura.
- **Critérios de Aceitação:**
  - Nome, e-mail e senha devem ser obrigatórios.
  - O e-mail deve possuir formato válido.
  - O e-mail deve ser exclusivo.
  - Uma tentativa de cadastro com e-mail já utilizado deve ser recusada.
  - A senha não deve ser armazenada em texto puro, mas processada por um algoritmo seguro de hash (ex: BCrypt).
  - O sistema deve confirmar o cadastro bem-sucedido.
  - Dados inválidos devem gerar resposta controlada.
  - A resposta não deve expor detalhes internos da aplicação.
- **Regras de Negócio Relacionadas:** RN01 — Isolamento de Dados; RN09 — Unicidade de E-mail.

### RF02 — Autenticar Usuário
- **Prioridade:** Alta
- **Dependências:** RF01 e mecanismo de autenticação JWT.
- **Descrição:** O sistema deve permitir que usuários cadastrados realizem a autenticação utilizando e-mail e senha. Após a validação das credenciais, o sistema deve gerar um token JWT (Bearer) para autenticar as requisições subsequentes.
- **Critérios de Aceitação:**
  - E-mail e senha devem ser obrigatórios.
  - O sistema deve localizar o usuário pelo e-mail.
  - A senha informada deve ser comparada com o hash armazenado.
  - Credenciais válidas devem gerar um token JWT com tempo de expiração.
  - Credenciais inválidas devem gerar mensagem genérica (não informar qual credencial está incorreta).
  - Endpoints protegidos devem exigir um token válido.
  - Tokens ausentes, inválidos ou expirados devem impedir o acesso (HTTP 401).
  - Usuários autenticados sem permissão devem ter o acesso recusado (HTTP 403).
- **Regras de Negócio Relacionadas:** RN01 — Isolamento de Dados.

### RF03 — Registrar Receita
- **Prioridade:** Alta
- **Dependências:** RF02.
- **Descrição:** O sistema deve permitir que o usuário autenticado registre entradas financeiras informando descrição, valor e data. A receita deve ser vinculada automaticamente ao usuário autenticado (através do token JWT).
- **Critérios de Aceitação:**
  - A descrição, valor e data devem ser obrigatórios.
  - O valor deve ser numérico e maior que zero.
  - A data deve possuir formato ISO 8601 válido.
  - O usuário não deve cadastrar receitas para outra conta.
  - A receita deve ser persistida como registro ativo.
  - A receita deve participar do cálculo imediato do saldo.
  - Os indicadores do Dashboard devem ser atualizados.
- **Regras de Negócio Relacionadas:** RN01, RN02, RN04, RN07.

### RF04 — Registrar Despesa
- **Prioridade:** Alta
- **Dependências:** RF02 e RF09.
- **Descrição:** O sistema deve permitir que o usuário autenticado registre saídas financeiras informando descrição, valor e data. A descrição deve ser submetida ao processo de classificação automática utilizando a Inteligência Artificial.
- **Critérios de Aceitação:**
  - Descrição, valor e data devem ser obrigatórios.
  - O valor deve ser numérico, maior que zero (armazenado como valor absoluto positivo).
  - A descrição deve ser submetida à classificação automática do módulo de IA.
  - Caso nenhuma categoria seja identificada pela IA ou a IA falhe, deve ser utilizada a categoria padrão "Outros".
  - A indisponibilidade da IA não deve impedir o cadastro.
  - A despesa deve participar do cálculo do saldo e dos gastos.
- **Regras de Negócio Relacionadas:** RN01, RN03, RN04, RN05, RN07.

### RF05 — Editar Receita
- **Prioridade:** Alta
- **Dependências:** RF02, RF03 e RF10.
- **Descrição:** O sistema deve permitir que o usuário autenticado altere integralmente (PUT) a descrição, o valor e a data de uma receita previamente cadastrada.
- **Critérios de Aceitação:**
  - A receita deve existir e estar ativa.
  - A receita deve pertencer exclusivamente ao usuário autenticado.
  - O valor atualizado deve ser maior que zero.
  - O saldo financeiro deve ser recalculado imediatamente.
  - Uma receita inexistente ou de outro usuário deve gerar erro apropriado (404 ou 403).
- **Regras de Negócio Relacionadas:** RN01, RN02, RN04, RN07, RN08.

### RF06 — Editar Despesa
- **Prioridade:** Alta
- **Dependências:** RF02, RF04, RF09 e RF11.
- **Descrição:** O sistema deve permitir que o usuário autenticado altere integralmente (PUT) a descrição, o valor e a data de uma despesa previamente cadastrada. Quando a descrição for alterada, a classificação automática (IA) deve ser executada novamente.
- **Critérios de Aceitação:**
  - A despesa deve existir e estar ativa.
  - A despesa deve pertencer ao usuário autenticado.
  - A alteração da descrição deve acionar nova classificação via IA.
  - Caso a classificação falhe, deve ser utilizada a categoria "Outros".
  - O saldo e os indicadores devem ser recalculados.
- **Regras de Negócio Relacionadas:** RN01, RN03, RN04, RN05, RN07, RN08.

### RF07 — Excluir Receita
- **Prioridade:** Alta
- **Dependências:** RF02, RF03 e RF10.
- **Descrição:** O sistema deve permitir que o usuário autenticado exclua logicamente uma receita pertencente à sua conta.
- **Critérios de Aceitação:**
  - A receita deve ser marcada como inativa no banco de dados.
  - A receita não deve mais aparecer nas consultas de registros ativos nem participar do cálculo do saldo.
  - A exclusão de registro de outro usuário deve ser bloqueada.
- **Regras de Negócio Relacionadas:** RN01, RN04, RN07, RN08.

### RF08 — Excluir Despesa
- **Prioridade:** Alta
- **Dependências:** RF02, RF04 e RF11.
- **Descrição:** O sistema deve permitir que o usuário autenticado exclua logicamente uma despesa pertencente à sua conta.
- **Critérios de Aceitação:**
  - A despesa deve ser marcada como inativa no banco de dados.
  - O valor não deve mais participar dos cálculos de gastos ou do saldo.
  - A exclusão deve refletir imediatamente no Dashboard.
- **Regras de Negócio Relacionadas:** RN01, RN04, RN07, RN08.

### RF09 — Classificar Despesa Automaticamente
- **Prioridade:** Alta
- **Dependências:** Módulo de Inteligência Artificial e cadastro de categorias.
- **Descrição:** O sistema deve analisar a descrição informada durante o cadastro ou edição de uma despesa e identificar a categoria mais adequada (ex: "Uber" -> "Transporte").
- **Critérios de Aceitação:**
  - O processo deve ocorrer de forma automática e transparente.
  - A alteração da descrição executa nova classificação.
  - Falhas na IA não devem quebrar o cadastro da despesa (fallback para "Outros").
  - Somente a descrição (sem dados sensíveis do usuário) é enviada para inferência.
- **Regras de Negócio Relacionadas:** RN01, RN05, RN06.

### RF10 — Consultar Receitas
- **Prioridade:** Alta
- **Dependências:** RF02 e RF03.
- **Descrição:** O sistema deve permitir que o usuário autenticado consulte as receitas ativas pertencentes à sua conta.
- **Critérios de Aceitação:**
  - Apenas receitas ativas do respectivo usuário devem ser listadas.
  - Deve retornar lista vazia caso não haja receitas.
- **Regras de Negócio Relacionadas:** RN01, RN08.

### RF11 — Consultar Despesas
- **Prioridade:** Alta
- **Dependências:** RF02 e RF04.
- **Descrição:** O sistema deve permitir que o usuário autenticado consulte as despesas ativas pertencentes à sua conta.
- **Critérios de Aceitação:**
  - Apenas despesas ativas do respectivo usuário devem ser listadas, acompanhadas de suas categorias.
  - Deve retornar lista vazia caso não haja despesas.
- **Regras de Negócio Relacionadas:** RN01, RN08.

### RF12 — Visualizar Dashboard e Indicadores
- **Prioridade:** Alta
- **Dependências:** RF02, RF10 e RF11.
- **Descrição:** O sistema deve permitir que o usuário autenticado visualize uma visão consolidada de sua situação financeira.
- **Critérios de Aceitação:**
  - Apenas dados do usuário autenticado devem ser compilados.
  - O saldo deve ser calculado em tempo real (Receitas Ativas - Despesas Ativas).
  - Devem ser apresentados totais de receitas, despesas, percentual de economia e gastos por categoria.
  - Caso não existam movimentações, totais e percentuais devem ser retornados como 0.
- **Regras de Negócio Relacionadas:** RN01, RN04, RN07, RN08, RN10.

### RF13 — Executar Análise Financeira
- **Prioridade:** Alta
- **Dependências:** RF02, RF12 e Módulo de Inteligência Artificial.
- **Descrição:** O usuário autenticado pode solicitar uma análise avançada das suas finanças. A API compila as transações ativas do usuário e envia para a IA, que retorna um diagnóstico do perfil financeiro e recomendações.
- **Critérios de Aceitação:**
  - A operação exige autenticação via JWT. O payload da requisição não precisa conter as transações (o backend as busca no banco).
  - O backend consolida os dados e os envia de forma segura à IA.
  - A IA classifica o perfil (Poupador, Endividado, etc.) e gera recomendações.
  - Se os dados forem insuficientes (ex: 0 transações), a API deve abortar a análise de forma controlada.
  - Se a IA estiver indisponível (HTTP 503), a operação falha de forma elegante sem perder as movimentações.
  - A análise bem-sucedida é persistida no banco, atrelando o perfil e recomendações à análise gerada.
- **Regras de Negócio Relacionadas:** RN01, RN06, RN10.

### RF14 — Consultar Recomendações
- **Prioridade:** Média
- **Dependências:** RF02, RF13.
- **Descrição:** O usuário autenticado deve poder listar as dicas e recomendações (geradas pela IA) atreladas à sua conta.
- **Critérios de Aceitação:**
  - Retorna o conteúdo da recomendação, prioridade, categoria relacionada e data de geração.
  - Exclusivo para o usuário dono da análise. Lista vazia caso nenhuma análise tenha gerado recomendações ainda.
- **Regras de Negócio Relacionadas:** RN01, RN06.

### RF15 — Consultar e Atualizar Perfil Cadastral
- **Prioridade:** Alta
- **Dependências:** RF01, RF02.
- **Descrição:** O usuário pode visualizar e atualizar seus dados base (Nome e E-mail).
- **Critérios de Aceitação:**
  - Ao atualizar o e-mail, deve ser verificado se o novo endereço não está sendo usado por outro usuário (RN09).
  - A alteração não permite edição de dados de outros usuários nem altera diretamente a senha sem passar pelo fluxo de troca específico.
- **Regras de Negócio Relacionadas:** RN01, RN09.

---

## 3. Requisitos Não Funcionais (RNF)

- **RNF01 (Segurança):** Hash bcrypt, JWT com expiração, chaves sensíveis salvas via variáveis de ambiente da OCI, nenhuma senha deve retornar na API.
- **RNF02 (Autenticação):** Filtro do Spring Security para interceptar todas rotas (exceto /auth).
- **RNF03 (Segregação de Dados):** Multi-tenancy lógico, as consultas na JPA devem ser obrigatoriamente vinculadas ao `usuario_id` extraído do JWT.
- **RNF04 (Desempenho):** Respostas sub-segundo para endpoints de CRUD.
- **RNF05 (Arquitetura):** Separação Controller -> Service -> Repository. O acesso ao módulo de IA ocorre por um serviço isolado.
- **RNF06 (Implantação):** Hospedado em Máquina Virtual na Oracle Cloud Infrastructure, com o domínio finguardian.com.br atrelado para segurança HTTPS via Cloudflare Tunnels.

---

## 4. Regras de Negócio Globais (RN)

1. **RN01 - Isolamento de Dados:** As queries devem sempre usar `AND usuario_id = ?`.
2. **RN02 / RN03 - Valores Absolutos:** O banco só armazena valores numéricos `> 0`. 
3. **RN04 - Cálculo do Saldo:** `SUM(receitas_ativas) - SUM(despesas_ativas)`.
4. **RN05 - IA Fallback:** Se a IA der timeout ou errar a categoria ao registrar uma despesa, atrelar a "Outros" automaticamente sem travar a requisição.
5. **RN08 - Soft Delete:** Transações deletadas são marcadas com um campo booleano `ativo = false` para retenção de log.

---

## 5. Casos de Uso e Diagramas
1. **UC01:** O usuário entra em `finguardian.com.br`, se cadastra, e o servidor (Spring Boot) encripta a senha com BCrypt e grava no PostgreSQL da OCI.
2. **UC02:** O usuário faz login, a API valida e retorna o Bearer JWT.
3. **UC03:** Com o JWT, o usuário submete um POST para registrar uma Despesa. O Backend chama a IA internamente. A IA devolve a categoria e tudo é salvo.
4. **UC04:** O usuário solicita no Dashboard uma Análise Financeira. O Backend busca os gastos de todo o período, passa para o modelo do Fin (IA), que calcula o Perfil (ex: Poupador) e gera as Recomendações personalizadas.

Esta especificação representa a totalidade da documentação técnica e de negócio que suporta a arquitetura de produção implantada atualmente no FinGuardian AI.
