const express = require('express');
const roteador = express();
const funcoes = require('./controladores/controlador1');

roteador.get('/contas', funcoes.listarContas);
roteador.post('/contas', funcoes.criarConta);
roteador.put('/contas/:numeroConta/:usuario', funcoes.atualizarUsuarioConta);
roteador.delete('/contas/:numeroConta', funcoes.excluirConta);
roteador.post('/transacoes/depositar', funcoes.depositar);
roteador.post('/transacoes/sacar', funcoes.sacar);
roteador.post('/transacoes/transferir', funcoes.transferir);
roteador.get('/contas/saldo', funcoes.saldo);
roteador.get('/contas/extrato', funcoes.extrato)

module.exports = roteador;