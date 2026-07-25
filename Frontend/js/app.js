/* ==========================================================================
   FinGuardian AI - Core Application Engine (Vanilla JS ES6+ Figma Aligned)
   ========================================================================== */

(function () {
  'use strict';

  // --- Chaves do localStorage ---
  const STORAGE_KEYS = {
    USER: 'finguardian_user',
    ACCOUNTS: 'finguardian_accounts',
    TRANSACTIONS: 'finguardian_transactions',
    DEBTS: 'finguardian_debts',
    DIARY: 'finguardian_diary',
    SHOPPING: 'finguardian_shopping',
    ALERTS: 'finguardian_alerts',
    RECOMMENDATIONS: 'finguardian_recommendations',
    ANALYSIS_HISTORY: 'finguardian_analysis_history',
    PREFERENCES: 'finguardian_preferences',
    AUTH: 'finguardian_auth_token',
    COOKIE_CONSENT: 'finguardian_cookie_consent',
    LEGAL_CONSENT: 'finguardian_legal_consent',
    SECURITY: 'finguardian_security_preferences'
  };

  // --- Dados de Demonstração Iniciais (Figma Exact Values) ---
  const INITIAL_DEMO_DATA = {
    user: {
      name: 'Taniara Silva',
      email: 'taniara@email.com',
      monthlyIncome: 4500.00,
      profileStatus: 'EM OBSERVAÇÃO',
      confidenceScore: 82
    },
    accounts: [
      { id: 'acc_1', name: 'Nubank', institution: 'Nubank', type: 'conta corrente', currency: 'BRL', balance: 1850.00, creditLimit: 5000.00, overdraftLimit: 0.00, status: 'Ativa' },
      { id: 'acc_2', name: 'Banco Inter', institution: 'Banco Inter', type: 'conta corrente', currency: 'BRL', balance: 1000.00, creditLimit: 2500.00, overdraftLimit: 500.00, status: 'Ativa' },
      { id: 'acc_3', name: 'Reserva de emergência', institution: 'Tesouro Direto / Nubank', type: 'investimento', currency: 'BRL', balance: 2000.00, creditLimit: 0.00, overdraftLimit: 0.00, status: 'Ativa' }
    ],
    debts: [
      { id: 'debt_1', description: 'Empréstimo Pessoal Nubank', originalAmount: 8000.00, remainingBalance: 4200.00, installmentValue: 380.00, remainingInstallments: 12, interestRate: 1.99, dueDate: 'Dia 15', status: 'Em dia' }
    ],
    transactions: [
      { id: 'tx_1', type: 'RECEITA', description: 'Salário Mensal', category: 'Trabalho', subcategory: 'Salário', account: 'Banco Inter', date: '2026-07-05', amount: 4500.00, incomeType: 'Fixo', paymentMethod: 'PIX', obs: 'Salário ref. Julho' },
      { id: 'tx_2', type: 'RECEITA', description: 'Projeto Freelance UX', category: 'Freelance', subcategory: 'Design', account: 'Nubank', date: '2026-07-12', amount: 700.00, incomeType: 'Variável', paymentMethod: 'PIX', obs: 'Projeto de prototipação' },
      { id: 'tx_3', type: 'DESPESA', description: 'Aluguel do Apê', category: 'Moradia', subcategory: 'Aluguel', account: 'Nubank', date: '2026-07-10', amount: 1800.00, paymentMethod: 'Boleto', recurrence: 'Mensal', obs: 'Aluguel fixo' },
      { id: 'tx_4', type: 'DESPESA', description: 'Compras de Mercado', category: 'Alimentação', subcategory: 'Supermercado', account: 'Nubank', date: '2026-07-14', amount: 950.00, paymentMethod: 'Cartão de Débito', obs: 'Feira mensal' },
      { id: 'tx_5', type: 'DESPESA', description: 'Transporte por Aplicativo', category: 'Transporte', subcategory: 'Uber/99', account: 'Nubank', date: '2026-07-18', amount: 180.00, paymentMethod: 'Cartão de Crédito', obs: 'Viagens semanais' },
      { id: 'tx_6', type: 'DESPESA', description: 'Farmácia e Vitaminas', category: 'Saúde', subcategory: 'Medicamentos', account: 'Banco Inter', date: '2026-07-19', amount: 120.00, paymentMethod: 'Cartão de Débito', obs: 'Remédios do mês' },
      { id: 'tx_7', type: 'AJUSTE_SALDO', description: 'Rendimento da Reserva', category: 'Investimentos', account: 'Reserva de emergência', date: '2026-07-20', amount: 700.00, reason: 'Ajuste de rendimento CDB 100% CDI' }
    ],
    diary: [
      { id: 'note_1', title: 'Aporte Mensal na Reserva', content: 'Planejar aporte adicional de pelo menos R$ 300 assim que entrar o bônus.', type: 'planejamento', date: '2026-07-20' },
      { id: 'note_2', title: 'Gastos com iFood', content: 'Percebi que pedi comida 5 vezes esta semana. Meta: reduzir para no máximo 1x por semana.', type: 'reflexão', date: '2026-07-18' },
      { id: 'note_3', title: 'Quitar Empréstimo', content: 'Objetivo de amortizar 3 parcelas do empréstimo Nubank até o fim do semestre.', type: 'meta', date: '2026-07-15' },
      { id: 'note_4', title: 'Revisar Assinaturas', content: 'Cancelar streaming que não estou utilizando ativamente.', type: 'lembrete', date: '2026-07-10' }
    ],
    shopping: [
      { id: 'shop_1', title: 'Arroz Integral 5kg', quantity: 1, estimatedPrice: 28.50, actualPrice: 27.00, priority: 'Alta', purchased: true, doNotBuyAgain: false, obs: 'Marca habitual' },
      { id: 'shop_2', title: 'Azeite Extra Virgem', quantity: 2, estimatedPrice: 70.00, actualPrice: 65.00, priority: 'Média', purchased: true, doNotBuyAgain: false, obs: 'Em promoção no mercado' },
      { id: 'shop_3', title: 'Detergente Neutro', quantity: 4, estimatedPrice: 12.00, actualPrice: 11.80, priority: 'Baixa', purchased: false, doNotBuyAgain: false, obs: 'Kit 4 unidades' },
      { id: 'shop_4', title: 'Café Especial 500g', quantity: 1, estimatedPrice: 24.00, actualPrice: 24.00, priority: 'Média', purchased: false, doNotBuyAgain: false, obs: 'Grãos torrados' }
    ],
    alerts: [
      { id: 'alt_1', title: 'Gasto com Transporte Elevado', message: 'Seus gastos com Uber este mês subiram 25% em relação ao mês anterior.', level: 'atenção', date: '2026-07-22', read: false },
      { id: 'alt_2', title: 'Vencimento de Dívida Próximo', message: 'A parcela do empréstimo Nubank vence no dia 15.', level: 'atenção', date: '2026-07-21', read: false },
      { id: 'alt_3', title: 'Reserva de Emergência Operacional', message: 'Sua reserva atingiu 100% da meta de segurança recomendada para 3 meses.', level: 'positivo', date: '2026-07-20', read: true },
      { id: 'alt_4', title: 'Comprometimento de Renda Elevado', message: 'Suas despesas fixas atingiram 68% da sua renda mensal.', level: 'risco', date: '2026-07-19', read: false }
    ],
    recommendations: [
      { id: 'rec_1', title: 'Reservar R$ 200 no Próximo Mês', description: 'Automatizar uma transferência de R$ 200 para a Reserva de Emergência no dia do pagamento.', priority: 'Alta', origin: 'FinGuardian AI Core', accepted: false },
      { id: 'rec_2', title: 'Reduzir Alimentação Fora de Casa', description: 'Diminuir gastos com restaurantes de R$ 950 para R$ 700 mensais economizará R$ 3.000 ao ano.', priority: 'Média', origin: 'Análise de Padrão de Gastos', accepted: false },
      { id: 'rec_3', title: 'Renegociar Empréstimo Ativo', description: 'Verifique taxas de portabilidade de crédito para amortizar os juros de 1.99% a.m.', priority: 'Alta', origin: 'Módulo de Dívidas', accepted: false }
    ],
    analysisHistory: []
  };

  // --- Gerenciador de Armazenamento Local ---
  const StorageService = {
    /*
      PONTO DE INTEGRAÇÃO FUTURA
      Na etapa de integração, estes métodos poderão usar a API Spring Boot
      definida pela equipe. Até lá, o protótipo permanece totalmente local.
    */
    init: function () {
      if (!localStorage.getItem(STORAGE_KEYS.USER)) {
        this.resetAll();
      }
    },
    get: function (key) {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    },
    set: function (key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    },
    resetAll: function () {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(INITIAL_DEMO_DATA.user));
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(INITIAL_DEMO_DATA.accounts));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_DEMO_DATA.transactions));
      localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(INITIAL_DEMO_DATA.debts));
      localStorage.setItem(STORAGE_KEYS.DIARY, JSON.stringify(INITIAL_DEMO_DATA.diary));
      localStorage.setItem(STORAGE_KEYS.SHOPPING, JSON.stringify(INITIAL_DEMO_DATA.shopping));
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(INITIAL_DEMO_DATA.alerts));
      localStorage.setItem(STORAGE_KEYS.RECOMMENDATIONS, JSON.stringify(INITIAL_DEMO_DATA.recommendations));
      localStorage.setItem(STORAGE_KEYS.ANALYSIS_HISTORY, JSON.stringify(INITIAL_DEMO_DATA.analysisHistory));
      localStorage.setItem(STORAGE_KEYS.AUTH, 'demo_token_authenticated');
    }
  };

  // --- Estado Global ---
  const State = {
    user: null,
    accounts: [],
    transactions: [],
    debts: [],
    diary: [],
    shopping: [],
    alerts: [],
    recommendations: [],
    analysisHistory: [],
    currentView: 'dashboard',
    pendingAiSuggestion: null,

    reload: function () {
      this.user = StorageService.get(STORAGE_KEYS.USER);
      this.accounts = StorageService.get(STORAGE_KEYS.ACCOUNTS) || [];
      this.transactions = StorageService.get(STORAGE_KEYS.TRANSACTIONS) || [];
      this.debts = StorageService.get(STORAGE_KEYS.DEBTS) || [];
      this.diary = StorageService.get(STORAGE_KEYS.DIARY) || [];
      this.shopping = StorageService.get(STORAGE_KEYS.SHOPPING) || [];
      let shoppingDatesUpdated = false;
      this.shopping.forEach(item => {
        if (!item.date) {
          item.date = new Date().toISOString().split('T')[0];
          shoppingDatesUpdated = true;
        }
      });
      if (shoppingDatesUpdated) StorageService.set(STORAGE_KEYS.SHOPPING, this.shopping);
      this.alerts = StorageService.get(STORAGE_KEYS.ALERTS) || [];
      this.recommendations = StorageService.get(STORAGE_KEYS.RECOMMENDATIONS) || [];
      this.analysisHistory = StorageService.get(STORAGE_KEYS.ANALYSIS_HISTORY) || [];
    }
  };

  // --- Formatadores ---
  const Formatters = {
    currency: function (val) {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
    },
    date: function (dateStr) {
      if (!dateStr) return '';
      const parts = dateStr.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      return dateStr;
    }
  };

  // --- Simulador de Processamento de Linguagem Natural (IA) ---
  const AiEngine = {
    /*
      PONTO DE INTEGRAÇÃO FUTURA
      Este simulador poderá ser substituído pelo serviço de IA definido no
      contrato oficial da API, sem alterar a interface das telas.
    */
    analyzePrompt: function (text) {
      const lower = text.toLowerCase();
      let type = 'DESPESA';
      let amount = 35.00;
      let category = 'Alimentação';
      let paymentMethod = 'PIX';
      let account = 'Nubank';
      let description = 'Almoço';
      let confidence = 82;

      // Se contém padrões no texto
      const valMatch = text.match(/(?:R\$\s*)?(\d+(?:[.,]\d{1,2})?)/i);
      if (valMatch) {
        amount = parseFloat(valMatch[1].replace(',', '.'));
      }

      if (lower.includes('recebi') || lower.includes('ganhei') || lower.includes('salário')) {
        type = 'RECEITA';
        category = 'Trabalho';
        description = lower.includes('freelance')
          ? 'Trabalho freelance'
          : (lower.includes('salário') ? 'Salário' : 'Receita');
      }

      if (lower.includes('almoço') || lower.includes('jantar') || lower.includes('restaurante')) {
        category = 'Alimentação';
        description = 'Almoço';
      } else if (lower.includes('uber') || lower.includes('transporte')) {
        category = 'Transporte';
        description = 'Corrida de Transporte';
      }

      if (lower.includes('inter')) account = 'Banco Inter';

      return {
        type,
        amount,
        description,
        category,
        paymentMethod,
        account,
        confidenceScore: confidence,
        date: new Date().toISOString().split('T')[0]
      };
    }
  };

  // --- Renderização da Interface ---
  const Render = {
    all: function () {
      State.reload();
      this.dashboard();
      this.transactions();
      this.accounts();
      this.analysis();
      this.alerts();
      this.recommendations();
      this.diary();
      this.shopping();
      this.profile();
      this.updateUserHeader();
    },

    updateUserHeader: function () {
      const firstName = State.user.name.split(' ')[0];
      const elWelcome = document.getElementById('welcome-username');
      if (elWelcome) elWelcome.textContent = firstName;

      const elAvatar = document.querySelectorAll('.user-avatar-initials');
      elAvatar.forEach(el => el.textContent = 'TS');

      const elName = document.querySelectorAll('.user-name-display');
      elName.forEach(el => el.textContent = State.user.name);

      const elEmail = document.querySelectorAll('.user-email-display');
      elEmail.forEach(el => el.textContent = State.user.email);
    },

    dashboard: function () {
      const totalBalance = State.accounts.reduce((acc, a) => acc + (a.balance || 0), 0);
      const totalIncome = State.transactions.filter(t => t.type === 'RECEITA').reduce((acc, t) => acc + t.amount, 0);
      const totalExpense = State.transactions.filter(t => t.type === 'DESPESA').reduce((acc, t) => acc + t.amount, 0);
      const incomeCommitment = State.user.monthlyIncome ? Math.round((totalExpense / State.user.monthlyIncome) * 100) : 0;

      document.getElementById('dash-total-balance').textContent = Formatters.currency(totalBalance);
      document.getElementById('dash-total-income').textContent = Formatters.currency(totalIncome);
      document.getElementById('dash-total-expense').textContent = Formatters.currency(totalExpense);
      document.getElementById('dash-income-commitment').textContent = `${incomeCommitment}% comprometido da renda`;
      const debtEl = document.getElementById('dash-total-debt');
      if (debtEl) debtEl.textContent = Formatters.currency(State.debts.reduce((sum, debt) => sum + (debt.remainingBalance || 0), 0));
      const unreadEl = document.getElementById('dash-unread-alerts');
      if (unreadEl) unreadEl.textContent = State.alerts.filter(a => !a.read).length;
      const analysisCount = document.getElementById('dash-analysis-count');
      if (analysisCount) analysisCount.textContent = `${Math.max(1, State.analysisHistory.length)} análise${State.analysisHistory.length === 1 ? '' : 's'}`;

      // Barras de categoria com as cores do dashboard definido no Figma.
      const catTotals = {};
      const categoryThemes = {
        'Alimentação': 'category-alimentacao',
        'Moradia': 'category-moradia',
        'Transporte': 'category-transporte',
        'Saúde': 'category-saude',
        'Educação': 'category-educacao',
        'Lazer': 'category-lazer'
      };
      State.transactions.filter(t => t.type === 'DESPESA').forEach(t => {
        catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
      });

      const catContainer = document.getElementById('dash-category-breakdown');
      if (catContainer) {
        catContainer.innerHTML = '';
        const categories = Object.keys(catTotals);
        if (categories.length === 0) {
          catContainer.innerHTML = '<div class="empty-state">Nenhuma despesa registrada.</div>';
        } else {
          categories.forEach(cat => {
            const val = catTotals[cat];
            const pct = Math.min(100, Math.round((val / (totalExpense || 1)) * 100));
            const categoryTheme = categoryThemes[cat] || 'category-padrao';
            catContainer.innerHTML += `
              <div class="category-item ${categoryTheme}">
                <div class="category-info">
                  <span class="category-name">${cat}</span>
                  <span class="category-val">${Formatters.currency(val)} (${pct}%)</span>
                </div>
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill" style="width: ${pct}%"></div>
                </div>
              </div>
            `;
          });
        }
      }

      // Tabela simplificada Figma
      const recentTxs = [...State.transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
      const recentContainer = document.getElementById('dash-recent-transactions');
      if (recentContainer) {
        const typeLabels = { RECEITA: 'Receita', DESPESA: 'Despesa', TRANSFERENCIA: 'Transferência', AJUSTE_SALDO: 'Ajuste Saldo' };
        const typeColors = { RECEITA: 'var(--color-positive)', DESPESA: 'var(--color-risk)', TRANSFERENCIA: 'var(--color-secondary)', AJUSTE_SALDO: 'var(--color-warning)' };
        const typeSign  = { RECEITA: '+', DESPESA: '-', TRANSFERENCIA: '⇄', AJUSTE_SALDO: '~' };
        recentContainer.innerHTML = recentTxs.map((t, i) => `
          <tr style="animation: fadeSlideIn 0.3s ease both; animation-delay: ${i * 0.06}s">
            <td><span class="transaction-type ${t.type}">${typeLabels[t.type] || t.type}</span></td>
            <td><strong>${t.description}</strong></td>
            <td style="font-weight: 700; color: ${typeColors[t.type] || 'var(--color-text-main)'}">
              ${typeSign[t.type] || ''} ${Formatters.currency(t.amount)}
            </td>
          </tr>
        `).join('');
      }
    },

    transactions: function () {
      const container = document.getElementById('transactions-list-table');
      if (!container) return;

      const query = (document.getElementById('tx-search-input')?.value || '').toLowerCase();
      const activeFilter = document.querySelector('.transaction-filter-btn.active');
      const typeFilter = activeFilter?.dataset.transactionType || 'ALL';
      const accountFilter = document.getElementById('tx-account-filter')?.value || 'ALL';
      const categoryFilter = document.getElementById('tx-category-filter')?.value || 'ALL';
      const paymentFilter = document.getElementById('tx-payment-filter')?.value || 'ALL';
      const from = document.getElementById('tx-date-from')?.value || '';
      const to = document.getElementById('tx-date-to')?.value || '';

      let filtered = State.transactions.filter(t => {
        const matchesQuery = t.description.toLowerCase().includes(query) || t.category.toLowerCase().includes(query);
        const matchesType = typeFilter === 'ALL' || t.type === typeFilter;
        return matchesQuery && matchesType && (accountFilter === 'ALL' || t.account === accountFilter) && (categoryFilter === 'ALL' || t.category === categoryFilter) && (paymentFilter === 'ALL' || t.paymentMethod === paymentFilter) && (!from || t.date >= from) && (!to || t.date <= to);
      });

      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

      if (filtered.length === 0) {
        container.innerHTML = '<tr><td colspan="6" class="empty-state">Nenhuma movimentação encontrada.</td></tr>';
        return;
      }

      const typeLabels = { 'RECEITA': 'Receita', 'DESPESA': 'Despesa', 'TRANSFERENCIA': 'Transferência', 'AJUSTE_SALDO': 'Ajuste Saldo' };
      const typeSign = { 'RECEITA': '+', 'DESPESA': '-', 'TRANSFERENCIA': '⇄', 'AJUSTE_SALDO': '~' };
      const typeColors = { 'RECEITA': 'var(--color-positive)', 'DESPESA': 'var(--color-risk)', 'TRANSFERENCIA': 'var(--color-info)', 'AJUSTE_SALDO': 'var(--color-warning)' };

      container.innerHTML = filtered.map(t => `
        <tr>
          <td><span class="transaction-type ${t.type}">${typeLabels[t.type] || t.type}</span></td>
          <td><strong>${t.description}</strong></td>
          <td><span class="badge badge-info transaction-category">${t.category}</span></td>
          <td>${t.account}</td>
          <td>${Formatters.date(t.date)}</td>
          <td style="font-weight: 700; color: ${typeColors[t.type] || 'var(--color-text-main)'}">
            ${typeSign[t.type] || ''} ${Formatters.currency(t.amount)}
          </td>
          <td class="table-actions"><button type="button" class="btn btn-outline btn-xs tx-action" data-tx-action="details" data-id="${t.id}">Detalhes</button><button type="button" class="btn btn-outline btn-xs tx-action" data-tx-action="edit" data-id="${t.id}">Editar</button><button type="button" class="btn btn-danger btn-xs tx-action" data-tx-action="delete" data-id="${t.id}">Excluir</button></td>
        </tr>
      `).join('');
    },
    
    initFilters: function() {
      const fillFilter = (id, values, label) => {
        const select = document.getElementById(id);
        if (!select || select.dataset.initialized) return;
        const current = select.value;
        select.innerHTML = `<option value="ALL">${label}</option>` + [...new Set(values.filter(Boolean))].sort().map(v => `<option value="${v}">${v}</option>`).join('');
        if ([...select.options].some(o => o.value === current)) select.value = current;
        select.dataset.initialized = 'true';
      };
      fillFilter('tx-account-filter', State.accounts.map(a => a.name), 'Todas as contas');
      fillFilter('tx-category-filter', State.transactions.map(t => t.category), 'Todas as categorias');
      fillFilter('tx-payment-filter', State.transactions.map(t => t.paymentMethod), 'Todas as formas');
    },

    accounts: function () {
      const cardsContainer = document.getElementById('accounts-cards-grid');
      if (cardsContainer) {
        cardsContainer.innerHTML = State.accounts.map(acc => `
          <div class="card">
            <div class="card-header">
              <div class="card-title">${acc.name}</div>
              <span class="badge badge-accent">${acc.type}</span>
            </div>
            <p style="color: var(--color-text-muted); font-size: 0.85rem; margin-bottom: 1rem;">${acc.institution} • ${acc.currency}</p>
            <div style="font-size: 1.6rem; font-weight: 800; color: var(--color-primary-dark); margin-bottom: 0.75rem;">
              ${Formatters.currency(acc.balance)}
            </div>
            <div style="font-size: 0.8rem; color: var(--color-text-muted); display: flex; justify-content: space-between;">
              <span>Limite: ${Formatters.currency(acc.creditLimit)}</span>
              <span>Cheque: ${Formatters.currency(acc.overdraftLimit)}</span>
            </div>
            <div class="account-actions"><button type="button" class="btn btn-outline btn-xs account-action" data-account-action="edit" data-id="${acc.id}">Editar</button><button type="button" class="btn btn-outline btn-xs account-action" data-account-action="adjust" data-id="${acc.id}">Ajustar saldo</button><button type="button" class="btn btn-danger btn-xs account-action" data-account-action="deactivate" data-id="${acc.id}">${acc.status === 'Ativa' ? 'Desativar' : 'Reativar'}</button></div>
          </div>
        `).join('');
      }

      const debtsContainer = document.getElementById('debts-list-grid');
      if (debtsContainer) {
        debtsContainer.innerHTML = State.debts.map(d => `
          <div class="card" style="border-left: 4px solid var(--color-warning);">
            <div class="card-header">
              <div class="card-title">${d.description}</div>
              <span class="badge badge-warning">${d.status}</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.75rem; font-size: 0.875rem;">
              <div><span style="color: var(--color-text-muted)">Saldo Devedor:</span><br><strong>${Formatters.currency(d.remainingBalance)}</strong></div>
              <div><span style="color: var(--color-text-muted)">Original:</span><br><strong>${Formatters.currency(d.originalAmount)}</strong></div>
              <div><span style="color: var(--color-text-muted)">Parcela:</span><br><strong>${Formatters.currency(d.installmentValue)}</strong> (${d.remainingInstallments}x)</div>
              <div><span style="color: var(--color-text-muted)">Juros a.m.:</span><br><strong>${d.interestRate}%</strong></div>
            </div>
          </div>
        `).join('');
      }

      const accountSelects = document.querySelectorAll('.account-select-options');
      accountSelects.forEach(select => {
        select.innerHTML = State.accounts.map(a => `<option value="${a.name}">${a.name} (${Formatters.currency(a.balance)})</option>`).join('');
      });
    },

    analysis: function () {
      const income = State.transactions.filter(t => t.type === 'RECEITA').reduce((s, t) => s + (t.amount || 0), 0);
      const expenses = State.transactions.filter(t => t.type === 'DESPESA').reduce((s, t) => s + (t.amount || 0), 0);
      const debt = State.debts.reduce((s, d) => s + (d.remainingBalance || 0), 0);
      const commitment = State.user.monthlyIncome ? Math.round(expenses / State.user.monthlyIncome * 100) : 0;
      const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
      set('analysis-income', Formatters.currency(income)); set('analysis-expenses', Formatters.currency(expenses)); set('analysis-balance', Formatters.currency(income - expenses)); set('analysis-debt', Formatters.currency(debt)); set('analysis-commitment', `${commitment}%`); set('analysis-risk', commitment > 70 ? 'Atenção' : 'Baixo');
      const cats = {}; State.transactions.filter(t => t.type === 'DESPESA').forEach(t => cats[t.category] = (cats[t.category] || 0) + t.amount);
      const catSummary = document.getElementById('analysis-category-summary'); if (catSummary) catSummary.innerHTML = Object.entries(cats).sort((a,b) => b[1]-a[1]).slice(0,4).map(([name, value]) => `<span>${name}<strong>${Formatters.currency(value)}</strong></span>`).join('');
      const alertSummary = document.getElementById('analysis-alerts-summary'); if (alertSummary) alertSummary.innerHTML = State.alerts.filter(a => !a.read).slice(0,3).map(a => `<span class="analysis-alert-item">${a.title}</span>`).join('') || '<span>Nenhum alerta pendente.</span>';
      const history = document.getElementById('analysis-history-list'); if (history) history.innerHTML = State.analysisHistory.length ? State.analysisHistory.map(item => `<div class="analysis-history-row"><span>${Formatters.date(item.date)}</span><strong>${Formatters.currency(item.balance)}</strong><span>${item.profile}</span></div>`).join('') : '<p class="empty-state">Nenhuma análise salva ainda.</p>';
      // Os indicadores desta tela seguem a composição visual aprovada no Figma.
      // A etapa de integração com a API substituirá estes valores demonstrativos.
    },

    alerts: function () {
      const container = document.getElementById('alerts-list-container');
      if (!container) return;

      container.innerHTML = State.alerts.map(a => `
        <div class="card" style="border-left: 4px solid var(--color-${a.level === 'atenção' ? 'warning' : a.level === 'risco' ? 'risk' : a.level === 'positivo' ? 'positive' : 'secondary'}); opacity: ${a.read ? 0.7 : 1}">
          <div class="card-header">
            <div class="card-title">
              <span class="badge badge-${a.level === 'atenção' ? 'warning' : a.level === 'risco' ? 'risk' : a.level === 'positivo' ? 'positive' : 'info'}">${a.level.toUpperCase()}</span>
              ${a.title}
            </div>
            <span style="font-size: 0.8rem; color: var(--color-text-muted);">${Formatters.date(a.date)}</span>
          </div>
          <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: 0.75rem;">${a.message}</p>
          ${!a.read ? `<button class="btn btn-outline btn-sm mark-alert-read-btn" data-id="${a.id}">Marcar como Visualizado</button>` : '<span style="font-size: 0.8rem; color: var(--color-positive);">✓ Visualizado</span>'}
        </div>
      `).join('');
    },

    recommendations: function () {
      const container = document.getElementById('recommendations-list-container');
      if (!container) return;

      container.innerHTML = State.recommendations.map(r => `
        <div class="card">
          <div class="card-header">
            <div class="card-title">${r.title}</div>
            <span class="badge badge-${r.priority === 'Alta' ? 'risk' : 'warning'}">Prioridade ${r.priority}</span>
          </div>
          <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: 1rem;">${r.description}</p>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: var(--color-text-muted);">
            <span>Origem: ${r.origin}</span>
            <div>
              ${r.accepted ? '<span class="badge badge-positive">✓ Aceita</span>' : `<button class="btn btn-primary btn-sm accept-rec-btn" data-id="${r.id}">Marcar como Aceita</button>`}
            </div>
          </div>
        </div>
      `).join('');
    },

    diary: function () {
      const container = document.getElementById('diary-timeline-container');
      if (container) {
        container.innerHTML = State.diary.map(n => `
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="badge badge-accent" style="text-transform: uppercase;">${n.type}</span>
                <span class="timeline-date">${Formatters.date(n.date)}</span>
              </div>
              <h4 style="font-weight: 700; margin: 0.35rem 0; color: var(--color-text-main);">${n.title}</h4>
              <p style="color: var(--color-text-muted); font-size: 0.9rem; line-height: 1.4;">${n.content}</p>
            </div>
          </div>
        `).join('');
      }

      const shoppingPreview = document.getElementById('diary-shopping-preview');
      if (shoppingPreview) {
        const items = State.shopping.slice(0, 4);
        const estimatedTotal = State.shopping.reduce((total, item) => total + (item.estimatedPrice || 0) * (item.quantity || 1), 0);
        const actualTotal = State.shopping.reduce((total, item) => total + (item.actualPrice || 0) * (item.quantity || 1), 0);
        shoppingPreview.innerHTML = `
          <div class="diary-shopping-summary">
            <span>Estimado: <strong>${Formatters.currency(estimatedTotal)}</strong></span>
            <span>Real até agora: <strong>${Formatters.currency(actualTotal)}</strong></span>
          </div>
          <div class="diary-shopping-items">
            ${items.map(item => `
              <div class="diary-shopping-row ${item.purchased ? 'is-purchased' : ''}">
                <span class="diary-shopping-check">${item.purchased ? '✓' : '○'}</span>
                <span>${item.title}</span>
                <strong>${Formatters.currency(item.actualPrice || item.estimatedPrice)}</strong>
              </div>
            `).join('') || '<p class="diary-empty-message">Nenhum item adicionado ainda.</p>'}
          </div>
        `;
      }

      const noBuyPreview = document.getElementById('diary-no-buy-preview');
      if (noBuyPreview) {
        const noBuyItem = State.shopping.find(item => item.doNotBuyAgain);
        noBuyPreview.innerHTML = noBuyItem
          ? `<strong>${noBuyItem.title}</strong><span>Marcado para não comprar novamente.</span>`
          : '<span>Nenhum produto marcado até o momento.</span>';
      }
    },

    shopping: function () {
      const container = document.getElementById('shopping-items-grid');
      if (!container) return;

      container.innerHTML = State.shopping.map(item => `
        <div class="shopping-item-card ${item.purchased ? 'purchased' : ''} ${item.doNotBuyAgain ? 'do-not-buy' : ''}">
          <input type="checkbox" class="shopping-check toggle-purchased-check" data-id="${item.id}" ${item.purchased ? 'checked' : ''}>
          <div class="shopping-details">
            <div class="shopping-title">${item.title} (x${item.quantity})</div>
            <div class="shopping-sub"><span class="shopping-date">Data: ${Formatters.date(item.date)}</span>
              Est: ${Formatters.currency(item.estimatedPrice)} | Pago: ${Formatters.currency(item.actualPrice)} • Prioridade ${item.priority}
            </div>
          </div>
          <div class="shopping-item-actions">
            <span class="badge badge-${item.purchased ? 'positive' : 'info'}">${item.purchased ? 'Comprado' : 'Pendente'}</span>
            <button type="button" class="btn btn-danger btn-xs delete-shopping-item" data-id="${item.id}">Excluir</button>
          </div>
        </div>
      `).join('');

      const purchasedCount = State.shopping.filter(i => i.purchased).length;
      document.getElementById('shopping-purchased-count').textContent = `${purchasedCount} comprados`;
    },

    profile: function () {
      const settingsCard = document.querySelector('#view-perfil .profile-layout > .card:last-child');
      settingsCard?.classList.add('profile-settings-card');
      const profileForm = document.getElementById('profile-edit-form');
      if (settingsCard && profileForm && profileForm.parentElement !== settingsCard) {
        settingsCard.appendChild(profileForm);
      }
      const exitButton = document.getElementById('btn-logout');
      if (exitButton) exitButton.textContent = 'Sair';
      document.getElementById('prof-name-input').value = State.user.name;
      document.getElementById('prof-email-input').value = State.user.email;
      document.getElementById('prof-income-input').value = State.user.monthlyIncome;
      const prefs = StorageService.get(STORAGE_KEYS.PREFERENCES) || {};
      if (document.getElementById('prof-theme-select')) document.getElementById('prof-theme-select').value = prefs.theme || 'claro';
      if (document.getElementById('profile-theme-inline')) document.getElementById('profile-theme-inline').value = prefs.theme || 'claro';
      if (document.getElementById('prof-notifications-input')) document.getElementById('prof-notifications-input').checked = prefs.notifications !== false;
    }
  };

  // --- Router ---
  const Router = {
    navigate: function (viewId) {
      State.currentView = viewId;

      const sections = document.querySelectorAll('.view-section');
      sections.forEach(s => s.classList.remove('active'));

      const target = document.getElementById(`view-${viewId}`);
      if (target) {
        target.classList.add('active');
        window.scrollTo(0, 0);
      }

      const navLinks = document.querySelectorAll('.nav-trigger');
      const activeNavigationView = viewId === 'lista-compras' ? 'diario' : viewId;
      navLinks.forEach(link => {
        if (link.dataset.view === activeNavigationView) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  };

  // --- Toasts ---
  const Toast = {
    show: function (msg, type = 'success') {
      let container = document.querySelector('.toast-container');
      if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
      }

      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.innerHTML = `<span>${msg}</span>`;

      container.appendChild(toast);
      setTimeout(() => {
        toast.remove();
      }, 3500);
    }
  };

  function initFinAssistant() {
    const finButton = document.getElementById('floating-ai-button');
    const finModal = document.getElementById('modal-fin-assistant');
    const finPromptStep = document.getElementById('fin-prompt-step');
    const finReviewStep = document.getElementById('fin-review-step');
    const finReviewFooter = document.getElementById('fin-review-footer');
    if (!finButton || !finModal || finButton.dataset.finBound === 'true') return;
    finButton.dataset.finBound = 'true';

    const showPromptStep = function (clearPrompt = false) {
      finPromptStep.hidden = false;
      finReviewStep.hidden = true;
      finReviewFooter.hidden = true;
      if (clearPrompt) document.getElementById('fin-prompt-input').value = '';
      window.setTimeout(() => document.getElementById('fin-prompt-input')?.focus(), 40);
    };

    const showReviewStep = function (suggestion) {
      document.getElementById('fin-type').value = suggestion.type;
      document.getElementById('fin-description').value = suggestion.description;
      document.getElementById('fin-amount').value = suggestion.amount;
      document.getElementById('fin-category').value = suggestion.category;
      document.getElementById('fin-account').value = suggestion.account;
      document.getElementById('fin-payment').value = suggestion.paymentMethod;
      document.getElementById('fin-date').value = suggestion.date;
      document.getElementById('fin-confidence').textContent = `${suggestion.confidenceScore}%`;
      finPromptStep.hidden = true;
      finReviewStep.hidden = false;
      finReviewFooter.hidden = false;
      window.setTimeout(() => document.getElementById('fin-description')?.focus(), 40);
    };

    const openAssistant = function () {
      const mainApp = document.getElementById('main-app-layout');
      if (!mainApp || window.getComputedStyle(mainApp).display === 'none') return;
      showPromptStep(true);
      document.getElementById('fin-date').value = new Date().toISOString().split('T')[0];
      finModal.classList.add('active');
    };

    window.openFinAssistant = openAssistant;
    finButton.addEventListener('click', openAssistant);
    finModal.querySelectorAll('.modal-close, [data-close-modal]').forEach(function (button) {
      button.addEventListener('click', function () {
        finModal.classList.remove('active');
        showPromptStep(true);
      });
    });
    finModal.addEventListener('click', function (event) {
      if (event.target === finModal) {
        finModal.classList.remove('active');
        showPromptStep(true);
      }
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && finModal.classList.contains('active')) {
        finModal.classList.remove('active');
        showPromptStep(true);
      }
    });

    document.querySelectorAll('[data-fin-example]').forEach(function (button) {
      button.addEventListener('click', function () {
        const prompt = document.getElementById('fin-prompt-input');
        prompt.value = button.dataset.finExample;
        prompt.focus();
      });
    });

    document.getElementById('btn-fin-analyze')?.addEventListener('click', function () {
      const text = document.getElementById('fin-prompt-input').value.trim();
      if (!text) {
        Toast.show('Conte ao Fin qual movimentação deseja registrar.', 'warning');
        document.getElementById('fin-prompt-input').focus();
        return;
      }
      showReviewStep(AiEngine.analyzePrompt(text));
    });

    document.getElementById('btn-fin-back')?.addEventListener('click', function () {
      showPromptStep(false);
    });

    document.getElementById('btn-fin-save')?.addEventListener('click', function () {
      const description = document.getElementById('fin-description').value.trim();
      const amount = parseFloat(document.getElementById('fin-amount').value);
      const category = document.getElementById('fin-category').value.trim();
      const account = document.getElementById('fin-account').value;

      if (!description || !category || !account || Number.isNaN(amount) || amount <= 0) {
        Toast.show('Revise descrição, valor, categoria e conta.', 'warning');
        return;
      }

      const newTx = {
        id: 'tx_' + Date.now(),
        type: document.getElementById('fin-type').value,
        description,
        amount,
        category,
        account,
        paymentMethod: document.getElementById('fin-payment').value,
        date: document.getElementById('fin-date').value || new Date().toISOString().split('T')[0],
        origin: 'CONVERSA_IA'
      };

      State.transactions.push(newTx);
      const targetAccount = State.accounts.find(item => item.name === newTx.account);
      if (targetAccount) {
        if (newTx.type === 'RECEITA') targetAccount.balance += newTx.amount;
        if (newTx.type === 'DESPESA') targetAccount.balance -= newTx.amount;
        StorageService.set(STORAGE_KEYS.ACCOUNTS, State.accounts);
      }

      StorageService.set(STORAGE_KEYS.TRANSACTIONS, State.transactions);
      finModal.classList.remove('active');
      showPromptStep(true);
      Render.all();
      Toast.show('Movimentação salva com o Fin!');
    });
  }

  // --- Bindings ---
  function bindEvents() {
    document.addEventListener('click', function (e) {
      const trigger = e.target.closest('.nav-trigger');
      if (trigger) {
        e.preventDefault();
        const view = trigger.dataset.view;
        if (view) Router.navigate(view);
      }
    });

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        StorageService.set(STORAGE_KEYS.AUTH, 'demo_token_authenticated');
        document.getElementById('auth-layout').style.display = 'none';
        document.getElementById('main-app-layout').style.display = 'flex';
        document.getElementById('floating-ai-button')?.classList.remove('is-hidden');
        Render.all();
        Toast.show('Bem-vindo ao FinGuardian AI!');
      });
    }

    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
      signupForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        if (name && email) {
          State.user.name = name;
          State.user.email = email;
          StorageService.set(STORAGE_KEYS.USER, State.user);
        }
        // PONTO DE INTEGRAÇÃO FUTURA: enviar versões aceitas e data do aceite à API.
        StorageService.set(STORAGE_KEYS.LEGAL_CONSENT, {
          termsVersion: '2026-07-25',
          privacyVersion: '2026-07-25',
          acceptedAt: new Date().toISOString()
        });
        Toast.show('Conta criada! Complete a configuração de contas.');
        document.getElementById('auth-layout').style.display = 'none';
        document.getElementById('main-app-layout').style.display = 'flex';
        document.getElementById('floating-ai-button')?.classList.remove('is-hidden');
        Router.navigate('contas');
        document.getElementById('modal-new-account').classList.add('active');
      });
    }

    // Alternar visibilidade da senha (Olho)
    document.addEventListener('click', function (e) {
      const toggleBtn = e.target.closest('.password-toggle-btn');
      if (toggleBtn) {
        e.preventDefault();
        const targetId = toggleBtn.dataset.target;
        const input = document.getElementById(targetId);
        if (input) {
          const isPassword = input.type === 'password';
          input.type = isPassword ? 'text' : 'password';
          const eyeOpen = toggleBtn.querySelector('.eye-open');
          const eyeClosed = toggleBtn.querySelector('.eye-closed');
          if (eyeOpen && eyeClosed) {
            eyeOpen.style.display = isPassword ? 'none' : 'block';
            eyeClosed.style.display = isPassword ? 'block' : 'none';
          }
        }
      }

      const forgotBtn = e.target.closest('#btn-forgot-password');
      if (forgotBtn) {
        e.preventDefault();
        Toast.show('Instruções de recuperação enviadas para o seu e-mail.');
      }
    });

    const toggleSignupBtn = document.getElementById('toggle-to-signup');
    const toggleLoginBtn = document.getElementById('toggle-to-login');

    if (toggleSignupBtn) {
      toggleSignupBtn.addEventListener('click', function () {
        document.getElementById('login-box').style.display = 'none';
        document.getElementById('signup-box').style.display = 'block';
        const headline = document.getElementById('auth-hero-headline');
        if (headline) headline.innerHTML = 'Comece hoje a cuidar<br>melhor do seu dinheiro.';
        const desc = document.getElementById('auth-hero-desc');
        if (desc) desc.textContent = 'Cadastro rápido, seguro e sem complicação.';
      });
    }
    if (toggleLoginBtn) {
      toggleLoginBtn.addEventListener('click', function () {
        document.getElementById('signup-box').style.display = 'none';
        document.getElementById('login-box').style.display = 'block';
        const headline = document.getElementById('auth-hero-headline');
        if (headline) headline.innerHTML = 'Sua vida financeira,<br>mais clara e inteligente.';
        const desc = document.getElementById('auth-hero-desc');
        if (desc) desc.textContent = 'Controle suas contas, entenda seus hábitos e receba recomendações personalizadas.';
      });
    }

    // Processamento de IA
    const aiAnalyzeBtn = document.getElementById('btn-analyze-ai-prompt');
    if (aiAnalyzeBtn) {
      aiAnalyzeBtn.addEventListener('click', function () {
        const promptInput = document.getElementById('ai-prompt-input');
        const text = promptInput.value.trim();
        if (!text) {
          Toast.show('Digite uma movimentação em linguagem natural.', 'warning');
          return;
        }

        const suggestion = AiEngine.analyzePrompt(text);
        State.pendingAiSuggestion = suggestion;

        document.getElementById('ai-rev-type').value = suggestion.type;
        document.getElementById('ai-rev-desc').value = suggestion.description;
        document.getElementById('ai-rev-amount').value = suggestion.amount;
        document.getElementById('ai-rev-category').value = suggestion.category;
        document.getElementById('ai-rev-account').value = suggestion.account;
        document.getElementById('ai-rev-payment').value = suggestion.paymentMethod;
        document.getElementById('ai-rev-confidence').textContent = `${suggestion.confidenceScore}%`;

        document.getElementById('modal-ai-review').classList.add('active');
      });
    }

    const btnConfirmAiSave = document.getElementById('btn-confirm-ai-save');
    if (btnConfirmAiSave) {
      btnConfirmAiSave.addEventListener('click', function () {
        const newTx = {
          id: 'tx_' + Date.now(),
          type: document.getElementById('ai-rev-type').value,
          description: document.getElementById('ai-rev-desc').value,
          amount: parseFloat(document.getElementById('ai-rev-amount').value) || 0,
          category: document.getElementById('ai-rev-category').value,
          account: document.getElementById('ai-rev-account').value,
          paymentMethod: document.getElementById('ai-rev-payment').value,
          date: new Date().toISOString().split('T')[0]
        };

        State.transactions.push(newTx);

        const targetAcc = State.accounts.find(a => a.name === newTx.account);
        if (targetAcc) {
          if (newTx.type === 'RECEITA') targetAcc.balance += newTx.amount;
          else if (newTx.type === 'DESPESA') targetAcc.balance -= newTx.amount;
          StorageService.set(STORAGE_KEYS.ACCOUNTS, State.accounts);
        }

        StorageService.set(STORAGE_KEYS.TRANSACTIONS, State.transactions);
        document.getElementById('modal-ai-review').classList.remove('active');
        document.getElementById('ai-prompt-input').value = '';
        Render.all();
        Toast.show('Movimentação revisada e salva com sucesso!');
      });
    }

    initFinAssistant();
    const manualTxForm = document.getElementById('manual-tx-form');
    const toggleManualFields = () => { const type = document.getElementById('manual-tx-type')?.value; document.getElementById('manual-transfer-fields')?.classList.toggle('active', type === 'TRANSFERENCIA'); document.getElementById('manual-adjustment-fields')?.classList.toggle('active', type === 'AJUSTE_SALDO'); };
    document.getElementById('manual-tx-type')?.addEventListener('change', toggleManualFields); toggleManualFields();
    if (manualTxForm) {
      manualTxForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const newTx = {
          id: 'tx_' + Date.now(),
          type: document.getElementById('manual-tx-type').value,
          description: document.getElementById('manual-tx-desc').value,
          amount: parseFloat(document.getElementById('manual-tx-amount').value) || 0,
          category: document.getElementById('manual-tx-category').value,
          subcategory: document.getElementById('manual-tx-subcategory').value,
          account: document.getElementById('manual-tx-account').value,
          paymentMethod: document.getElementById('manual-tx-payment').value,
          date: document.getElementById('manual-tx-date').value || new Date().toISOString().split('T')[0],
          obs: document.getElementById('manual-tx-obs').value
        };

        newTx.recurrence = document.getElementById('manual-tx-recurrence')?.value || 'Única';
        if (newTx.type === 'TRANSFERENCIA') { newTx.destinationAccount = document.getElementById('manual-tx-destination')?.value; if (!newTx.destinationAccount || newTx.destinationAccount === newTx.account) { Toast.show('Escolha uma conta de destino diferente.', 'warning'); return; } }
        if (newTx.type === 'AJUSTE_SALDO') { newTx.reason = document.getElementById('manual-tx-adjustment-reason')?.value; newTx.realBalance = parseFloat(document.getElementById('manual-tx-real-balance')?.value) || 0; if (!newTx.reason) { Toast.show('Informe o motivo do ajuste.', 'warning'); return; } }

        State.transactions.push(newTx);

        const acc = State.accounts.find(a => a.name === newTx.account);
        if (acc) {
          if (newTx.type === 'RECEITA') acc.balance += newTx.amount;
          else if (newTx.type === 'DESPESA') acc.balance -= newTx.amount;
          else if (newTx.type === 'TRANSFERENCIA') { acc.balance -= newTx.amount; const dest = State.accounts.find(a => a.name === newTx.destinationAccount); if (dest) dest.balance += newTx.amount; }
          else if (newTx.type === 'AJUSTE_SALDO') acc.balance = newTx.realBalance;
          StorageService.set(STORAGE_KEYS.ACCOUNTS, State.accounts);
        }

        StorageService.set(STORAGE_KEYS.TRANSACTIONS, State.transactions);
        manualTxForm.reset();
        Render.all();
        Toast.show('Movimentação salva com sucesso!');
        Router.navigate('movimentacoes');
      });
    }

    let editingAccountId = null;
    const newAccountForm = document.getElementById('new-account-form');
    if (newAccountForm) {
      newAccountForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const newAcc = {
          id: editingAccountId || 'acc_' + Date.now(),
          name: document.getElementById('acc-name-input').value,
          institution: document.getElementById('acc-inst-input').value,
          type: document.getElementById('acc-type-input').value,
          currency: 'BRL',
          balance: parseFloat(document.getElementById('acc-balance-input').value) || 0,
          creditLimit: parseFloat(document.getElementById('acc-limit-input').value) || 0,
          overdraftLimit: parseFloat(document.getElementById('acc-overdraft-input').value) || 0,
          status: 'Ativa'
        };

        if (editingAccountId) { const index = State.accounts.findIndex(a => a.id === editingAccountId); if (index >= 0) State.accounts[index] = { ...State.accounts[index], ...newAcc }; editingAccountId = null; } else State.accounts.push(newAcc);
        StorageService.set(STORAGE_KEYS.ACCOUNTS, State.accounts);
        newAccountForm.reset();
        document.getElementById('modal-new-account').classList.remove('active');
        Render.all();
        Toast.show(editingAccountId ? 'Conta financeira atualizada!' : 'Conta financeira criada!');
      });
    }

    const btnConvertShopping = document.getElementById('btn-convert-shopping-to-expense');
    if (btnConvertShopping) {
      btnConvertShopping.addEventListener('click', function () {
        const purchasedItems = State.shopping.filter(i => i.purchased && !i.doNotBuyAgain);
        if (purchasedItems.length === 0) {
          Toast.show('Nenhum item comprado selecionado.', 'warning');
          return;
        }

        const totalCost = purchasedItems.reduce((acc, item) => acc + (item.actualPrice || item.estimatedPrice) * (item.quantity || 1), 0);

        document.getElementById('convert-shopping-total').textContent = Formatters.currency(totalCost);
        document.getElementById('convert-shopping-items-summary').textContent = purchasedItems.map(i => `${i.title} (${Formatters.currency(i.actualPrice)})`).join(', ');

        document.getElementById('modal-convert-shopping').classList.add('active');
      });
    }

    const btnConfirmConvertShopping = document.getElementById('btn-confirm-convert-shopping');
    if (btnConfirmConvertShopping) {
      btnConfirmConvertShopping.addEventListener('click', function () {
        const targetAccount = document.getElementById('convert-shopping-account-select').value;
        const purchasedItems = State.shopping.filter(i => i.purchased && !i.doNotBuyAgain);
        const totalCost = purchasedItems.reduce((acc, item) => acc + (item.actualPrice || item.estimatedPrice) * (item.quantity || 1), 0);

        const newExpense = {
          id: 'tx_' + Date.now(),
          type: 'DESPESA',
          description: 'Compras de Mercado (Lista de Compras)',
          category: 'Alimentação',
          account: targetAccount,
          category: document.getElementById('convert-shopping-category-select')?.value || 'Alimentação',
          amount: totalCost,
          date: new Date().toISOString().split('T')[0],
          paymentMethod: 'Cartão de Débito',
          obs: `Convertido de ${purchasedItems.length} itens.`
        };

        State.transactions.push(newExpense);

        const acc = State.accounts.find(a => a.name === targetAccount);
        if (acc) {
          acc.balance -= totalCost;
          StorageService.set(STORAGE_KEYS.ACCOUNTS, State.accounts);
        }

        State.shopping = State.shopping.filter(i => !i.purchased || i.doNotBuyAgain);

        StorageService.set(STORAGE_KEYS.TRANSACTIONS, State.transactions);
        StorageService.set(STORAGE_KEYS.SHOPPING, State.shopping);

        document.getElementById('modal-convert-shopping').classList.remove('active');
        Render.all();
        Toast.show(`Despesa de ${Formatters.currency(totalCost)} gerada com sucesso!`);
      });
    }

    document.addEventListener('change', function (e) {
      if (e.target.classList.contains('toggle-purchased-check')) {
        const id = e.target.dataset.id;
        const item = State.shopping.find(i => i.id === id);
        if (item) {
          item.purchased = e.target.checked;
          StorageService.set(STORAGE_KEYS.SHOPPING, State.shopping);
          Render.shopping();
        }
      }
      if (e.target.id === 'profile-alert-toggle') { const prefs = StorageService.get(STORAGE_KEYS.PREFERENCES) || {}; prefs.notifications = e.target.checked; StorageService.set(STORAGE_KEYS.PREFERENCES, prefs); }
    });
    document.addEventListener('click', function (e) {
      const deleteButton = e.target.closest('.delete-shopping-item');
      if (deleteButton) { State.shopping = State.shopping.filter(item => item.id !== deleteButton.dataset.id); StorageService.set(STORAGE_KEYS.SHOPPING, State.shopping); Render.all(); Toast.show('Item removido da lista.'); }
    });
    document.getElementById('btn-clear-shopping')?.addEventListener('click', function () {
      if (confirm('Limpar todos os itens da lista?')) { State.shopping = []; StorageService.set(STORAGE_KEYS.SHOPPING, State.shopping); Render.all(); Toast.show('Lista limpa.'); }
    });

    const txSearchInput = document.getElementById('tx-search-input');
    if (txSearchInput) {
      txSearchInput.addEventListener('input', () => Render.transactions());
    }
    ['tx-account-filter','tx-category-filter','tx-payment-filter','tx-date-from','tx-date-to'].forEach(id => document.getElementById(id)?.addEventListener('change', () => Render.transactions()));
    document.querySelectorAll('.transaction-filter-btn').forEach(function (button) {
      button.addEventListener('click', function () {
        document.querySelectorAll('.transaction-filter-btn').forEach(function (filterButton) {
          filterButton.classList.remove('active');
          filterButton.setAttribute('aria-pressed', 'false');
        });
        button.classList.add('active');
        button.setAttribute('aria-pressed', 'true');
        Render.transactions();
      });
    });

    let editingTransactionId = null;
    document.addEventListener('click', function (e) {
      const txButton = e.target.closest('.tx-action');
      if (txButton) {
        const tx = State.transactions.find(item => item.id === txButton.dataset.id); if (!tx) return;
        const modal = document.getElementById('modal-transaction'); modal.classList.add('active'); editingTransactionId = tx.id;
        document.getElementById('transaction-details-content').innerHTML = `<p><strong>${tx.description}</strong></p><p>${tx.type} · ${Formatters.currency(tx.amount)} · ${Formatters.date(tx.date)}</p><p>Categoria: ${tx.category || '—'} · Conta: ${tx.account || '—'} · Pagamento: ${tx.paymentMethod || '—'}</p><p>${tx.obs || tx.reason || ''}</p>`;
        document.getElementById('transaction-edit-form').style.display = txButton.dataset.txAction === 'edit' ? 'block' : 'none'; document.getElementById('btn-save-edit-transaction').style.display = txButton.dataset.txAction === 'edit' ? 'inline-flex' : 'none'; document.getElementById('btn-start-edit-transaction').style.display = txButton.dataset.txAction === 'edit' ? 'none' : 'inline-flex';
        if (txButton.dataset.txAction === 'delete') { modal.classList.remove('active'); if (confirm('Excluir esta movimentação?')) { State.transactions = State.transactions.filter(item => item.id !== tx.id); StorageService.set(STORAGE_KEYS.TRANSACTIONS, State.transactions); Render.all(); Toast.show('Movimentação excluída.'); } }
        if (txButton.dataset.txAction === 'edit') { document.getElementById('tx-edit-description').value = tx.description; document.getElementById('tx-edit-amount').value = tx.amount; document.getElementById('tx-edit-category').value = tx.category || ''; document.getElementById('tx-edit-payment').value = tx.paymentMethod || ''; document.getElementById('tx-edit-date').value = tx.date; }
      }
      const accountButton = e.target.closest('.account-action');
      if (accountButton) { const acc = State.accounts.find(a => a.id === accountButton.dataset.id); if (!acc) return; if (accountButton.dataset.accountAction === 'deactivate') { acc.status = acc.status === 'Ativa' ? 'Inativa' : 'Ativa'; StorageService.set(STORAGE_KEYS.ACCOUNTS, State.accounts); Render.all(); } if (accountButton.dataset.accountAction === 'adjust') { const value = parseFloat(prompt('Informe o saldo real conferido: ', acc.balance)); const reason = prompt('Motivo do ajuste:'); if (!Number.isNaN(value) && reason) { acc.balance = value; State.transactions.push({ id:'tx_'+Date.now(), type:'AJUSTE_SALDO', description:'Ajuste de saldo', account:acc.name, amount:value, realBalance:value, reason, category:'Ajuste', date:new Date().toISOString().split('T')[0] }); StorageService.set(STORAGE_KEYS.ACCOUNTS, State.accounts); StorageService.set(STORAGE_KEYS.TRANSACTIONS, State.transactions); Render.all(); } } }
    });
    document.getElementById('btn-start-edit-transaction')?.addEventListener('click', () => { document.getElementById('transaction-edit-form').style.display = 'block'; document.getElementById('btn-save-edit-transaction').style.display = 'inline-flex'; document.getElementById('btn-start-edit-transaction').style.display = 'none'; const tx = State.transactions.find(t => t.id === editingTransactionId); if (tx) { document.getElementById('tx-edit-description').value = tx.description; document.getElementById('tx-edit-amount').value = tx.amount; document.getElementById('tx-edit-category').value = tx.category || ''; document.getElementById('tx-edit-payment').value = tx.paymentMethod || ''; document.getElementById('tx-edit-date').value = tx.date; } });
    document.getElementById('btn-save-edit-transaction')?.addEventListener('click', () => { const tx = State.transactions.find(t => t.id === editingTransactionId); if (!tx) return; tx.description = document.getElementById('tx-edit-description').value; tx.amount = parseFloat(document.getElementById('tx-edit-amount').value) || 0; tx.category = document.getElementById('tx-edit-category').value; tx.paymentMethod = document.getElementById('tx-edit-payment').value; tx.date = document.getElementById('tx-edit-date').value; StorageService.set(STORAGE_KEYS.TRANSACTIONS, State.transactions); document.getElementById('modal-transaction').classList.remove('active'); Render.all(); Toast.show('Movimentação atualizada.'); });
    document.getElementById('btn-save-analysis')?.addEventListener('click', () => { const income = State.transactions.filter(t=>t.type==='RECEITA').reduce((s,t)=>s+t.amount,0); const expense = State.transactions.filter(t=>t.type==='DESPESA').reduce((s,t)=>s+t.amount,0); State.analysisHistory.unshift({ id:'analysis_'+Date.now(), date:new Date().toISOString().split('T')[0], balance:income-expense, profile:State.user.profileStatus }); StorageService.set(STORAGE_KEYS.ANALYSIS_HISTORY, State.analysisHistory); Render.all(); Toast.show('Análise salva no histórico.'); });
    document.getElementById('btn-save-preferences')?.addEventListener('click', () => { StorageService.set(STORAGE_KEYS.PREFERENCES, { theme: document.getElementById('prof-theme-select').value, notifications: document.getElementById('prof-notifications-input').checked }); document.body.classList.toggle('theme-dark', document.getElementById('prof-theme-select').value === 'escuro'); Toast.show('Preferências salvas.'); });
    document.getElementById('profile-theme-inline')?.addEventListener('change', e => { const prefs = StorageService.get(STORAGE_KEYS.PREFERENCES) || {}; prefs.theme = e.target.value; StorageService.set(STORAGE_KEYS.PREFERENCES, prefs); document.body.classList.toggle('theme-dark', e.target.value === 'escuro'); if (document.getElementById('prof-theme-select')) document.getElementById('prof-theme-select').value = e.target.value; });

    // Botão Ocultar / Exibir valores
    (function () {
      document.getElementById('btn-save-preferences')?.addEventListener('click', () => {
        const passwordInput = document.getElementById('prof-password-input');
        if (!passwordInput?.value) return;
        if (passwordInput.value.length < 8) {
          Toast.show('A nova senha deve ter pelo menos 8 caracteres.', 'warning');
          passwordInput.focus();
          return;
        }
        // PONTO DE INTEGRAÇÃO FUTURA: enviar senha via HTTPS para endpoint autenticado.
        const security = StorageService.get(STORAGE_KEYS.SECURITY) || {};
        security.passwordChangeRequestedAt = new Date().toISOString();
        StorageService.set(STORAGE_KEYS.SECURITY, security);
        passwordInput.value = '';
      });
      let hidden = false;
      const btn = document.getElementById('btn-toggle-values');
      if (!btn) return;
      const HIDDEN_SELECTORS = [
        '#dash-total-balance', '#dash-total-income', '#dash-total-expense',
        '#dash-total-debt', '#dash-unread-alerts', '#dash-analysis-count',
        '#dash-recent-transactions td:last-child'
      ];
      function applyHidden() {
        const label = btn.querySelector('.toggle-values-label');
        const eyeOpen = btn.querySelector('.eye-icon-open');
        const eyeClosed = btn.querySelector('.eye-icon-closed');
        HIDDEN_SELECTORS.forEach(sel => {
          document.querySelectorAll(sel).forEach(el => {
            if (hidden) {
              el.dataset.origText = el.innerHTML;
              el.innerHTML = '<span class="value-hidden" aria-hidden="true">••••</span>';
            } else {
              if (el.dataset.origText !== undefined) el.innerHTML = el.dataset.origText;
            }
          });
        });
        if (label)     label.textContent = hidden ? 'Exibir' : 'Ocultar';
        if (eyeOpen)   eyeOpen.style.display   = hidden ? 'none' : '';
        if (eyeClosed) eyeClosed.style.display  = hidden ? '' : 'none';
        btn.classList.toggle('values-hidden', hidden);
      }
      btn.addEventListener('click', function () {
        hidden = !hidden;
        applyHidden();
      });
    })();

    // Botões chevron do perfil
    document.addEventListener('click', function (e) {
      const chevron = e.target.closest('[data-profile-action]');
      if (!chevron) return;
      const action = chevron.dataset.profileAction;
      if (action === 'dados-pessoais') {
        Router.navigate('perfil');
        setTimeout(() => {
          const nameInput = document.getElementById('prof-name-input');
          if (nameInput) { nameInput.focus(); nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
        }, 100);
      } else if (action === 'contas') {
        Router.navigate('contas');
      } else if (action === 'seguranca') {
        // O painel completo é aberto pelo listener de configurações abaixo.
      } else if (action === 'tema') {
        const themeSelect = document.getElementById('profile-theme-inline');
        if (themeSelect) themeSelect.focus();
      }
    });

    // Toggle de notificações no painel de configurações do perfil
    document.getElementById('profile-alert-toggle')?.addEventListener('change', function() {
      const prefs = StorageService.get(STORAGE_KEYS.PREFERENCES) || {};
      prefs.notifications = this.checked;
      StorageService.set(STORAGE_KEYS.PREFERENCES, prefs);
      if (document.getElementById('prof-notifications-input')) document.getElementById('prof-notifications-input').checked = this.checked;
      Toast.show(this.checked ? 'Notificações ativadas.' : 'Notificações desativadas.');
    });
    document.addEventListener('click', function (e) { const button = e.target.closest('.account-action[data-account-action="edit"]'); if (!button) return; const acc = State.accounts.find(item => item.id === button.dataset.id); if (!acc) return; editingAccountId = acc.id; document.getElementById('acc-name-input').value = acc.name; document.getElementById('acc-inst-input').value = acc.institution; document.getElementById('acc-type-input').value = acc.type; document.getElementById('acc-balance-input').value = acc.balance; document.getElementById('acc-limit-input').value = acc.creditLimit; document.getElementById('acc-overdraft-input').value = acc.overdraftLimit; document.getElementById('modal-new-account').classList.add('active'); });

    const diaryForm = document.getElementById('diary-new-note-form');
    if (diaryForm) {
      diaryForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const newNote = {
          id: 'note_' + Date.now(),
          title: document.getElementById('diary-title-input').value,
          content: document.getElementById('diary-content-input').value,
          type: document.getElementById('diary-type-select').value,
          date: document.getElementById('diary-date-input').value || new Date().toISOString().split('T')[0]
        };

        State.diary.unshift(newNote);
        StorageService.set(STORAGE_KEYS.DIARY, State.diary);
        diaryForm.reset();
        Render.diary();
        Toast.show('Anotação salva no diário!');
      });
    }

    document.querySelectorAll('.diary-type-choice').forEach(function (choice) {
      choice.addEventListener('click', function () {
        const selectedType = choice.dataset.diaryType;
        if (selectedType === 'lista_compras') {
          Router.navigate('lista-compras');
          return;
        }

        document.querySelectorAll('.diary-type-choice').forEach(function (typeButton) {
          typeButton.classList.remove('active');
          typeButton.setAttribute('aria-pressed', 'false');
        });
        choice.classList.add('active');
        choice.setAttribute('aria-pressed', 'true');

        const typeSelect = document.getElementById('diary-type-select');
        if (typeSelect && typeSelect.querySelector(`option[value="${selectedType}"]`)) {
          typeSelect.value = selectedType;
        }
      });
    });

    const shoppingForm = document.getElementById('shopping-new-item-form');
    if (shoppingForm) {
      shoppingForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const newItem = {
          id: 'shop_' + Date.now(),
          title: document.getElementById('shop-title-input').value,
          quantity: parseInt(document.getElementById('shop-qty-input').value) || 1,
          estimatedPrice: parseFloat(document.getElementById('shop-est-input').value) || 0,
          actualPrice: parseFloat(document.getElementById('shop-real-input').value) || 0,
          priority: document.getElementById('shop-priority-select').value,
          purchased: false,
          doNotBuyAgain: document.getElementById('shop-do-not-buy-input')?.checked || false,
          obs: document.getElementById('shop-obs-input')?.value || ''
          ,date: document.getElementById('shop-date-input')?.value || new Date().toISOString().split('T')[0]
        };

        State.shopping.push(newItem);
        StorageService.set(STORAGE_KEYS.SHOPPING, State.shopping);
        shoppingForm.reset();
        Render.shopping();
        Toast.show('Item adicionado!');
      });
    }

    document.addEventListener('click', function (e) {
      if (e.target.classList.contains('mark-alert-read-btn')) {
        const id = e.target.dataset.id;
        const alt = State.alerts.find(a => a.id === id);
        if (alt) {
          alt.read = true;
          StorageService.set(STORAGE_KEYS.ALERTS, State.alerts);
          Render.alerts();
          Toast.show('Alerta marcado como lido.');
        }
      }

      if (e.target.classList.contains('accept-rec-btn')) {
        const id = e.target.dataset.id;
        const rec = State.recommendations.find(r => r.id === id);
        if (rec) {
          rec.accepted = true;
          StorageService.set(STORAGE_KEYS.RECOMMENDATIONS, State.recommendations);
          Render.recommendations();
          Toast.show('Recomendação aceita!');
        }
      }
    });

    const profileForm = document.getElementById('profile-edit-form');
    const openProfileForm = function () {
      if (!profileForm) return;
      profileForm.classList.add('profile-form-visible');
      profileForm.closest('.profile-settings-card')?.classList.add('profile-edit-mode');
      document.body.classList.remove('profile-form-open');
      document.getElementById('prof-name-input')?.focus();
    };
    const closeProfileForm = function () {
      if (!profileForm) return;
      profileForm.classList.remove('profile-form-visible');
      profileForm.closest('.profile-settings-card')?.classList.remove('profile-edit-mode');
      document.body.classList.remove('profile-form-open');
    };
    const saveProfileData = function () {
      if (!profileForm) return;
      const name = document.getElementById('prof-name-input').value.trim();
      const email = document.getElementById('prof-email-input').value.trim();
      const income = parseFloat(document.getElementById('prof-income-input').value);
      if (!name || !email || Number.isNaN(income)) {
        Toast.show('Preencha nome, e-mail e renda mensal.', 'warning');
        return;
      }
      State.user.name = name;
      State.user.email = email;
      State.user.monthlyIncome = income;
      StorageService.set(STORAGE_KEYS.USER, State.user);
      Render.all();
      closeProfileForm();
      Toast.show('Perfil atualizado com sucesso!');
    };
    if (profileForm) {
      profileForm.addEventListener('submit', function (e) {
        e.preventDefault();
        saveProfileData();
      });
    }
    document.getElementById('btn-save-profile')?.addEventListener('click', saveProfileData);
    window.saveFinGuardianProfile = saveProfileData;
    document.getElementById('btn-cancel-profile-form')?.addEventListener('click', closeProfileForm);
    document.getElementById('btn-close-profile-form')?.addEventListener('click', closeProfileForm);

    const btnResetData = null;
    if (btnResetData) {
      btnResetData.addEventListener('click', function () {
        if (confirm('Deseja restaurar todos os dados do protótipo Figma?')) {
          document.getElementById('main-app-layout').style.display = 'none';
          document.getElementById('auth-layout').style.display = 'flex';
          Toast.show('Você saiu da demonstração.');
        }
      });
    }
    document.getElementById('btn-logout')?.addEventListener('click', function () {
      document.getElementById('main-app-layout').style.display = 'none';
      document.getElementById('auth-layout').style.display = 'flex';
      document.getElementById('floating-ai-button')?.classList.add('is-hidden');
      document.getElementById('modal-fin-assistant')?.classList.remove('active');
      Router.navigate('dashboard');
      Toast.show('Sessão encerrada.');
    });

    document.addEventListener('click', function (e) {
      const openModalBtn = e.target.closest('[data-open-modal]');
      if (openModalBtn) {
        const targetId = openModalBtn.dataset.openModal;
        const modal = document.getElementById(targetId);
        if (modal) modal.classList.add('active');
      }

      const closeModalBtn = e.target.closest('.modal-close, [data-close-modal]');
      if (closeModalBtn) {
        const modal = closeModalBtn.closest('.modal-overlay');
        if (modal) modal.classList.remove('active');
      }

      if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
      }
    });

    document.getElementById('btn-analysis-details')?.addEventListener('click', function () {
      const details = document.querySelector('.analysis-detail-grid');
      const history = document.querySelector('.analysis-history-card');
      const visible = details?.classList.toggle('analysis-details-visible');
      history?.classList.toggle('analysis-details-visible', Boolean(visible));
      this.textContent = visible ? 'Ocultar detalhes' : 'Ver detalhes';
      if (visible) details.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    document.addEventListener('click', function (e) {
      const action = e.target.closest('[data-profile-action]'); if (!action) return;
      const type = action.dataset.profileAction;
      if (type === 'dados-pessoais') openProfileForm();
      else if (type === 'seguranca') {
        const securityModal = document.getElementById('modal-security-privacy');
        if (securityModal) securityModal.classList.add('active');
      }
      else if (type === 'tema') document.getElementById('profile-theme-inline')?.focus();
    });
    // modal-new-account clear is handled globally or on open
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      closeProfileForm();
      document.querySelectorAll('.modal-overlay.active').forEach(function (modal) {
        modal.classList.remove('active');
      });
    });

    const getSecurityPreferences = () => StorageService.get(STORAGE_KEYS.SECURITY) || {
      twoFactorEnabled: false,
      hideValuesOnOpen: false
    };
    const applySecurityPreferences = function () {
      const preferences = getSecurityPreferences();
      document.body.classList.toggle('privacy-values-hidden', Boolean(preferences.hideValuesOnOpen));
      const twoFactor = document.getElementById('security-2fa-toggle');
      const hideValues = document.getElementById('security-hide-values-toggle');
      if (twoFactor) twoFactor.checked = Boolean(preferences.twoFactorEnabled);
      if (hideValues) hideValues.checked = Boolean(preferences.hideValuesOnOpen);
    };
    document.getElementById('security-2fa-toggle')?.addEventListener('change', function () {
      const preferences = getSecurityPreferences();
      preferences.twoFactorEnabled = this.checked;
      StorageService.set(STORAGE_KEYS.SECURITY, preferences);
      Toast.show(this.checked ? 'Verificação em duas etapas marcada para ativação na integração.' : 'Verificação em duas etapas desativada.');
    });
    document.getElementById('security-hide-values-toggle')?.addEventListener('change', function () {
      const preferences = getSecurityPreferences();
      preferences.hideValuesOnOpen = this.checked;
      StorageService.set(STORAGE_KEYS.SECURITY, preferences);
      applySecurityPreferences();
      Toast.show(this.checked ? 'Valores serão ocultados ao abrir o painel.' : 'Valores visíveis ao abrir o painel.');
    });
    document.getElementById('btn-security-change-password')?.addEventListener('click', function () {
      const password = document.getElementById('security-new-password')?.value || '';
      const confirmation = document.getElementById('security-confirm-password')?.value || '';
      if (password.length < 8) {
        Toast.show('A nova senha deve ter pelo menos 8 caracteres.', 'warning');
        return;
      }
      if (password !== confirmation) {
        Toast.show('A confirmação de senha não confere.', 'warning');
        return;
      }
      // PONTO DE INTEGRAÇÃO FUTURA: enviar a senha somente por HTTPS para endpoint autenticado.
      const preferences = getSecurityPreferences();
      preferences.passwordChangeRequestedAt = new Date().toISOString();
      StorageService.set(STORAGE_KEYS.SECURITY, preferences);
      document.getElementById('security-new-password').value = '';
      document.getElementById('security-confirm-password').value = '';
      Toast.show('Alteração de senha preparada para a integração segura.');
    });
    document.getElementById('btn-export-data')?.addEventListener('click', function () {
      const exportData = {
        exportedAt: new Date().toISOString(),
        user: State.user,
        accounts: State.accounts,
        transactions: State.transactions,
        diary: State.diary,
        shopping: State.shopping
      };
      const file = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(file);
      link.download = 'finguardian-meus-dados.json';
      link.click();
      URL.revokeObjectURL(link.href);
      Toast.show('Cópia dos dados demonstrativos preparada.');
    });
    document.getElementById('btn-delete-data-request')?.addEventListener('click', function () {
      Toast.show('Solicitação registrada no protótipo. A exclusão real será tratada pela API.', 'warning');
    });

    const saveCookieConsent = function (choices) {
      StorageService.set(STORAGE_KEYS.COOKIE_CONSENT, { ...choices, savedAt: new Date().toISOString() });
      const banner = document.getElementById('cookie-banner');
      if (banner) banner.hidden = true;
      document.getElementById('cookie-preferences')?.classList.remove('active');
      Toast.show('Preferências de cookies salvas.');
    };
    document.getElementById('btn-cookie-accept')?.addEventListener('click', () => saveCookieConsent({ essential: true, functional: true, analytics: true }));
    document.getElementById('btn-cookie-essential')?.addEventListener('click', () => saveCookieConsent({ essential: true, functional: false, analytics: false }));
    document.getElementById('btn-cookie-settings')?.addEventListener('click', () => document.getElementById('cookie-preferences')?.classList.add('active'));
    document.getElementById('btn-cookie-save')?.addEventListener('click', () => saveCookieConsent({
      essential: true,
      functional: Boolean(document.getElementById('cookie-functional-toggle')?.checked),
      analytics: Boolean(document.getElementById('cookie-analytics-toggle')?.checked)
    }));
    const cookieConsent = StorageService.get(STORAGE_KEYS.COOKIE_CONSENT);
    if (!cookieConsent) document.getElementById('cookie-banner').hidden = false;
    else {
      document.getElementById('cookie-functional-toggle').checked = Boolean(cookieConsent.functional);
      document.getElementById('cookie-analytics-toggle').checked = Boolean(cookieConsent.analytics);
    }
    applySecurityPreferences();
  }

  document.addEventListener('DOMContentLoaded', function () {
    StorageService.init();
    State.reload();
    try {
      bindEvents();
    } catch (error) {
      console.error('Falha ao iniciar interações:', error);
    }
    initFinAssistant();
    Render.all();

    // Restaurar tema salvo nas preferências
    const savedPrefs = StorageService.get(STORAGE_KEYS.PREFERENCES);
    if (savedPrefs && savedPrefs.theme === 'escuro') {
      document.body.classList.add('theme-dark');
    }
  });

})();
