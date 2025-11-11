// api.js

// ❗️❗️ MUITO IMPORTANTE ❗️❗️
// Substitua '192.168.15.200' pelo seu IP atual, se mudar.
// A porta é 3000 (do seu server.js).
export const BASE_URL = 'http://192.168.15.200:3000'; 

/**
 * Função genérica para tratar os fetches
 */
const fetcher = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      // Tenta ler a mensagem de erro específica do servidor
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido.' }));
      throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
    }
    
    // Se for um POST/PUT que retorna 204 (No Content), apenas retorna sucesso
    if (response.status === 204) {
      return { success: true };
    }
    
    return response.json(); // Retorna os dados (GET)
  } catch (error) {
    console.error(`Falha na API [${options.method || 'GET'} ${url}]:`, error.message);
    throw error; // Re-lança o erro para a tela (ex: LoginScreen) apanhar
  }
};

// --- ROTAS DE LEITURA (GET) ---

export const getCardapio = () => fetcher(`${BASE_URL}/cardapio`, { cache: 'no-cache' });
export const getGarcons = () => fetcher(`${BASE_URL}/garcons`, { cache: 'no-cache' });
export const getMesas = () => fetcher(`${BASE_URL}/mesas`, { cache: 'no-cache' });
export const getHistorico = () => fetcher(`${BASE_URL}/historico`, { cache: 'no-cache' });

// --- ROTAS DE ESCRITA (POST/PUT) ---

export const loginUsuario = (nome, senha, tipo) => {
  return fetcher(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, senha, tipo }),
  });
};

export const ocuparMesa = (mesaId, garcomNome) => {
  return fetcher(`${BASE_URL}/mesas/${mesaId}/ocupar`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ garcomNome }),
  });
};

export const liberarMesa = (mesaId) => {
  return fetcher(`${BASE_URL}/mesas/${mesaId}/liberar`, {
    method: 'PUT',
  });
};

export const adicionarEstoque = (itemId, quantidade) => {
  return fetcher(`${BASE_URL}/estoque/adicionar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemId, quantidade }),
  });
};

export const finalizarPedido = (pedidoData) => {
  return fetcher(`${BASE_URL}/pedidos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pedidoData),
  });
};