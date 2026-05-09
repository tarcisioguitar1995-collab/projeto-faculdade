import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Fornecedores from './pages/Fornecedores';
import Produtos from './pages/Produtos';
import Associacao from './pages/Associacao';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <header className="navbar">
        <h1>Sistema de Controle de Estoque</h1>
        <nav>
          <NavLink to="/fornecedores" className={({ isActive }) => (isActive ? 'ativo' : '')}>
            Fornecedores
          </NavLink>
          <NavLink to="/produtos" className={({ isActive }) => (isActive ? 'ativo' : '')}>
            Produtos
          </NavLink>
          <NavLink to="/associacao" className={({ isActive }) => (isActive ? 'ativo' : '')}>
            Associação
          </NavLink>
        </nav>
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/fornecedores" replace />} />
          <Route path="/fornecedores" element={<Fornecedores />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/associacao" element={<Associacao />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
