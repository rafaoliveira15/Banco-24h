import { BancoController } from "./controller/bancoController.js";

const controller = new BancoController();

// --- REFERÊNCIAS DO DOM ---
const secaoLogin = document.getElementById('secao-login');
const h2Login = document.getElementById('h2-login');
const secaoPainel = document.getElementById('secao-painel');
const secaoAcoes = document.getElementById('secao-acoes');
const secaoExtrato = document.getElementById('secao-extrato');
const inputCPF = document.getElementById('input-cpf');
const inputSenha = document.getElementById('input-senha');
const headerBanco = document.getElementById('header-banco');
const saldoDisplay = document.getElementById('saldo-display');
const extratoCorpo = document.getElementById('extrato-corpo');
const modalOverlay = document.getElementById('modal-overlay');
const modalBox = document.getElementById('modal-box');
const inputRadios = document.getElementsByName('bancos');
const secaoMain = document.getElementById('container-main');
const btnToggleSaldo = document.getElementById('btn-toggle-saldo');

let imgSecaoMain = document.querySelector(".container-main img");
let imgSecaoPainel = document.querySelector("#secao-painel img");
let h2SecaoMain = document.querySelector(".container-main h2");
let tabelaExtrato = document.querySelector("#tabela-extrato");


const btnTransferencia = document.getElementById('btn-transferencia');
const btnDeposito = document.getElementById('btn-deposito');
const btnSaque = document.getElementById('btn-saque');
const btnSenha = document.getElementById('btn-senha');

let usuarioAtual = null;
let ultimaClasse = "";
let lastClassH2 = "";
let lastClassPainel = "";
let lastHeaderBanco = "";
let lastSecaoExtrato = "";
let lastSaldoDisplay = "";

// --- REGEX PARA VALIDAÇÃO ---
const regexMonetario = /^\d+(\.\d{1,2})?$/; // Números com até 2 casas decimais
const regexTexto = /^[a-zA-ZÀ-ÿ\s]{3,}$/;      // No mínimo 3 letras
const regexSenhaForte = /^[a-zA-Z0-9]{4,8}$/;  // Alfanumérico de 4 a 8 dígitos

// --- FUNÇÕES DE NAVEGAÇÃO ---

export function homepage() {
    secaoLogin.classList.add('oculto');
    secaoPainel.classList.add('oculto');
    h2Login.classList.remove('oculto');
}

export function mostrarLogin() {
    secaoLogin.classList.remove('oculto');
    h2Login.classList.add('oculto');
    secaoPainel.classList.add('oculto');

    // ✅ Anima o login ao aparecer
    window.animarLogin();
}

export function mostrarPainel(nome, saldo, cpf, user) {
    usuarioAtual = user;
    secaoLogin.classList.add('oculto');
    secaoPainel.classList.remove('oculto');
    secaoAcoes.classList.remove('oculto');
    secaoExtrato.classList.remove('oculto');
    headerBanco.innerHTML = `<h2>Bem vindo, ${nome}!</h2>`;
    atualizarInterface();

    // ✅ Anima o painel ao aparecer
    window.animarPainel();
}

function atualizarInterface() {
    saldoDisplay.textContent = btnToggleSaldo.checked
        ? usuarioAtual.saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        : "••••••";
        window.animarSaldo()

    extratoCorpo.innerHTML = "";
    [...usuarioAtual.extrato].reverse().forEach(t => {
        extratoCorpo.innerHTML += `
            <tr>
                <td>${t.data}</td>
                <td>${t.tipo}</td>
                <td>${t.obs}</td>
                <td style="color: ${t.tipo === 'Depósito' ? '#11C76F' : '#E21E25'}">R$ ${t.valor}</td>
                <td>R$ ${t.saldoApos.toFixed(2)}</td>
            </tr>`;
    });
}

// --- MODAL COM DO...WHILE E REGEX ---

function abrirModalValidado(titulo, campos, acaoFinal) {
    modalOverlay.classList.remove('oculto');
    modalBox.innerHTML = `
        <h3>${titulo}</h3>
        ${campos.map(c => `<input type="${c.type}" id="${c.id}" placeholder="${c.placeholder}">`).join('')}
        <div class="modal-buttons">
            <button id="btn-ok" style="background:#11C76F; color:white;">Confirmar</button>
            <button id="btn-out" style="background:#666; color:white;">Cancelar</button>
        </div>
    `;

    document.getElementById('btn-out').onclick = () => modalOverlay.classList.add('oculto');

    document.getElementById('btn-ok').onclick = () => {
        let erros = [];
        let i = 0;

        // OBRIGATÓRIO: DO...WHILE para validar os campos com REGEX
        do {
            const config = campos[i];
            const valorInput = document.getElementById(config.id).value;

            if (!config.regex.test(valorInput)) {
                erros.push(`Entrada inválida no campo: ${config.placeholder}`);
            }
            i++;
        } while (i < campos.length);

        if (erros.length === 0) {
            const resultados = {};
            campos.forEach(c => resultados[c.id] = document.getElementById(c.id).value);
            acaoFinal(resultados);
            modalOverlay.classList.add('oculto');
            atualizarInterface();
        } else {
            alert(erros.join("\n"));
        }
    };
}

// --- OPERAÇÕES DO BANCO ---

btnSaque.onclick = () => abrirModalValidado("Realizar Saque",
    [{ id: 'v', type: 'text', placeholder: 'Valor', regex: regexMonetario }],
    (res) => {
        const r = controller.realizarTransacao(usuarioAtual, 'Saque', res.v);
        if (!r.sucesso) alert(r.msg);
    }
);

btnDeposito.onclick = () => abrirModalValidado("Realizar Depósito",
    [{ id: 'v', type: 'text', placeholder: 'Valor', regex: regexMonetario }],
    (res) => controller.realizarTransacao(usuarioAtual, 'Depósito', res.v)
);

btnTransferencia.onclick = () => abrirModalValidado("Transferência",
    [
        { id: 'b', type: 'text', placeholder: 'Banco Destino', regex: regexTexto },
        { id: 'v', type: 'text', placeholder: 'Valor', regex: regexMonetario }
    ],
    (res) => {
        const r = controller.realizarTransacao(usuarioAtual, 'Transferência', res.v, `Para: ${res.b}`);
        if (!r.sucesso) alert(r.msg);
    }
);

btnSenha.onclick = () => abrirModalValidado("Alterar Senha",
    [{ id: 's', type: 'password', placeholder: '4 a 8 caracteres', regex: regexSenhaForte }],
    (res) => {
        controller.alterarSenha(usuarioAtual, res.s);
        alert("Senha alterada!");
    }
);

btnToggleSaldo.addEventListener("change", atualizarInterface);

// --- SEU FOREACH (MANTIDO E CORRIGIDO PARA O ERRO DE NULL) ---

inputRadios.forEach(banco => {
    let bancoClicado = banco.addEventListener("change", (event) => {
        let nomeBanco = event.target.value;

        if (nomeBanco) {
            if (ultimaClasse) {
                secaoMain.classList.remove(ultimaClasse);
                h2SecaoMain.classList.remove(lastClassH2);
                secaoPainel.classList.remove(lastClassPainel);
                /* secaoExtrato.classList.remove(lastSecaoExtrato);
                saldoDisplay.classList.remove(lastSaldoDisplay);
                headerBanco.classList.remove(lastHeaderBanco); */
            }

            mostrarLogin();
            // Passamos o ID 'buttonLogar' em vez da variável para que o Controller sempre ache o botão vivo no DOM
            controller.Login(inputCPF, inputSenha, 'buttonLogar', nomeBanco);
            imgSecaoMain.setAttribute("src", `./assets/images/${nomeBanco}.png`);
            imgSecaoPainel.setAttribute("src", `./assets/images/${nomeBanco}.png`);
            h2SecaoMain.classList.add("h2" + nomeBanco);
            secaoMain.classList.add(nomeBanco);
            secaoPainel.classList.add(nomeBanco);
            secaoPainel.style.setProperty(
                'color',
                `var(--${nomeBanco}texto)`,
                'important'
            );

            ultimaClasse = nomeBanco;
            lastClassH2 =  `h2${nomeBanco}`;
            lastHeaderBanco =  `painel${nomeBanco}`;
            lastSaldoDisplay =  `painel${nomeBanco}`;
            lastSecaoExtrato =  `painel${nomeBanco}`;
            lastHeaderBanco =  `painel${nomeBanco}`;
            lastClassPainel =  nomeBanco;
            return true;
        }
    });

    if (bancoClicado != true) {
        homepage();
    }
});

document.getElementById('btn-pdf').onclick = () => {
    if (!usuarioAtual || usuarioAtual.extrato.length === 0) {
        alert("Não há dados para gerar o PDF.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Cabeçalho do PDF
    doc.setFontSize(18);
    doc.text(`Extrato Bancário - ${usuarioAtual.nome}`, 14, 20);
    doc.setFontSize(11);
    doc.text(`CPF: ${usuarioAtual.cpf} | Saldo Atual: R$ ${usuarioAtual.saldo.toFixed(2)}`, 14, 30);

    // Gerar Tabela usando o do-while para processar se necessário (ou direto no autotable)
    const colunas = ["Data", "Operação", "Observação", "Valor", "Saldo"];
    const linhas = controller.prepararDadosPDF(usuarioAtual);

    doc.autoTable({
        startY: 40,
        head: [colunas],
        body: linhas,
        theme: 'striped',
        headStyles: { fillColor: [44, 62, 80] }
    });

    doc.save(`extrato_${usuarioAtual.nome.replace(/\s+/g, '_')}.pdf`);
};
