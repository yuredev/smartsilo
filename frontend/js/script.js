const socket = io();           // constante que armazenará o objeto do socket.io
const startTime = new Date(); // armazenar o tempo inicial ao executar em milisegundos 
let t1 = null, t2 = null, t3 = null, t4 = null, t5 = null, controlBitValue = null; // valores de y inseridos nos gráficos  
let setPoint = 30;         // determina o valor do set point do primeiro gráfico 
let showBitGraph = true;    // determina se o gráfico do set point será mostrado 
let pause = false;           // determina se o gráfico está pausado 
let x = 0;                   // x representa os pontos no eixo x do gráfico
let cntSec = 0;              // cntSec conta os segundos passados a cada minuto ele ganha 60
let minutes = 0;             // minutes representa os minutos passados
let secP;                     // armazenar o tempo passado (secP = seconds passed)
let option = 'Temperatura';        // gráfico a ser exibido 
let executingGraph, executingGraphCB;  // armazenará dos dois gráficos 
let currentControlMode = 'Malha aberta'
let layout = {                 // layout a ser usado nos gráficos 
    height: 250,
    autosize: true,
    margin: { b: 50, t: 30 }
};
// array de linhas do primeiro gráfico
let traces = [
    new Trace('temperatura', t1, 'red'),
    new Trace('set point', setPoint, '#00E')
];
// array de linhas do gráfico do bit de controle (CB: Bit Control)
let traceCB = [new Trace('bit de controle', controlBitValue)];

window.onload = initialize;

const switchExpState = () => document.getElementById('startExperiment').innerText = document.getElementById('startExperiment').innerText == 'Iniciar aquisição' ? 'Parar aquisição' : 'Iniciar aquisição';

// inicializar a aplicação
function initialize() {
    startPloting();
    startSocketListening();
    $("#controlMode > #off").prop('selected', 'true'); // marcar malha aberta por padrão  
    $("#setPoint").on("keypress", evt => evt.keyCode == 13 && changeSetPoint());
    $('#' + option).addClass('marked');      // marcar a opção atual do gráfico
    $('#controlBit').prop('checked', true); // deixar o checkbox marcado por padrão via jquery  
    $('#controlEnable').prop('checked', true); // deixar o checkbox marcado por padrão via jquery  
}

// faz o cliente começar a ouvir os dados do servidor 
function startSocketListening() {
    socket.on('newTemperature1', receivedData => t1 = receivedData);
    socket.on('newTemperature2', receivedData => t2 = receivedData);
    socket.on('newTemperature3', receivedData => t3 = receivedData);
    socket.on('newTemperature4', receivedData => t4 = receivedData);
    socket.on('newTemperature5', receivedData => t5 = receivedData);
    socket.on('changeSetPoint', newSetPoint => {
        setPoint = newSetPoint
        document.getElementById('setPoint').value = setPoint;
    });
    socket.on('dryerBusy', () => {
        alert('Secador ocupado!! não foi possível iniciar o experimento');
    });
    socket.on('dryerAvaliable', () => switchExpState());
    socket.on('controlBitValue', newCbValue => controlBitValue = newCbValue);
    socket.on('chartReady', () => window.location.href = 'html/report.html');
}

// alternar do 0v para 5v 
function switchOffControling() {
    let value = document.getElementById('buttonSwitch').innerText;
    document.getElementById('buttonSwitch').innerText = value == 'Mudar para 3v' ? 'Mudar para 0v' : 'Mudar para 3v';
    socket.emit('switchOffController', null);
}

// começa a plotar os gráficos dinamicamente
function startPloting() {
    Plotly.plot('chart', traces, layout);      // plotar primeiro gráfico 
    Plotly.plot('chart2', traceCB, layout);    // plotar gráfico do bit de controle 
    executingGraph = setInterval(updateGraph, 100);
    executingGraphCB = setInterval(updateGraphCB, 100);
}

// começa o novo experimento, controlando o secador com o option selecionado e salvando em um novo arquivo
function startExperiment() {
    let value = document.getElementById('startExperiment').innerText;
    if (value == 'Iniciar aquisição') {
        socket.emit('startExperiment', currentControlMode);
    } else {
        socket.emit('stopExperiment', null);
    }
}

// muda a opção de controle 
function changeControlMode(controlMode) {
    if (controlMode == 'Malha aberta') {
        document.getElementById('buttonSwitch').style.display = 'inline';
        document.getElementById('startExperiment').style.display = 'none';
    } else {
        document.getElementById('buttonSwitch').style.display = 'none';
        document.getElementById('startExperiment').style.display = 'inline';
    }
    currentControlMode = controlMode;
}

// redirecionar para a página de setar os canais 
function redirectToPins() {
    window.location.href = 'html/setpins.html';
}

// função construtora para gerar objetos do tipo linha 
function Trace(name = 'unnamed trace', valueTrace, color = '#000') {
    this.name = name;
    this.y = [valueTrace];
    this.type = 'line';
    this.mode = 'lines';
    this.line = { color };
}
// retorna o tempo passado em segundos 
function secondsPassed() {
    let endTime = new Date();
    let timeDiff = endTime - startTime; // retorno em milisegundos
    timeDiff /= 1000; // convertendo para segundos 
    return Math.round(timeDiff);
}
// mudar gráfico atual
function changeGraph(optionName) {
    $('#' + option).removeClass('marked');
    option = optionName;
    $('#' + option).addClass('marked');
}
// função para mudar o setPoint 
function changeSetPoint() {
    let value = document.getElementById('setPoint').value
    if (value <= 45) {
        setPoint = document.getElementById('setPoint').value;
        socket.emit('changingSetPoint', setPoint); // mandar set point para o servidor
    } else {
        alert(`Digite um valor mais baixo, ${value}°c pode acabar danificando os componentes`);
    }
}
// função para mostrar ou ocultar o segundo gráfico 
function switchControlBitGraph() {
    document.getElementById('container2').style.display = showBitGraph ? 'none' : 'block';
    showBitGraph = !showBitGraph;
}
// função para pausar ou retomar o gráfico 
function pauseResume() {
    pause = !pause;
    if (pause) {
        document.getElementById('pause-resume').innerText = 'Retomar';
        clearInterval(executingGraph);    // pausa primeiro gráfico 
        clearInterval(executingGraphCB);  // pausa segundo gráfico 
    } else {
        document.getElementById('pause-resume').innerText = 'Pausar';
        executingGraph = setInterval(updateGraph, 100);     // retoma primeiro gráfico 
        executingGraphCB = setInterval(updateGraphCB, 100); // retoma segundo gráfico 
    }
}
// função para fazer o tempo passar, será utilizada para fazer o tempo ser exibido abaixo dos gráficos 
function passTime() {
    secP = secondsPassed();
    if (secP - cntSec > 59) {
        cntSec += 60;
        minutes++;
    }
}
// update do primeiro gráfico 
function updateGraph() {
    Plotly.extendTraces('chart', { y: [[(t1 + t2 + t3 + t4 + t5) / 5], [setPoint]] }, [0, 1]);
    x++;
    passTime();
    graphRelayout('chart', 'temperatura', 10, 50);
    document.getElementById('average').innerHTML = `Temperatura: ${((t1 + t2 + t3 + t4 + t5) / 5).toFixed(2).replace('.', ',')}°C`;
    // printTemps();
}
// função para printar as temperaturas para conferir se estão ok 
function printTemps() {
    console.log('\n\n\n\n\n\nTemperatura 1: ', t1);
    console.log('Temperatura 2: ', t2);
    console.log('Temperatura 3: ', t3);
    console.log('Temperatura 4: ', t4);
    console.log('Temperatura 5: ', t5);
}
// update do gráfico de bit de controle 
function updateGraphCB() {
    Plotly.extendTraces('chart2', { y: [[controlBitValue]] }, [0]);
    graphRelayout('chart2', 'sinal de controle', 0, 5);
}
// faz o redesenho de um gráfico
function graphRelayout(divName, graphName, rangeMin, rangeMax) {
    Plotly.relayout(divName, {
        xaxis: {
            showticklabels: false,
            title: `tempo decorrido: ${minutes}:${secP < 60 ? secP : secP - cntSec}`,
            range: [x - 150, x],
        },
        yaxis: {
            title: graphName,
            range: [rangeMin, rangeMax]
        }
    });
}