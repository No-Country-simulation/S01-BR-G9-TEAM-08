/**
 * FinGuardian AI - API Client & Integration Layer
 * Comunicação com a API REST Spring Boot (Backend)
 */

(function () {
  'use strict';

  const STORAGE_AUTH_KEY = 'finguardian_auth_token';
  const STORAGE_AUTH_META = 'finguardian_auth_meta';
  const STORAGE_API_BASE_URL = 'finguardian_api_url';

  // Configuração padrão da URL base da API Spring Boot
  const DEFAULT_API_BASE_URL = 'http://localhost:8080';

  class ApiError extends Error {
    constructor(message, status, code = null, raw = null) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
      this.code = code;
      this.raw = raw;
    }
  }

  const ApiService = {
    /**
     * Retorna a URL base configurada para a API.
     */
    getBaseUrl: function () {
      const saved = localStorage.getItem(STORAGE_API_BASE_URL);
      if (saved) return saved;

      // Se executado através do servidor proxy local (porta 3000), da porta
      // padrão HTTP (80/443) ou da mesma origem (8080), usa caminhos relativos
      if (typeof window !== 'undefined' && window.location) {
        if (window.location.port === '3000' || window.location.port === '8080' || window.location.port === '') {
          return '';
        }
      }

      return DEFAULT_API_BASE_URL;
    },

    /**
     * Permite alterar a URL base da API se necessário.
     */
    setBaseUrl: function (url) {
      if (!url) {
        localStorage.removeItem(STORAGE_API_BASE_URL);
      } else {
        localStorage.setItem(STORAGE_API_BASE_URL, url.replace(/\/+$/, ''));
      }
    },

    /**
     * Recupera o token JWT armazenado.
     */
    getToken: function () {
      return localStorage.getItem(STORAGE_AUTH_KEY);
    },

    /**
     * Salva o token JWT e seus metadados.
     */
    setToken: function (token, tipo = 'Bearer', expiraEm = 7200) {
      if (token) {
        localStorage.setItem(STORAGE_AUTH_KEY, token);
        localStorage.setItem(
          STORAGE_AUTH_META,
          JSON.stringify({
            tipo: tipo || 'Bearer',
            expiraEm: expiraEm || 7200,
            salvoEm: Date.now()
          })
        );
      }
    },

    /**
     * Limpa o token e encerra a sessão local.
     */
    clearToken: function () {
      localStorage.removeItem(STORAGE_AUTH_KEY);
      localStorage.removeItem(STORAGE_AUTH_META);
    },

    /**
     * Verifica se existe um token salvo.
     */
    isAuthenticated: function () {
      return Boolean(this.getToken());
    },

    /**
     * Executa requisições HTTP padronizadas com tratamento de erros.
     */
    request: async function (endpoint, options = {}) {
      const baseUrl = this.getBaseUrl();
      const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

      const headers = {
        'Accept': 'application/json',
        ...(options.headers || {})
      };

      // Inclui Content-Type quando houver corpo e não estiver configurado
      if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }

      // Adiciona o cabeçalho Authorization com o token JWT se presente
      const token = this.getToken();
      if (token && !headers['Authorization']) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      let response;
      try {
        response = await fetch(url, {
          ...options,
          headers
        });
      } catch (networkError) {
        console.error(`[FinGuardian API] Falha de conexão ao acessar ${url}:`, networkError);
        throw new ApiError(
          `Falha ao conectar no backend (${baseUrl || 'origem local'}). Certifique-se de que o backend Spring Boot está ativo ou utilize o servidor local 'node Frontend/server.js' para evitar bloqueios de CORS.`,
          0,
          'NETWORK_ERROR',
          networkError
        );
      }

      // Tratamento para respostas sem corpo (204 No Content)
      if (response.status === 204) {
        return { success: true };
      }

      // Tratamento de respostas de sucesso (2xx)
      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          return await response.json();
        }
        return await response.text();
      }

      // Tratamento de respostas de erro (4xx, 5xx)
      let errorBody = null;
      try {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          errorBody = await response.json();
        } else {
          errorBody = await response.text();
        }
      } catch (parseErr) {
        errorBody = null;
      }

      const formattedMessage = this.extractErrorMessage(response.status, errorBody);
      const errorCode = errorBody && typeof errorBody === 'object' ? errorBody.code || null : null;

      // Se for 401 Unauthorized e tínhamos token, o token expirou ou é inválido
      if (response.status === 401 && this.isAuthenticated()) {
        console.warn('[FinGuardian API] Token expirado ou inválido (401).');
      }

      throw new ApiError(formattedMessage, response.status, errorCode, errorBody);
    },

    /**
     * Extrai mensagem de erro legível de acordo com os DTOs do backend:
     * - MethodArgumentNotValidException: Map<String, String> com erros por campo
     * - GlobalExceptionHandler: ErrorResponse { code, message, status }
     * - SecurityEntryPoint: ErrorResponse { code, message, status }
     */
    extractErrorMessage: function (status, errorBody) {
      if (!errorBody) {
        if (status === 400) return 'Dados inválidos enviados na requisição.';
        if (status === 401) return 'Credenciais inválidas ou sessão expirada.';
        if (status === 403) return 'Acesso não autorizado.';
        if (status === 404) return 'Recurso não encontrado no servidor.';
        if (status === 409) return 'Conflito de dados (registro já existente).';
        if (status >= 500) return 'Erro interno no servidor backend.';
        return `Erro na requisição (${status}).`;
      }

      if (typeof errorBody === 'string') {
        return errorBody;
      }

      if (typeof errorBody === 'object') {
        // Se for o DTO ErrorResponse do backend: { code, message, status }
        if (errorBody.message && typeof errorBody.message === 'string') {
          return errorBody.message;
        }

        // Se for o Map de validação de campos: { "nome": "...", "email": "..." }
        if (!errorBody.code && !errorBody.error) {
          const fieldMessages = Object.entries(errorBody)
            .map(([field, msg]) => (typeof msg === 'string' ? msg : `${field}: ${JSON.stringify(msg)}`))
            .filter(Boolean);

          if (fieldMessages.length > 0) {
            return fieldMessages.join(' | ');
          }
        }

        if (errorBody.code && typeof errorBody.code === 'string') {
          return errorBody.code;
        }

        if (errorBody.error && typeof errorBody.error === 'string') {
          return errorBody.error;
        }
      }

      return 'Ocorreu um erro ao processar a requisição.';
    },

    /* ==========================================================================
       ENDPOINTS DE AUTENTICAÇÃO (AuthController)
       ========================================================================== */
    auth: {
      /**
       * Cadastra um novo usuário no backend.
       * POST /auth/register
       * @param {Object} data { nome, email, senha }
       * @returns {Promise<{ id: number, nome: string, email: string }>}
       */
      register: function (data) {
        return ApiService.request('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            nome: data.nome?.trim(),
            email: data.email?.trim(),
            senha: data.senha
          })
        });
      },

      /**
       * Realiza login e obtém token JWT.
       * POST /auth/login
       * @param {Object} data { email, senha }
       * @returns {Promise<{ token: string, tipo: string, expiraEm: number }>}
       */
      login: function (data) {
        return ApiService.request('/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: data.email?.trim(),
            senha: data.senha
          })
        });
      }
    },

    /* ==========================================================================
       ENDPOINTS DO USUÁRIO (UsuarioController)
       ========================================================================== */
    usuario: {
      /**
       * Obtém os dados do perfil do usuário autenticado.
       * GET /usuarios/me
       * @returns {Promise<{ id: number, nome: string, email: string, dataCadastro: string }>}
       */
      getPerfil: function () {
        return ApiService.request('/usuarios/me', {
          method: 'GET'
        });
      },

      /**
       * Atualiza nome e/ou e-mail do usuário autenticado.
       * PUT /usuarios/me
       * @param {Object} data { nome, email }
       * @returns {Promise<{ id: number, nome: string, email: string }>}
       */
      atualizarPerfil: function (data) {
        const payload = {};
        if (data.nome !== undefined && data.nome !== null && data.nome.trim() !== '') {
          payload.nome = data.nome.trim();
        }
        if (data.email !== undefined && data.email !== null && data.email.trim() !== '') {
          payload.email = data.email.trim();
        }

        return ApiService.request('/usuarios/me', {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      },

      /**
       * Altera a senha do usuário autenticado.
       * PATCH /usuarios/me/senha
       * @param {Object} data { senhaAtual, novaSenha }
       * @returns {Promise<{ success: boolean }>}
       */
      alterarSenha: function (data) {
        return ApiService.request('/usuarios/me/senha', {
          method: 'PATCH',
          body: JSON.stringify({
            senhaAtual: data.senhaAtual,
            novaSenha: data.novaSenha
          })
        });
      },

      /**
       * Exclui (inativa) a conta do usuário autenticado confirmando a senha.
       * DELETE /usuarios/me
       * @param {Object} data { senha }
       * @returns {Promise<{ success: boolean }>}
       */
      excluirConta: function (data) {
        return ApiService.request('/usuarios/me', {
          method: 'DELETE',
          body: JSON.stringify({
            senha: data.senha
          })
        });
      }
    },

    /* ==========================================================================
       ENDPOINTS DE CONTAS BANCÁRIAS (ContaController)
       ========================================================================== */
    contas: {
      /**
       * Lista todas as contas bancárias do usuário autenticado.
       * GET /contas
       */
      listar: function () {
        return ApiService.request('/contas', { method: 'GET' });
      },

      /**
       * Cadastra uma nova conta bancária.
       * POST /contas
       * @param {Object} data { nome, instituicao, tipo, moeda, saldo, limiteCredito, limiteChequeEspecial }
       */
      criar: function (data) {
        return ApiService.request('/contas', {
          method: 'POST',
          body: JSON.stringify({
            nome: data.name || data.nome,
            instituicao: data.institution || data.instituicao || 'Principal',
            tipo: data.type || data.tipo || 'conta corrente',
            moeda: data.currency || data.moeda || 'BRL',
            saldo: data.balance !== undefined ? data.balance : (data.saldo || 0),
            limiteCredito: data.creditLimit !== undefined ? data.creditLimit : (data.limiteCredito || 0),
            limiteChequeEspecial: data.overdraftLimit !== undefined ? data.overdraftLimit : (data.limiteChequeEspecial || 0)
          })
        });
      },

      /**
       * Atualiza os dados de uma conta bancária.
       * PUT /contas/{id}
       */
      atualizar: function (id, data) {
        return ApiService.request(`/contas/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            nome: data.name || data.nome,
            instituicao: data.institution || data.instituicao,
            tipo: data.type || data.tipo,
            moeda: data.currency || data.moeda || 'BRL',
            saldo: data.balance !== undefined ? data.balance : data.saldo,
            limiteCredito: data.creditLimit !== undefined ? data.creditLimit : data.limiteCredito,
            limiteChequeEspecial: data.overdraftLimit !== undefined ? data.overdraftLimit : data.limiteChequeEspecial
          })
        });
      },

      /**
       * Ajusta o saldo de uma conta bancária.
       * PATCH /contas/{id}/saldo
       */
      ajustarSaldo: function (id, data) {
        return ApiService.request(`/contas/${id}/saldo`, {
          method: 'PATCH',
          body: JSON.stringify({
            novoSaldo: data.novoSaldo !== undefined ? data.novoSaldo : data.realBalance,
            motivo: data.motivo || data.reason || 'Ajuste manual de saldo'
          })
        });
      },

      /**
       * Alterna o status da conta entre Ativa e Inativa.
       * PATCH /contas/{id}/status
       */
      alternarStatus: function (id) {
        return ApiService.request(`/contas/${id}/status`, {
          method: 'PATCH'
        });
      },

      /**
       * Exclui uma conta bancária.
       * DELETE /contas/{id}
       */
      excluir: function (id) {
        return ApiService.request(`/contas/${id}`, {
          method: 'DELETE'
        });
      }
    },

    /* ==========================================================================
       ENDPOINTS DE DÍVIDAS E EMPRÉSTIMOS (DividaController)
       ========================================================================== */
    dividas: {
      /**
       * Lista todas as dívidas e empréstimos do usuário autenticado.
       * GET /dividas
       */
      listar: function () {
        return ApiService.request('/dividas', { method: 'GET' });
      },

      /**
       * Cria uma nova dívida ou empréstimo.
       * POST /dividas
       */
      criar: function (data) {
        return ApiService.request('/dividas', {
          method: 'POST',
          body: JSON.stringify({
            descricao: data.description || data.descricao,
            valorOriginal: data.originalAmount !== undefined ? data.originalAmount : data.valorOriginal,
            saldoDevedor: data.remainingBalance !== undefined ? data.remainingBalance : data.saldoDevedor,
            valorParcela: data.installmentValue !== undefined ? data.installmentValue : data.valorParcela,
            parcelasRestantes: data.remainingInstallments !== undefined ? data.remainingInstallments : data.parcelasRestantes,
            taxaJuros: data.interestRate !== undefined ? data.interestRate : (data.taxaJuros || 0),
            dataVencimento: data.dueDate || data.dataVencimento || 'Dia 10',
            status: data.status || 'Em dia'
          })
        });
      },

      /**
       * Atualiza uma dívida existente.
       * PUT /dividas/{id}
       */
      atualizar: function (id, data) {
        return ApiService.request(`/dividas/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            descricao: data.description || data.descricao,
            valorOriginal: data.originalAmount !== undefined ? data.originalAmount : data.valorOriginal,
            saldoDevedor: data.remainingBalance !== undefined ? data.remainingBalance : data.saldoDevedor,
            valorParcela: data.installmentValue !== undefined ? data.installmentValue : data.valorParcela,
            parcelasRestantes: data.remainingInstallments !== undefined ? data.remainingInstallments : data.parcelasRestantes,
            taxaJuros: data.interestRate !== undefined ? data.interestRate : (data.taxaJuros || 0),
            dataVencimento: data.dueDate || data.dataVencimento,
            status: data.status
          })
        });
      },

      /**
       * Exclui uma dívida.
       * DELETE /dividas/{id}
       */
      excluir: function (id) {
        return ApiService.request(`/dividas/${id}`, {
          method: 'DELETE'
        });
      }
    },

    /* ==========================================================================
       ENDPOINTS DE MOVIMENTAÇÕES (MovimentacaoController)
       ========================================================================== */
    movimentacoes: {
      /**
       * Lista todas as movimentações do usuário autenticado.
       * GET /movimentacoes
       */
      listar: function (params = {}) {
        let query = '';
        const searchParams = new URLSearchParams();
        if (params.tipo) searchParams.append('tipo', params.tipo);
        if (params.dataInicio) searchParams.append('dataInicio', params.dataInicio);
        if (params.dataFim) searchParams.append('dataFim', params.dataFim);
        const qs = searchParams.toString();
        if (qs) query = `?${qs}`;

        return ApiService.request(`/movimentacoes${query}`, {
          method: 'GET'
        });
      },

      /**
       * Busca uma movimentação pelo ID.
       * GET /movimentacoes/{id}
       */
      buscarPorId: function (id) {
        return ApiService.request(`/movimentacoes/${id}`, {
          method: 'GET'
        });
      },

      /**
       * Cadastra uma nova movimentação.
       * POST /movimentacoes
       */
      criar: function (data) {
        const rawOrigemId = data.contaOrigemId !== undefined ? data.contaOrigemId : data.accountId;
        const validOrigemId = (Number.isInteger(Number(rawOrigemId)) && !String(rawOrigemId).startsWith('acc_')) ? Number(rawOrigemId) : null;
        const rawDestinoId = data.contaDestinoId !== undefined ? data.contaDestinoId : data.destinationAccountId;
        const validDestinoId = (Number.isInteger(Number(rawDestinoId)) && !String(rawDestinoId).startsWith('acc_')) ? Number(rawDestinoId) : null;

        return ApiService.request('/movimentacoes', {
          method: 'POST',
          body: JSON.stringify({
            tipo: data.tipo || data.type || 'DESPESA',
            descricao: data.descricao || data.description,
            valor: data.valor !== undefined ? Number(data.valor) : (data.amount !== undefined ? Number(data.amount) : 0),
            data: data.data || data.date || new Date().toISOString().split('T')[0],
            categoria: data.categoria || data.category || 'Geral',
            subcategoria: data.subcategoria || data.subcategory || null,
            contaOrigemId: validOrigemId,
            contaOrigemNome: data.contaOrigemNome || data.account || 'Carteira Principal',
            contaDestinoId: validDestinoId,
            contaDestinoNome: data.contaDestinoNome || data.destinationAccount || null,
            formaPagamento: data.formaPagamento || data.paymentMethod || 'PIX',
            recorrencia: data.recorrencia || data.recurrence || 'Única',
            observacoes: data.observacoes || data.obs || null,
            saldoReal: data.saldoReal !== undefined ? Number(data.saldoReal) : (data.realBalance !== undefined ? Number(data.realBalance) : null),
            motivoAjuste: data.motivoAjuste || data.reason || null,
            origemIA: Boolean(data.origemIA || data.origin === 'CONVERSA_IA')
          })
        });
      },

      /**
       * Atualiza uma movimentação existente.
       * PUT /movimentacoes/{id}
       */
      atualizar: function (id, data) {
        const rawOrigemId = data.contaOrigemId !== undefined ? data.contaOrigemId : data.accountId;
        const validOrigemId = (Number.isInteger(Number(rawOrigemId)) && !String(rawOrigemId).startsWith('acc_')) ? Number(rawOrigemId) : null;
        const rawDestinoId = data.contaDestinoId !== undefined ? data.contaDestinoId : data.destinationAccountId;
        const validDestinoId = (Number.isInteger(Number(rawDestinoId)) && !String(rawDestinoId).startsWith('acc_')) ? Number(rawDestinoId) : null;

        return ApiService.request(`/movimentacoes/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            tipo: data.tipo || data.type,
            descricao: data.descricao || data.description,
            valor: data.valor !== undefined ? Number(data.valor) : (data.amount !== undefined ? Number(data.amount) : undefined),
            data: data.data || data.date,
            categoria: data.categoria || data.category,
            subcategoria: data.subcategoria || data.subcategory,
            contaOrigemId: validOrigemId,
            contaOrigemNome: data.contaOrigemNome || data.account,
            contaDestinoId: validDestinoId,
            contaDestinoNome: data.contaDestinoNome || data.destinationAccount,
            formaPagamento: data.formaPagamento || data.paymentMethod,
            recorrencia: data.recorrencia || data.recurrence,
            observacoes: data.observacoes || data.obs,
            saldoReal: data.saldoReal !== undefined ? Number(data.saldoReal) : (data.realBalance !== undefined ? Number(data.realBalance) : undefined),
            motivoAjuste: data.motivoAjuste || data.reason,
            origemIA: Boolean(data.origemIA)
          })
        });
      },

      /**
       * Exclui uma movimentação.
       * DELETE /movimentacoes/{id}
       */
      excluir: function (id) {
        return ApiService.request(`/movimentacoes/${id}`, {
          method: 'DELETE'
        });
      }
    },

    /* ==========================================================================
       ENDPOINTS DE DIÁRIO FINANCEIRO (DiarioController)
       ========================================================================== */
    diario: {
      /**
       * Lista todas as anotações do diário financeiro.
       * GET /diario
       */
      listar: function () {
        return ApiService.request('/diario', {
          method: 'GET'
        });
      },

      /**
       * Busca uma anotação pelo ID.
       * GET /diario/{id}
       */
      buscarPorId: function (id) {
        return ApiService.request(`/diario/${id}`, {
          method: 'GET'
        });
      },

      /**
       * Cadastra uma nova anotação no diário financeiro.
       * POST /diario
       */
      criar: function (data) {
        return ApiService.request('/diario', {
          method: 'POST',
          body: JSON.stringify({
            titulo: data.titulo || data.title,
            tipo: data.tipo || data.type || 'anotacao',
            data: data.data || data.date || new Date().toISOString().split('T')[0],
            conteudo: data.conteudo || data.content
          })
        });
      },

      /**
       * Atualiza uma anotação existente no diário financeiro.
       * PUT /diario/{id}
       */
      atualizar: function (id, data) {
        return ApiService.request(`/diario/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            titulo: data.titulo || data.title,
            tipo: data.tipo || data.type || 'anotacao',
            data: data.data || data.date,
            conteudo: data.conteudo || data.content
          })
        });
      },

      /**
       * Exclui uma anotação do diário financeiro.
       * DELETE /diario/{id}
       */
      excluir: function (id) {
        return ApiService.request(`/diario/${id}`, {
          method: 'DELETE'
        });
      }
    },

    /* ==========================================================================
       ENDPOINTS DE IA (IAController)
       ========================================================================== */
    ia: {
      /**
       * Processa texto em linguagem natural através do endpoint do backend Spring Boot.
       * POST /api/ia/processar-texto
       * @param {Object} data { texto }
       * @returns {Promise<Object>}
       */
      processarTexto: async function (data) {
        const response = await ApiService.request('/api/ia/processar-texto', {
          method: 'POST',
          body: JSON.stringify({
            texto: data.texto
          })
        });

        if (typeof response === 'string') {
          try {
            return JSON.parse(response);
          } catch (e) {
            return { resultado: response };
          }
        }
        return response;
      }
    },

    /* ==========================================================================
       ENDPOINTS DO FIN (Chatbot IA)
       ========================================================================== */
    fin: {
      /**
       * Envia mensagem para o assistente virtual Fin com histórico opcional.
       * POST /api/fin/chat
       * @param {Object} data { mensagem, historico }
       * @returns {Promise<Object>}
       */
      chat: function (data) {
        return ApiService.request('/api/fin/chat', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      }
    }
  };

  // Exporta globalmente para uso na aplicação
  window.ApiService = ApiService;
  window.ApiError = ApiError;
})();
