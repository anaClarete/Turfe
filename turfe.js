let cavalos = [];            // lista com os dados de cada cavalo
let pilhaResultados = [];    // guarda os blocos de resultado de cada volta para mostrar no final
let quantidadeCavalos = 0;   // quantos cavalos vao correr
let quantidadeVoltas = 0;    // quantas voltas a corrida tem
let animacaoId = null;       // id do requestAnimationFrame (para poder cancelar)

let animacao = {
    inicio: 0,          // momento em que a animacao comecou
    duracao: 0,         // quanto tempo a animacao dura na tela (ms)
    tempoMaximo: 0,     // maior tempo total entre os cavalos (segundos)
    eventosVolta: [],   // marcadores para saber quando mostrar cada volta
};

// Cada personagem tem um emoji (mostrado na tela) e uma cor de destaque.
const PERSONAGENS = [
    { emoji: "🐎", cor: "#c8852f" },
    { emoji: "🐴", cor: "#a63d2f" },
    { emoji: "🏇", cor: "#2f6b6b" },
    { emoji: "🦄", cor: "#8a6d1f" },
    { emoji: "🦓", cor: "#6b4423" },
    { emoji: "🎠", cor: "#3f5e3a" },
];

// Nomes que aparecem como sugestao nos campos de cadastro.
const NOMES_SUGERIDOS = [
    "Relâmpago",
    "Tempestade",
    "Fumaça",
    "Sombra",
    "Falcão Negro",
    "Vento Veloz"
];

function gerarCamposNomes() {
    const container = document.getElementById("campos-nomes");

    // Le quantos cavalos o usuario quer e mantem entre 0 e 6.
    let qtd_cavalos = Number(document.getElementById("ipt_qtdCavalos").value);
    if (!qtd_cavalos || qtd_cavalos < 1) qtd_cavalos = 0;
    if (qtd_cavalos > 6) qtd_cavalos = 6;

    // Guarda o que o usuario ja tinha digitado para nao perder ao recriar.
    const inputs = container.querySelectorAll(".input-nome");
    let valoresAtuais = [];
    for (let i = 0; i < inputs.length; i++) {
        valoresAtuais.push(inputs[i].value);
    }

    // Recria as linhas de cadastro do zero.
    container.innerHTML = "";
    for (let i = 0; i < qtd_cavalos; i++) {
        if (valoresAtuais[i] === undefined) valoresAtuais[i] = "";
        const valor = valoresAtuais[i];

        const linha = document.createElement("div");
        linha.className = "linha-nome";
        // O emoji agora e texto dentro de um <span>, nao mais uma imagem.
        linha.innerHTML =
            '<span class="badge-personagem" style="border-color:' + PERSONAGENS[i].cor + '">' +
                PERSONAGENS[i].emoji +
            '</span>' +
            '<input type="text" class="input-nome" maxlength="18"' +
                ' placeholder="' + NOMES_SUGERIDOS[i] + '"' +
                ' value="' + valor + '">';
        container.appendChild(linha);
    }
}

function adicionarCavalo() {
    cavalos = [];
    document.getElementById("resultado").innerHTML = "";

    quantidadeVoltas = Number(document.getElementById("ipt_qtdVoltas").value);
    quantidadeCavalos = Number(document.getElementById("ipt_qtdCavalos").value);

    // Validacoes simples.
    if (!quantidadeVoltas || quantidadeVoltas < 1) {
        alert("Informe um número de voltas válido (mínimo 1).");
        return false;
    }
    if (quantidadeCavalos < 3 || quantidadeCavalos > 6) {
        alert("A corrida deve ter entre 3 e 6 corredores.");
        return false;
    }

    const inputs = document.querySelectorAll("#campos-nomes .input-nome");

    // Monta um objeto para cada cavalo.
    for (let i = 0; i < quantidadeCavalos; i++) {
        let nomeCavalo = inputs[i] ? inputs[i].value.trim() : "";
        if (!nomeCavalo) {
            nomeCavalo = NOMES_SUGERIDOS[i] || ("Corredor " + (i + 1));
        }

        const personagem = PERSONAGENS[i];

        cavalos.push({
            nome: nomeCavalo,
            tempoTotal: 0,        // soma de todos os tempos de volta
            tempos: [],           // tempo de cada volta
            tempoAcumulado: [],   // tempo total ao terminar cada volta
            emoji: personagem.emoji,
            cor: personagem.cor,
            progresso: 0,         // posicao atual na pista (usada na animacao)
            el: null,             // referencia ao elemento HTML na pista
        });
    }
    return true;
}

// Ao abrir a pagina, ja desenha os campos de nome.
document.addEventListener("DOMContentLoaded", gerarCamposNomes);

function calcularPodio(lista) {
    const podio = [];

    const copia = [];
    for (let i = 0; i < lista.length; i++) {
        copia.push(lista[i]);
    }

    while (podio.length < 3 && copia.length > 0) {
        let melhor = copia[0];
        for (let i = 1; i < copia.length; i++) {
            if (copia[i].tempoTotal < melhor.tempoTotal) {
                melhor = copia[i];
            }
        }

        podio.push(melhor);
        copia.splice(copia.indexOf(melhor), 1);
    }
    return podio;
}

function corrida() {
    if (!adicionarCavalo()) return;

    // Sorteia o tempo de cada volta para cada cavalo (entre 7 e 9 segundos).
    for (let v = 0; v < quantidadeVoltas; v++) {
        for (let c = 0; c < quantidadeCavalos; c++) {
            const tempoAtual = Number((Math.random() * (9 - 7) + 7).toFixed(2));
            cavalos[c].tempos.push(tempoAtual);
            cavalos[c].tempoTotal += tempoAtual;
            cavalos[c].tempoAcumulado.push(Number(cavalos[c].tempoTotal.toFixed(2)));
        }
    }

    // Prepara a interface antes de comecar.
    document.getElementById("btn_iniciar").disabled = true;
    document.getElementById("placar-volta-total").textContent = "/ " + quantidadeVoltas;
    document.getElementById("placar-volta-atual").textContent = "1";
    document.getElementById("resultado").innerHTML = "";
    document.getElementById("btn_encerrar").classList.add("oculto");

    montarPista();
    animarCorrida();
}

function montarPista() {
    const pista = document.getElementById("pista-cavalos");
    pista.innerHTML = "";

    for (let i = 0; i < cavalos.length; i++) {
        const cav = cavalos[i];

        const el = document.createElement("div");
        el.className = "cavalo";
        // Cada cavalo tem uma ficha (com o emoji) e uma etiqueta (com o nome).
        el.innerHTML =
            '<span class="ficha" style="border-color:' + cav.cor + '">' + cav.emoji + '</span>' +
            '<span class="etiqueta" style="background:' + cav.cor + '">' + cav.nome + '</span>';

        pista.appendChild(el);
        cav.el = el; // guarda a referencia para mover depois
    }
}

function posicionarCavalo(cav, i, progresso) {
    const hipodromo = document.getElementById("hipodromo");
    const tamanho = hipodromo.clientWidth;

    // Cada cavalo corre num raio levemente diferente para nao se sobrepor.
    const raioBase = tamanho * 0.41;
    const desloc = (i - (quantidadeCavalos - 1) / 2) * (tamanho * 0.022);
    const raio = raioBase + desloc;

    // Converte o progresso (quantas voltas ja andou) em um angulo no circulo.
    const angulo = (progresso % 1) * Math.PI * 2;
    const x = Math.sin(angulo) * raio;
    const y = -Math.cos(angulo) * raio;

    cav.el.style.transform = "translate(" + x + "px, " + y + "px)";
}

function animarCorrida() {
    // Descobre o maior tempo total (quem termina por ultimo define a duracao).
    let totalMax = cavalos[0].tempoTotal;
    for (let i = 1; i < cavalos.length; i++) {
        if (cavalos[i].tempoTotal > totalMax) {
            totalMax = cavalos[i].tempoTotal;
        }
    }

    // Duracao da animacao na tela (entre 6 e 18 segundos).
    let duracaoReal = quantidadeVoltas * 2500;
    if (duracaoReal < 6000) duracaoReal = 6000;
    if (duracaoReal > 18000) duracaoReal = 18000;

    // Para cada volta, guarda o tempo em que o primeiro cavalo a completa.
    // Quando a simulacao passar desse tempo, mostramos o resultado da volta.
    const eventosVolta = [];
    for (let v = 0; v < quantidadeVoltas; v++) {
        let tempoGatilho = cavalos[0].tempoAcumulado[v];
        for (let i = 1; i < cavalos.length; i++) {
            if (cavalos[i].tempoAcumulado[v] < tempoGatilho) {
                tempoGatilho = cavalos[i].tempoAcumulado[v];
            }
        }
        eventosVolta.push({ volta: v, tempoGatilho: tempoGatilho, mostrado: false });
    }

    // Salva tudo no estado global para a funcao do quadro poder usar.
    animacao.inicio = performance.now();
    animacao.duracao = duracaoReal;
    animacao.tempoMaximo = totalMax;
    animacao.eventosVolta = eventosVolta;

    // Inicia o loop.
    animacaoId = requestAnimationFrame(quadroAnimacao);
}

function quadroAnimacao(agora) {
    // Quanto tempo passou desde o inicio (0 ate 1 = comeco ate o fim).
    const decorridoReal = agora - animacao.inicio;
    let t = decorridoReal / animacao.duracao;
    if (t > 1) t = 1;

    // Converte esse progresso em "tempo de simulacao" em segundos.
    const tempoSim = t * animacao.tempoMaximo;

    // Atualiza a posicao de cada cavalo na pista.
    for (let i = 0; i < cavalos.length; i++) {
        const cav = cavalos[i];
        const progresso = calcularProgresso(cav, tempoSim);
        posicionarCavalo(cav, i, progresso);
        cav.progresso = progresso;
    }

    // Mostra ao vivo quem esta na frente.
    atualizarLiderAoVivo();

    // Descobre o maior progresso para saber em qual volta a corrida esta.
    let liderProg = cavalos[0].progresso;
    for (let i = 1; i < cavalos.length; i++) {
        if (cavalos[i].progresso > liderProg) {
            liderProg = cavalos[i].progresso;
        }
    }

    let voltaAtual = Math.floor(liderProg) + 1;
    if (voltaAtual > quantidadeVoltas) voltaAtual = quantidadeVoltas;
    document.getElementById("placar-volta-atual").textContent = voltaAtual;

    // Verifica se chegou a hora de mostrar o resultado de alguma volta.
    for (let i = 0; i < animacao.eventosVolta.length; i++) {
        const ev = animacao.eventosVolta[i];
        if (!ev.mostrado && tempoSim >= ev.tempoGatilho) {
            ev.mostrado = true;
            mostrarResultadoVolta(ev.volta);
        }
    }

    // Continua o loop ou finaliza.
    if (t < 1) {
        animacaoId = requestAnimationFrame(quadroAnimacao);
    } else {
        // Garante que todas as voltas foram mostradas no final.
        for (let i = 0; i < animacao.eventosVolta.length; i++) {
            const ev = animacao.eventosVolta[i];
            if (!ev.mostrado) {
                ev.mostrado = true;
                mostrarResultadoVolta(ev.volta);
            }
        }
        finalizarCorrida();
    }
}

function calcularProgresso(cav, tempoSim) {
    const total = quantidadeVoltas;

    // Conta quantas voltas inteiras o cavalo ja completou.
    let completas = 0;
    while (completas < total && cav.tempoAcumulado[completas] <= tempoSim) {
        completas++;
    }

    // Se terminou a corrida, o progresso e o total de voltas.
    if (completas >= total) return total;

    // Calcula a fracao da volta atual.
    const inicioVolta = completas === 0 ? 0 : cav.tempoAcumulado[completas - 1];
    const duracaoVolta = cav.tempos[completas];
    let frac = (tempoSim - inicioVolta) / duracaoVolta;
    if (frac < 0) frac = 0;
    if (frac > 1) frac = 1;

    return completas + frac;
}

function atualizarLiderAoVivo() {
    // Procura o cavalo com maior progresso (o lider).
    let lider = cavalos[0];
    for (let i = 1; i < cavalos.length; i++) {
        if (cavalos[i].progresso > lider.progresso) {
            lider = cavalos[i];
        }
    }
    document.getElementById("lider-nome").textContent = lider.nome;
}

function mostrarResultadoVolta(v) {
    // Encontra o 1o e o 2o colocado nesta volta (menor tempo acumulado).
    let lider = cavalos[0];
    let segundo = null;

    for (let i = 0; i < cavalos.length; i++) {
        const cav = cavalos[i];
        if (cav.tempoAcumulado[v] < lider.tempoAcumulado[v]) {
            segundo = lider;
            lider = cav;
        } else if (cav !== lider) {
            if (segundo === null || cav.tempoAcumulado[v] < segundo.tempoAcumulado[v]) {
                segundo = cav;
            }
        }
    }

    // Monta a lista de todos os cavalos com seu tempo acumulado nesta volta.
    let linhas = "";
    for (let i = 0; i < cavalos.length; i++) {
        const cav = cavalos[i];
        const ehLider = (cav === lider) ? "primeiro" : "";
        linhas +=
            '<div class="linha-cavalo ' + ehLider + '">' +
                '<span class="lc-nome">' +
                    '<span class="lc-ficha">' + cav.emoji + '</span>' +
                    (i + 1) + 'º ' + cav.nome +
                '</span>' +
                '<span>' + cav.tempoAcumulado[v].toFixed(2) + 's</span>' +
            '</div>';
    }

    // Calcula a diferenca de tempo entre o lider e o segundo colocado.
    let textoGap = "";
    if (segundo) {
        const gap = segundo.tempoAcumulado[v] - lider.tempoAcumulado[v];
        textoGap = "Vantagem de " + gap.toFixed(2) + "s para " + segundo.nome + " (2º)";
    } else {
        textoGap = "Único na pista";
    }

    // Cria o bloco e coloca no topo da lista de resultados.
    const bloco = document.createElement("div");
    bloco.className = "bloco-volta";
    bloco.innerHTML =
        "<h3>Volta " + (v + 1) + "</h3>" +
        "<div class='lider-linha'>Na frente: " + lider.nome + "</div>" +
        "<div class='gap-linha'>" + textoGap + "</div>" +
        linhas;

    pilhaResultados.push(bloco);

    const resultado = document.getElementById("resultado");
    resultado.innerHTML = "";

    for (let i = 0; i < pilhaResultados.length; i++) {
        resultado.appendChild(pilhaResultados[i]);
    }
}

function finalizarCorrida() {
    document.getElementById("placar-volta-atual").textContent = quantidadeVoltas;
    document.getElementById("btn_encerrar").classList.remove("oculto");
}

function encerrarTurfe() {
    const podio = calcularPodio(cavalos);

    const ordemClasse = ["campeao", "prata", "bronze"];
    const rotulo = ["Campeão", "Vice", "3º Lugar"];

    const podioEl = document.getElementById("podio");
    podioEl.innerHTML = "";

    for (let pos = 0; pos < podio.length; pos++) {
        const cav = podio[pos];

        // Monta o historico das voltas, da ultima para a primeira.
        let historico = "";
        for (let v = quantidadeVoltas - 1; v >= 0; v--) {
            historico +=
                "<li>" +
                    "<span>Volta " + (v + 1) + "</span>" +
                    "<span>" + cav.tempos[v].toFixed(2) + "s · total " +
                        cav.tempoAcumulado[v].toFixed(2) + "s</span>" +
                "</li>";
        }

        // Faixa especial so para o campeao.
        let faixa = "";
        if (pos === 0) {
            faixa = "<div class='faixa-campeao'>Vencedor do Turfe</div>";
        }

        const card = document.createElement("div");
        card.className = "card-podio " + ordemClasse[pos];
        card.style.animationDelay = (pos * 0.15) + "s";
        card.innerHTML =
            faixa +
            "<span class='posicao-label'>" + rotulo[pos] + "</span>" +
            "<div class='moldura-personagem' style='border-color:" + cav.cor + "'>" +
                "<span class='foto-cavalo'>" + cav.emoji + "</span>" +
            "</div>" +
            "<div class='nome-cavalo'>" + cav.nome + "</div>" +
            "<div class='tempo-total'>Tempo total: " + cav.tempoTotal.toFixed(2) + "s</div>" +
            "<p class='historico-titulo'>Voltas (da última à primeira)</p>" +
            "<ul class='historico-voltas'>" + historico + "</ul>";

        podioEl.appendChild(card);
    }

    // Troca da tela da corrida para a tela de encerramento.
    document.getElementById("tela-corrida").classList.add("oculto");
    document.getElementById("tela-encerramento").classList.remove("oculto");
    window.scrollTo(0, 0);
}

function reiniciar() {
    if (animacaoId) cancelAnimationFrame(animacaoId);
    cavalos = [];
    pilhaResultados = [];
    document.getElementById("resultado").innerHTML = "";
    document.getElementById("pista-cavalos").innerHTML = "";
    document.getElementById("placar-volta-atual").textContent = "0";
    document.getElementById("placar-volta-total").textContent = "/ 0";
    document.getElementById("lider-nome").textContent = "—";
    document.getElementById("lider-gap").textContent = "";
    document.getElementById("btn_iniciar").disabled = false;
    document.getElementById("btn_encerrar").classList.add("oculto");
    document.getElementById("tela-encerramento").classList.add("oculto");
    document.getElementById("tela-corrida").classList.remove("oculto");
    gerarCamposNomes();
    window.scrollTo(0, 0);
}
