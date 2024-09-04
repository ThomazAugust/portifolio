let sorteioGerado = false;

function gerarInputs() {
    const numTeams = parseInt(document.getElementById('numTeams').value);
    const teamInputsDiv = document.getElementById('teamInputs');
    teamInputsDiv.innerHTML = '';

    for (let i = 1; i <= numTeams; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Equipe ${i}`;
        input.id = `team${i}`;
        input.classList.add('form-control', 'mt-2');
        teamInputsDiv.appendChild(input);        
    }

    document.getElementById('generateButton').style.display = 'block';

    // Restaurar valores dos inputs se existirem no localStorage
    for (let i = 1; i <= numTeams; i++) {
        const savedValue = localStorage.getItem(`team${i}`);
        if (savedValue) {
            document.getElementById(`team${i}`).value = savedValue;
        }
    }
}

function limparInputs() {
    // Limpar o conteúdo do elemento result
    document.getElementById('result').innerHTML = '';

    // Limpar o localStorage
    localStorage.clear();

    // Recarregar a página
    location.reload();
}

function gerarSorteio() {
    if (sorteioGerado) {
        if (!confirm("Um sorteio já foi gerado. Deseja gerar um novo sorteio?")) {
            return;
        }
        document.getElementById('result').innerHTML = '';
    }

    const equipes = [];
    const numTeams = parseInt(document.getElementById('numTeams').value);

    for (let i = 1; i <= numTeams; i++) {
        const equipeNome = document.getElementById(`team${i}`).value.trim();
        if (equipeNome) {
            equipes.push(equipeNome);
        } else {
            alert(`Por favor, insira o nome para a Equipe ${i}.`);
            return;
        }
    }

    // Salvar valores dos inputs no localStorage
    for (let i = 1; i <= numTeams; i++) {
        const inputValue = document.getElementById(`team${i}`).value;
        localStorage.setItem(`team${i}`, inputValue);
    }
    localStorage.setItem('numTeams', numTeams);

    let rodadas;
    do {
        rodadas = gerarTabelaRoundRobin(equipes);
    } while (!validarRodadas(rodadas, equipes.length / 2));

    exibirRodadas(rodadas);
    sorteioGerado = true;
}

function gerarTabelaRoundRobin(equipes) {
    const rodadas = [];
    const totalTeams = equipes.length;

    // Se o número de equipes for ímpar, adicionar uma "folga"
    if (totalTeams % 2 !== 0) {
        equipes.push("Folga");
    }

    const totalRounds = equipes.length - 1;
    const halfTeams = equipes.length / 2;
    const matchups = new Set();

    for (let rodada = 0; rodada < totalRounds; rodada++) {
        // Embaralhar equipes para cada rodada
        shuffleArray(equipes);

        const jogos = [];
        const teamsInRound = new Set();

        for (let i = 0; i < halfTeams; i++) {
            const time1 = equipes[i];
            const time2 = equipes[totalTeams - 1 - i];

            if (time1 !== "Folga" && time2 !== "Folga" && !teamsInRound.has(time1) && !teamsInRound.has(time2)) {
                const matchup = [time1, time2].sort().join('-');
                if (!matchups.has(matchup)) {
                    jogos.push(`${time1} vs ${time2}`);
                    matchups.add(matchup);
                    teamsInRound.add(time1);
                    teamsInRound.add(time2);
                }
            }
        }

        // Garantir que todas as equipes joguem em cada rodada
        while (jogos.length < halfTeams) {
            const missingMatch = findMissingMatch(equipes, matchups, teamsInRound);
            if (missingMatch) {
                jogos.push(`${missingMatch[0]} vs ${missingMatch[1]}`);
                matchups.add(missingMatch.sort().join('-'));
                teamsInRound.add(missingMatch[0]);
                teamsInRound.add(missingMatch[1]);
            } else {
                break; // Evitar loop infinito se não houver mais combinações possíveis
            }
        }

        rodadas.push(jogos);
    }

    return rodadas;
}

function findMissingMatch(equipes, matchups, teamsInRound) {
    for (let i = 0; i < equipes.length; i++) {
        for (let j = i + 1; j < equipes.length; j++) {
            const matchup = [equipes[i], equipes[j]].sort().join('-');
            if (!matchups.has(matchup) && !teamsInRound.has(equipes[i]) && !teamsInRound.has(equipes[j])) {
                return [equipes[i], equipes[j]];
            }
        }
    }
    return null;
}

function validarRodadas(rodadas, halfTeams) {
    for (const rodada of rodadas) {
        if (rodada.length !== halfTeams) {
            return false;
        }
        const teamsInRound = new Set();
        for (const jogo of rodada) {
            const [team1, team2] = jogo.split(' vs ');
            if (teamsInRound.has(team1) || teamsInRound.has(team2)) {
                return false;
            }
            teamsInRound.add(team1);
            teamsInRound.add(team2);
        }
    }
    return true;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function exibirRodadas(rodadas) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';

    rodadas.forEach((rodada, index) => {
        const rodadaDiv = document.createElement('div');
        rodadaDiv.classList.add('card');
        rodadaDiv.style.alignItems = 'center';
        resultDiv.style.padding = '10px';        

        const cardHeader = document.createElement('div');
        cardHeader.classList.add('card-header','col-12');

        const ulComponent = document.createElement('ul');
        ulComponent.classList.add('list-group', 'list-group-flush', 'col-12');
        ulComponent.style.alignItems = 'center';

        const liComponent = document.createElement('li');
        liComponent.classList.add('list-group-item');

        const rodadaTitle = document.createElement('h3');
        rodadaTitle.textContent = `Rodada ${index + 1}`;
        rodadaTitle.style.textAlign = 'center';

        cardHeader.appendChild(rodadaTitle);
        ulComponent.appendChild(liComponent);
        rodadaDiv.appendChild(cardHeader);
        rodadaDiv.appendChild(ulComponent);

        rodada.forEach(jogo => {
            const jogoP = document.createElement('p');
            jogoP.textContent = jogo;
            liComponent.appendChild(jogoP);
        });
        
        resultDiv.appendChild(rodadaDiv);
    });
}

// Inicializar com 6 inputs e restaurar valores se existirem
window.onload = function () {
    const savedNumTeams = localStorage.getItem('numTeams');
    if (savedNumTeams) {
        document.getElementById('numTeams').value = savedNumTeams;
    }
    gerarInputs();
};