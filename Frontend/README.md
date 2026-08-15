# FinGuardian AI — Frontend local

Frontend acadêmico do FinGuardian AI, criado com arquivos simples e editáveis. A interface segue a identidade visual e as telas definidas no protótipo do projeto.

## Tecnologias

- HTML5
- CSS3
- JavaScript puro (ES6+)
- `localStorage` para manter os dados demonstrativos no navegador

Não há framework, etapa de compilação, hospedagem ou dependência obrigatória de serviço externo.

## Estrutura

```text
frontend/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── app.js
├── assets/
└── README.md
```

## Como executar

### Abrindo diretamente

Abra o arquivo `index.html` em um navegador moderno.

### Pelo VS Code

1. Abra a pasta `frontend` no VS Code.
2. Instale a extensão Live Server, caso ainda não tenha.
3. Clique com o botão direito em `index.html`.
4. Escolha **Open with Live Server**.

O endereço exibido pelo Live Server, normalmente `http://127.0.0.1:5500`, existe apenas no seu computador enquanto a extensão estiver em execução. Isso não publica o projeto na internet.

## O que está implementado

- Login e cadastro demonstrativos
- Dashboard financeiro responsivo
- Cadastro, consulta e filtragem de movimentações
- Registro por texto com simulação de IA e confirmação editável
- Formulário manual e tela demonstrativa de scanner
- Contas financeiras e dívidas
- Análise financeira, indicadores, alertas e recomendações
- Diário financeiro
- Lista de compras com conversão em despesa
- Perfil do usuário
- Navegação lateral no desktop e inferior no celular

## Dados e integração

Esta versão funciona inteiramente no navegador. Os dados ficam no `localStorage`, e a análise por IA é simulada em JavaScript para fins de protótipo.

Quando o backend estiver disponível, os métodos do objeto `StorageService` e o simulador `AiEngine`, em `js/app.js`, poderão ser substituídos por chamadas ao contrato oficial da API definido pela equipe. Nenhum endereço de API foi presumido neste frontend.

## Onde editar

- Identidade visual, espaçamentos e responsividade: `css/styles.css`
- Conteúdo e estrutura das telas: `index.html`
- Regras, dados demonstrativos e interações: `js/app.js`

As cores principais ficam nas variáveis `:root` do CSS:

```css
--color-primary: #0F766E;
--color-primary-dark: #0F3D3E;
--color-secondary: #1D4ED8;
--color-bg-main: #F7FAFC;
```

O projeto prioriza a fonte Inter quando ela estiver instalada no computador e usa fontes do sistema como alternativa, sem carregar uma fonte externa.

## GitHub

A pasta pode ser versionada e enviada ao GitHub normalmente. Publicar o código no repositório não exige hospedar a interface; ela continuará sendo executada localmente até que a equipe decida configurar uma hospedagem.
