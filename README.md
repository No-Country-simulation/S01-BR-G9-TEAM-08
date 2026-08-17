<div align="center">

# 🚀 FinGuardian AI

### Plataforma inteligente para gestão financeira pessoal

![Java](https://img.shields.io/badge/Java-21-orange?logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?logo=springboot)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)
![Status](https://img.shields.io/badge/Status-Em%20Produ%C3%A7%C3%A3o-green)
![Oracle Cloud](https://img.shields.io/badge/Oracle_Cloud-OCI-F80000?logo=oracle)

</div>

---

## 📚 Índice

- 📝 [Sobre](#-sobre)
- 🎯 [Objetivos](#-objetivos)
- 📌 [Funcionalidades](#-funcionalidades)
- 🏗️ [Arquitetura](#️-arquitetura)
- 🌐 [Acesso e Hospedagem](#-acesso-e-hospedagem)
- 🚀 [Setup](#-setup)
- 👥 [Equipe](#-equipe)
- 🛠️ [Tecnologias](#️-tecnologias)
- 📂 [Estrutura](#-estrutura-do-projeto)
- 🔗 [Links](#-links)

---

## 📝 Sobre

O **FinGuardian AI** é uma plataforma de gestão financeira pessoal desenvolvida para auxiliar usuários no controle de receitas, despesas e indicadores financeiros. A aplicação incorpora recursos de inteligência artificial para fornecer recomendações e insights personalizados, promovendo uma gestão financeira mais consciente e eficiente.

O projeto foi desenvolvido no âmbito do **Oracle Next Education (ONE)**, em parceria com a **Alura**, durante o Hackathon realizado na plataforma **No Country**, integrando conhecimentos de Engenharia de Software e Inteligência de Dados para entregar uma solução moderna, escalável e centrada na experiência do usuário.


---

## 🎯 Objetivos

Este MVP busca:

- ✅ Registrar receitas e despesas.
- ✅ Organizar gastos por categorias.
- ✅ Exibir dashboards financeiros.
- ✅ Utilizar IA para gerar recomendações de economia (O assistente "Fin").
- ✅ Apresentar indicadores da saúde financeira do usuário.

---

## 📌 Funcionalidades

- 👤 Cadastro de usuários
- 💸 Registro de despesas
- 💰 Registro de receitas
- 📈 Dashboard financeiro
- 🤖 Recomendações personalizadas com IA (Fin)
- 📊 Relatórios financeiros detalhados
- 📔 Diário financeiro para metas e lembretes
- 🛒 Lista de compras integrada

---

## 🏗️ Arquitetura

A solução foi desenvolvida integrando conceitos de **Engenharia de Software** e **Inteligência de Dados**, utilizando uma arquitetura baseada em:

- Backend REST API
- Banco de Dados Relacional
- Integração entre serviços
- Camada de visualização (Frontend)

```text
                🌐 Frontend
                     │
               HTTP / REST
                     │
           ☕ Spring Boot API
                     │
         ┌───────────┴───────────┐
         │                       │
🤖 Serviço de IA          🐘 PostgreSQL
```
---

## 🌐 Acesso e Hospedagem

A nossa aplicação já está no ar! Ela foi hospedada de forma escalável utilizando uma **Máquina Virtual (VM) da Oracle Cloud Infrastructure (OCI)**. 

Você pode acessar o FinGuardian AI diretamente através do nosso domínio oficial:

🔗 **[www.finguardian.com.br](http://www.finguardian.com.br)**

---

## 🚀 Setup

### Pré-requisitos

- Java 21
- Maven 3.9+
- PostgreSQL 16+
- Git

### Instalação

```bash
git clone https://github.com/No-Country-simulation/S01-BR-G9-TEAM-08.git

cd S01-BR-G9-TEAM-08

mvn spring-boot:run
```

---

## 👥 Equipe

### 💻 Engenharia de Software

| Integrante | Função |
|------------|---------|
| Kelwin Antonio Zambarda Moreira | Backend Developer |
| Felipe Augusto Busamolin de Souza | Full Stack Developer |
| Cristian Mathias Francisco | Backend Developer |
| Alexander Ricardo Nunes | Backend Developer |
| Jose Romualdo | Backend Developer |

### 📊 Inteligência de Dados & BI

| Integrante | Função |
|------------|---------|
| Ludimila Rodrigues dos Santos | Data Scientist |
| Samuel Henrique Lima da Silva | BI Developer |

---

## 🛠️ Tecnologias

| Categoria | Tecnologias |
|-----------|-------------|
| Backend | Java 21, Spring Boot |
| Frontend | HTML5, CSS3, JavaScript |
| Banco de Dados | PostgreSQL |
| Cloud e Infraestrutura | Oracle Cloud Infrastructure (OCI VM) |
| Ferramentas | VS Code, GitHub, Trello, Postman, ChatGPT, Claude |

---

## 📂 Estrutura do Projeto

```text
📦 FinGuardian
┣ 📂 backend
┃ ┣ 📂 src
┃ ┣ 📂 docs
┃ ┗ 📜 pom.xml
┣ 📂 frontend
┣ 📂 database
┣ 📜 README.md
┗ 📜 .gitignore
```

---

## 🔗 Links

🌐 **Site Oficial:** [www.finguardian.com.br](http://www.finguardian.com.br)

📁 [**Repositório Github**](https://github.com/No-Country-simulation/S01-BR-G9-TEAM-08)

🎥 [**Demonstração no Youtube**](LINKYOUTUBE)

📋 [**Quadro Trello**](https://trello.com/b/RxKuz0ec/g9-equipe-08-brasil)

📄 [**Documentação**](https://docs.google.com/document/d/1y_H0BXH-ShkH-L08tipggLHcjtMfQp9gaxV049ceevA/edit?tab=t.0)

---

## 📅 Roadmap

- [x] Planejamento
- [x] Organização da equipe
- [x] Documentação inicial
- [x] Definição da arquitetura
- [x] Backend
- [x] Frontend
- [x] Integração
- [x] Deploy na Oracle Cloud (OCI)
- [ ] Testes automatizados

---


<div align="center">

### Desenvolvido por **G9-BR-Team 08**

**Simulação No Country • 2026**
</div>
