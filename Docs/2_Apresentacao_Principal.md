# FinGuardian AI - Documentação Principal do Sistema

## 1. Introdução
### 1.1 Contexto
O crescimento das plataformas financeiras aumentou a quantidade de informações disponíveis aos usuários, no entanto, muitos ainda encontram dificuldades para identificar padrões de consumo, avaliar o comprometimento da renda e controlar o orçamento. O FinGuardian AI atua exatamente nesta lacuna, utilizando Inteligência Artificial para interpretar dados e entregar respostas fáceis de compreender.

### 1.2 Objetivo do Projeto
Desenvolvido para o Hackathon Alura + No Country (G9-TEAM-08), o FinGuardian AI é agora um produto maduro e em produção, operando via Oracle Cloud Infrastructure (OCI). Seu foco principal é analisar o comportamento financeiro do usuário pessoa física, categorizar despesas com IA e recomendar melhorias.

---

## 2. Visão Geral do Sistema
A arquitetura do FinGuardian AI é composta por serviços modulares:
- **Aplicação Web (Frontend):** Responsável por prover uma interface rica e intuitiva. Interage via HTTP com o Backend.
- **API REST (Backend Core):** Construída com **Java 21 e Spring Boot**, protege os acessos, aplica regras de negócios (isolamento de dados) e atua como ponte com a IA.
- **Banco de Dados (PostgreSQL):** Base relacional hospedada com segurança, garantindo armazenamento de contas e movimentações de longo prazo.
- **Módulo de IA:** Scripts em Python integrados ao motor da aplicação, interpretam transações, definem perfis (ex: Gastador, Poupador) e geram recomendações dinâmicas.

---

## 3. Objetivos
Permitir cadastro, gestão financeira diária (receitas e despesas), processamento autônomo com IA para categorização sem esforço manual, e disponibilização de um "Dashboard" com a real saúde financeira do cliente. Tudo com máxima disponibilidade através da nuvem (OCI).

---

## 4. Escopo
### 4.1 Funcionalidades do MVP (Concluídas)
As seguintes funcionalidades compõem o escopo principal lançado e já em ambiente de produção:
- Cadastro de usuários e autenticação segura via JWT;
- Cadastro, edição, consulta e exclusão lógica de receitas;
- Cadastro, edição, consulta e exclusão lógica de despesas;
- Classificação automática e inteligente das despesas pelo agente Fin (IA);
- Cálculo de indicadores financeiros determinísticos no Backend (saldo, gastos percentuais);
- Geração de análise avançada via módulo de IA (inferência sobre a saúde financeira);
- Classificação do perfil financeiro e geração de recomendações de economia;
- Dashboard financeiro consolidado em interface responsiva;
- API REST robusta integrada à persistência em banco de dados;
- Implantação e integração completa com infraestrutura em nuvem na Oracle Cloud (OCI) sob o domínio **www.finguardian.com.br**.

### 4.2 Funcionalidades Futuras
Funcionalidades que não compõem o MVP atual, mas estão no backlog evolutivo:
- Exportação de relatórios (PDF e Excel).
- Definição manual de metas financeiras guiadas.
- Integração de movimentações (Open Finance ou leitura de notificações bancárias locais).
- Notificações de alerta via e-mail sobre quebra de orçamentos ou gastos anormais.

---

## 5. Público-Alvo
O sistema é desenhado para pessoas físicas, sobretudo aquelas sem forte letramento financeiro, que precisam de uma ferramenta simples que "faça o trabalho duro" por elas — como categorizar os gastos automaticamente e gerar um panorama direto e orientativo através da Inteligência Artificial.

---

## 11. Banco de Dados (Persistência)
### 11.1 Visão Geral
O banco de dados PostgreSQL foi modelado para garantir integridade e isolamento de informações (multi-tenancy por coluna `usuario_id`). Todas as deleções em transações são lógicas (soft-delete, usando `ativo=false`) para permitir auditoria e reversão.

### 11.2 Entidades e Relacionamentos Principais
- **Usuário:** `1:N` Receita, `1:N` Despesa, `1:N` Análise, `1:N` Perfil e `1:N` Recomendação. Armazena o hash Bcrypt da senha.
- **Categoria:** Entidade estática/descritiva de domínio para agrupamentos (Alimentação, Transporte). `1:N` Despesa.
- **Análise Financeira:** Entidade transacional que guarda um registro consolidado da requisição de diagnóstico enviada à IA.

---

## 13. Módulo de Inteligência Artificial (O "Fin")
- **Responsabilidades:** A Inteligência Artificial (motor em Python) é o cérebro que classifica semanticamente cada despesa baseada apenas em sua descrição (evitando uso de chaves sensíveis) e, quando solicitado, avalia toda a série histórica do usuário para diagnosticar padrões.
- **Processamento no Pipeline:** Ao salvar uma despesa via API Java, a IA intercepta os dados, classifica-a, e o Java salva o resultado no banco. Caso a IA falhe por instabilidade na rede, o fallback da categoria para "Outros" é acionado sem penalizar a usabilidade do cliente.

---

## 14. Interface do Usuário (Design)
- A interface segue uma estrutura de Dashboard minimalista, pensada para mobile e desktop (Totalmente Responsiva). 
- O fluxo básico leva o usuário do Login diretamente para a visão geral. Os cadastros de Receita e Despesa são desenhados para demandar poucos cliques (já que a IA resolve a categorização).
- Os alertas (avisos do Fin) possuem hierarquia de cor para priorizar atenção aos problemas graves (comprometimento de renda alto).

---

## 15. Estratégia de Testes
O projeto FinGuardian AI utiliza testes automatizados para as principais regras de negócios na camada de serviço do Spring Boot (testes unitários com JUnit/Mockito), validando a proteção dos dados (isolamento de usuário) e os fallbacks em caso de indisponibilidade da IA. Foram executados testes manuais de integração simulando cargas básicas no deploy final da OCI para garantia de disponibilidade.

---

## 16. Tecnologias Utilizadas (Stack Oficial)
- **Camada de Apresentação:** HTML5, CSS3, JavaScript.
- **Camada de Negócio e API:** Java 21, Spring Boot, Spring Security (JWT).
- **Camada de Persistência:** PostgreSQL 16, Spring Data JPA.
- **Módulo de IA:** Python, Scikit-Learn, APIs Analíticas.
- **Infraestrutura e Deploy:** Hospedado integralmente em Oracle Cloud Infrastructure (OCI VM).

---

## 17. Implantação (Deploy)
A aplicação atingiu o nível de produção.
- **Provedor:** Oracle Cloud Infrastructure.
- **Recursos:** Compute Instance (VM Linux) rodando os contêineres e aplicações (Backend, IA, e Banco de Dados) orquestrados de forma segura e acessível externamente via configuração de VCN e Security Lists.
- **Domínio Público:** Acessível mundialmente através de **[www.finguardian.com.br](http://www.finguardian.com.br)**, utilizando HTTPS.

---

## 18. Roadmap do Projeto (Status Atual)
- **[x] Planejamento e Arquitetura:** Concluído.
- **[x] Construção do Banco e API REST:** Concluído.
- **[x] Construção da Interface Frontend:** Concluído.
- **[x] Integração da Classificação de IA:** Concluído.
- **[x] Relatórios Avançados pela IA (Análises):** Concluído.
- **[x] Implantação e Publicação Oficial em Nuvem (OCI):** Concluído.

O projeto MVP encontra-se 100% estabilizado e atendendo a sua proposta de valor original idealizada no hackathon.

---

## 19. Referências Técnicas
- Documentação Oracle Cloud (IAAS): https://docs.oracle.com/en-us/iaas/
- Documentação Java 21: https://docs.oracle.com/en/java/javase/21/
- Especificações do Spring Framework: https://spring.io/
- Documentação PostgreSQL: https://www.postgresql.org/docs/
