const express = require('express');
const bancodedados = require('./bancodedados');
const roteador = require('./roteador');

const app = express();

app.use(express.json());

app.get("/contas", (req, res, next) => {
    if (!req.query.senha_banco) {
        return res.status(400).json("Digite uma senha válida")
    } else if (req.query.senha_banco != bancodedados.banco.senha) {
        return res.status(401).json("Senha incorreta.")
    } else {
        next()
    }
})

app.use(roteador);



module.exports = app;