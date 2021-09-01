const express = require("express");
const app = express();
app.use(express.json());

const bancoDeDados = require('../bancodedados');
const { format } = require('date-fns');



function listarContas(req, res) {
    return res.json(bancoDeDados.contas)
}

let numeroDaConta = 1111;

function criarConta(req, res) {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body

    if (!nome) {
        return res.status(400).json({ mensagem: "Insira um nome válido." })
    } else if (!cpf) {
        return res.status(400).json({ mensagem: "Insira um cpf válido." })
    } else if (!data_nascimento) {
        return res.status(400).json({ mensagem: "Insira uma data de nascimento válida." })
    } else if (!telefone) {
        return res.status(400).json({ mensagem: "Insira um telefone válido." })
    } else if (!email) {
        return res.status(400).json({ mensagem: "Insira um email válido." })
    } else if (!senha) {
        return res.status(400).json({ mensagem: "Insira uma senha válida." })
    }

    const conta = {
        numero: numeroDaConta,
        saldo: 0,
        usuario: {
            nome,
            cpf,
            data_nascimento,
            telefone,
            email,
            senha
        }
    }
    numeroDaConta += 1;

    bancoDeDados.contas.push(conta);
    res.json(conta)
}

function atualizarUsuarioConta(req, res) {
    const contaParametro = Number(req.params.numeroConta);
    if (!contaParametro) {
        res.status(400).json({ mensagem: "informe um número válido de conta" })
    }
    else if (!req.body) {
        res.status(400).json({ mensagem: "informe ao menos um valor válido" })
    } else {
        const conta = bancoDeDados.contas.filter(conta => conta.numero === contaParametro);

        const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;
        conta.forEach(item => {
            if (nome) {
                item.usuario.nome = nome;
            } else if (cpf) {
                item.usuario.cpf = cpf;
            } else if (data_nascimento) {
                item.usuario.data_nascimento = data_nascimento;
            } else if (telefone) {
                item.usuario.telefone = telefone;
            } else if (senha) {
                item.usuario.senha = senha;
            }
            // Se o CPF for informado, verificar se já existe outro registro com o mesmo CPF
            // Se o E-mail for informado, verificar se já existe outro registro com o mesmo E-mail
        })
        return res.status(201).json({
            mensagem: "Conta atualizada com sucesso!"
        });
    }
}

function excluirConta(req, res) {
    const contaASerExcluida = Number(req.params.numeroConta);

    let index;
    for (let i = 0; i < bancoDeDados.contas.length; i++) {
        if (bancoDeDados.contas[i].numero === contaASerExcluida) {
            index = i;
        }
    }
    if (!index) {
        return res.status(404).json({
            mensagem: "Conta não encontrada!"
        })
    }
    if (bancoDeDados.contas[index].saldo === 0) {
        bancoDeDados.contas.splice(index, 1);
        return res.json({
            mensagem: "Conta excluída com sucesso!"
        })
    } else {
        return res.status(400).json({
            mensagem: "Não foi possível excluir a conta, pois a mesma ainda possui saldo."
        })
    }
}

function depositar(req, res) {
    const { numero_conta, valor } = req.body;
    if (!numero_conta || !valor) {
        return res.status(400).json({
            mensagem: "Informe número de conta e valor válido!"
        })
    } else if (valor <= 0) {
        return res.status(400).json({
            mensagem: "Informe um valor válido!"
        })
    }
    const conta = bancoDeDados.contas.filter(conta => conta.numero === Number(numero_conta));
    if (!conta[0]) {
        return res.status(404).json({
            mensagem: "Conta não encontrada!"
        })
    }
    conta.forEach(item => {
        item.saldo += Number(valor);
    })
    res.json({
        mensagem: "Depósito realizado com sucesso!"
    })
    bancoDeDados.depositos.push({
        data: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        numero_conta,
        valor
    })
}

function sacar(req, res) {
    const { numero_conta, valor, senha } = req.body;

    if (!numeroDaConta) {

        res.status(400).json({
            mensagem: "Insira um valor válido de conta!"
        })
    } else if (!valor) {
        res.status(400).json({
            mensagem: "Insira um valor válido!"
        })
    } else if (!senha) {
        return res.status(400).json({
            mensagem: "Insira uma senha válida!"
        })
    }

    const conta = bancoDeDados.contas.filter(conta => conta.numero === Number(numero_conta));
    if (!conta[0]) {
        return res.status(404).json({
            mensagem: "Conta não encontrada!"
        })
    }
    if (senha != conta[0].usuario.senha) {
        return res.status(404).json({
            mensagem: "Senha incorreta!"
        })
    }

    if (Number(conta[0].saldo) >= Number(valor)) {
        conta[0].saldo -= Number(valor)

        bancoDeDados.saques.push({
            data: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            numero_conta,
            valor
        })
        return res.json({
            mensagem: "Saque realizado com sucesso!"
        })

    } else {
        return res.status(404).json({
            mensagem: "Saldo indisponível para saque!"
        })

    }
}

function transferir(req, res) {

    const { numero_conta_origem, numero_conta_destino, valor } = req.body;

    if (!numero_conta_origem) {
        res.status(400).json({
            mensagem: "Conta de origem não informada!"
        })
    } else if (!numero_conta_destino) {
        res.status(400).json({
            mensagem: "Conta de destino não informada!"
        })
    } else if (!valor) {
        res.status(400).json({
            mensagem: "Valor a ser transferido não informado!"
        })
    }

    const contaOrigem = bancoDeDados.contas.filter(conta => conta.numero === Number(numero_conta_origem));
    const contaDestino = bancoDeDados.contas.filter(conta => conta.numero === Number(numero_conta_destino));

    if (!contaOrigem[0]) {
        return res.status(404).json({
            mensagem: "Conta de origem não encontrada!"
        })
    } else if (!contaDestino[0]) {
        return res.status(404).json({
            mensagem: "Conta de Destino não encontrada!"
        })
    }

    if (contaOrigem[0].saldo < Number(valor)) {
        return res.status(404).json({
            mensagem: "Saldo insuficiente para realizar a transação!"
        })
    }

    contaOrigem[0].saldo -= Number(valor);
    contaDestino[0].saldo += Number(valor);

    bancoDeDados.transferencias.push({
        data: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        numero_conta_origem: numero_conta_origem,
        numero_conta_destino: numero_conta_destino,
        valor: valor
    })

    return res.json({
        mensagem: "Transferência realizada com sucesso!"
    })
}

function saldo(req, res) {
    if (!req.query.numero_conta) {
        return res.status(400).json({
            mensagem: "Informe um número válido de conta!"
        })
    }
    if (!req.query.senha) {
        return res.status(400).json({
            mensagem: "Informe uma senha válida!"
        })
    }

    const conta = bancoDeDados.contas.filter(conta => conta.numero === Number(req.query.numero_conta));

    if (!conta[0]) {
        return res.status(404).json({
            mensagem: "Conta não encontrada!"
        })
    }

    if (conta[0].usuario.senha != req.query.senha) {
        return res.status(404).json({
            mensagem: "Senha incorreta!"
        })
    }

    const saldo = conta[0].saldo;
    return res.status(404).json({
        saldo: saldo
    })
}

function extrato(req, res) {

    if (!req.query.numero_conta) {
        return res.status(400).json({
            mensagem: 'Informe um número de conta válido!'
        })
    }
    if (!req.query.senha) {
        return res.status(400).json({
            mensagem: 'Informe uma senha válida!'
        })
    }

    const conta = bancoDeDados.contas.filter(conta => conta.numero === Number(req.query.numero_conta));

    if (!conta[0]) {
        return res.status(400).json({
            mensagem: 'Conta não encontrada!'
        })
    }

    if (conta[0].usuario.senha != req.query.senha) {
        return res.status(400).json({
            mensagem: 'Senha incorreta!'
        })
    }

    const arrayDeSaques = [];

    for (let i = 0; i < bancoDeDados.saques.length; i++) {
        if (bancoDeDados.saques[i].numero_conta === req.query.numero_conta) {
            arrayDeSaques.push(bancoDeDados.saques[i]);
        }
    }

    const arrayDeDepositos = [];

    for (let i = 0; i < bancoDeDados.depositos.length; i++) {
        if (bancoDeDados.depositos[i].numero_conta === req.query.numero_conta) {
            arrayDeDepositos.push(bancoDeDados.depositos[i]);
        }
    }

    const arrayDeTransferenciasRecebidas = [];

    for (let i = 0; i < bancoDeDados.transferencias.length; i++) {
        if (bancoDeDados.transferencias[i].numero_conta_destino === req.query.numero_conta) {
            arrayDeTransferenciasRecebidas.push(bancoDeDados.transferencias[i]);
        }
    }

    const arrayDeTransferenciasRealizadas = [];

    for (let i = 0; i < bancoDeDados.transferencias.length; i++) {
        if (bancoDeDados.transferencias[i].numero_conta_origem === req.query.numero_conta) {
            arrayDeTransferenciasRealizadas.push(bancoDeDados.transferencias[i]);
        }
    }

    return res.json({
        depositos: arrayDeDepositos,
        saques: arrayDeSaques,
        transferenciasEnviadas: arrayDeTransferenciasRealizadas,
        transferenciasRecebidas: arrayDeTransferenciasRecebidas
    })

}

module.exports = {
    listarContas,
    criarConta,
    atualizarUsuarioConta,
    excluirConta,
    depositar,
    sacar,
    transferir,
    saldo,
    extrato
}
