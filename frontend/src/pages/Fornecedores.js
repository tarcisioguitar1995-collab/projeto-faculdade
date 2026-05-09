import React, { useEffect, useState } from 'react';
import * as api from '../services/api';

const FORM_VAZIO = {
  nome: '',
  cnpj: '',
  endereco: '',
  telefone: '',
  email: '',
  contato: ''
};

function formatarCNPJ(valor) {
  const d = valor.replace(/\D/g, '').slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

function Fornecedores() {
  const [fornecedores, setFornecedores] = useState([]);
  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [erros, setErros] = useState({});
  const [alerta, setAlerta] = useState(null);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    try {
      const dados = await api.listarFornecedores();
      setFornecedores(dados);
    } catch (e) {
      setAlerta({ tipo: 'erro', texto: e.message });
    }
  }

  function mudar(campo, valor) {
    setForm({ ...form, [campo]: campo === 'cnpj' ? formatarCNPJ(valor) : valor });
    if (erros[campo]) {
      const novos = { ...erros };
      delete novos[campo];
      setErros(novos);
    }
  }

  function cnpjValido(cnpj) {
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    if (cnpjLimpo.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cnpjLimpo)) return false;

    const calcDigito = (digitos, pesos) => {
      const soma = digitos.reduce((acc, d, i) => acc + d * pesos[i], 0);
      const resto = soma % 11;
      return resto < 2 ? 0 : 11 - resto;
    };

    const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const digitos = cnpjLimpo.split('').map(Number);

    return calcDigito(digitos.slice(0, 12), pesos1) === digitos[12]
      && calcDigito(digitos.slice(0, 13), pesos2) === digitos[13];
  }

  function telefoneValido(telefone) {
    const num = telefone.replace(/\D/g, '');
    return num.length === 10 || num.length === 11;
  }

  function validarLocal() {
    const erros = {};
    if (!form.nome) erros.nome = 'Nome é obrigatório';
    if (!form.cnpj) erros.cnpj = 'CNPJ é obrigatório';
    else if (!cnpjValido(form.cnpj)) erros.cnpj = 'CNPJ inválido';
    if (!form.endereco) erros.endereco = 'Endereço é obrigatório';
    if (!form.telefone) erros.telefone = 'Telefone é obrigatório';
    else if (!telefoneValido(form.telefone)) erros.telefone = 'Telefone inválido. Use (XX) XXXX-XXXX ou (XX) 9XXXX-XXXX';
    if (!form.email) erros.email = 'E-mail é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) erros.email = 'E-mail inválido';
    if (!form.contato) erros.contato = 'Contato é obrigatório';
    return erros;
  }

  async function submeter(e) {
    e.preventDefault();
    setErros({});
    setAlerta(null);

    const errosLocal = validarLocal();
    if (Object.keys(errosLocal).length > 0) {
      setErros(errosLocal);
      return;
    }

    try {
      const dados = { ...form, cnpj: form.cnpj.replace(/\D/g, '') };

      if (editandoId) {
        await api.atualizarFornecedor(editandoId, dados);
        setAlerta({ tipo: 'sucesso', texto: 'Fornecedor atualizado com sucesso!' });
      } else {
        await api.criarFornecedor(dados);
        setAlerta({ tipo: 'sucesso', texto: 'Fornecedor cadastrado com sucesso!' });
      }
      setForm(FORM_VAZIO);
      setEditandoId(null);
      carregar();
    } catch (e) {
      if (e.dados && e.dados.erros) {
        setErros(e.dados.erros);
        const msgs = Object.values(e.dados.erros).join('. ');
        setAlerta({ tipo: 'erro', texto: msgs });
      } else {
        setAlerta({ tipo: 'erro', texto: e.message });
      }
    }
  }

  function editar(f) {
    setForm({
      nome: f.nome,
      cnpj: formatarCNPJ(f.cnpj),
      endereco: f.endereco,
      telefone: f.telefone,
      email: f.email,
      contato: f.contato
    });
    setEditandoId(f.id);
    setErros({});
    setAlerta(null);
    window.scrollTo(0, 0);
  }

  async function remover(id) {
    if (!window.confirm('Deseja realmente remover este fornecedor?')) return;
    try {
      await api.removerFornecedor(id);
      setAlerta({ tipo: 'sucesso', texto: 'Fornecedor removido!' });
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
        <h2>{editandoId ? 'Editar Fornecedor' : 'Cadastro de Fornecedor'}</h2>

        {alerta && (
          <div className={`alerta alerta-${alerta.tipo}`}>{alerta.texto}</div>
        )}

        <form onSubmit={submeter} noValidate>
          <div className="form-group">
            <label>Nome da Empresa *</label>
            <input
              className={erros.nome ? 'invalido' : ''}
              value={form.nome}
              onChange={(e) => mudar('nome', e.target.value)}
              placeholder="Insira o nome da empresa"
            />
            {erros.nome && <div className="erro">{erros.nome}</div>}
          </div>

          <div className="form-group">
            <label>CNPJ *</label>
            <input
              className={erros.cnpj ? 'invalido' : ''}
              value={form.cnpj}
              onChange={(e) => mudar('cnpj', e.target.value)}
              placeholder="00.000.000/0000-00"
            />
            {erros.cnpj && <div className="erro">{erros.cnpj}</div>}
          </div>

          <div className="form-group">
            <label>Endereço *</label>
            <input
              className={erros.endereco ? 'invalido' : ''}
              value={form.endereco}
              onChange={(e) => mudar('endereco', e.target.value)}
              placeholder="Insira o endereço completo da empresa"
            />
            {erros.endereco && <div className="erro">{erros.endereco}</div>}
          </div>

          <div className="form-group">
            <label>Telefone *</label>
            <input
              className={erros.telefone ? 'invalido' : ''}
              value={form.telefone}
              onChange={(e) => mudar('telefone', e.target.value)}
              placeholder="(00) 0000-0000"
            />
            {erros.telefone && <div className="erro">{erros.telefone}</div>}
          </div>

          <div className="form-group">
            <label>E-mail *</label>
            <input
              type="email"
              className={erros.email ? 'invalido' : ''}
              value={form.email}
              onChange={(e) => mudar('email', e.target.value)}
              placeholder="exemplo@fornecedor.com"
            />
            {erros.email && <div className="erro">{erros.email}</div>}
          </div>

          <div className="form-group">
            <label>Contato Principal *</label>
            <input
              className={erros.contato ? 'invalido' : ''}
              value={form.contato}
              onChange={(e) => mudar('contato', e.target.value)}
              placeholder="Nome do contato principal"
            />
            {erros.contato && <div className="erro">{erros.contato}</div>}
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
        <h2>Fornecedores Cadastrados</h2>
        {fornecedores.length === 0 ? (
          <p>Nenhum fornecedor cadastrado.</p>
        ) : (
          <table className="tabela">
            <thead>
              <tr>
                <th>Nome</th>
                <th>CNPJ</th>
                <th>Telefone</th>
                <th>E-mail</th>
                <th>Contato</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {fornecedores.map((f) => (
                <tr key={f.id}>
                  <td>{f.nome}</td>
                  <td>{formatarCNPJ(f.cnpj)}</td>
                  <td>{f.telefone}</td>
                  <td>{f.email}</td>
                  <td>{f.contato}</td>
                  <td>
                    <button
                      className="btn btn-secondary btn-pequeno"
                      onClick={() => editar(f)}
                    >
                      Editar
                    </button>{' '}
                    <button
                      className="btn btn-danger btn-pequeno"
                      onClick={() => remover(f.id)}
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default Fornecedores;
