let cavalos = [];
let pontuacoes = [];

let quantidadeCavalos;
let quantidadeVoltas;

function adicionarCavalo() {
    cavalos = [];
    resultado.innerHTML = "";

    quantidadeVoltas = Number(ipt_qtdVoltas.value)
    quantidadeCavalos = Number(ipt_qtdCavalos.value)

    if (quantidadeCavalos < 3 || quantidadeCavalos > 6) {
        alert("A corrida deve ter entre 3 e 6 cavalos");
        return;
    }

    for (let i = 0; i < quantidadeCavalos; i++) {
        let nomeCavalo = prompt("Digite o nome do cavalo: ")

        let json = {
            "nome": nomeCavalo,
            "tempoTotal": 0
        }

        cavalos.push(json);
    }
}

function calcularPodio(cavalos) {
    let podio = [];
    let copiaCavalos = [];

    for (let i = 0; i < cavalos.length; i++) {
        copiaCavalos.push(cavalos[i])
    }

    while (podio.length < 3 && copiaCavalos.length > 0) {
        let melhor = copiaCavalos[0];
        for (let i = 1; i < copiaCavalos.length; i++) {
            if (copiaCavalos[i].tempoTotal < melhor.tempoTotal) {
                melhor = copiaCavalos[i];
            }
        }
        podio.push(melhor);

        copiaCavalos.splice(copiaCavalos.indexOf(melhor), 1);
    }

    return podio;
}

function corrida() {
    adicionarCavalo();

    for (let i = 0; i < quantidadeVoltas; i++) {
        resultado.innerHTML += `<br>Volta ${i + 1} <br>`
        for (let j = 0; j < quantidadeCavalos; j++) {
            let tempoAtual = Number((Math.random() * (9 - 7) + 7).toFixed(2));

            cavalos[j].tempoTotal += tempoAtual;

            resultado.innerHTML += `${cavalos[j].nome}: ${tempoAtual.toFixed(2)} - Total: ${cavalos[j].tempoTotal.toFixed(2)}<br>`;
        }
    }

    let podio = calcularPodio(cavalos);

    resultado.innerHTML += `
        <br><br>
        <h3>Pódio</h3>
            🥇 1º Lugar: ${podio[0].nome} - ${podio[0].tempoTotal.toFixed(2)}<br>
            🥈 2º Lugar: ${podio[1].nome} - ${podio[1].tempoTotal.toFixed(2)}<br>
            🥉 3º Lugar: ${podio[2].nome} - ${podio[2].tempoTotal.toFixed(2)}<br>
        `;
}