import React, { useEffect, useState } from 'react';
import * as api from '../services/api';

function Producao() {
  const [produtos, setProdutos] = useState([]);
  const [produtoId, setProdutoId] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [fichaInfo, setFichaInfo] = useState(null);

  useEffect(() => {
    api.listarProdutos().then(setProdutos).catch(() => {});
  }, []);

  useEffect(() => {
    if (!produtoId) {
      setFichaInfo(null);
      return;
    }
    api.listarFichaTecnica(produtoId).then(setFichaInfo).catch(() => setFichaInfo(null));
  }, [produtoId]);

  async function submeter(e) {
    e.preventDefault();
    setProcessando(true);
    setResultado(null);

    try {
      const dados = await api.registrarProducao({
        produto_id: Number(produtoId),
        quantidade_produzida: Number(quantidade)
      });

      let alertasTexto = '';
      if (dados.alertas && dados.alertas.length > 0) {
        alertasTexto = ' Alerta de estoque mínimo: ' +
          dados.alertas.map((a) => `${a.nome} (${a.estoque_atual} restantes, mínimo ${a.estoque_minimo})`).join(', ');
      }

      setResultado({
        tipo: 'sucesso',
        texto: dados.mensagem + alertasTexto
      });
      api.listarFichaTecnica(produtoId).then(setFichaInfo).catch(() => {});
    } catch (e) {
      if (e.dados && e.dados.faltantes) {
        const detalhes = e.dados.faltantes
          .map((f) => `${f.nome}: necessário ${f.necessario}, disponível ${f.disponivel}`)
          .join('; ');
        setResultado({
          tipo: 'erro',
          texto: `Estoque insuficiente: ${detalhes}`
        });
      } else {
        setResultado({ tipo: 'erro', texto: e.message });
      }
    } finally {
      setProcessando(false);
    }
  }

  return (
    <>
      <div className="card">
        <h2>Registrar Produção</h2>

        {resultado && (
          <div className={`alerta alerta-${resultado.tipo}`}>{resultado.texto}</div>
        )}

        <form onSubmit={submeter} noValidate>
          <div className="form-group">
            <label>Produto (Churro) *</label>
            <select
              value={produtoId}
              onChange={(e) => {
                setProdutoId(e.target.value);
                setResultado(null);
              }}
            >
              <option value="">-- Selecione --</option>
              {produtos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>

          {fichaInfo && (
            <div className="detalhes-produto">
              <h3>{fichaInfo.produto.nome}</h3>
              <p>Insumos necessários por unidade:</p>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {fichaInfo.itens.map((item) => (
                  <li key={item.id}>
                    {item.insumo_nome}: {item.quantidade_consumida}{item.unidade_medida || 'un'}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="form-group">
            <label>Quantidade Produzida *</label>
            <input
              type="number"
              min="1"
              value={quantidade}
              onChange={(e) => {
                setQuantidade(e.target.value);
                setResultado(null);
              }}
              placeholder="Quantidade produzida"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={processando || !produtoId || !quantidade}
          >
            {processando ? 'Processando...' : 'Registrar Produção'}
          </button>
        </form>
      </div>
    </>
  );
}

export default Producao;
