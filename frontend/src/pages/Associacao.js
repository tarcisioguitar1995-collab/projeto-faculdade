import React, { useEffect, useState } from 'react';
import * as api from '../services/api';

function Associacao() {
  const [produtos, setProdutos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [produtoId, setProdutoId] = useState('');
  const [fornecedorId, setFornecedorId] = useState('');
  const [associados, setAssociados] = useState([]);
  const [alerta, setAlerta] = useState(null);

  useEffect(() => {
    api.listarProdutos().then(setProdutos).catch((e) => setAlerta({ tipo: 'erro', texto: e.message }));
    api.listarFornecedores().then(setFornecedores).catch(() => {});
  }, []);

  useEffect(() => {
    if (produtoId) {
      carregarAssociados(produtoId);
    } else {
      setAssociados([]);
    }
  }, [produtoId]);

  async function carregarAssociados(idProduto) {
    try {
      const dados = await api.listarFornecedoresDoProduto(idProduto);
      setAssociados(dados);
    } catch (e) {
      setAlerta({ tipo: 'erro', texto: e.message });
    }
  }

  async function associar() {
    setAlerta(null);
    if (!produtoId) {
      setAlerta({ tipo: 'erro', texto: 'Selecione um produto' });
      return;
    }
    if (!fornecedorId) {
      setAlerta({ tipo: 'erro', texto: 'Selecione um fornecedor' });
      return;
    }
    try {
      await api.associarFornecedor(produtoId, fornecedorId);
      setAlerta({ tipo: 'sucesso', texto: 'Fornecedor associado com sucesso ao produto!' });
      setFornecedorId('');
      carregarAssociados(produtoId);
    } catch (e) {
      setAlerta({ tipo: 'erro', texto: e.message });
    }
  }

  async function desassociar(forId) {
    if (!window.confirm('Confirma a desassociação deste fornecedor?')) return;
    try {
      await api.desassociarFornecedor(produtoId, forId);
      setAlerta({ tipo: 'sucesso', texto: 'Fornecedor desassociado com sucesso!' });
      carregarAssociados(produtoId);
    } catch (e) {
      setAlerta({ tipo: 'erro', texto: e.message });
    }
  }

  const produto = produtos.find((p) => String(p.id) === String(produtoId));

  // fornecedores ainda não associados (para não oferecer duplicar)
  const idsAssociados = new Set(associados.map((a) => a.id));
  const disponiveis = fornecedores.filter((f) => !idsAssociados.has(f.id));

  return (
    <>
      <div className="card">
        <h2>Associação de Fornecedor a Produto</h2>

        {alerta && (
          <div className={`alerta alerta-${alerta.tipo}`}>{alerta.texto}</div>
        )}

        <div className="form-group">
          <label>Produto</label>
          <select
            value={produtoId}
            onChange={(e) => {
              setProdutoId(e.target.value);
              setAlerta(null);
            }}
          >
            <option value="">-- Escolha um produto --</option>
            {produtos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>

        {produto && (
          <div className="detalhes-produto">
            <h3 style={{ marginTop: 0 }}>Detalhes do Produto</h3>
            <p>
              <strong>Nome:</strong> {produto.nome}
            </p>
            <p>
              <strong>Código de Barras:</strong> {produto.codigo_barras || '—'}
            </p>
            <p>
              <strong>Descrição:</strong> {produto.descricao}
            </p>
            <p>
              <strong>Categoria:</strong> {produto.categoria}
            </p>
            {produto.imagem && (
              <p>
                <strong>Imagem:</strong>
                <br />
                <img
                  src={produto.imagem}
                  alt={produto.nome}
                  style={{ maxWidth: 120, maxHeight: 120, marginTop: 4 }}
                />
              </p>
            )}
          </div>
        )}

        {produtoId && (
          <>
            <div className="form-group">
              <label>Selecione um Fornecedor</label>
              <select
                value={fornecedorId}
                onChange={(e) => setFornecedorId(e.target.value)}
              >
                <option value="">Selecione um fornecedor</option>
                {disponiveis.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome} — {f.cnpj}
                  </option>
                ))}
              </select>
              {disponiveis.length === 0 && fornecedores.length > 0 && (
                <small style={{ color: '#6b7280' }}>
                  Todos os fornecedores cadastrados já estão associados a este produto.
                </small>
              )}
            </div>
            <button
              className="btn btn-primary"
              onClick={associar}
              disabled={disponiveis.length === 0}
            >
              Associar Fornecedor
            </button>
          </>
        )}
      </div>

      {produtoId && (
        <div className="card">
          <h2>Fornecedores Associados</h2>
          {associados.length === 0 ? (
            <p>Nenhum fornecedor associado a este produto.</p>
          ) : (
            <table className="tabela">
              <thead>
                <tr>
                  <th>Nome do Fornecedor</th>
                  <th>CNPJ</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {associados.map((f) => (
                  <tr key={f.id}>
                    <td>{f.nome}</td>
                    <td>{f.cnpj}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-pequeno"
                        onClick={() => desassociar(f.id)}
                      >
                        Desassociar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </>
  );
}

export default Associacao;
