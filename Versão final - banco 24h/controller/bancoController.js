import usuariosJSON from '../assets/bancos.json' with {type: 'json'};
import { mostrarPainel } from '../main.js';

export class BancoController {
  constructor() {
    this.usuarios = usuariosJSON.map(u => ({ ...u, extrato: [] }));
  }

  // Agora o Login recebe o nomeBanco selecionado no rádio
  Login(inputCPF, inputSenha, idBotao, nomeBanco) {
    const btnOriginal = document.getElementById(idBotao);
    const novoBotao = btnOriginal.cloneNode(true);
    btnOriginal.parentNode.replaceChild(novoBotao, btnOriginal);

    novoBotao.addEventListener("click", () => {
      const cpf = inputCPF.value.trim();
      const senha = inputSenha.value.trim();

      // FILTRO DE SEGURANÇA: CPF + SENHA + BANCO CORRETO
      const user = this.usuarios.find(u =>
        u.cpf == cpf &&
        u.senha == senha &&
        u.banco.toLowerCase() == nomeBanco.toLowerCase()
      );

      if (user) {
        mostrarPainel(user.nome, user.saldo, user.cpf, user);
      } else {
        alert(`Usuário não encontrado ou senha incorreta para o banco ${nomeBanco.toUpperCase()}`);
      }
    });
  }

  realizarTransacao(user, tipo, valor, obs = "") {
    valor = parseFloat(valor);
    if (tipo === 'Saque' || tipo === 'Transferência') {
      if (user.saldo < valor) return { sucesso: false, msg: "Saldo insuficiente!" };
      user.saldo -= valor;
    } else if (tipo === 'Depósito') {
      user.saldo += valor;
    }

    user.extrato.push({
      data: new Date().toLocaleString('pt-BR'),
      tipo: tipo,
      obs: obs,
      valor: valor,
      saldoApos: user.saldo
    });
    return { sucesso: true };
  }

  alterarSenha(user, novaSenha) {
    user.senha = novaSenha;
    return true;
  }
  
  prepararDadosPDF(user) {
    return user.extrato.map(t => [
        t.data,
        t.tipo,
        t.obs,
        `R$ ${t.valor.toFixed(2)}`,
        `R$ ${t.saldoApos.toFixed(2)}`
    ]);
}
}

