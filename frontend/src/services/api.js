// camada de comunicação com o backend
const BASE_URL = 'http://localhost:3000';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const dados = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(dados.mensagem || dados.erro || 'Erro na requisição');
    err.status = res.status;
    err.dados = dados;
    throw err;
  }
  return dados;
}

// fornecedores
export const listarFornecedores = () => request('/fornecedores');
export const buscarFornecedor = (id) => request(`/fornecedores/${id}`);
export const criarFornecedor = (dados) =>
  request('/fornecedores', { method: 'POST', body: JSON.stringify(dados) });
export const atualizarFornecedor = (id, dados) =>
  request(`/fornecedores/${id}`, { method: 'PUT', body: JSON.stringify(dados) });
export const removerFornecedor = (id) =>
  request(`/fornecedores/${id}`, { method: 'DELETE' });

// produtos
export const listarProdutos = () => request('/produtos');
export const buscarProduto = (id) => request(`/produtos/${id}`);
export const criarProduto = (dados) =>
  request('/produtos', { method: 'POST', body: JSON.stringify(dados) });
export const atualizarProduto = (id, dados) =>
  request(`/produtos/${id}`, { method: 'PUT', body: JSON.stringify(dados) });
export const removerProduto = (id) =>
  request(`/produtos/${id}`, { method: 'DELETE' });

// associação
export const listarFornecedoresDoProduto = (produtoId) =>
  request(`/produtos/${produtoId}/fornecedores`);
export const associarFornecedor = (produtoId, fornecedorId) =>
  request(`/produtos/${produtoId}/fornecedores`, {
    method: 'POST',
    body: JSON.stringify({ fornecedor_id: fornecedorId })
  });
export const desassociarFornecedor = (produtoId, fornecedorId) =>
  request(`/produtos/${produtoId}/fornecedores/${fornecedorId}`, { method: 'DELETE' });

// ficha técnica
export const listarFichaTecnica = (produtoId) =>
  request(`/produtos/${produtoId}/ficha-tecnica`);
export const salvarFichaTecnica = (produtoId, itens) =>
  request(`/produtos/${produtoId}/ficha-tecnica`, {
    method: 'POST',
    body: JSON.stringify({ itens })
  });

// produção
export const registrarProducao = (dados) =>
  request('/producao', { method: 'POST', body: JSON.stringify(dados) });
