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
    DELETED_ANALYSES: 'finguardian_deleted_analyses',
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
      { id: 'note_1', title: 'Aporte Mensal na Reserva', content: 'Planejar aporte adicional de pelo menos R$ 300 assim que entrar o bônus.', type: 'planejamento', date: '2026-07-20', valorAlvo: 3000, valorAtual: 2100 },
      { id: 'note_2', title: 'Gastos com iFood', content: 'Percebi que pedi comida 5 vezes esta semana. Meta: reduzir para no máximo 1x por semana.', type: 'reflexão', date: '2026-07-18' },
      { id: 'note_3', title: 'Quitar Empréstimo', content: 'Objetivo de amortizar 3 parcelas do empréstimo Nubank até o fim do semestre.', type: 'meta', date: '2026-07-15', valorAlvo: 3000, valorAtual: 0 },
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
      localStorage.setItem(STORAGE_KEYS.DELETED_ANALYSES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.AUTH, 'demo_token_authenticated');
    }
  };

  const NumberParser = {
    value: function (value) {
      if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
      if (value === null || value === undefined || value === '') return 0;
      const raw = String(value).trim().replace(/[^\d,.-]/g, '');
      const normalized = raw.includes(',')
        ? raw.replace(/\./g, '').replace(',', '.')
        : raw.replace(/,/g, '');
      const parsed = Number(normalized);
      return Number.isFinite(parsed) ? parsed : 0;
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
    deletedAnalyses: [],
    currentView: 'dashboard',
    pendingAiSuggestion: null,

    reload: function () {
      this.user = StorageService.get(STORAGE_KEYS.USER);
      this.accounts = StorageService.get(STORAGE_KEYS.ACCOUNTS) || [];
      this.transactions = StorageService.get(STORAGE_KEYS.TRANSACTIONS) || [];
      let financialValuesUpdated = false;
      this.accounts.forEach(account => {
        ['balance', 'creditLimit', 'overdraftLimit'].forEach(field => {
          const normalized = NumberParser.value(account[field]);
          if (account[field] !== normalized) {
            account[field] = normalized;
            financialValuesUpdated = true;
          }
        });
      });
      this.transactions.forEach(transaction => {
        const normalized = NumberParser.value(transaction.amount);
        if (transaction.amount !== normalized) {
          transaction.amount = normalized;
          financialValuesUpdated = true;
        }
      });
      const legacyInitialTransactions = this.transactions.filter(transaction => transaction.origin === 'CADASTRO_CONTA');
      if (legacyInitialTransactions.length) {
        const remainingTransactions = this.transactions.filter(transaction => transaction.origin !== 'CADASTRO_CONTA');
        legacyInitialTransactions.forEach(initialTransaction => {
          const account = this.accounts.find(item => item.name === initialTransaction.account);
          if (!account) return;
          const initialBalance = NumberParser.value(initialTransaction.realBalance || initialTransaction.amount);
          account.initialBalance = initialBalance;
          let recalculatedBalance = initialBalance;
          const accountTransactions = remainingTransactions
            .filter(transaction => transaction.account === account.name || transaction.destinationAccount === account.name)
            .sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')) || String(a.id || '').localeCompare(String(b.id || '')));
          accountTransactions.forEach(transaction => {
            const amount = NumberParser.value(transaction.amount);
            if (transaction.type === 'RECEITA' && transaction.account === account.name) recalculatedBalance += amount;
            if (transaction.type === 'DESPESA' && transaction.account === account.name) recalculatedBalance -= amount;
            if (transaction.type === 'TRANSFERENCIA' && transaction.account === account.name) recalculatedBalance -= amount;
            if (transaction.type === 'TRANSFERENCIA' && transaction.destinationAccount === account.name) recalculatedBalance += amount;
            if (transaction.type === 'AJUSTE_SALDO' && transaction.account === account.name) recalculatedBalance = NumberParser.value(transaction.realBalance);
          });
          account.balance = recalculatedBalance;
        });
        this.transactions = remainingTransactions;
        financialValuesUpdated = true;
      }
      this.accounts.forEach(account => {
        if (account.initialBalance === undefined || account.initialBalance === null) {
          account.initialBalance = 0;
          financialValuesUpdated = true;
        }
      });
      if (financialValuesUpdated) {
        StorageService.set(STORAGE_KEYS.ACCOUNTS, this.accounts);
        StorageService.set(STORAGE_KEYS.TRANSACTIONS, this.transactions);
      }
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
      this.deletedAnalyses = StorageService.get(STORAGE_KEYS.DELETED_ANALYSES) || [];
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
      this.reports();
      this.transactions();
      this.accounts();
      this.initFilters();
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

    categoryData: function (transactions) {
      const palette = {
        'Alimentação': '#0F766E',
        'Moradia': '#2563EB',
        'Transporte': '#B45309',
        'Saúde': '#C93443',
        'Educação': '#7C3AED',
        'Lazer': '#0891B2'
      };
      const totals = {};
      transactions.filter(t => t.type === 'DESPESA').forEach(t => {
        totals[t.category] = (totals[t.category] || 0) + Number(t.amount || 0);
      });
      const total = Object.values(totals).reduce((sum, value) => sum + value, 0);
      return Object.entries(totals)
        .map(([label, value], index) => ({ label, value, pct: total ? Math.round((value / total) * 100) : 0, color: palette[label] || ['#0F766E', '#2563EB', '#B45309', '#C93443'][index % 4] }))
        .sort((a, b) => b.value - a.value);
    },

    distributionChart: function (items, type = 'donut', className = '') {
      if (!items.length) return '<div class="empty-state">Nenhuma despesa registrada no período.</div>';
      const total = items.reduce((sum, item) => sum + item.value, 0);
      const point = (angle, radius) => {
        const radians = (angle - 90) * Math.PI / 180;
        return { x: 100 + Math.cos(radians) * radius, y: 100 + Math.sin(radians) * radius };
      };
      let startAngle = 0;
      const slices = items.map((item, index) => {
        const sliceAngle = total ? (item.value / total) * 360 : 0;
        const endAngle = startAngle + sliceAngle;
        const outerStart = point(startAngle, 90);
        const outerEnd = point(endAngle, 90);
        const largeArc = sliceAngle > 180 ? 1 : 0;
        const innerRadius = type === 'donut' ? 51 : 0;
        const innerEnd = point(endAngle, innerRadius);
        const innerStart = point(startAngle, innerRadius);
        const path = type === 'donut'
          ? `M ${outerStart.x} ${outerStart.y} A 90 90 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y} L ${innerEnd.x} ${innerEnd.y} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y} Z`
          : `M 100 100 L ${outerStart.x} ${outerStart.y} A 90 90 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y} Z`;
        const midAngle = startAngle + sliceAngle / 2;
        const labelPoint = point(midAngle, type === 'donut' ? 69 : 60);
        const sliceId = `slice-${index}`;
        startAngle = endAngle;
        return { ...item, sliceId, path, labelX: labelPoint.x.toFixed(2), labelY: labelPoint.y.toFixed(2) };
      });
      return `
        <div class="distribution-chart ${className} distribution-${type}">
          <div class="distribution-visual">
            <svg class="distribution-svg" viewBox="0 0 200 200" role="img" aria-label="Distribuição de gastos por categoria">
              ${slices.map(slice => `<path class="distribution-slice" data-chart-slice="${slice.sliceId}" d="${slice.path}" fill="${slice.color}"><title>${slice.label}: ${slice.pct}% (${Formatters.currency(slice.value)})</title></path><text class="distribution-slice-label ${slice.pct < 8 ? 'is-small' : ''}" data-chart-slice="${slice.sliceId}" x="${slice.labelX}" y="${slice.labelY}">${slice.pct}%</text>`).join('')}
            </svg>
            ${type === 'donut' ? `<div class="distribution-hole"><strong>${Formatters.currency(total)}</strong><span>em gastos</span></div>` : ''}
          </div>
          <div class="distribution-legend">
            ${slices.map(slice => `<button type="button" class="distribution-legend-item" data-chart-slice="${slice.sliceId}"><span class="legend-dot" style="background:${slice.color}"></span><span>${slice.label}</span><strong>${Formatters.currency(slice.value)}</strong></button>`).join('')}
          </div>
        </div>`;
    },

    dashboard: function () {
      const totalBalance = State.accounts.reduce((acc, a) => acc + NumberParser.value(a.balance), 0);
      const totalIncome = State.transactions.filter(t => t.type === 'RECEITA').reduce((acc, t) => acc + NumberParser.value(t.amount), 0);
      const totalExpense = State.transactions.filter(t => t.type === 'DESPESA').reduce((acc, t) => acc + NumberParser.value(t.amount), 0);
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
        } else if ((document.querySelector('.chart-type-btn.active')?.dataset.chartType || 'bars') !== 'bars') {
          const chartType = document.querySelector('.chart-type-btn.active').dataset.chartType;
          catContainer.innerHTML = this.distributionChart(this.categoryData(State.transactions), chartType, 'dashboard-distribution');
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
      const recentTxs = [...State.transactions].sort((a, b) => FinancialStore.transactionTime(b) - FinancialStore.transactionTime(a)).slice(0, 5);
      const recentContainer = document.getElementById('dash-recent-transactions');
      if (recentContainer) {
        const typeLabels = { RECEITA: 'Receita', DESPESA: 'Despesa', TRANSFERENCIA: 'Transferência', AJUSTE_SALDO: 'Ajuste Saldo' };
        const typeColors = { RECEITA: 'var(--color-positive)', DESPESA: 'var(--color-risk)', TRANSFERENCIA: 'var(--color-secondary)', AJUSTE_SALDO: 'var(--color-warning)' };
        const typeSign  = { RECEITA: '+', DESPESA: '-', TRANSFERENCIA: '⇄', AJUSTE_SALDO: '~' };
        recentContainer.innerHTML = recentTxs.map((t, i) => {
          const isInitialBalance = t.origin === 'CADASTRO_CONTA';
          const displayType = isInitialBalance ? 'Saldo inicial' : (typeLabels[t.type] || t.type);
          const displayClass = isInitialBalance ? 'SALDO_INICIAL' : t.type;
          const displayColor = isInitialBalance ? 'var(--color-secondary)' : (typeColors[t.type] || 'var(--color-text-main)');
          const displaySign = isInitialBalance ? '' : (typeSign[t.type] || '');
          return `
          <tr style="animation: fadeSlideIn 0.3s ease both; animation-delay: ${i * 0.06}s">
            <td><span class="transaction-type ${displayClass}">${displayType}</span></td>
            <td><strong>${t.description}</strong></td>
            <td style="font-weight: 700; color: ${displayColor}">
              ${displaySign} ${Formatters.currency(t.amount)}
            </td>
          </tr>
        `; }).join('');
      }
    },

    reports: function () {
      const period = document.querySelector('.report-period-btn.active')?.dataset.reportPeriod || 'current';
      const distributionType = document.querySelector('.report-distribution-btn.active')?.dataset.reportDistribution || 'donut';
      const flowType = document.querySelector('.report-flow-btn.active')?.dataset.reportFlow || 'all';
      const allTransactions = State.transactions || [];
      const latestDate = allTransactions.map(t => t.date).filter(Boolean).sort().slice(-1)[0] || new Date().toISOString().slice(0, 10);
      const latestMonth = latestDate.slice(0, 7);
      const transactions = period === 'current' ? allTransactions.filter(t => t.date?.startsWith(latestMonth)) : allTransactions;
      const income = transactions.filter(t => t.type === 'RECEITA').reduce((sum, t) => sum + Number(t.amount || 0), 0);
      const expense = transactions.filter(t => t.type === 'DESPESA').reduce((sum, t) => sum + Number(t.amount || 0), 0);
      const net = income - expense;
      const categories = this.categoryData(transactions);
      const topCategory = categories[0];

      const setText = (id, value) => { const element = document.getElementById(id); if (element) element.textContent = value; };
      setText('report-total-income', Formatters.currency(income));
      setText('report-total-expense', Formatters.currency(expense));
      setText('report-net-result', Formatters.currency(net));
      setText('report-net-detail', net >= 0 ? 'Resultado positivo no período' : 'Atenção ao saldo do período');
      setText('report-top-category', topCategory?.label || '—');
      setText('report-top-category-detail', topCategory ? `${Formatters.currency(topCategory.value)} · ${topCategory.pct}% das despesas` : 'Nenhuma despesa no período');

      const donut = document.getElementById('report-expense-donut');
      if (donut) donut.innerHTML = this.distributionChart(categories, distributionType, 'report-distribution');

      const byDay = {};
      transactions.filter(t => t.type === 'RECEITA' || t.type === 'DESPESA').forEach(t => {
        if (!byDay[t.date]) byDay[t.date] = { income: 0, expense: 0 };
        if (t.type === 'RECEITA') byDay[t.date].income += Number(t.amount || 0);
        else byDay[t.date].expense += Number(t.amount || 0);
      });
      const days = Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b)).filter(([, values]) => flowType === 'all' || (flowType === 'income' ? values.income > 0 : values.expense > 0));
      const peak = Math.max(1, ...days.flatMap(([, values]) => flowType === 'income' ? [values.income] : (flowType === 'expense' ? [values.expense] : [values.income, values.expense])));
      const cashflow = document.getElementById('report-cashflow-chart');
      if (cashflow) cashflow.innerHTML = days.length ? `<div class="cashflow-legend">${flowType !== 'expense' ? '<span><i class="legend-dot income-dot"></i>Entradas</span>' : ''}${flowType !== 'income' ? '<span><i class="legend-dot expense-dot"></i>Saídas</span>' : ''}</div><div class="cashflow-bars">${days.map(([date, values]) => `<div class="cashflow-day report-highlight-item"><div class="cashflow-columns">${flowType !== 'expense' ? `<span class="cashflow-bar income" style="height:${Math.max(values.income ? 9 : 0, (values.income / peak) * 150)}px" title="Entradas: ${Formatters.currency(values.income)}"></span>` : ''}${flowType !== 'income' ? `<span class="cashflow-bar expense" style="height:${Math.max(values.expense ? 9 : 0, (values.expense / peak) * 150)}px" title="Saídas: ${Formatters.currency(values.expense)}"></span>` : ''}</div><span>${date.slice(8, 10)}/${date.slice(5, 7)}</span></div>`).join('')}</div>` : '<div class="empty-state">Nenhuma movimentação no período.</div>';

      const categoryBars = document.getElementById('report-category-bars');
      if (categoryBars) categoryBars.innerHTML = categories.length ? categories.map(item => `<div class="report-bar-item report-highlight-item"><div><span>${item.label}</span><strong>${Formatters.currency(item.value)}</strong></div><div class="report-bar-track"><span style="width:${item.pct}%; background:${item.color}"></span></div></div>`).join('') : '<div class="empty-state">Nenhuma despesa no período.</div>';

      const payments = {};
      transactions.filter(t => t.type === 'RECEITA' || t.type === 'DESPESA').forEach(t => { const key = t.paymentMethod || 'Não informado'; payments[key] = (payments[key] || 0) + Number(t.amount || 0); });
      const paymentEntries = Object.entries(payments).sort((a, b) => b[1] - a[1]);
      const paymentTotal = paymentEntries.reduce((sum, [, value]) => sum + value, 0);
      const payment = document.getElementById('report-payment-chart');
      if (payment) payment.innerHTML = paymentEntries.length ? paymentEntries.map(([label, value]) => { const pct = Math.round((value / paymentTotal) * 100); return `<div class="payment-row report-highlight-item"><span>${label}</span><div class="payment-meter"><i style="width:${pct}%"></i></div><strong>${pct}%</strong></div>`; }).join('') : '<div class="empty-state">Nenhuma movimentação no período.</div>';

      const accountTotal = State.accounts.reduce((sum, account) => sum + Number(account.balance || 0), 0);
      const accounts = document.getElementById('report-accounts-chart');
      if (accounts) accounts.innerHTML = State.accounts.length ? State.accounts.map((account, index) => { const pct = accountTotal ? Math.max(0, Math.round((Number(account.balance || 0) / accountTotal) * 100)) : 0; return `<div class="account-distribution-item report-highlight-item"><div><span class="account-color account-color-${index % 4}"></span><strong>${account.name}</strong><small>${account.institution}</small></div><div class="account-distribution-value"><strong>${Formatters.currency(account.balance)}</strong><span>${pct}% do saldo</span></div><div class="account-distribution-track"><i class="account-color-${index % 4}" style="width:${pct}%"></i></div></div>`; }).join('') : '<div class="empty-state">Nenhuma conta cadastrada.</div>';
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

      filtered.sort((a, b) => FinancialStore.transactionTime(b) - FinancialStore.transactionTime(a));

      if (filtered.length === 0) {
        container.innerHTML = '<tr><td colspan="6" class="empty-state">Nenhuma movimentação encontrada.</td></tr>';
        return;
      }

      const typeLabels = { 'RECEITA': 'Receita', 'DESPESA': 'Despesa', 'TRANSFERENCIA': 'Transferência', 'AJUSTE_SALDO': 'Ajuste Saldo' };
      const typeSign = { 'RECEITA': '+', 'DESPESA': '-', 'TRANSFERENCIA': '⇄', 'AJUSTE_SALDO': '~' };
      const typeColors = { 'RECEITA': 'var(--color-positive)', 'DESPESA': 'var(--color-risk)', 'TRANSFERENCIA': 'var(--color-info)', 'AJUSTE_SALDO': 'var(--color-warning)' };

      container.innerHTML = filtered.map(t => {
        const isInitialBalance = t.origin === 'CADASTRO_CONTA';
        const displayType = isInitialBalance ? 'Saldo inicial' : (typeLabels[t.type] || t.type);
        const displayClass = isInitialBalance ? 'SALDO_INICIAL' : t.type;
        const displayColor = isInitialBalance ? 'var(--color-secondary)' : (typeColors[t.type] || 'var(--color-text-main)');
        const displaySign = isInitialBalance ? '' : (typeSign[t.type] || '');
        return `
        <tr>
          <td><span class="transaction-type ${displayClass}">${displayType}</span></td>
          <td><strong>${t.description}</strong></td>
          <td><span class="badge badge-info transaction-category">${t.category}</span></td>
          <td>${t.account}</td>
          <td>${Formatters.date(t.date)}</td>
          <td style="font-weight: 700; color: ${displayColor}">
            ${displaySign} ${Formatters.currency(t.amount)}
          </td>
          <td class="table-actions"><button type="button" class="btn btn-outline btn-xs tx-action" data-tx-action="details" data-id="${t.id}">Detalhes</button><button type="button" class="btn btn-outline btn-xs tx-action" data-tx-action="edit" data-id="${t.id}">Editar</button><button type="button" class="btn btn-danger btn-xs tx-action" data-tx-action="delete" data-id="${t.id}">Excluir</button></td>
        </tr>
      `; }).join('');
    },
    
    initFilters: function() {
      const fillFilter = (id, values, label) => {
        const select = document.getElementById(id);
        if (!select) return;
        const uniqueValues = [...new Set(values.filter(Boolean))].sort();
        const signature = uniqueValues.join('|');
        if (select.dataset.optionsSignature === signature) return;
        const current = select.value;
        select.innerHTML = `<option value="ALL">${label}</option>` + uniqueValues.map(v => `<option value="${v}">${v}</option>`).join('');
        if ([...select.options].some(o => o.value === current)) select.value = current;
        select.dataset.optionsSignature = signature;
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
            <div class="account-actions"><button type="button" class="btn btn-outline btn-xs account-action" data-account-action="edit" data-id="${acc.id}">Editar</button><button type="button" class="btn btn-outline btn-xs account-action" data-account-action="adjust" data-id="${acc.id}">Ajustar saldo</button><button type="button" class="btn btn-outline btn-xs account-action" data-account-action="deactivate" data-id="${acc.id}">${acc.status === 'Ativa' ? 'Desativar' : 'Reativar'}</button><button type="button" class="btn btn-danger btn-xs account-action" data-account-action="delete" data-id="${acc.id}">Excluir</button></div>
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
      const currentAnalysis = State.analysisHistory[0] || null;
      const hasSelectedPeriod = Boolean(currentAnalysis?.periodStart && currentAnalysis?.periodEnd);
      const analysisTransactions = hasSelectedPeriod
        ? State.transactions.filter(transaction => transaction.date >= currentAnalysis.periodStart && transaction.date <= currentAnalysis.periodEnd)
        : State.transactions;
      const income = analysisTransactions.filter(t => t.type === 'RECEITA').reduce((s, t) => s + NumberParser.value(t.amount), 0);
      const expenses = analysisTransactions.filter(t => t.type === 'DESPESA').reduce((s, t) => s + NumberParser.value(t.amount), 0);
      const debt = State.debts.reduce((s, d) => s + (d.remainingBalance || 0), 0);
      const incomeBase = income || NumberParser.value(State.user.monthlyIncome);
      const commitment = incomeBase ? Math.round(expenses / incomeBase * 100) : 0;
      const debtLevel = incomeBase ? Math.round((debt / incomeBase) * 1000) / 10 : 0;
      const savingsRate = income ? ((income - expenses) / income) * 100 : 0;
      const profile = currentAnalysis?.profile || (commitment > 70 ? 'EM RISCO' : commitment > 50 || debtLevel > 100 ? 'EM OBSERVAÇÃO' : 'SAUDÁVEL');
      const confidence = currentAnalysis?.confidence ?? State.user.confidenceScore ?? 82;
      const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
      set('analysis-income', Formatters.currency(income)); set('analysis-expenses', Formatters.currency(expenses)); set('analysis-balance', Formatters.currency(income - expenses)); set('analysis-debt', Formatters.currency(debt)); set('analysis-commitment', `${commitment}%`); set('analysis-risk', commitment > 70 ? 'Atenção' : 'Baixo');
      set('analysis-profile-status', profile);
      set('analysis-confidence', `Confiança da classificação: ${confidence}%`);
      set('analysis-debt-level', `${debtLevel.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`);
      set('analysis-savings-frequency', savingsRate >= 20 ? 'Alta' : savingsRate > 0 ? 'Média' : 'Baixa');
      set('analysis-current-period', hasSelectedPeriod
        ? `Período analisado: ${Formatters.date(currentAnalysis.periodStart)} a ${Formatters.date(currentAnalysis.periodEnd)}`
        : 'Visualização atual: todas as movimentações');
      const cats = {}; analysisTransactions.filter(t => t.type === 'DESPESA').forEach(t => cats[t.category] = (cats[t.category] || 0) + NumberParser.value(t.amount));
      const catSummary = document.getElementById('analysis-category-summary'); if (catSummary) catSummary.innerHTML = Object.entries(cats).sort((a,b) => b[1]-a[1]).slice(0,4).map(([name, value]) => `<span>${name}<strong>${Formatters.currency(value)}</strong></span>`).join('');
      const alertSummary = document.getElementById('analysis-alerts-summary'); if (alertSummary) alertSummary.innerHTML = State.alerts.filter(a => !a.read).slice(0,3).map(a => `<span class="analysis-alert-item">${a.title}</span>`).join('') || '<span>Nenhum alerta pendente.</span>';
      const history = document.getElementById('analysis-history-list');
      if (history) history.innerHTML = State.analysisHistory.length
        ? State.analysisHistory.map(item => `<div class="analysis-history-row"><span>${item.periodStart && item.periodEnd ? `${Formatters.date(item.periodStart)} a ${Formatters.date(item.periodEnd)}` : Formatters.date(item.date)}</span><strong>${Formatters.currency(item.balance)}</strong><span>${item.profile}</span><button type="button" class="btn btn-danger btn-xs analysis-history-action" data-analysis-action="delete" data-id="${item.id}">Excluir</button></div>`).join('')
        : '<p class="empty-state">Nenhuma análise salva ainda.</p>';
      const deletedButton = document.getElementById('btn-toggle-deleted-analyses');
      if (deletedButton) deletedButton.textContent = `Itens excluídos (${State.deletedAnalyses.length})`;
      const deletedList = document.getElementById('analysis-deleted-list');
      if (deletedList) deletedList.innerHTML = State.deletedAnalyses.length
        ? `<div class="analysis-deleted-title">Análises excluídas — restaure uma análise caso tenha removido por engano.</div>${State.deletedAnalyses.map(item => `<div class="analysis-history-row analysis-deleted-row"><span>${item.periodStart && item.periodEnd ? `${Formatters.date(item.periodStart)} a ${Formatters.date(item.periodEnd)}` : Formatters.date(item.date)}</span><strong>${Formatters.currency(item.balance)}</strong><span>${item.profile}</span><button type="button" class="btn btn-outline btn-xs analysis-history-action" data-analysis-action="restore" data-id="${item.id}">Restaurar</button></div>`).join('')}`
        : '<p class="empty-state">Nenhuma análise excluída.</p>';
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

      const planningContainer = document.getElementById('diary-planning-container');
      if (planningContainer) {
        const plannings = State.diary.filter(n => (n.type === 'planejamento' || n.type === 'meta') && NumberParser.value(n.valorAlvo) > 0);
        planningContainer.innerHTML = plannings.length === 0
          ? '<p class="diary-empty-message">Nenhum planejamento com valor alvo por enquanto. Crie uma entrada dos tipos Planejamento ou Meta e defina o valor alvo.</p>'
          : plannings.map(n => {
            const target = NumberParser.value(n.valorAlvo);
            const current = NumberParser.value(n.valorAtual);
            const pct = Math.min(100, Math.round((current / target) * 100));
            const reached = current >= target;
            return `
              <div class="planning-card" data-id="${n.id}">
                <div class="planning-card-header">
                  <div>
                    <span class="badge badge-${n.type === 'meta' ? 'warning' : 'accent'}" style="text-transform: uppercase;">${n.type}</span>
                    <h4 class="planning-card-title">${n.title}</h4>
                  </div>
                  <button type="button" class="btn btn-danger btn-xs planning-delete-btn" data-id="${n.id}" title="Excluir planejamento">Excluir</button>
                </div>
                <div class="planning-values">
                  <span class="planning-current">${Formatters.currency(current)}</span>
                  <span class="planning-target">de ${Formatters.currency(target)} · ${pct}%</span>
                </div>
                <div class="progress-bar-bg planning-progress">
                  <div class="progress-bar-fill ${reached ? 'planning-progress-done' : ''}" style="width: ${pct}%"></div>
                </div>
                <form class="planning-add-form">
                  <input type="text" inputmode="decimal" class="form-input planning-add-input" placeholder="Valor a adicionar (R$)">
                  <button type="submit" class="btn btn-primary btn-sm planning-add-btn">Adicionar</button>
                </form>
              </div>
            `;
          }).join('');
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

      const noBuyPreview = document.getElementById('diary-no-buy-preview');
      if (noBuyPreview) {
        const noBuyItem = State.shopping.find(item => item.doNotBuyAgain);
        noBuyPreview.innerHTML = noBuyItem
          ? `<strong>${noBuyItem.title}</strong><span>Marcado para não comprar novamente.</span>`
          : '<span>Nenhum produto marcado até o momento.</span>';
      }
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

  // --- Atualização local do protótipo ---
  // Mantém telas e localStorage sincronizados até a integração com a API.
  const FinancialStore = {
    today: function () {
      return new Date().toISOString().split('T')[0];
    },

    transactionTime: function (transaction) {
      const dateBase = Date.parse(`${transaction.date || '1970-01-01'}T00:00:00`) || 0;
      const createdAt = Date.parse(transaction.createdAt || '');
      if (Number.isFinite(createdAt)) return dateBase + (createdAt % 86400000);
      const idTimestamp = Number(String(transaction.id || '').replace(/^tx_/, ''));
      if (Number.isFinite(idTimestamp) && idTimestamp > 1000000000000) return dateBase + (idTimestamp % 86400000);
      return dateBase;
    },

    refresh: function () {
      StorageService.set(STORAGE_KEYS.ACCOUNTS, State.accounts);
      StorageService.set(STORAGE_KEYS.TRANSACTIONS, State.transactions);
      Render.all();
    },

    applyTransactionEffect: function (transaction, direction = 1) {
      const amount = NumberParser.value(transaction.amount);
      const sourceAccount = State.accounts.find(account => account.name === transaction.account);
      if (!sourceAccount) return false;

      if (transaction.type === 'RECEITA') sourceAccount.balance += amount * direction;
      if (transaction.type === 'DESPESA') sourceAccount.balance -= amount * direction;
      if (transaction.type === 'TRANSFERENCIA') {
        const destinationAccount = State.accounts.find(account => account.name === transaction.destinationAccount);
        if (!destinationAccount) return false;
        sourceAccount.balance -= amount * direction;
        destinationAccount.balance += amount * direction;
      }
      if (transaction.type === 'AJUSTE_SALDO') {
        if (direction === 1) {
          transaction.previousBalance = NumberParser.value(sourceAccount.balance);
          sourceAccount.balance = NumberParser.value(transaction.realBalance);
        } else {
          if (transaction.previousBalance === undefined || transaction.previousBalance === null) return false;
          sourceAccount.balance = NumberParser.value(transaction.previousBalance);
        }
      }
      return true;
    },

    registerTransaction: function (transaction) {
      const amount = NumberParser.value(transaction.amount);
      const isBalanceAdjustment = transaction.type === 'AJUSTE_SALDO';
      const realBalance = NumberParser.value(transaction.realBalance);
      if (!transaction.account || (!isBalanceAdjustment && amount <= 0)) {
        Toast.show('Informe uma conta e um valor maior que zero.', 'warning');
        return false;
      }
      if (isBalanceAdjustment && !Number.isFinite(realBalance)) {
        Toast.show('Informe o saldo real conferido.', 'warning');
        return false;
      }
      if (!State.accounts.some(account => account.name === transaction.account)) {
        Toast.show('A conta selecionada não foi encontrada.', 'warning');
        return false;
      }
      if (transaction.type === 'TRANSFERENCIA' && !State.accounts.some(account => account.name === transaction.destinationAccount)) {
        Toast.show('Escolha uma conta de destino válida.', 'warning');
        return false;
      }

      transaction.amount = amount;
      if (isBalanceAdjustment) transaction.realBalance = realBalance;
      transaction.createdAt = transaction.createdAt || new Date().toISOString();
      if (!this.applyTransactionEffect(transaction, 1)) return false;
      State.transactions.push(transaction);
      this.refresh();
      return true;
    },

    deleteTransaction: function (transaction) {
      if (!this.applyTransactionEffect(transaction, -1)) {
        Toast.show('Não foi possível desfazer o efeito desta movimentação no saldo.', 'warning');
        return false;
      }
      State.transactions = State.transactions.filter(item => item.id !== transaction.id);
      this.refresh();
      return true;
    },

    updateTransaction: function (transaction, changes) {
      const previous = { ...transaction };
      if (!this.applyTransactionEffect(previous, -1)) {
        Toast.show('Não foi possível recalcular o saldo anterior.', 'warning');
        return false;
      }
      Object.assign(transaction, changes);
      if (!this.applyTransactionEffect(transaction, 1)) {
        Object.assign(transaction, previous);
        this.applyTransactionEffect(transaction, 1);
        Toast.show('Não foi possível aplicar a movimentação atualizada.', 'warning');
        return false;
      }
      this.refresh();
      return true;
    },

    saveAccount: function (account, isEditing, options = {}) {
      if (isEditing) {
        const index = State.accounts.findIndex(item => item.id === account.id);
        if (index === -1) return false;
        State.accounts[index] = { ...State.accounts[index], ...account };
      } else {
        const declaredBalance = NumberParser.value(options.declaredBalance);
        const addBalanceAsIncome = Boolean(options.addBalanceAsIncome && declaredBalance > 0);
        account.initialBalance = addBalanceAsIncome ? 0 : declaredBalance;
        account.balance = addBalanceAsIncome ? 0 : declaredBalance;
        State.accounts.push(account);
        if (addBalanceAsIncome) {
          const openingIncome = {
            id: 'tx_' + Date.now(),
            type: 'RECEITA',
            description: `Receita de abertura — ${account.name}`,
            category: 'Outras receitas',
            account: account.name,
            amount: declaredBalance,
            paymentMethod: 'Saldo informado no cadastro',
            origin: 'CADASTRO_CONTA_COMO_RECEITA',
            date: this.today(),
            createdAt: new Date().toISOString()
          };
          this.applyTransactionEffect(openingIncome, 1);
          State.transactions.push(openingIncome);
        }
      }
      this.refresh();
      return true;
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
      const activeNavigationView = viewId;
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

      if (!FinancialStore.registerTransaction(newTx)) return;
      finModal.classList.remove('active');
      showPromptStep(true);
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

        if (!FinancialStore.registerTransaction(newTx)) return;
        document.getElementById('modal-ai-review').classList.remove('active');
        document.getElementById('ai-prompt-input').value = '';
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

        if (!FinancialStore.registerTransaction(newTx)) return;
        manualTxForm.reset();
        Toast.show('Movimentação salva com sucesso!');
        Router.navigate('movimentacoes');
      });
    }

    let editingAccountId = null;
    const newAccountForm = document.getElementById('new-account-form');
    if (newAccountForm) {
      newAccountForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const isEditing = Boolean(editingAccountId);
        const declaredBalance = NumberParser.value(document.getElementById('acc-balance-input').value);
        const addBalanceAsIncome = !isEditing && Boolean(document.getElementById('acc-balance-as-income')?.checked);
        const newAcc = {
          id: editingAccountId || 'acc_' + Date.now(),
          name: document.getElementById('acc-name-input').value,
          institution: document.getElementById('acc-inst-input').value,
          type: document.getElementById('acc-type-input').value,
          currency: 'BRL',
          balance: declaredBalance,
          creditLimit: NumberParser.value(document.getElementById('acc-limit-input').value),
          overdraftLimit: NumberParser.value(document.getElementById('acc-overdraft-input').value),
          status: 'Ativa'
        };

        if (!FinancialStore.saveAccount(newAcc, isEditing, { declaredBalance, addBalanceAsIncome })) {
          Toast.show('Não foi possível localizar a conta para atualização.', 'warning');
          return;
        }
        editingAccountId = null;
        newAccountForm.reset();
        const balanceAsIncomeInput = document.getElementById('acc-balance-as-income');
        if (balanceAsIncomeInput) balanceAsIncomeInput.checked = false;
        document.getElementById('modal-new-account').classList.remove('active');
        const successMessage = isEditing
          ? 'Conta financeira atualizada!'
          : addBalanceAsIncome
            ? 'Conta criada e saldo registrado uma única vez como receita.'
            : 'Conta criada com saldo inicial. O valor não foi contado como receita.';
        Toast.show(successMessage);
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
          createdAt: new Date().toISOString(),
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
    document.querySelectorAll('.chart-type-btn').forEach(function (button) {
      button.addEventListener('click', function () {
        document.querySelectorAll('.chart-type-btn').forEach(function (chartButton) {
          chartButton.classList.remove('active');
          chartButton.setAttribute('aria-pressed', 'false');
        });
        button.classList.add('active');
        button.setAttribute('aria-pressed', 'true');
        Render.dashboard();
      });
    });
    const setDistributionSliceState = function (chart, sliceId, active) {
      if (!chart) return;
      chart.classList.toggle('has-active-slice', active);
      chart.querySelectorAll('[data-chart-slice]').forEach(function (element) {
        const isCurrent = element.dataset.chartSlice === sliceId;
        element.classList.toggle('is-active', active && isCurrent);
        element.classList.toggle('is-dimmed', active && !isCurrent);
      });
    };
    document.addEventListener('mouseover', function (event) {
      const trigger = event.target.closest('[data-chart-slice]');
      if (!trigger) return;
      setDistributionSliceState(trigger.closest('.distribution-chart'), trigger.dataset.chartSlice, true);
    });
    document.addEventListener('mouseout', function (event) {
      const trigger = event.target.closest('[data-chart-slice]');
      if (!trigger) return;
      const nextTrigger = event.relatedTarget?.closest?.('[data-chart-slice]');
      if (nextTrigger && nextTrigger.closest('.distribution-chart') === trigger.closest('.distribution-chart')) return;
      setDistributionSliceState(trigger.closest('.distribution-chart'), trigger.dataset.chartSlice, false);
    });
    [
      ['.report-period-btn', 'reportPeriod'],
      ['.report-distribution-btn', 'reportDistribution'],
      ['.report-flow-btn', 'reportFlow']
    ].forEach(function ([selector]) {
      document.querySelectorAll(selector).forEach(function (button) {
        button.addEventListener('click', function () {
          document.querySelectorAll(selector).forEach(function (filterButton) {
            filterButton.classList.remove('active');
            filterButton.setAttribute('aria-pressed', 'false');
          });
          button.classList.add('active');
          button.setAttribute('aria-pressed', 'true');
          Render.reports();
        });
      });
    });
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
        const transactionTypeLabel = tx.origin === 'CADASTRO_CONTA' ? 'Saldo inicial' : tx.type;
        const modal = document.getElementById('modal-transaction'); modal.classList.add('active'); editingTransactionId = tx.id;
        document.getElementById('transaction-details-content').innerHTML = `<p><strong>${tx.description}</strong></p><p>${transactionTypeLabel} · ${Formatters.currency(tx.amount)} · ${Formatters.date(tx.date)}</p><p>Categoria: ${tx.category || '—'} · Conta: ${tx.account || '—'} · Pagamento: ${tx.paymentMethod || '—'}</p><p>${tx.obs || tx.reason || ''}</p>`;
        document.getElementById('transaction-edit-form').style.display = txButton.dataset.txAction === 'edit' ? 'block' : 'none'; document.getElementById('btn-save-edit-transaction').style.display = txButton.dataset.txAction === 'edit' ? 'inline-flex' : 'none'; document.getElementById('btn-start-edit-transaction').style.display = txButton.dataset.txAction === 'edit' ? 'none' : 'inline-flex';
        if (txButton.dataset.txAction === 'delete') {
          modal.classList.remove('active');
          if (confirm('Excluir esta movimentação?') && FinancialStore.deleteTransaction(tx)) {
            Toast.show('Movimentação excluída e saldo recalculado.');
          }
          return;
        }
        if (txButton.dataset.txAction === 'edit') { document.getElementById('tx-edit-description').value = tx.description; document.getElementById('tx-edit-amount').value = tx.amount; document.getElementById('tx-edit-category').value = tx.category || ''; document.getElementById('tx-edit-payment').value = tx.paymentMethod || ''; document.getElementById('tx-edit-date').value = tx.date; }
      }
      const accountButton = e.target.closest('.account-action');
      if (accountButton) {
        const acc = State.accounts.find(account => account.id === accountButton.dataset.id);
        if (!acc) return;
        const action = accountButton.dataset.accountAction;

        if (action === 'deactivate') {
          acc.status = acc.status === 'Ativa' ? 'Inativa' : 'Ativa';
          StorageService.set(STORAGE_KEYS.ACCOUNTS, State.accounts);
          Render.all();
          Toast.show(acc.status === 'Ativa' ? 'Conta reativada.' : 'Conta desativada.');
          return;
        }

        if (action === 'delete') {
          const relatedTransactions = State.transactions.filter(transaction => transaction.account === acc.name).length;
          const message = relatedTransactions
            ? `Excluir a conta “${acc.name}”? As ${relatedTransactions} movimentações do histórico serão preservadas.`
            : `Excluir a conta “${acc.name}”?`;
          if (!confirm(message)) return;
          State.accounts = State.accounts.filter(account => account.id !== acc.id);
          StorageService.set(STORAGE_KEYS.ACCOUNTS, State.accounts);
          Render.all();
          Toast.show('Conta excluída. O histórico de movimentações foi preservado.');
          return;
        }

        if (action === 'adjust') {
          const value = NumberParser.value(prompt('Informe o saldo real conferido: ', acc.balance));
          const reason = prompt('Motivo do ajuste:');
          if (reason) {
            FinancialStore.registerTransaction({
              id: 'tx_' + Date.now(), type: 'AJUSTE_SALDO', description: 'Ajuste de saldo',
              account: acc.name, amount: Math.abs(value - NumberParser.value(acc.balance)),
              realBalance: value, reason, category: 'Ajuste', date: FinancialStore.today()
            });
          }
        }
      }
    });
    document.getElementById('btn-start-edit-transaction')?.addEventListener('click', () => { document.getElementById('transaction-edit-form').style.display = 'block'; document.getElementById('btn-save-edit-transaction').style.display = 'inline-flex'; document.getElementById('btn-start-edit-transaction').style.display = 'none'; const tx = State.transactions.find(t => t.id === editingTransactionId); if (tx) { document.getElementById('tx-edit-description').value = tx.description; document.getElementById('tx-edit-amount').value = tx.amount; document.getElementById('tx-edit-category').value = tx.category || ''; document.getElementById('tx-edit-payment').value = tx.paymentMethod || ''; document.getElementById('tx-edit-date').value = tx.date; } });
    document.getElementById('btn-save-edit-transaction')?.addEventListener('click', () => {
      const tx = State.transactions.find(t => t.id === editingTransactionId);
      if (!tx) return;
      const updated = FinancialStore.updateTransaction(tx, {
        description: document.getElementById('tx-edit-description').value,
        amount: NumberParser.value(document.getElementById('tx-edit-amount').value),
        category: document.getElementById('tx-edit-category').value,
        paymentMethod: document.getElementById('tx-edit-payment').value,
        date: document.getElementById('tx-edit-date').value
      });
      if (!updated) return;
      document.getElementById('modal-transaction').classList.remove('active');
      Toast.show('Movimentação atualizada e saldo recalculado.');
    });
    const analysisForm = document.getElementById('generate-analysis-form');
    const fillAnalysisPeriod = function () {
      const end = new Date();
      const start = new Date(end.getFullYear(), end.getMonth(), 1);
      const toInputDate = date => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      const startInput = document.getElementById('analysis-period-start');
      const endInput = document.getElementById('analysis-period-end');
      if (startInput && !startInput.value) startInput.value = toInputDate(start);
      if (endInput && !endInput.value) endInput.value = toInputDate(end);
    };
    document.getElementById('btn-generate-analysis')?.addEventListener('click', fillAnalysisPeriod);
    analysisForm?.addEventListener('submit', function (event) {
      event.preventDefault();
      const periodStart = document.getElementById('analysis-period-start').value;
      const periodEnd = document.getElementById('analysis-period-end').value;
      if (!periodStart || !periodEnd || periodStart > periodEnd) {
        Toast.show('Informe um período válido para a análise.', 'warning');
        return;
      }

      const transactions = State.transactions.filter(transaction => transaction.date >= periodStart && transaction.date <= periodEnd);
      const income = transactions.filter(transaction => transaction.type === 'RECEITA').reduce((sum, transaction) => sum + NumberParser.value(transaction.amount), 0);
      const expenses = transactions.filter(transaction => transaction.type === 'DESPESA').reduce((sum, transaction) => sum + NumberParser.value(transaction.amount), 0);
      const debt = State.debts.reduce((sum, item) => sum + NumberParser.value(item.remainingBalance), 0);
      const incomeBase = income || NumberParser.value(State.user.monthlyIncome);
      const commitment = incomeBase ? Math.round((expenses / incomeBase) * 100) : 0;
      const debtLevel = incomeBase ? (debt / incomeBase) * 100 : 0;
      const profile = commitment > 70 ? 'EM RISCO' : commitment > 50 || debtLevel > 100 ? 'EM OBSERVAÇÃO' : 'SAUDÁVEL';
      const confidence = State.user.confidenceScore || 82;

      State.analysisHistory.unshift({
        id: 'analysis_' + Date.now(),
        date: FinancialStore.today(),
        createdAt: new Date().toISOString(),
        periodStart,
        periodEnd,
        income,
        expenses,
        balance: income - expenses,
        totalDebt: debt,
        commitment,
        debtLevel: Math.round(debtLevel * 10) / 10,
        profile,
        confidence
      });
      State.user.profileStatus = profile;
      State.user.confidenceScore = confidence;
      StorageService.set(STORAGE_KEYS.ANALYSIS_HISTORY, State.analysisHistory);
      StorageService.set(STORAGE_KEYS.USER, State.user);
      document.getElementById('modal-generate-analysis')?.classList.remove('active');
      document.querySelector('.analysis-detail-grid')?.classList.add('analysis-details-visible');
      document.querySelector('.analysis-history-card')?.classList.add('analysis-details-visible');
      const detailsButton = document.getElementById('btn-analysis-details');
      if (detailsButton) detailsButton.textContent = 'Ocultar detalhes';
      Render.all();
      Toast.show(transactions.length ? 'Nova análise gerada e salva no histórico.' : 'Análise gerada sem movimentações no período.', transactions.length ? 'success' : 'warning');
    });
    document.getElementById('btn-toggle-deleted-analyses')?.addEventListener('click', function () {
      const deletedList = document.getElementById('analysis-deleted-list');
      if (!deletedList) return;
      deletedList.hidden = !deletedList.hidden;
      this.textContent = deletedList.hidden
        ? `Itens excluídos (${State.deletedAnalyses.length})`
        : 'Ocultar itens excluídos';
    });
    document.addEventListener('click', function (event) {
      const actionButton = event.target.closest('.analysis-history-action');
      if (!actionButton) return;
      const id = actionButton.dataset.id;
      if (actionButton.dataset.analysisAction === 'delete') {
        const analysis = State.analysisHistory.find(item => item.id === id);
        if (!analysis) return;
        State.analysisHistory = State.analysisHistory.filter(item => item.id !== id);
        State.deletedAnalyses.unshift({ ...analysis, deletedAt: new Date().toISOString() });
        StorageService.set(STORAGE_KEYS.ANALYSIS_HISTORY, State.analysisHistory);
        StorageService.set(STORAGE_KEYS.DELETED_ANALYSES, State.deletedAnalyses);
        Render.all();
        Toast.show('Análise movida para itens excluídos. Você pode restaurá-la quando quiser.');
      }
      if (actionButton.dataset.analysisAction === 'restore') {
        const analysis = State.deletedAnalyses.find(item => item.id === id);
        if (!analysis) return;
        State.deletedAnalyses = State.deletedAnalyses.filter(item => item.id !== id);
        delete analysis.deletedAt;
        State.analysisHistory.unshift(analysis);
        StorageService.set(STORAGE_KEYS.ANALYSIS_HISTORY, State.analysisHistory);
        StorageService.set(STORAGE_KEYS.DELETED_ANALYSES, State.deletedAnalyses);
        Render.all();
        Toast.show('Análise restaurada no histórico.');
      }
    });
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
    document.addEventListener('click', function (e) {
      const button = e.target.closest('.account-action[data-account-action="edit"]');
      if (!button) return;
      const acc = State.accounts.find(item => item.id === button.dataset.id);
      if (!acc) return;
      editingAccountId = acc.id;
      document.getElementById('acc-name-input').value = acc.name;
      document.getElementById('acc-inst-input').value = acc.institution;
      document.getElementById('acc-type-input').value = acc.type;
      const balanceInput = document.getElementById('acc-balance-input');
      balanceInput.value = acc.balance;
      balanceInput.readOnly = true;
      document.getElementById('acc-limit-input').value = acc.creditLimit;
      document.getElementById('acc-overdraft-input').value = acc.overdraftLimit;
      document.getElementById('account-balance-label').textContent = 'Saldo atual da conta (R$)';
      document.getElementById('account-balance-helper').textContent = 'Para corrigir este valor, use a ação “Ajustar saldo” no cartão da conta.';
      const incomeOption = document.getElementById('account-balance-income-option');
      const incomeInput = document.getElementById('acc-balance-as-income');
      if (incomeOption) incomeOption.hidden = true;
      if (incomeInput) incomeInput.checked = false;
      document.getElementById('modal-new-account').classList.add('active');
    });

    document.addEventListener('click', function (e) {
      const button = e.target.closest('[data-open-modal="modal-new-account"]');
      if (!button || button.closest('.account-action')) return;
      editingAccountId = null;
      newAccountForm?.reset();
      const balanceInput = document.getElementById('acc-balance-input');
      if (balanceInput) balanceInput.readOnly = false;
      document.getElementById('account-balance-label').textContent = 'Saldo inicial da conta (R$)';
      document.getElementById('account-balance-helper').textContent = 'Informe quanto existe na conta no momento do cadastro.';
      const incomeOption = document.getElementById('account-balance-income-option');
      const incomeInput = document.getElementById('acc-balance-as-income');
      if (incomeOption) incomeOption.hidden = false;
      if (incomeInput) incomeInput.checked = false;
    });

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

        const targetValue = NumberParser.value(document.getElementById('diary-target-input')?.value);
        if (targetValue > 0) {
          newNote.valorAlvo = targetValue;
          newNote.valorAtual = NumberParser.value(document.getElementById('diary-current-input')?.value);
        }

        State.diary.unshift(newNote);
        StorageService.set(STORAGE_KEYS.DIARY, State.diary);
        diaryForm.reset();
        Render.diary();
        Toast.show('Anotação salva no diário!');
      });
    }

    document.getElementById('diary-type-select')?.addEventListener('change', function () {
      if (this.value !== 'lista_compras') {
        const valueFields = document.getElementById('diary-value-fields');
        if (valueFields) {
          valueFields.hidden = this.value !== 'planejamento' && this.value !== 'meta';
        }
        return;
      }
      this.value = 'anotacao';
      Router.navigate('lista-compras');
    });

    document.addEventListener('submit', function (e) {
      const addForm = e.target.closest('.planning-add-form');
      if (!addForm) return;
      e.preventDefault();
      const card = addForm.closest('.planning-card');
      const note = State.diary.find(n => n.id === card.dataset.id);
      if (!note) return;
      const amount = NumberParser.value(addForm.querySelector('.planning-add-input')?.value);
      if (amount <= 0) {
        Toast.show('Informe um valor maior que zero.', 'warning');
        return;
      }
      note.valorAtual = NumberParser.value(note.valorAtual) + amount;
      StorageService.set(STORAGE_KEYS.DIARY, State.diary);
      Render.diary();
      Toast.show(`${Formatters.currency(amount)} adicionado ao objetivo!`);
    });

    document.addEventListener('click', function (e) {
      const deleteBtn = e.target.closest('.planning-delete-btn');
      if (!deleteBtn) return;
      const note = State.diary.find(n => n.id === deleteBtn.dataset.id);
      if (!note) return;
      if (!confirm(`Excluir o planejamento "${note.title}"? Ele também será removido da linha do tempo.`)) return;
      State.diary = State.diary.filter(n => n.id !== note.id);
      StorageService.set(STORAGE_KEYS.DIARY, State.diary);
      Render.diary();
      Toast.show('Planejamento excluído.');
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
