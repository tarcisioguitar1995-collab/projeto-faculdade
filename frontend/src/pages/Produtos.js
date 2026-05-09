import React, { useEffect, useState } from 'react';
import * as api from '../services/api';

const CATEGORIAS = ['Eletrônicos', 'Alimentos', 'Vestuário', 'Higiene', 'Limpeza', 'Outro'];

const UNIDADES = ['g', 'ml', 'un'];

const FORM_VAZIO = {
  nome: '',
  codigo_barras: '',
  descricao: '',
  quantidade: '',
  estoque_minimo: '',
  unidade_medida: 'un',
  categoria: '',
  categoria_outro: '',
  data_validade: '',
  imagem: ''
};

function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [erros, setErros] = useState({});
  const [alerta, setAlerta] = useState(null);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    try {
      const dados = await api.listarProdutos();
      setProdutos(dados);
    } catch (e) {
      setAlerta({ tipo: 'erro', texto: e.message });
    }
  }

  function mudar(campo, valor) {
    setForm({ ...form, [campo]: valor });
    if (erros[campo]) {
      const novos = { ...erros };
      delete novos[campo];
      setErros(novos);
    }
  }

  async function submeter(e) {
    e.preventDefault();
    setErros({});
    setAlerta(null);

    // validação local da opção "Outro"
    if (form.categoria === 'Outro' && !form.categoria_outro.trim()) {
      setErros({ categoria: 'Especifique a categoria' });
      return;
    }

    const dados = {
      nome: form.nome,
      codigo_barras: form.codigo_barras || null,
      descricao: form.descricao,
      quantidade: form.quantidade === '' ? 0 : Number(form.quantidade),
      estoque_minimo: form.estoque_minimo === '' ? 0 : Number(form.estoque_minimo),
      unidade_medida: form.unidade_medida,
      categoria: form.categoria === 'Outro' ? form.categoria_outro.trim() : form.categoria,
      data_validade: form.data_validade || null,
      imagem: form.imagem || null
    };

    try {
      if (editandoId) {
        await api.atualizarProduto(editandoId, dados);
        setAlerta({ tipo: 'sucesso', texto: 'Produto atualizado com sucesso!' });
      } else {
        await api.criarProduto(dados);
        setAlerta({ tipo: 'sucesso', texto: 'Produto cadastrado com sucesso!' });
      }
      setForm(FORM_VAZIO);
      setEditandoId(null);
      carregar();
    } catch (e) {
      if (e.dados && e.dados.erros) {
        setErros(e.dados.erros);
      }
      setAlerta({ tipo: 'erro', texto: e.message });
    }
  }

  function editar(p) {
    const ehCategoriaConhecida = CATEGORIAS.slice(0, -1).includes(p.categoria);
    setForm({
      nome: p.nome || '',
      codigo_barras: p.codigo_barras || '',
      descricao: p.descricao || '',
      quantidade: p.quantidade !== null && p.quantidade !== undefined ? String(p.quantidade) : '',
      estoque_minimo: p.estoque_minimo !== null && p.estoque_minimo !== undefined ? String(p.estoque_minimo) : '',
      unidade_medida: p.unidade_medida || 'un',
      categoria: ehCategoriaConhecida ? p.categoria : 'Outro',
      categoria_outro: ehCategoriaConhecida ? '' : p.categoria || '',
      data_validade: p.data_validade || '',
      imagem: p.imagem || ''
    });
    setEditandoId(p.id);
    setErros({});
    setAlerta(null);
    window.scrollTo(0, 0);
  }

  async function remover(id) {
    if (!window.confirm('Deseja realmente remover este produto?')) return;
    try {
      await api.removerProduto(id);
      setAlerta({ tipo: 'sucesso', texto: 'Produto removido!' });
      carregar();
    } catch (e) {
      setAlerta({ tipo: 'erro', texto: e.message });
    }
  }

  function cancelar() {
    setForm(FORM_VAZIO);
    setEditandoId(null);
    setErros({});
    setAlerta(null);
  }

  return (
    <>
      <div className="card">
        <h2>{editandoId ? 'Editar Produto' : 'Cadastro de Produto'}</h2>

        {alerta && (
          <div className={`alerta alerta-${alerta.tipo}`}>{alerta.texto}</div>
        )}

        <form onSubmit={submeter} noValidate>
          <div className="form-group">
            <label>Nome do Produto *</label>
            <input
              className={erros.nome ? 'invalido' : ''}
              value={form.nome}
              onChange={(e) => mudar('nome', e.target.value)}
              placeholder="Insira o nome do produto"
            />
            {erros.nome && <div className="erro">{erros.nome}</div>}
          </div>

          <div className="form-group">
            <label>Código de Barras</label>
            <input
              value={form.codigo_barras}
              onChange={(e) => mudar('codigo_barras', e.target.value)}
              placeholder="Insira o código de barras"
            />
          </div>

          <div className="form-group">
            <label>Descrição *</label>
            <textarea
              className={erros.descricao ? 'invalido' : ''}
              rows="3"
              value={form.descricao}
              onChange={(e) => mudar('descricao', e.target.value)}
              placeholder="Descreva brevemente o produto"
            />
            {erros.descricao && <div className="erro">{erros.descricao}</div>}
          </div>

          <div className="form-group">
            <label>Quantidade em Estoque</label>
            <input
              type="number"
              min="0"
              value={form.quantidade}
              onChange={(e) => mudar('quantidade', e.target.value)}
              placeholder="Quantidade disponível"
            />
          </div>

          <div className="form-group">
            <label>Estoque Mínimo</label>
            <input
              type="number"
              min="0"
              value={form.estoque_minimo}
              onChange={(e) => mudar('estoque_minimo', e.target.value)}
              placeholder="Nível mínimo permitido"
            />
          </div>

          <div className="form-group">
            <label>Unidade de Medida</label>
            <select
              value={form.unidade_medida}
              onChange={(e) => mudar('unidade_medida', e.target.value)}
            >
              {UNIDADES.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Categoria *</label>
            <select
              className={erros.categoria ? 'invalido' : ''}
              value={form.categoria}
              onChange={(e) => mudar('categoria', e.target.value)}
            >
              <option value="">-- Selecione --</option>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {erros.categoria && <div className="erro">{erros.categoria}</div>}
          </div>

          {form.categoria === 'Outro' && (
            <div className="form-group">
              <label>Especificar categoria</label>
              <input
                value={form.categoria_outro}
                onChange={(e) => mudar('categoria_outro', e.target.value)}
                placeholder="Digite a categoria"
              />
            </div>
          )}

          <div className="form-group">
            <label>Data de Validade</label>
            <input
              type="date"
              value={form.data_validade}
              onChange={(e) => mudar('data_validade', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>URL da Imagem do Produto</label>
            <input
              value={form.imagem}
              onChange={(e) => mudar('imagem', e.target.value)}
              placeholder="https://..."
            />
          </div>

          <button type="submit" className="btn btn-primary">
            {editandoId ? 'Salvar' : 'Cadastrar'}
          </button>
          {editandoId && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={cancelar}
              style={{ marginLeft: 8 }}
            >
              Cancelar
            </button>
          )}
        </form>
      </div>

      <div className="card">
        <h2>Produtos Cadastrados</h2>
        {produtos.length === 0 ? (
          <p>Nenhum produto cadastrado.</p>
        ) : (
          <table className="tabela">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Código de Barras</th>
                <th>Categoria</th>
                <th>Quantidade</th>
                <th>Est. Mínimo</th>
                <th>Un.</th>
                <th>Validade</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((p) => {
                const estoqueCritico = p.estoque_minimo > 0 && p.quantidade <= p.estoque_minimo;
                return (
                  <tr key={p.id} className={estoqueCritico ? 'estoque-critico' : ''}>
                    <td>{p.nome}</td>
                    <td>{p.codigo_barras || '—'}</td>
                    <td>{p.categoria}</td>
                    <td>{p.quantidade ?? 0}</td>
                    <td>{p.estoque_minimo ?? 0}</td>
                    <td>{p.unidade_medida || 'un'}</td>
                    <td>{p.data_validade || '—'}</td>
                    <td>
                      <button
                        className="btn btn-secondary btn-pequeno"
                        onClick={() => editar(p)}
                      >
                        Editar
                      </button>{' '}
                      <button
                        className="btn btn-danger btn-pequeno"
                        onClick={() => remover(p.id)}
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default Produtos;
