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

  // --- Estado Inicial Padrão Limpo ---
  const DEFAULT_INITIAL_STATE = {
    user: {
      name: 'Usuário',
      email: '',
      monthlyIncome: 0,
      profileStatus: 'SAUDÁVEL',
      confidenceScore: 100
    },
    accounts: [],
    debts: [],
    transactions: [],
    diary: [],
    shopping: [],
    alerts: [],
    recommendations: [],
    analysisHistory: [],
    deletedAnalyses: []
  };

  // --- Gerenciador de Armazenamento Local ---
  const StorageService = {
    getUserScopeKey: function (key) {
      if (key === STORAGE_KEYS.USER || key === STORAGE_KEYS.AUTH || key === STORAGE_KEYS.PREFERENCES || key === STORAGE_KEYS.COOKIE_CONSENT || key === STORAGE_KEYS.LEGAL_CONSENT) {
        return key;
      }
      const rawUser = this.getRaw(STORAGE_KEYS.USER);
      if (rawUser && rawUser.id) {
        return `user_${rawUser.id}_${key}`;
      }
      if (rawUser && rawUser.email) {
        return `user_${rawUser.email.replace(/[^a-zA-Z0-9]/g, '_')}_${key}`;
      }
      return key;
    },
    getRaw: function (key) {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    },
    setRaw: function (key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    },
    get: function (key) {
      const scopedKey = this.getUserScopeKey(key);
      const data = localStorage.getItem(scopedKey);
      return data ? JSON.parse(data) : null;
    },
    set: function (key, value) {
      const scopedKey = this.getUserScopeKey(key);
      localStorage.setItem(scopedKey, JSON.stringify(value));
    },
    init: function () {
      // Inicialização sem forçar dados mock para novos usuários
    },
    resetAll: function () {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_INITIAL_STATE.user));
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify([]));
      // Diário agora é carregado apenas do backend
      localStorage.setItem(STORAGE_KEYS.SHOPPING, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.RECOMMENDATIONS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.ANALYSIS_HISTORY, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.DELETED_ANALYSES, JSON.stringify([]));
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
      this.user = StorageService.get(STORAGE_KEYS.USER) || { ...DEFAULT_INITIAL_STATE.user };
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
      this.diary = []; // Carrega apenas da API
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

  // --- Mecanismo de Processamento de Linguagem Natural (IA) ---
  const AiEngine = {
    fromApiResponse: function (res, originalText) {
      if (!res) return null;

      // Mapeamento de tipos do backend para o frontend
      const tipoMap = {
        'TRANSACAO': 'DESPESA',
        'LEMBRETE': 'DESPESA',
        'ANOTACAO': 'DESPESA'
      };

      let type = tipoMap[res.tipo] || 'DESPESA';
      let amount = res.valor || 0;
      let category = res.categoria || 'Alimentação';
      let description = res.descricao || originalText;
      let paymentMethod = res.formaPagamento || 'PIX';

      // Se não tiver valor, tenta extrair do texto original
      if (!amount || amount === 0) {
        const valMatch = originalText.match(/(?:R\$\s*)?(\d+(?:[.,]\d{1,2})?)/i);
        if (valMatch) {
          amount = parseFloat(valMatch[1].replace(',', '.'));
        }
      }

      // Normalização de categoria para o formato do frontend
      const categoryMap = {
        'TRANSPORTE': 'Transporte',
        'ALIMENTAÇÃO': 'Alimentação',
        'MORADIA': 'Moradia',
        'SAÚDE': 'Saúde',
        'EDUCAÇÃO': 'Educação',
        'LAZER': 'Lazer',
        'VESTUÁRIO': 'Vestuário',
        'OUTROS': 'Outros'
      };
      category = categoryMap[category?.toUpperCase()] || category || 'Alimentação';

      // Normalização de forma de pagamento
      const paymentMap = {
        'DINHEIRO': 'Dinheiro',
        'DÉBITO': 'Débito',
        'CRÉDITO': 'Crédito',
        'PIX': 'PIX',
        'BOLETO': 'Boleto',
        'TRANSFERÊNCIA': 'Transferência'
      };
      paymentMethod = paymentMap[paymentMethod?.toUpperCase()] || paymentMethod || 'PIX';

      const defaultAccount = State.accounts[0]?.name || 'Carteira';

      return {
        type,
        amount: amount || 35.00,
        description: description || 'Movimentação via IA',
        category: category,
        paymentMethod: paymentMethod,
        account: defaultAccount,
        confidenceScore: 95,
        date: new Date().toISOString().split('T')[0]
      };
    },

    analyzePrompt: function (text) {
      const lower = text.toLowerCase();
      let type = 'DESPESA';
      let amount = 35.00;
      let category = 'Alimentação';
      let paymentMethod = 'PIX';
      let account = State.accounts[0]?.name || 'Carteira';
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
      else if (lower.includes('nubank')) account = 'Nubank';

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
      const firstName = (State.user?.name || 'Usuário').split(' ')[0];
      const elWelcome = document.getElementById('welcome-username');
      if (elWelcome) elWelcome.textContent = firstName;

      const initials = (State.user?.name || 'US')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(n => n[0].toUpperCase())
        .join('') || 'US';

      const elAvatar = document.querySelectorAll('.user-avatar-initials, .user-avatar');
      elAvatar.forEach(el => {
        el.textContent = initials;
      });

      const elName = document.querySelectorAll('.user-name-display');
      elName.forEach(el => {
        el.textContent = State.user?.name || '';
      });

      const elEmail = document.querySelectorAll('.user-email-display');
      elEmail.forEach(el => {
        el.textContent = State.user?.email || '';
      });
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
      const accountsCountEl = document.getElementById('dash-accounts-count');
      if (accountsCountEl) accountsCountEl.textContent = `${State.accounts.length} Conta${State.accounts.length === 1 ? '' : 's'}`;
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
          <td class="table-actions"><button type="button" class="btn btn-outline btn-xs tx-action" data-tx-action="details" data-id="${t.id}">Detalhes</button><button type="button" class="btn btn-outline btn-xs tx-action" data-tx-action="edit" data-id="${t.id}">Editar</button>${t.type === 'AJUSTE_SALDO' ? `<button type="button" class="btn btn-xs tx-action" style="background-color: #f59e0b; border-color: #f59e0b; color: white;" data-tx-action="delete" data-id="${t.id}">Reverter</button>` : `<button type="button" class="btn btn-danger btn-xs tx-action" data-tx-action="delete" data-id="${t.id}">Excluir</button>`}</td>
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
        if (!State.accounts.length) {
          cardsContainer.innerHTML = '<div class="empty-state" style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: var(--color-text-muted);">Nenhuma conta bancária cadastrada. Clique no botão <strong>+ Nova Conta</strong> acima para adicionar.</div>';
        } else {
          cardsContainer.innerHTML = State.accounts.map(acc => `
            <div class="card">
              <div class="card-header">
                <div class="card-title">${acc.name}</div>
                <span class="badge badge-accent">${acc.type}</span>
              </div>
              <p style="color: var(--color-text-muted); font-size: 0.85rem; margin-bottom: 1rem;">${acc.institution} • ${acc.currency}</p>
              <div style="font-size: 1.6rem; font-weight: 800; color: var(--color-positive); margin-bottom: 0.75rem;">
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
      }

      const debtsContainer = document.getElementById('debts-list-grid');
      if (debtsContainer) {
        if (!State.debts.length) {
          debtsContainer.innerHTML = '<div class="empty-state" style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: var(--color-text-muted);">Nenhuma dívida ou empréstimo registrado.</div>';
        } else {
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
              <div style="margin-top: 0.75rem; text-align: right;">
                <button type="button" class="btn btn-danger btn-xs debt-action" data-debt-action="delete" data-id="${d.id}">Excluir dívida</button>
              </div>
            </div>
          `).join('');
        }
      }

      const accountSelects = document.querySelectorAll('.account-select-options');
      accountSelects.forEach(select => {
        if (!State.accounts.length) {
          select.innerHTML = '<option value="Carteira">Carteira Principal</option>';
        } else {
          select.innerHTML = State.accounts.map(a => `<option value="${a.name}">${a.name} (${Formatters.currency(a.balance)})</option>`).join('');
        }
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
        if (!State.diary.length) {
          container.innerHTML = '<div class="empty-state" style="padding: 2rem; text-align: center; color: var(--color-text-muted);">Nenhuma anotação registrada ainda. Crie sua primeira nota ao lado!</div>';
        } else {
          container.innerHTML = State.diary.map(n => `
            <div class="timeline-item">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem;">
                  <span class="badge badge-accent" style="text-transform: uppercase;">${n.type}</span>
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span class="timeline-date">${Formatters.date(n.date)}</span>
                    <button type="button" class="btn btn-outline btn-xs diary-delete-btn" data-id="${n.id}" title="Excluir anotação" style="padding: 0.1rem 0.4rem; font-size: 0.75rem; border-color: var(--color-risk); color: var(--color-risk);">Excluir</button>
                  </div>
                </div>
                <h4 style="font-weight: 700; margin: 0.35rem 0; color: var(--color-text-main);">${n.title}</h4>
                <p style="color: var(--color-text-muted); font-size: 0.9rem; line-height: 1.4; white-space: pre-wrap;">${n.content}</p>
              </div>
            </div>
          `).join('');
        }
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

  // --- Sincronização Completa com a API REST Spring Boot ---
  async function syncAllDataFromBackend() {
    if (!window.ApiService || !ApiService.isAuthenticated()) {
      return false;
    }

    try {
      // 1. Obter Perfil do Usuário (GET /usuarios/me)
      const perfil = await ApiService.usuario.getPerfil();
      if (perfil && perfil.id) {
        State.user = {
          ...(State.user || {}),
          id: perfil.id,
          name: perfil.nome || State.user?.name || 'Usuário',
          email: perfil.email || State.user?.email || '',
          dataCadastro: perfil.dataCadastro || State.user?.dataCadastro || null,
          monthlyIncome: State.user?.monthlyIncome || 0,
          profileStatus: State.user?.profileStatus || 'SAUDÁVEL',
          confidenceScore: State.user?.confidenceScore || 100
        };
        StorageService.set(STORAGE_KEYS.USER, State.user);
      }

      // 2. Buscar Contas, Dívidas, Movimentações, Diário, Lista de Compras, Recomendações e Dashboard
      const [contasRes, dividasRes, movsRes, receitasRes, despesasRes, diarioRes, comprasRes, recsRes, dashRes] = await Promise.allSettled([
        ApiService.contas.listar(),
        ApiService.dividas.listar(),
        ApiService.movimentacoes.listar(),
        ApiService.request('/receitas', { method: 'GET' }),
        ApiService.request('/despesas', { method: 'GET' }),
        ApiService.diario.listar(),
        ApiService.request('/lista-compras', { method: 'GET' }),
        ApiService.request('/recomendacoes', { method: 'GET' }),
        ApiService.request('/dashboard', { method: 'GET' })
      ]);

      // Sincronizar Contas Bancárias
      if (contasRes.status === 'fulfilled' && Array.isArray(contasRes.value)) {
        State.accounts = contasRes.value.map(c => ({
          id: c.id,
          name: c.nome,
          institution: c.instituicao,
          type: c.tipo,
          currency: c.moeda || 'BRL',
          balance: NumberParser.value(c.saldo),
          creditLimit: NumberParser.value(c.limiteCredito),
          overdraftLimit: NumberParser.value(c.limiteChequeEspecial),
          status: c.status || 'Ativa'
        }));
        StorageService.set(STORAGE_KEYS.ACCOUNTS, State.accounts);
      }

      // Sincronizar Dívidas e Empréstimos
      if (dividasRes.status === 'fulfilled' && Array.isArray(dividasRes.value)) {
        State.debts = dividasRes.value.map(d => ({
          id: d.id,
          description: d.descricao,
          originalAmount: NumberParser.value(d.valorOriginal),
          remainingBalance: NumberParser.value(d.saldoDevedor),
          installmentValue: NumberParser.value(d.valorParcela),
          remainingInstallments: d.parcelasRestantes,
          interestRate: NumberParser.value(d.taxaJuros),
          dueDate: d.dataVencimento,
          status: d.status || 'Em dia'
        }));
        StorageService.set(STORAGE_KEYS.DEBTS, State.debts);
      }

      // Sincronizar Movimentações Financeiras
      const defaultAccountName = State.accounts[0]?.name || 'Carteira Principal';
      if (movsRes.status === 'fulfilled' && Array.isArray(movsRes.value) && movsRes.value.length > 0) {
        State.transactions = movsRes.value.map(m => ({
          id: m.id,
          backendId: m.id,
          type: m.tipo,
          description: m.descricao,
          amount: NumberParser.value(m.valor),
          date: m.data,
          category: m.categoria || 'Geral',
          subcategory: m.subcategoria || '',
          account: m.contaOrigemNome || defaultAccountName,
          destinationAccount: m.contaDestinoNome || '',
          paymentMethod: m.formaPagamento || 'PIX',
          recurrence: m.recorrencia || 'Única',
          obs: m.observacoes || '',
          realBalance: m.saldoReal,
          reason: m.motivoAjuste,
          origemIA: Boolean(m.origemIA),
          createdAt: m.criadoEm || (m.data ? `${m.data}T00:00:00` : new Date().toISOString())
        })).sort((a, b) => (b.date || '').localeCompare(a.date || '') || String(b.id).localeCompare(String(a.id)));
      } else {
        const receitas = receitasRes.status === 'fulfilled' && Array.isArray(receitasRes.value) ? receitasRes.value : [];
        const despesas = despesasRes.status === 'fulfilled' && Array.isArray(despesasRes.value) ? despesasRes.value : [];

        const txReceitas = receitas.map(r => ({
          id: r.id,
          backendId: r.id,
          legacyEndpoint: 'receitas',
          type: 'RECEITA',
          description: r.descricao,
          amount: NumberParser.value(r.valor),
          date: r.data,
          category: 'Receita',
          account: defaultAccountName,
          paymentMethod: 'PIX',
          createdAt: r.data ? `${r.data}T00:00:00` : new Date().toISOString()
        }));

        const txDespesas = despesas.map(d => ({
          id: d.id,
          backendId: d.id,
          legacyEndpoint: 'despesas',
          type: 'DESPESA',
          description: d.descricao,
          amount: NumberParser.value(d.valor),
          date: d.data,
          category: d.categoriaNome || 'Geral',
          account: defaultAccountName,
          paymentMethod: 'Débito/Outros',
          origemIA: Boolean(d.origemIA),
          createdAt: d.criadoEm || (d.data ? `${d.data}T00:00:00` : new Date().toISOString())
        }));

        State.transactions = [...txReceitas, ...txDespesas].sort((a, b) => {
          return (b.date || '').localeCompare(a.date || '') || String(b.id).localeCompare(String(a.id));
        });
      }
      StorageService.set(STORAGE_KEYS.TRANSACTIONS, State.transactions);

      // Sincronizar Diário Financeiro
      if (diarioRes.status === 'fulfilled' && Array.isArray(diarioRes.value)) {
        State.diary = diarioRes.value.map(n => ({
          id: n.id,
          title: n.titulo,
          content: n.conteudo,
          type: (n.tipo || 'anotacao').toLowerCase(),
          date: n.data
        }));
        // Não salva no Storage para forçar leitura sempre do DB
      }

      // Sincronizar Lista de Compras
      if (comprasRes.status === 'fulfilled' && Array.isArray(comprasRes.value)) {
        State.shopping = comprasRes.value.map(item => ({
          id: item.id,
          title: item.nome,
          quantity: item.quantidade || 1,
          estimatedPrice: NumberParser.value(item.precoEstimado),
          actualPrice: NumberParser.value(item.precoPago),
          priority: item.prioridade || 'Média',
          purchased: Boolean(item.comprado),
          doNotBuyAgain: Boolean(item.naoComprarNovamente),
          obs: item.observacao || '',
          date: item.data
        }));
        StorageService.set(STORAGE_KEYS.SHOPPING, State.shopping);
      }

      // Sincronizar Recomendações
      if (recsRes.status === 'fulfilled' && Array.isArray(recsRes.value)) {
        State.recommendations = recsRes.value.map(r => ({
          id: r.id,
          title: r.categoriaRelacionada ? `Recomendação (${r.categoriaRelacionada})` : 'Recomendação FinGuardian AI',
          description: r.conteudo,
          priority: r.prioridade || 'Média',
          origin: 'FinGuardian AI',
          accepted: false
        }));
        StorageService.set(STORAGE_KEYS.RECOMMENDATIONS, State.recommendations);
      }

      // Sincronizar Dashboard
      if (dashRes.status === 'fulfilled' && dashRes.value) {
        const d = dashRes.value;
        if (d.perfilFinanceiro?.tipo) {
          State.user.profileStatus = d.perfilFinanceiro.tipo;
        }
        if (d.totalReceitas && (!State.user.monthlyIncome || State.user.monthlyIncome === 0)) {
          State.user.monthlyIncome = NumberParser.value(d.totalReceitas);
        }
        StorageService.set(STORAGE_KEYS.USER, State.user);
      }

      // Gerar alertas contextuais baseados nos dados reais
      generateContextualAlerts();

      return true;
    } catch (err) {
      console.error('[FinGuardian Sync] Erro ao sincronizar dados com backend:', err);
      throw err;
    }
  }

  function generateContextualAlerts() {
    const alerts = [];
    const today = new Date().toISOString().split('T')[0];

    const totalExpense = State.transactions.filter(t => t.type === 'DESPESA').reduce((acc, t) => acc + NumberParser.value(t.amount), 0);
    const totalIncome = State.transactions.filter(t => t.type === 'RECEITA').reduce((acc, t) => acc + NumberParser.value(t.amount), 0);
    const totalBalance = State.accounts.reduce((acc, a) => acc + NumberParser.value(a.balance), 0);
    const totalDebt = State.debts.reduce((acc, d) => acc + NumberParser.value(d.remainingBalance), 0);

    if (totalDebt > 0) {
      alerts.push({
        id: 'alt_debt_' + Date.now(),
        title: 'Compromissos de Dívidas Ativos',
        message: `Você possui ${Formatters.currency(totalDebt)} em saldo devedor distribuído em suas dívidas ativas.`,
        level: 'atenção',
        date: today,
        read: false
      });
    }

    if (totalIncome > 0 && totalExpense > totalIncome * 0.7) {
      alerts.push({
        id: 'alt_exp_' + Date.now(),
        title: 'Comprometimento de Renda Elevado',
        message: `Suas despesas registradas atingiram ${Math.round((totalExpense / totalIncome) * 100)}% das suas receitas do período.`,
        level: 'risco',
        date: today,
        read: false
      });
    } else if (totalBalance > 0) {
      alerts.push({
        id: 'alt_pos_' + Date.now(),
        title: 'Saldo Consolidado Positivo',
        message: `Seu saldo total em contas é de ${Formatters.currency(totalBalance)}. Mantenha sua meta de reserva financeira.`,
        level: 'positivo',
        date: today,
        read: true
      });
    }

    State.alerts = alerts;
    StorageService.set(STORAGE_KEYS.ALERTS, State.alerts);
  }

  // --- Gerenciador Financeiro Integrado ---
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
      const accountName = transaction.account || 'Carteira Principal';
      let sourceAccount = State.accounts.find(account => account.name === accountName);
      
      if (!sourceAccount) {
        sourceAccount = {
          id: 'acc_' + Date.now(),
          name: accountName,
          institution: accountName,
          type: 'conta corrente',
          currency: 'BRL',
          balance: 0.00,
          initialBalance: 0.00,
          creditLimit: 0.00,
          overdraftLimit: 0.00,
          status: 'Ativa'
        };
        State.accounts.push(sourceAccount);
        StorageService.set(STORAGE_KEYS.ACCOUNTS, State.accounts);
      }

      if (transaction.type === 'RECEITA') sourceAccount.balance += amount * direction;
      if (transaction.type === 'DESPESA') sourceAccount.balance -= amount * direction;
      if (transaction.type === 'TRANSFERENCIA') {
        const destName = transaction.destinationAccount || 'Conta Destino';
        let destinationAccount = State.accounts.find(account => account.name === destName);
        if (!destinationAccount) {
          destinationAccount = {
            id: 'acc_' + (Date.now() + 1),
            name: destName,
            institution: destName,
            type: 'conta corrente',
            currency: 'BRL',
            balance: 0.00,
            initialBalance: 0.00,
            creditLimit: 0.00,
            overdraftLimit: 0.00,
            status: 'Ativa'
          };
          State.accounts.push(destinationAccount);
          StorageService.set(STORAGE_KEYS.ACCOUNTS, State.accounts);
        }
        sourceAccount.balance -= amount * direction;
        destinationAccount.balance += amount * direction;
      }
      if (transaction.type === 'AJUSTE_SALDO') {
        if (direction === 1) {
          transaction.previousBalance = NumberParser.value(sourceAccount.balance);
          sourceAccount.balance = NumberParser.value(transaction.realBalance);
        } else {
          // Se ajustado foi maior, a diferença é positiva, então subtraímos para reverter.
          // Se ajustado foi menor, a diferença é negativa, então ao subtrair, somamos.
          sourceAccount.balance = NumberParser.value(sourceAccount.balance) - amount;
          if (window.ApiService && ApiService.isAuthenticated() && !String(sourceAccount.id).startsWith('acc_')) {
            ApiService.contas.ajustarSaldo(sourceAccount.id, { novoSaldo: sourceAccount.balance, motivo: 'Reversão de Ajuste Saldo' }).catch(() => {});
          }
        }
      }
      return true;
    },

    registerTransaction: async function (transaction) {
      const amount = NumberParser.value(transaction.amount);
      const isBalanceAdjustment = transaction.type === 'AJUSTE_SALDO';
      const realBalance = NumberParser.value(transaction.realBalance);
      
      if (!isBalanceAdjustment && amount <= 0) {
        Toast.show('Informe um valor maior que zero.', 'warning');
        return false;
      }
      if (isBalanceAdjustment && !Number.isFinite(realBalance)) {
        Toast.show('Informe o saldo real conferido.', 'warning');
        return false;
      }

      // Persistir no backend Spring Boot via POST /movimentacoes
      if (window.ApiService && ApiService.isAuthenticated()) {
        try {
          const created = await ApiService.movimentacoes.criar({
            tipo: transaction.type,
            descricao: transaction.description,
            valor: amount,
            data: transaction.date || this.today(),
            categoria: transaction.category,
            subcategoria: transaction.subcategory,
            contaOrigemNome: transaction.account,
            contaDestinoNome: transaction.destinationAccount,
            formaPagamento: transaction.paymentMethod,
            recorrencia: transaction.recurrence || 'Única',
            observacoes: transaction.obs,
            saldoReal: isBalanceAdjustment ? realBalance : undefined,
            motivoAjuste: transaction.reason,
            origemIA: Boolean(transaction.origin === 'CONVERSA_IA' || transaction.origemIA)
          });
          if (created && created.id) {
            transaction.id = created.id;
            transaction.backendId = created.id;
            if (created.categoria) {
              transaction.category = created.categoria;
            }
          }
        } catch (apiErr) {
          console.error('[FinGuardian Backend Movimentação] Erro ao registrar:', apiErr);
          Toast.show(apiErr.message || 'Erro ao registrar movimentação no servidor.', 'error');
          return false;
        }
      } else {
        console.warn('[FinGuardian] Usuário não autenticado no backend. Faça login para persistir no banco de dados.');
        Toast.show('Aviso: Faça login para salvar suas movimentações diretamente no banco de dados.', 'warning');
      }

      // Se a conta não foi informada ou não existe, usa a primeira conta ativa ou Carteira Principal
      if (!transaction.account) {
        transaction.account = State.accounts[0]?.name || 'Carteira Principal';
      }

      // Se a conta não existir ainda no State, cria automaticamente sem bloquear
      if (!State.accounts.some(account => account.name === transaction.account)) {
        const newAccount = {
          id: 'acc_' + Date.now(),
          name: transaction.account,
          institution: transaction.account,
          type: 'conta corrente',
          currency: 'BRL',
          balance: 0.00,
          initialBalance: 0.00,
          creditLimit: 0.00,
          overdraftLimit: 0.00,
          status: 'Ativa'
        };
        State.accounts.push(newAccount);
        StorageService.set(STORAGE_KEYS.ACCOUNTS, State.accounts);
      }

      if (transaction.type === 'TRANSFERENCIA') {
        if (!transaction.destinationAccount) {
          Toast.show('Escolha uma conta de destino válida.', 'warning');
          return false;
        }
        if (!State.accounts.some(account => account.name === transaction.destinationAccount)) {
          const destAccount = {
            id: 'acc_' + (Date.now() + 1),
            name: transaction.destinationAccount,
            institution: transaction.destinationAccount,
            type: 'conta corrente',
            currency: 'BRL',
            balance: 0.00,
            initialBalance: 0.00,
            creditLimit: 0.00,
            overdraftLimit: 0.00,
            status: 'Ativa'
          };
          State.accounts.push(destAccount);
          StorageService.set(STORAGE_KEYS.ACCOUNTS, State.accounts);
        }
      }

      transaction.amount = amount;
      if (isBalanceAdjustment) transaction.realBalance = realBalance;
      transaction.createdAt = transaction.createdAt || new Date().toISOString();
      if (!this.applyTransactionEffect(transaction, 1)) return false;
      State.transactions.unshift(transaction);
      this.refresh();

      // Sincroniza em background com o backend para manter saldos e totais das contas 100% atualizados
      if (window.ApiService && ApiService.isAuthenticated()) {
        syncAllDataFromBackend().then(() => {
          Render.all();
        }).catch(err => {
          console.warn('[FinGuardian] Atualização após salvar movimentação:', err);
        });
      }
      return true;
    },

    deleteTransaction: async function (transaction) {
      const backendId = transaction.backendId || transaction.id;
      const isLocal = String(transaction.id).startsWith('tx_') && !transaction.backendId;

      if (window.ApiService && ApiService.isAuthenticated() && !isLocal) {
        try {
          if (transaction.legacyEndpoint) {
            await ApiService.request(`/${transaction.legacyEndpoint}/${backendId}`, { method: 'DELETE' });
          } else {
            await ApiService.movimentacoes.excluir(backendId);
          }
        } catch (apiErr) {
          console.error('[FinGuardian Excluir Movimentação] Erro no backend:', apiErr);
          Toast.show(apiErr.message || 'Erro ao excluir movimentação no servidor.', 'error');
          return false;
        }
      }

      if (!this.applyTransactionEffect(transaction, -1)) {
        Toast.show('Não foi possível desfazer o efeito desta movimentação no saldo.', 'warning');
        return false;
      }
      State.transactions = State.transactions.filter(item => item.id !== transaction.id);
      this.refresh();
      return true;
    },

    updateTransaction: async function (transaction, changes) {
      const backendId = transaction.backendId || transaction.id;
      const isLocal = String(transaction.id).startsWith('tx_') && !transaction.backendId;

      if (window.ApiService && ApiService.isAuthenticated() && !isLocal) {
        try {
          if (transaction.legacyEndpoint === 'receitas') {
            await ApiService.request(`/receitas/${backendId}`, {
              method: 'PUT',
              body: JSON.stringify({
                descricao: changes.description || transaction.description,
                valor: NumberParser.value(changes.amount !== undefined ? changes.amount : transaction.amount),
                data: changes.date || transaction.date
              })
            });
          } else if (transaction.legacyEndpoint === 'despesas') {
            await ApiService.request(`/despesas/${backendId}`, {
              method: 'PUT',
              body: JSON.stringify({
                descricao: changes.description || transaction.description,
                valor: NumberParser.value(changes.amount !== undefined ? changes.amount : transaction.amount),
                data: changes.date || transaction.date,
                categoria: changes.category !== undefined ? changes.category : transaction.category
              })
            });
          } else {
            await ApiService.movimentacoes.atualizar(backendId, {
            tipo: changes.type || transaction.type,
            descricao: changes.description || transaction.description,
            valor: NumberParser.value(changes.amount !== undefined ? changes.amount : transaction.amount),
            data: changes.date || transaction.date,
            categoria: changes.category !== undefined ? changes.category : transaction.category,
            subcategoria: changes.subcategory !== undefined ? changes.subcategory : transaction.subcategory,
            contaOrigemNome: changes.account || transaction.account,
            formaPagamento: changes.paymentMethod !== undefined ? changes.paymentMethod : transaction.paymentMethod,
            recorrencia: changes.recurrence || transaction.recurrence,
            observacoes: changes.obs !== undefined ? changes.obs : transaction.obs
          });
          }
        } catch (apiErr) {
          console.error('[FinGuardian Atualizar Movimentação] Erro no backend:', apiErr);
          Toast.show(apiErr.message || 'Erro ao atualizar movimentação no servidor.', 'error');
          return false;
        }
      }

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
      navLinks.forEach(link => {
        if (link.dataset.view === viewId) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      if (viewId === 'diario') {
        ApiService.diario.listar().then(res => {
          if (Array.isArray(res)) {
            // Pega as 5 mais recentes (ordenando por ID descrescente)
            const ultimas = res.sort((a, b) => b.id - a.id).slice(0, 5);
            State.diary = ultimas.map(n => ({
              id: n.id,
              title: n.titulo,
              content: n.conteudo,
              type: (n.tipo || 'anotacao').toLowerCase(),
              date: n.data
            }));
            Render.diary();
          }
        }).catch(err => console.error('Erro ao buscar diário:', err));
      }
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

    let finChatHistory = [];

    const openAssistant = function () {
      const mainApp = document.getElementById('main-app-layout');
      if (!mainApp || window.getComputedStyle(mainApp).display === 'none') return;
      finModal.classList.add('active');
      window.setTimeout(() => document.getElementById('fin-chat-input')?.focus(), 100);
      scrollToBottom();
    };

    window.openFinAssistant = openAssistant;
    finButton.addEventListener('click', openAssistant);
    
    finModal.querySelectorAll('.modal-close, [data-close-modal]').forEach(function (button) {
      button.addEventListener('click', function () {
        finModal.classList.remove('active');
      });
    });
    
    finModal.addEventListener('click', function (event) {
      if (event.target === finModal) {
        finModal.classList.remove('active');
      }
    });
    
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && finModal.classList.contains('active')) {
        finModal.classList.remove('active');
      }
    });

    const chatMessagesContainer = document.getElementById('fin-chat-messages');
    const chatInput = document.getElementById('fin-chat-input');
    const btnChatSend = document.getElementById('btn-fin-chat-send');
    const btnChatClear = document.getElementById('btn-fin-chat-clear');

    if (btnChatClear) {
      btnChatClear.addEventListener('click', () => {
        finChatHistory = [];
        if (chatMessagesContainer) {
          chatMessagesContainer.innerHTML = `
            <div class="chat-message fin-message" style="align-self: flex-start; background: var(--color-surface); border: 1px solid var(--color-border); padding: 0.75rem 1rem; border-radius: 12px; border-top-left-radius: 0; max-width: 85%; font-size: 0.95rem; line-height: 1.4; color: var(--color-text);">
              Chat limpo! Nova conversa iniciada. Em que posso ajudar com suas finanças agora?
            </div>
          `;
        }
      });
    }

    const scrollToBottom = () => {
      if(chatMessagesContainer) chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    };

    const addMessageToUI = (text, isUser = false) => {
      const msgDiv = document.createElement('div');
      msgDiv.className = isUser ? 'chat-message user-message' : 'chat-message fin-message';
      msgDiv.style.alignSelf = isUser ? 'flex-end' : 'flex-start';
      msgDiv.style.background = isUser ? 'var(--color-primary)' : 'var(--color-surface)';
      msgDiv.style.color = isUser ? 'white' : 'var(--color-text)';
      msgDiv.style.border = isUser ? 'none' : '1px solid var(--color-border)';
      msgDiv.style.padding = '0.75rem 1rem';
      msgDiv.style.borderRadius = '12px';
      msgDiv.style.borderTopRightRadius = isUser ? '0' : '12px';
      msgDiv.style.borderTopLeftRadius = isUser ? '12px' : '0';
      msgDiv.style.maxWidth = '85%';
      msgDiv.style.fontSize = '0.95rem';
      msgDiv.style.lineHeight = '1.4';
      
      let formattedText = text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      msgDiv.innerHTML = formattedText;
      
      chatMessagesContainer.appendChild(msgDiv);
      scrollToBottom();
    };

    const handleSendMessage = async () => {
      const text = chatInput.value.trim();
      if (!text) return;
      
      chatInput.value = '';
      chatInput.style.height = 'auto';
      
      addMessageToUI(text, true);
      
      const payload = {
        mensagem: text,
        historico: finChatHistory
      };
      
      finChatHistory.push({ papel: 'user', conteudo: text });
      
      const loaderDiv = document.createElement('div');
      loaderDiv.id = 'fin-chat-loader';
      loaderDiv.innerHTML = '<span style="font-size: 0.85rem; color: var(--color-text-muted);">Fin está analisando seus dados...</span>';
      loaderDiv.style.alignSelf = 'flex-start';
      chatMessagesContainer.appendChild(loaderDiv);
      scrollToBottom();

      try {
        if (!window.ApiService || !ApiService.isAuthenticated()) {
          throw new Error('Você precisa estar logado para falar com o Fin.');
        }
        
        const response = await ApiService.fin.chat(payload);
        
        loaderDiv.remove();
        addMessageToUI(response.resposta, false);
        finChatHistory.push({ papel: 'assistant', conteudo: response.resposta });
        
      } catch (error) {
        loaderDiv.remove();
        const errorMsg = error.message || 'Desculpe, ocorreu um erro ao processar sua solicitação.';
        addMessageToUI('❌ ' + errorMsg, false);
      }
    };

    btnChatSend?.addEventListener('click', handleSendMessage);
    chatInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    });

    chatInput?.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
      scrollToBottom();
    });
  }

  // --- Bindings ---
  function bindEvents() {
    // Variável para controle de edição de transação
    let editingTransactionId = null;

    document.addEventListener('click', function (e) {
      const trigger = e.target.closest('.nav-trigger');
      if (trigger) {
        e.preventDefault();
        const view = trigger.dataset.view;
        if (view) Router.navigate(view);
      }

      // Ações de transações (Detalhes, Editar, Excluir)
      const txButton = e.target.closest('.tx-action');
      if (txButton) {
        const tx = State.transactions.find(item => String(item.id) === String(txButton.dataset.id));
        if (!tx) return;

        const action = txButton.dataset.txAction;
        const transactionTypeLabel = tx.origin === 'CADASTRO_CONTA' ? 'Saldo inicial' : tx.type;
        const modal = document.getElementById('modal-transaction');
        editingTransactionId = tx.id;

        if (action === 'delete') {
          const confirmMsg = tx.type === 'AJUSTE_SALDO' 
            ? 'Deseja reverter este ajuste e devolver o dinheiro para a conta?' 
            : 'Excluir esta movimentação?';
          if (confirm(confirmMsg)) {
            FinancialStore.deleteTransaction(tx).then(deleted => {
              if (deleted) {
                Toast.show(tx.type === 'AJUSTE_SALDO' ? 'Ajuste revertido e dinheiro devolvido.' : 'Movimentação excluída e saldo recalculado.');
              }
            });
          }
          return;
        }

        modal.classList.add('active');
        document.getElementById('transaction-details-content').innerHTML = `<p><strong>${tx.description}</strong></p><p>${transactionTypeLabel} · ${Formatters.currency(tx.amount)} · ${Formatters.date(tx.date)}</p><p>Categoria: ${tx.category || '—'} · Conta: ${tx.account || '—'} · Pagamento: ${tx.paymentMethod || '—'}</p><p>${tx.obs || tx.reason || ''}</p>`;

        if (action === 'edit') {
          document.getElementById('transaction-edit-form').style.display = 'block';
          document.getElementById('btn-save-edit-transaction').style.display = 'inline-flex';
          document.getElementById('btn-start-edit-transaction').style.display = 'none';
          document.getElementById('tx-edit-description').value = tx.description;
          document.getElementById('tx-edit-amount').value = tx.amount;
          document.getElementById('tx-edit-category').value = tx.category || '';
          document.getElementById('tx-edit-payment').value = tx.paymentMethod || '';
          document.getElementById('tx-edit-date').value = tx.date;
        } else {
          document.getElementById('transaction-edit-form').style.display = 'none';
          document.getElementById('btn-save-edit-transaction').style.display = 'none';
          document.getElementById('btn-start-edit-transaction').style.display = 'inline-flex';
        }
      }
    });

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const email = document.getElementById('login-email')?.value.trim();
        const password = document.getElementById('login-password')?.value;
        const submitBtn = loginForm.querySelector('button[type="submit"]');

        if (!email || !password) {
          Toast.show('Informe seu e-mail e senha.', 'warning');
          return;
        }

        const originalBtnText = submitBtn ? submitBtn.textContent : 'Entrar';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Entrando...';
        }

        try {
          if (window.ApiService) {
            // 1. Autenticar no backend Spring Boot (POST /auth/login)
            const authData = await ApiService.auth.login({ email, senha: password });
            ApiService.setToken(authData.token, authData.tipo, authData.expiraEm);

            // 2. Carregar todos os dados reais do backend
            await syncAllDataFromBackend();
          } else {
            StorageService.set(STORAGE_KEYS.AUTH, 'demo_token_authenticated');
          }

          // 3. Exibir o aplicativo principal
          document.getElementById('auth-layout').style.display = 'none';
          document.getElementById('main-app-layout').style.display = 'flex';
          document.getElementById('floating-ai-button')?.classList.remove('is-hidden');

          Render.all();
          Router.navigate('dashboard');
          const firstName = State.user?.name ? State.user.name.split(' ')[0] : 'usuário';
          Toast.show(`Bem-vindo(a) ao FinGuardian AI, ${firstName}!`, 'success');
        } catch (error) {
          console.error('[FinGuardian Login] Erro na autenticação:', error);
          Toast.show(error.message || 'Falha ao autenticar. Verifique suas credenciais.', 'error');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
          }
        }
      });
    }

    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
      signupForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const name = document.getElementById('signup-name')?.value.trim();
        const email = document.getElementById('signup-email')?.value.trim();
        const password = document.getElementById('signup-pass')?.value;
        const confirmPassword = document.getElementById('signup-confirm-pass')?.value;
        const legalConsent = document.getElementById('signup-legal-consent')?.checked;
        const submitBtn = signupForm.querySelector('button[type="submit"]');

        if (!name || !email || !password || !confirmPassword) {
          Toast.show('Preencha todos os campos obrigatórios.', 'warning');
          return;
        }

        if (name.length < 2) {
          Toast.show('O nome deve ter no mínimo 2 caracteres.', 'warning');
          document.getElementById('signup-name')?.focus();
          return;
        }

        if (password.length < 6) {
          Toast.show('A senha deve ter no mínimo 6 caracteres.', 'warning');
          document.getElementById('signup-pass')?.focus();
          return;
        }

        if (password !== confirmPassword) {
          Toast.show('A confirmação de senha não confere.', 'warning');
          document.getElementById('signup-confirm-pass')?.focus();
          return;
        }

        if (!legalConsent) {
          Toast.show('Você deve aceitar os Termos de Uso e Política de Privacidade.', 'warning');
          return;
        }

        const originalBtnText = submitBtn ? submitBtn.textContent : 'Criar minha conta';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Criando conta...';
        }

        try {
          if (window.ApiService) {
            // 1. Cadastrar usuário no backend Spring Boot (POST /auth/register)
            await ApiService.auth.register({ nome: name, email, senha: password });

            // 2. Realizar login automático com o token (POST /auth/login)
            const authData = await ApiService.auth.login({ email, senha: password });
            ApiService.setToken(authData.token, authData.tipo, authData.expiraEm);

            // 3. Sincronizar todos os dados com o backend
            await syncAllDataFromBackend();
          } else {
            State.user = {
              ...DEFAULT_INITIAL_STATE.user,
              name,
              email
            };
          }

          StorageService.set(STORAGE_KEYS.USER, State.user);
          StorageService.set(STORAGE_KEYS.LEGAL_CONSENT, {
            termsVersion: '2026-07-25',
            privacyVersion: '2026-07-25',
            acceptedAt: new Date().toISOString()
          });

          // 4. Exibir o aplicativo principal
          document.getElementById('auth-layout').style.display = 'none';
          document.getElementById('main-app-layout').style.display = 'flex';
          document.getElementById('floating-ai-button')?.classList.remove('is-hidden');

          Render.all();
          Router.navigate('contas');
          Toast.show('Conta criada com sucesso no banco de dados!', 'success');
        } catch (error) {
          console.error('[FinGuardian Cadastro] Erro:', error);
          Toast.show(error.message || 'Falha ao cadastrar usuário. Verifique os dados.', 'error');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
          }
        }
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
      aiAnalyzeBtn.addEventListener('click', async function () {
        const promptInput = document.getElementById('ai-prompt-input');
        const text = promptInput?.value.trim();
        if (!text) {
          Toast.show('Digite uma movimentação em linguagem natural.', 'warning');
          return;
        }

        const originalText = aiAnalyzeBtn.textContent;
        aiAnalyzeBtn.disabled = true;
        aiAnalyzeBtn.textContent = 'Processando IA...';

        let suggestion = null;
        try {
          if (window.ApiService && ApiService.isAuthenticated()) {
            const iaResponse = await ApiService.ia.processarTexto({ texto: text });
            suggestion = AiEngine.fromApiResponse(iaResponse, text);
          }
        } catch (iaErr) {
          console.warn('[FinGuardian IA] Backend IA:', iaErr);
        }

        if (!suggestion) {
          suggestion = AiEngine.analyzePrompt(text);
        }

        State.pendingAiSuggestion = suggestion;

        document.getElementById('ai-rev-type').value = suggestion.type;
        document.getElementById('ai-rev-desc').value = suggestion.description;
        document.getElementById('ai-rev-amount').value = suggestion.amount;
        document.getElementById('ai-rev-category').value = suggestion.category;
        document.getElementById('ai-rev-account').value = suggestion.account;
        document.getElementById('ai-rev-payment').value = suggestion.paymentMethod;
        document.getElementById('ai-rev-confidence').textContent = `${suggestion.confidenceScore}%`;

        document.getElementById('modal-ai-review')?.classList.add('active');

        aiAnalyzeBtn.disabled = false;
        aiAnalyzeBtn.textContent = originalText;
      });
    }

    const btnConfirmAiSave = document.getElementById('btn-confirm-ai-save');
    if (btnConfirmAiSave) {
      btnConfirmAiSave.addEventListener('click', async function () {
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

        const saved = await FinancialStore.registerTransaction(newTx);
        if (!saved) return;
        document.getElementById('modal-ai-review')?.classList.remove('active');
        document.getElementById('ai-prompt-input').value = '';
        Toast.show('Movimentação revisada e salva com sucesso!');
      });
    }

    initFinAssistant();
    const manualTxForm = document.getElementById('manual-tx-form');
    const toggleManualFields = () => { const type = document.getElementById('manual-tx-type')?.value; document.getElementById('manual-transfer-fields')?.classList.toggle('active', type === 'TRANSFERENCIA'); document.getElementById('manual-adjustment-fields')?.classList.toggle('active', type === 'AJUSTE_SALDO'); };
    document.getElementById('manual-tx-type')?.addEventListener('change', toggleManualFields); toggleManualFields();
    if (manualTxForm) {
      manualTxForm.addEventListener('submit', async function (e) {
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
        if (newTx.type === 'AJUSTE_SALDO') { 
          newTx.reason = document.getElementById('manual-tx-adjustment-reason')?.value; 
          newTx.realBalance = parseFloat(document.getElementById('manual-tx-real-balance')?.value) || 0; 
          const accToAdjust = State.accounts.find(a => a.name === newTx.account);
          if (accToAdjust) newTx.amount = newTx.realBalance - NumberParser.value(accToAdjust.balance);
          if (!newTx.reason) { Toast.show('Informe o motivo do ajuste.', 'warning'); return; } 
        }

        const saved = await FinancialStore.registerTransaction(newTx);
        if (!saved) return;
        manualTxForm.reset();
        Toast.show('Movimentação salva com sucesso!');
        Router.navigate('movimentacoes');
      });
    }

    let editingAccountId = null;
    const newAccountForm = document.getElementById('new-account-form');
    if (newAccountForm) {
      newAccountForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const isEditing = Boolean(editingAccountId);
        const declaredBalance = NumberParser.value(document.getElementById('acc-balance-input').value);
        const addBalanceAsIncome = !isEditing && Boolean(document.getElementById('acc-balance-as-income')?.checked);
        const name = document.getElementById('acc-name-input').value.trim();
        const institution = document.getElementById('acc-inst-input').value.trim();
        const type = document.getElementById('acc-type-input').value;
        const creditLimit = NumberParser.value(document.getElementById('acc-limit-input').value);
        const overdraftLimit = NumberParser.value(document.getElementById('acc-overdraft-input').value);
        const submitBtn = newAccountForm.querySelector('button[type="submit"]');

        const originalBtnText = submitBtn ? submitBtn.textContent : 'Salvar conta';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Salvando...';
        }

        try {
          if (window.ApiService && ApiService.isAuthenticated()) {
            if (isEditing && !String(editingAccountId).startsWith('acc_')) {
              const updated = await ApiService.contas.atualizar(editingAccountId, {
                nome: name,
                instituicao: institution,
                tipo: type,
                saldo: declaredBalance,
                limiteCredito: creditLimit,
                limiteChequeEspecial: overdraftLimit
              });
              const idx = State.accounts.findIndex(a => String(a.id) === String(editingAccountId));
              if (idx !== -1) {
                State.accounts[idx] = {
                  id: updated.id,
                  name: updated.nome,
                  institution: updated.instituicao,
                  type: updated.tipo,
                  currency: updated.moeda,
                  balance: NumberParser.value(updated.saldo),
                  creditLimit: NumberParser.value(updated.limiteCredito),
                  overdraftLimit: NumberParser.value(updated.limiteChequeEspecial),
                  status: updated.status
                };
              }
            } else {
              const created = await ApiService.contas.criar({
                nome: name,
                instituicao: institution,
                tipo: type,
                saldo: declaredBalance,
                limiteCredito: creditLimit,
                limiteChequeEspecial: overdraftLimit
              });
              State.accounts.push({
                id: created.id,
                name: created.nome,
                institution: created.instituicao,
                type: created.tipo,
                currency: created.moeda,
                balance: NumberParser.value(created.saldo),
                creditLimit: NumberParser.value(created.limiteCredito),
                overdraftLimit: NumberParser.value(created.limiteChequeEspecial),
                status: created.status
              });
            }
            StorageService.set(STORAGE_KEYS.ACCOUNTS, State.accounts);
            Render.all();
          } else {
            const newAcc = {
              id: editingAccountId || 'acc_' + Date.now(),
              name,
              institution,
              type,
              currency: 'BRL',
              balance: declaredBalance,
              creditLimit,
              overdraftLimit,
              status: 'Ativa'
            };
            FinancialStore.saveAccount(newAcc, isEditing, { declaredBalance, addBalanceAsIncome });
          }

          editingAccountId = null;
          newAccountForm.reset();
          const balanceAsIncomeInput = document.getElementById('acc-balance-as-income');
          if (balanceAsIncomeInput) balanceAsIncomeInput.checked = false;
          document.getElementById('modal-new-account')?.classList.remove('active');
          Toast.show(isEditing ? 'Conta bancária atualizada no banco!' : 'Conta bancária criada com sucesso no banco!');
        } catch (err) {
          console.error('[FinGuardian Contas] Erro:', err);
          Toast.show(err.message || 'Erro ao salvar conta bancária.', 'error');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
          }
        }
      });
    }

    const newDebtForm = document.getElementById('new-debt-form');
    if (newDebtForm) {
      newDebtForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const description = document.getElementById('debt-desc-input')?.value.trim();
        const originalAmount = NumberParser.value(document.getElementById('debt-original-input')?.value);
        const remainingBalance = NumberParser.value(document.getElementById('debt-balance-input')?.value);
        const installmentValue = NumberParser.value(document.getElementById('debt-installment-input')?.value);
        const remainingInstallments = parseInt(document.getElementById('debt-remaining-input')?.value, 10) || 1;
        const interestRate = NumberParser.value(document.getElementById('debt-rate-input')?.value);
        const dueDate = document.getElementById('debt-due-input')?.value.trim() || 'Dia 15';
        const submitBtn = newDebtForm.querySelector('button[type="submit"]');

        if (!description || originalAmount <= 0) {
          Toast.show('Preencha a descrição e os valores da dívida.', 'warning');
          return;
        }

        const originalBtnText = submitBtn ? submitBtn.textContent : 'Salvar dívida';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Salvando...';
        }

        try {
          if (window.ApiService && ApiService.isAuthenticated()) {
            const created = await ApiService.dividas.criar({
              description,
              originalAmount,
              remainingBalance,
              installmentValue,
              remainingInstallments,
              interestRate,
              dueDate,
              status: 'Em dia'
            });
            State.debts.push({
              id: created.id,
              description: created.descricao,
              originalAmount: NumberParser.value(created.valorOriginal),
              remainingBalance: NumberParser.value(created.saldoDevedor),
              installmentValue: NumberParser.value(created.valorParcela),
              remainingInstallments: created.parcelasRestantes,
              interestRate: NumberParser.value(created.taxaJuros),
              dueDate: created.dataVencimento,
              status: created.status
            });
          } else {
            State.debts.push({
              id: 'debt_' + Date.now(),
              description,
              originalAmount,
              remainingBalance,
              installmentValue,
              remainingInstallments,
              interestRate,
              dueDate,
              status: 'Em dia'
            });
          }

          StorageService.set(STORAGE_KEYS.DEBTS, State.debts);
          Render.all();
          newDebtForm.reset();
          document.getElementById('modal-new-debt')?.classList.remove('active');
          Toast.show('Dívida/Empréstimo cadastrado com sucesso no banco!');
        } catch (err) {
          console.error('[FinGuardian Dívidas] Erro:', err);
          Toast.show(err.message || 'Erro ao cadastrar dívida.', 'error');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
          }
        }
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
      btnConfirmConvertShopping.addEventListener('click', async function () {
        const targetAccount = document.getElementById('convert-shopping-account-select').value;
        const purchasedItems = State.shopping.filter(i => i.purchased && !i.doNotBuyAgain);
        const totalCost = purchasedItems.reduce((acc, item) => acc + (item.actualPrice || item.estimatedPrice) * (item.quantity || 1), 0);

        if (window.ApiService && ApiService.isAuthenticated()) {
          try {
            const txDate = document.getElementById('convert-shopping-date-input').value || FinancialStore.today();
            const txCategory = document.getElementById('convert-shopping-category-select').value || 'Alimentação';
            await ApiService.request('/lista-compras/lancar-pagos', {
              method: 'POST',
              body: JSON.stringify({
                categoria: txCategory,
                data: txDate
              })
            });
            // Recarrega transações e lista de compras atualizadas do backend
            const [despesasRes, comprasRes] = await Promise.allSettled([
              ApiService.request('/despesas', { method: 'GET' }),
              ApiService.request('/lista-compras', { method: 'GET' })
            ]);
            if (despesasRes.status === 'fulfilled' && Array.isArray(despesasRes.value)) {
              const defaultAccountName = State.accounts[0]?.name || 'Carteira Principal';
              const txDespesas = despesasRes.value.map(d => ({
                id: d.id,
                backendId: d.id,
                type: 'DESPESA',
                description: d.descricao,
                amount: NumberParser.value(d.valor),
                date: d.data,
                category: d.categoriaNome || 'Geral',
                account: defaultAccountName,
                paymentMethod: 'Débito/Outros',
                origemIA: Boolean(d.origemIA),
                createdAt: d.criadoEm || (d.data ? `${d.data}T00:00:00` : new Date().toISOString())
              }));
              const txReceitas = State.transactions.filter(t => t.type === 'RECEITA');
              State.transactions = [...txReceitas, ...txDespesas].sort((a, b) => (b.date || '').localeCompare(a.date || '') || String(b.id).localeCompare(String(a.id)));
              StorageService.set(STORAGE_KEYS.TRANSACTIONS, State.transactions);
            }
            if (comprasRes.status === 'fulfilled' && Array.isArray(comprasRes.value)) {
              State.shopping = comprasRes.value.map(item => ({
                id: item.id,
                title: item.nome,
                quantity: item.quantidade || 1,
                estimatedPrice: NumberParser.value(item.precoEstimado),
                actualPrice: NumberParser.value(item.precoPago),
                priority: item.prioridade || 'Média',
                purchased: Boolean(item.comprado),
                doNotBuyAgain: Boolean(item.naoComprarNovamente),
                obs: item.observacao || '',
                date: item.data
              }));
              StorageService.set(STORAGE_KEYS.SHOPPING, State.shopping);
            }
          } catch (apiErr) {
            console.error('[FinGuardian Lançar Pagos] Erro:', apiErr);
            Toast.show(apiErr.message || 'Erro ao lançar itens pagos no backend.', 'error');
            return;
          }
        } else {
          const newExpense = {
            id: 'tx_' + Date.now(),
            type: 'DESPESA',
            description: 'Compras de Mercado (Lista de Compras)',
            category: 'Alimentação',
            account: targetAccount,
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
        }

        document.getElementById('modal-convert-shopping').classList.remove('active');
        Render.all();
        Toast.show(`Despesa de ${Formatters.currency(totalCost)} gerada com sucesso!`);
      });
    }

    document.addEventListener('change', async function (e) {
      if (e.target.classList.contains('toggle-purchased-check')) {
        const id = e.target.dataset.id;
        const item = State.shopping.find(i => String(i.id) === String(id));
        if (item) {
          item.purchased = e.target.checked;
          if (window.ApiService && ApiService.isAuthenticated() && !String(item.id).startsWith('shop_')) {
            try {
              await ApiService.request(`/lista-compras/${item.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                  nome: item.title,
                  quantidade: item.quantity,
                  precoEstimado: item.estimatedPrice,
                  precoPago: item.actualPrice,
                  prioridade: item.priority,
                  comprado: item.purchased,
                  naoComprarNovamente: item.doNotBuyAgain,
                  observacao: item.obs,
                  data: item.date
                })
              });
            } catch (err) {
              console.warn('[FinGuardian Shopping Check] Erro ao salvar estado no backend:', err);
            }
          }
          StorageService.set(STORAGE_KEYS.SHOPPING, State.shopping);
          Render.shopping();
        }
      }
      if (e.target.id === 'profile-alert-toggle') { const prefs = StorageService.get(STORAGE_KEYS.PREFERENCES) || {}; prefs.notifications = e.target.checked; StorageService.set(STORAGE_KEYS.PREFERENCES, prefs); }
    });
    document.addEventListener('click', async function (e) {
      const deleteButton = e.target.closest('.delete-shopping-item');
      if (deleteButton) {
        const itemId = deleteButton.dataset.id;
        if (window.ApiService && ApiService.isAuthenticated() && !String(itemId).startsWith('shop_')) {
          try {
            await ApiService.request(`/lista-compras/${itemId}`, { method: 'DELETE' });
          } catch (err) {
            console.error('[FinGuardian Excluir Item Compra] Erro no backend:', err);
            Toast.show(err.message || 'Erro ao remover item do servidor.', 'error');
            return;
          }
        }
        State.shopping = State.shopping.filter(item => String(item.id) !== String(itemId));
        StorageService.set(STORAGE_KEYS.SHOPPING, State.shopping);
        Render.all();
        Toast.show('Item removido da lista.');
      }
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

    // Ações em Contas Bancárias
    document.addEventListener('click', async function (e) {
      const accountButton = e.target.closest('.account-action');
      if (accountButton) {
        const acc = State.accounts.find(account => String(account.id) === String(accountButton.dataset.id));
        if (!acc) return;
        const action = accountButton.dataset.accountAction;

        if (action === 'deactivate') {
          try {
            if (window.ApiService && ApiService.isAuthenticated() && !String(acc.id).startsWith('acc_')) {
              await ApiService.contas.alternarStatus(acc.id);
            }
            acc.status = acc.status === 'Ativa' ? 'Inativa' : 'Ativa';
            StorageService.set(STORAGE_KEYS.ACCOUNTS, State.accounts);
            Render.all();
            Toast.show(acc.status === 'Ativa' ? 'Conta reativada no banco.' : 'Conta desativada no banco.');
          } catch (err) {
            Toast.show(err.message || 'Erro ao alterar status da conta.', 'error');
          }
          return;
        }

        if (action === 'delete') {
          const relatedTransactions = State.transactions.filter(transaction => transaction.account === acc.name).length;
          const message = relatedTransactions
            ? `Excluir a conta “${acc.name}”? As ${relatedTransactions} movimentações do histórico serão preservadas.`
            : `Excluir a conta “${acc.name}”?`;
          if (!confirm(message)) return;
          
          try {
            if (window.ApiService && ApiService.isAuthenticated() && !String(acc.id).startsWith('acc_')) {
              await ApiService.contas.excluir(acc.id);
            }
            State.accounts = State.accounts.filter(account => String(account.id) !== String(acc.id));
            StorageService.set(STORAGE_KEYS.ACCOUNTS, State.accounts);
            Render.all();
            Toast.show('Conta excluída do banco com sucesso.');
          } catch (err) {
            Toast.show(err.message || 'Erro ao excluir conta do banco.', 'error');
          }
          return;
        }

        if (action === 'adjust') {
          const rawValue = prompt('Informe o saldo real conferido: ', acc.balance);
          if (rawValue === null) return;
          const value = NumberParser.value(rawValue);
          const reason = prompt('Motivo do ajuste:') || 'Ajuste manual de saldo';
          try {
            if (window.ApiService && ApiService.isAuthenticated() && !String(acc.id).startsWith('acc_')) {
              await ApiService.contas.ajustarSaldo(acc.id, { novoSaldo: value, motivo: reason });
            }
            await FinancialStore.registerTransaction({
              id: 'tx_' + Date.now(), type: 'AJUSTE_SALDO', description: 'Ajuste de saldo',
              account: acc.name, accountId: acc.id, amount: value - NumberParser.value(acc.balance),
              realBalance: value, reason, category: 'Ajuste', date: FinancialStore.today()
            });
            Toast.show('Saldo ajustado com sucesso!');
            Render.all();
          } catch (err) {
            Toast.show(err.message || 'Erro ao ajustar saldo.', 'error');
          }
        }
      }

      // Ações em Dívidas e Empréstimos
      const debtButton = e.target.closest('.debt-action');
      if (debtButton) {
        const debtId = debtButton.dataset.id;
        const action = debtButton.dataset.debtAction;
        if (action === 'delete') {
          if (!confirm('Deseja realmente excluir este registro de dívida/empréstimo?')) return;
          try {
            if (window.ApiService && ApiService.isAuthenticated() && !String(debtId).startsWith('debt_')) {
              await ApiService.dividas.excluir(debtId);
            }
            State.debts = State.debts.filter(d => String(d.id) !== String(debtId));
            StorageService.set(STORAGE_KEYS.DEBTS, State.debts);
            Render.all();
            Toast.show('Dívida/Empréstimo excluído do banco com sucesso.');
          } catch (err) {
            Toast.show(err.message || 'Erro ao excluir dívida do banco.', 'error');
          }
        }
      }

      // Ações no Diário Financeiro
      const diaryDeleteBtn = e.target.closest('.diary-delete-btn');
      if (diaryDeleteBtn) {
        const noteId = diaryDeleteBtn.dataset.id;
        if (!confirm('Deseja realmente excluir esta anotação do diário?')) return;
        try {
          if (window.ApiService && ApiService.isAuthenticated() && !String(noteId).startsWith('note_')) {
            await ApiService.diario.excluir(noteId);
          }
          State.diary = State.diary.filter(n => String(n.id) !== String(noteId));
          // StorageService removido, apenas DB
          Render.diary();
          Toast.show('Anotação excluída com sucesso.');
        } catch (err) {
          console.error('[FinGuardian Diário Excluir]', err);
          Toast.show(err.message || 'Erro ao excluir anotação no servidor.', 'error');
        }
      }
    });
    document.getElementById('btn-start-edit-transaction')?.addEventListener('click', () => { document.getElementById('transaction-edit-form').style.display = 'block'; document.getElementById('btn-save-edit-transaction').style.display = 'inline-flex'; document.getElementById('btn-start-edit-transaction').style.display = 'none'; const tx = State.transactions.find(t => t.id === editingTransactionId); if (tx) { document.getElementById('tx-edit-description').value = tx.description; document.getElementById('tx-edit-amount').value = tx.amount; document.getElementById('tx-edit-category').value = tx.category || ''; document.getElementById('tx-edit-payment').value = tx.paymentMethod || ''; document.getElementById('tx-edit-date').value = tx.date; } });
    document.getElementById('btn-save-edit-transaction')?.addEventListener('click', async () => {
      const tx = State.transactions.find(t => t.id === editingTransactionId);
      if (!tx) return;
      const updated = await FinancialStore.updateTransaction(tx, {
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
    analysisForm?.addEventListener('submit', async function (event) {
      event.preventDefault();
      const periodStart = document.getElementById('analysis-period-start').value;
      const periodEnd = document.getElementById('analysis-period-end').value;
      if (!periodStart || !periodEnd || periodStart > periodEnd) {
        Toast.show('Informe um período válido para a análise.', 'warning');
        return;
      }

      const transactions = State.transactions.filter(transaction => transaction.date >= periodStart && transaction.date <= periodEnd);
      let income = transactions.filter(transaction => transaction.type === 'RECEITA').reduce((sum, transaction) => sum + NumberParser.value(transaction.amount), 0);
      let expenses = transactions.filter(transaction => transaction.type === 'DESPESA').reduce((sum, transaction) => sum + NumberParser.value(transaction.amount), 0);
      let debt = State.debts.reduce((sum, item) => sum + NumberParser.value(item.remainingBalance), 0);
      const incomeBase = income || NumberParser.value(State.user.monthlyIncome);
      let commitment = incomeBase ? Math.round((expenses / incomeBase) * 100) : 0;
      let debtLevel = incomeBase ? (debt / incomeBase) * 100 : 0;
      let profile = commitment > 70 ? 'EM RISCO' : commitment > 50 || debtLevel > 100 ? 'EM OBSERVAÇÃO' : 'SAUDÁVEL';
      let confidence = State.user.confidenceScore || 100;

      if (window.ApiService && ApiService.isAuthenticated()) {
        try {
          const apiAnalysis = await ApiService.request('/analise-financeira', { method: 'POST' });
          if (apiAnalysis) {
            income = NumberParser.value(apiAnalysis.totalReceitas) || income;
            expenses = NumberParser.value(apiAnalysis.totalDespesas) || expenses;
            debt = NumberParser.value(apiAnalysis.totalDividas) || debt;
            commitment = NumberParser.value(apiAnalysis.comprometimentoRenda) || commitment;
            debtLevel = NumberParser.value(apiAnalysis.nivelEndividamento) || debtLevel;
            if (apiAnalysis.perfilFinanceiro?.tipo) {
              profile = apiAnalysis.perfilFinanceiro.tipo;
            }
            if (apiAnalysis.scoreConfianca) {
              confidence = apiAnalysis.scoreConfianca;
            }
            if (Array.isArray(apiAnalysis.recomendacoes) && apiAnalysis.recomendacoes.length) {
              State.recommendations = apiAnalysis.recomendacoes.map(r => ({
                id: r.id,
                title: r.categoriaRelacionada ? `Recomendação (${r.categoriaRelacionada})` : 'Recomendação FinGuardian AI',
                description: r.conteudo,
                priority: r.prioridade || 'Média',
                origin: 'FinGuardian AI',
                accepted: false
              }));
              StorageService.set(STORAGE_KEYS.RECOMMENDATIONS, State.recommendations);
            }
          }
        } catch (apiErr) {
          console.warn('[FinGuardian Analise] Falha no backend, usando cálculo local:', apiErr);
        }
      }

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
      Toast.show('Nova análise financeira gerada com sucesso!', 'success');
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
        const analysis = State.analysisHistory.find(item => String(item.id) === String(id));
        if (!analysis) return;
        State.analysisHistory = State.analysisHistory.filter(item => String(item.id) !== String(id));
        State.deletedAnalyses.unshift({ ...analysis, deletedAt: new Date().toISOString() });
        StorageService.set(STORAGE_KEYS.ANALYSIS_HISTORY, State.analysisHistory);
        StorageService.set(STORAGE_KEYS.DELETED_ANALYSES, State.deletedAnalyses);
        Render.all();
        Toast.show('Análise movida para itens excluídos. Você pode restaurá-la quando quiser.');
      }
      if (actionButton.dataset.analysisAction === 'restore') {
        const analysis = State.deletedAnalyses.find(item => String(item.id) === String(id));
        if (!analysis) return;
        State.deletedAnalyses = State.deletedAnalyses.filter(item => String(item.id) !== String(id));
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
      const acc = State.accounts.find(item => String(item.id) === String(button.dataset.id));
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
      diaryForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const title = document.getElementById('diary-title-input')?.value.trim();
        const content = document.getElementById('diary-content-input')?.value.trim();
        const type = document.getElementById('diary-type-select')?.value || 'anotacao';
        const date = document.getElementById('diary-date-input')?.value || new Date().toISOString().split('T')[0];

        if (!title || !content) {
          Toast.show('Preencha o título e o conteúdo da anotação.', 'warning');
          return;
        }

        const newNote = {
          id: 'note_' + Date.now(),
          title,
          content,
          type,
          date
        };

        if (window.ApiService && ApiService.isAuthenticated()) {
          try {
            const created = await ApiService.diario.criar({
              titulo: title,
              tipo: type,
              data: date,
              conteudo: content
            });
            if (created && created.id) {
              newNote.id = created.id;
            }
          } catch (err) {
            console.error('[FinGuardian Diário] Erro ao salvar no backend:', err);
            Toast.show(err.message || 'Erro ao salvar anotação no servidor.', 'error');
            return;
          }
        } else {
          console.warn('[FinGuardian] Usuário não autenticado no backend.');
          Toast.show('Aviso: Faça login para salvar suas anotações diretamente no banco de dados.', 'warning');
        }

        State.diary.unshift(newNote);
        // Storage removido para forçar DB
        diaryForm.reset();
        Render.diary();
        Toast.show('Anotação salva no diário com sucesso!', 'success');

        if (window.ApiService && ApiService.isAuthenticated()) {
          syncAllDataFromBackend().then(() => Render.diary()).catch(() => {});
        }
      });
    }

    const shoppingForm = document.getElementById('shopping-new-item-form');
    if (shoppingForm) {
      shoppingForm.addEventListener('submit', async function (e) {
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
          obs: document.getElementById('shop-obs-input')?.value || '',
          date: document.getElementById('shop-date-input')?.value || new Date().toISOString().split('T')[0]
        };

        if (window.ApiService && ApiService.isAuthenticated()) {
          try {
            const created = await ApiService.request('/lista-compras', {
              method: 'POST',
              body: JSON.stringify({
                nome: newItem.title,
                quantidade: newItem.quantity,
                precoEstimado: newItem.estimatedPrice,
                precoPago: newItem.actualPrice,
                prioridade: newItem.priority,
                comprado: newItem.purchased,
                naoComprarNovamente: newItem.doNotBuyAgain,
                observacao: newItem.obs,
                data: newItem.date
              })
            });
            if (created && created.id) {
              newItem.id = created.id;
            }
          } catch (err) {
            console.error('[FinGuardian Item Compra] Erro ao salvar no backend:', err);
            Toast.show(err.message || 'Erro ao adicionar item no servidor.', 'error');
            return;
          }
        }

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
        const alt = State.alerts.find(a => String(a.id) === String(id));
        if (alt) {
          alt.read = true;
          StorageService.set(STORAGE_KEYS.ALERTS, State.alerts);
          Render.alerts();
          Toast.show('Alerta marcado como lido.');
        }
      }

      if (e.target.classList.contains('accept-rec-btn')) {
        const id = e.target.dataset.id;
        const rec = State.recommendations.find(r => String(r.id) === String(id));
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
    const saveProfileData = async function () {
      if (!profileForm) return;
      const name = document.getElementById('prof-name-input')?.value.trim();
      const email = document.getElementById('prof-email-input')?.value.trim();
      const income = parseFloat(document.getElementById('prof-income-input')?.value);
      const saveBtn = document.getElementById('btn-save-profile');

      if (!name || !email || Number.isNaN(income)) {
        Toast.show('Preencha nome, e-mail e renda mensal.', 'warning');
        return;
      }

      if (name.length < 2) {
        Toast.show('O nome deve ter no mínimo 2 caracteres.', 'warning');
        document.getElementById('prof-name-input')?.focus();
        return;
      }

      const originalBtnText = saveBtn ? saveBtn.textContent : 'Salvar perfil';
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Salvando...';
      }

      try {
        if (window.ApiService && ApiService.isAuthenticated()) {
          // Atualiza perfil no backend Spring Boot (PUT /usuarios/me)
          const updated = await ApiService.usuario.atualizarPerfil({ nome: name, email });
          State.user.id = updated.id || State.user.id;
          State.user.name = updated.nome || name;
          State.user.email = updated.email || email;
        } else {
          State.user.name = name;
          State.user.email = email;
        }

        State.user.monthlyIncome = income;
        StorageService.set(STORAGE_KEYS.USER, State.user);

        Render.all();
        closeProfileForm();
        Toast.show('Perfil atualizado com sucesso!', 'success');
      } catch (error) {
        console.error('[FinGuardian Perfil] Erro ao atualizar perfil:', error);
        Toast.show(error.message || 'Erro ao atualizar perfil no servidor.', 'error');
      } finally {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = originalBtnText;
        }
      }
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
      if (window.ApiService) {
        ApiService.clearToken();
      }
      document.getElementById('main-app-layout').style.display = 'none';
      document.getElementById('auth-layout').style.display = 'flex';
      document.getElementById('floating-ai-button')?.classList.add('is-hidden');
      document.getElementById('modal-fin-assistant')?.classList.remove('active');
      Router.navigate('dashboard');
      Toast.show('Sessão encerrada com sucesso.', 'success');
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

    // Alteração de senha via PATCH /usuarios/me/senha
    document.getElementById('btn-security-change-password')?.addEventListener('click', async function () {
      const currentPass = document.getElementById('security-current-password')?.value || '';
      const newPass = document.getElementById('security-new-password')?.value || '';
      const confirmPass = document.getElementById('security-confirm-password')?.value || '';
      const changeBtn = this;

      if (!currentPass) {
        Toast.show('Informe a senha atual da sua conta.', 'warning');
        document.getElementById('security-current-password')?.focus();
        return;
      }

      if (newPass.length < 6) {
        Toast.show('A nova senha deve ter no mínimo 6 caracteres.', 'warning');
        document.getElementById('security-new-password')?.focus();
        return;
      }

      if (newPass !== confirmPass) {
        Toast.show('A confirmação da nova senha não confere.', 'warning');
        document.getElementById('security-confirm-password')?.focus();
        return;
      }

      if (newPass === currentPass) {
        Toast.show('A nova senha deve ser diferente da senha atual.', 'warning');
        document.getElementById('security-new-password')?.focus();
        return;
      }

      const originalText = changeBtn.textContent;
      changeBtn.disabled = true;
      changeBtn.textContent = 'Atualizando...';

      try {
        if (window.ApiService && ApiService.isAuthenticated()) {
          // Chamada real ao backend: PATCH /usuarios/me/senha
          await ApiService.usuario.alterarSenha({
            senhaAtual: currentPass,
            novaSenha: newPass
          });
        }
        const currentInput = document.getElementById('security-current-password');
        const newInput = document.getElementById('security-new-password');
        const confirmInput = document.getElementById('security-confirm-password');
        if (currentInput) currentInput.value = '';
        if (newInput) newInput.value = '';
        if (confirmInput) confirmInput.value = '';

        Toast.show('Senha alterada com sucesso!', 'success');
      } catch (error) {
        console.error('[FinGuardian Senha] Erro ao alterar senha:', error);
        Toast.show(error.message || 'Erro ao alterar a senha.', 'error');
      } finally {
        changeBtn.disabled = false;
        changeBtn.textContent = originalText;
      }
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

    // Exclusão de conta via DELETE /usuarios/me
    document.getElementById('btn-delete-data-request')?.addEventListener('click', function () {
      const deleteModal = document.getElementById('modal-delete-account');
      if (deleteModal) {
        const passInput = document.getElementById('delete-account-password');
        if (passInput) passInput.value = '';
        deleteModal.classList.add('active');
        passInput?.focus();
      }
    });

    document.getElementById('btn-confirm-delete-account')?.addEventListener('click', async function () {
      const passInput = document.getElementById('delete-account-password');
      const senha = passInput?.value || '';
      const confirmBtn = this;

      if (!senha) {
        Toast.show('Digite sua senha atual para confirmar a exclusão.', 'warning');
        passInput?.focus();
        return;
      }

      const originalText = confirmBtn.textContent;
      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Excluindo...';

      try {
        if (window.ApiService && ApiService.isAuthenticated()) {
          // Chamada real ao backend: DELETE /usuarios/me
          await ApiService.usuario.excluirConta({ senha });
        }

        // Fechar modais
        document.getElementById('modal-delete-account')?.classList.remove('active');
        document.getElementById('modal-security-privacy')?.classList.remove('active');
        if (passInput) passInput.value = '';

        // Limpar autenticação e redirecionar para login
        if (window.ApiService) {
          ApiService.clearToken();
        }
        document.getElementById('main-app-layout').style.display = 'none';
        document.getElementById('auth-layout').style.display = 'flex';
        document.getElementById('floating-ai-button')?.classList.add('is-hidden');
        document.getElementById('modal-fin-assistant')?.classList.remove('active');
        Router.navigate('dashboard');

        Toast.show('Sua conta foi inativada com sucesso.', 'warning');
      } catch (error) {
        console.error('[FinGuardian Exclusão] Erro:', error);
        Toast.show(error.message || 'Erro ao excluir conta. Verifique sua senha.', 'error');
      } finally {
        confirmBtn.disabled = false;
        confirmBtn.textContent = originalText;
      }
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

  document.addEventListener('DOMContentLoaded', async function () {
    StorageService.init();
    State.reload();
    try {
      bindEvents();
    } catch (error) {
      console.error('Falha ao iniciar interações:', error);
    }
    initFinAssistant();

    // Sincronizar sessão existente com a API Spring Boot
    if (window.ApiService && ApiService.isAuthenticated()) {
      try {
        await syncAllDataFromBackend();
        document.getElementById('auth-layout').style.display = 'none';
        document.getElementById('main-app-layout').style.display = 'flex';
        document.getElementById('floating-ai-button')?.classList.remove('is-hidden');
      } catch (authError) {
        console.warn('[FinGuardian Sessão] Sessão não validada:', authError);
        if (authError.status === 401) {
          ApiService.clearToken();
          document.getElementById('auth-layout').style.display = 'flex';
          document.getElementById('main-app-layout').style.display = 'none';
          document.getElementById('floating-ai-button')?.classList.add('is-hidden');
          Toast.show('Sessão expirada. Faça login novamente.', 'warning');
        }
      }
    } else {
      document.getElementById('auth-layout').style.display = 'flex';
      document.getElementById('main-app-layout').style.display = 'none';
      document.getElementById('floating-ai-button')?.classList.add('is-hidden');
    }

    Render.all();

    // Restaurar tema salvo nas preferências
    const savedPrefs = StorageService.get(STORAGE_KEYS.PREFERENCES);
    if (savedPrefs && savedPrefs.theme === 'escuro') {
      document.body.classList.add('theme-dark');
    }
  });

})();
