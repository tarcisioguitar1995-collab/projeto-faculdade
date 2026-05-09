import React, { useEffect, useState } from 'react';
import * as api from '../services/api';

function FichaTecnica() {
  const [produtos, setProdutos] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [produtoId, setProdutoId] = useState('');
  const [itens, setItens] = useState([{ insumo_id: '', quantidade_consumida: '' }]);
  const [fichaSalva, setFichaSalva] = useState(null);
  const [alerta, setAlerta] = useState(null);

  useEffect(() => {
    api.listarProdutos().then(setProdutos).catch(() => {});
  }, []);

  useEffect(() => {
    const idsFiltro = produtoId ? new Set([Number(produtoId)]) : new Set();
    setInsumos(produtos.filter((p) => !idsFiltro.has(p.id)));
  }, [produtos, produtoId]);

  useEffect(() => {
    if (!produtoId) {
      setFichaSalva(null);
      setItens([{ insumo_id: '', quantidade_consumida: '' }]);
      return;
    }
    setAlerta(null);
    api.listarFichaTecnica(produtoId).then((dados) => {
      setFichaSalva(dados);
      if (dados.itens.length > 0) {
        setItens(
          dados.itens.map((i) => ({
            insumo_id: String(i.insumo_id),
            quantidade_consumida: String(i.quantidade_consumida)
          }))
        );
      } else {
        setItens([{ insumo_id: '', quantidade_consumida: '' }]);
      }
    }).catch(() => {
      setFichaSalva(null);
      setItens([{ insumo_id: '', quantidade_consumida: '' }]);
    });
  }, [produtoId]);

  function adicionarItem() {
    setItens([...itens, { insumo_id: '', quantidade_consumida: '' }]);
  }

  function removerItem(i) {
    if (itens.length <= 1) return;
    setItens(itens.filter((_, idx) => idx !== i));
  }

  function mudarItem(i, campo, valor) {
    const novos = [...itens];
    novos[i][campo] = valor;
    setItens(novos);
  }

  async function submeter(e) {
    e.preventDefault();
    setAlerta(null);

    if (!produtoId) {
      setAlerta({ tipo: 'erro', texto: 'Selecione um produto' });
      return;
    }

    const dados = itens.map((item) => ({
      insumo_id: Number(item.insumo_id),
      quantidade_consumida: Number(item.quantidade_consumida)
    })).filter((item) => item.insumo_id && item.quantidade_consumida > 0);

    if (dados.length === 0) {
      setAlerta({ tipo: 'erro', texto: 'Adicione pelo menos um insumo com quantidade válida' });
      return;
    }

    try {
      await api.salvarFichaTecnica(produtoId, dados);
      setAlerta({ tipo: 'sucesso', texto: 'Ficha técnica salva com sucesso!' });
      await api.listarFichaTecnica(produtoId).then((dados) => {
        setFichaSalva(dados);
        if (dados.itens.length > 0) {
          setItens(
            dados.itens.map((i) => ({
              insumo_id: String(i.insumo_id),
              quantidade_consumida: String(i.quantidade_consumida)
            }))
          );
        }
      });
    } catch (e) {
      setAlerta({ tipo: 'erro', texto: e.message });
    }
  }

  const insumosDisponiveis = insumos.filter(
    (ins) => !itens.some((item) => Number(item.insumo_id) === ins.id)
  );

  return (
    <>
      <div className="card">
        <h2>Ficha Técnica</h2>
        {alerta && (
          <div className={`alerta alerta-${alerta.tipo}`}>{alerta.texto}</div>
        )}

        <form onSubmit={submeter} noValidate>
          <div className="form-group">
            <label>Produto (Churro) *</label>
            <select
              value={produtoId}
              onChange={(e) => setProdutoId(e.target.value)}
            >
              <option value="">-- Selecione --</option>
              {produtos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>

          {fichaSalva && (
            <div className="detalhes-produto">
              <h3>{fichaSalva.produto.nome}</h3>
              <p>{fichaSalva.produto.descricao}</p>
            </div>
          )}

          <h3>Insumos</h3>
          {itens.map((item, idx) => (
            <div key={idx} className="linha-insumo">
              <div className="form-group" style={{ flex: 2 }}>
                <label>{`Insumo ${idx + 1}`}</label>
                <select
                  value={item.insumo_id}
                  onChange={(e) => mudarItem(idx, 'insumo_id', e.target.value)}
                >
                  <option value="">-- Selecione --</option>
                  {(item.insumo_id
                    ? [...insumosDisponiveis, produtos.find((p) => p.id === Number(item.insumo_id))].filter(Boolean)
                    : insumosDisponiveis
                  ).map((ins) => (
                    <option key={ins.id} value={ins.id}>
                      {ins.nome} ({ins.unidade_medida || 'un'})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Quantidade</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.quantidade_consumida}
                  onChange={(e) => mudarItem(idx, 'quantidade_consumida', e.target.value)}
                  placeholder="Qtd"
                />
              </div>
              <button
                type="button"
                className="btn btn-danger btn-pequeno"
                onClick={() => removerItem(idx)}
                disabled={itens.length <= 1}
                style={{ alignSelf: 'flex-end', marginBottom: 14 }}
              >
                Remover
              </button>
            </div>
          ))}

          <button type="button" className="btn btn-secondary" onClick={adicionarItem} style={{ marginBottom: 16 }}>
            + Adicionar Insumo
          </button>

          <br />
          <button type="submit" className="btn btn-primary">
            Salvar Ficha Técnica
          </button>
        </form>
      </div>

      {fichaSalva && fichaSalva.itens.length > 0 && (
        <div className="card">
          <h2>Insumos Cadastrados</h2>
          <table className="tabela">
            <thead>
              <tr>
                <th>Insumo</th>
                <th>Quantidade</th>
                <th>Unidade</th>
              </tr>
            </thead>
            <tbody>
              {fichaSalva.itens.map((item) => (
                <tr key={item.id}>
                  <td>{item.insumo_nome}</td>
                  <td>{item.quantidade_consumida}</td>
                  <td>{item.unidade_medida || 'un'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default FichaTecnica;
