const PIXELES_POR_METRO = 1.35;
const RANGO_MINIMO_ESCALA = -500;
const RANGO_MAXIMO_ESCALA = 500;

const vehiculo = document.getElementById("vehiculo");
const vehiculoB = document.getElementById("vehiculoB");
const carretera = document.getElementById("carretera");

const tiempoTexto = document.getElementById("tiempo");
const velocidadTexto = document.getElementById("velocidadVehiculo");
const velocidadTextoB = document.getElementById("velocidadVehiculoB");

const modoClasico = document.getElementById("modoClasico");
const modoPersecucion = document.getElementById("modoPersecucion");

const panelClasico = document.getElementById("panelClasico");
const panelPersecucion = document.getElementById("panelPersecucion");

const posicionInicial = document.getElementById("posicionInicial");
const velocidadInicial = document.getElementById("velocidadInicial");
const aceleracion = document.getElementById("aceleracion");

const valorPosicion = document.getElementById("valorPosicion");
const valorVelocidad = document.getElementById("valorVelocidad");
const valorAceleracion = document.getElementById("valorAceleracion");

const posicionInicialA = document.getElementById("posicionInicialA");
const velocidadInicialA = document.getElementById("velocidadInicialA");
const aceleracionA = document.getElementById("aceleracionA");

const valorPosicionA = document.getElementById("valorPosicionA");
const valorVelocidadA = document.getElementById("valorVelocidadA");
const valorAceleracionA = document.getElementById("valorAceleracionA");

const posicionInicialB = document.getElementById("posicionInicialB");
const velocidadInicialB = document.getElementById("velocidadInicialB");
const aceleracionB = document.getElementById("aceleracionB");

const valorPosicionB = document.getElementById("valorPosicionB");
const valorVelocidadB = document.getElementById("valorVelocidadB");
const valorAceleracionB = document.getElementById("valorAceleracionB");

const btnIniciar = document.getElementById("btnIniciar");
const btnPausar = document.getElementById("btnPausar");
const btnReiniciar = document.getElementById("btnReiniciar");

const btnGraficas = document.getElementById("btnGraficas");
const pantallaGraficas = document.getElementById("pantallaGraficas");
const btnCerrarGraficas = document.getElementById("btnCerrarGraficas");

let tiempo = 0;
let intervalo = null;
let simulando = false;
let pausado = false;
let modoActual = "clasico";



let graficaPosicion = null;
let graficaVelocidad = null;
let graficaAceleracion = null;

function limitarValor(valor, minimo, maximo) {
    const numero = Number(valor);

    if (Number.isNaN(numero)) {
        return minimo;
    }

    return Math.min(Math.max(numero, minimo), maximo);
}

function obtenerPixelesPorMetro() {
    const anchoCarretera = carretera.clientWidth || 1000;
    return anchoCarretera / (RANGO_MAXIMO_ESCALA - RANGO_MINIMO_ESCALA);
}

function moverVehiculo(elemento, posicionMetros) {
    const posicionLimitada = limitarValor(posicionMetros, RANGO_MINIMO_ESCALA, RANGO_MAXIMO_ESCALA);
    const desplazamientoPx = posicionLimitada * obtenerPixelesPorMetro();

    elemento.style.transform = `translateX(calc(-50% + ${desplazamientoPx}px))`;
}

function actualizarValoresClasico() {
    valorPosicion.value = posicionInicial.value;
    valorVelocidad.value = velocidadInicial.value;
    valorAceleracion.value = aceleracion.value;
}

function actualizarValoresPersecucion() {
    valorPosicionA.value = posicionInicialA.value;
    valorVelocidadA.value = velocidadInicialA.value;
    valorAceleracionA.value = aceleracionA.value;

    valorPosicionB.value = posicionInicialB.value;
    valorVelocidadB.value = velocidadInicialB.value;
    valorAceleracionB.value = aceleracionB.value;
}

function sincronizarControl(slider, input, callback) {
    slider.addEventListener("input", () => {
        input.value = slider.value;

        if (callback) {
            callback();
        }
    });

    input.addEventListener("input", () => {
        if (input.value === "" || input.value === "-" || input.value === "+") {
            return;
        }

        const minimo = Number(slider.min);
        const maximo = Number(slider.max);
        const valorLimitado = limitarValor(input.value, minimo, maximo);

        input.value = valorLimitado;
        slider.value = valorLimitado;

        if (callback) {
            callback();
        }
    });

    input.addEventListener("blur", () => {
        const minimo = Number(slider.min);
        const maximo = Number(slider.max);
        const valorLimitado = limitarValor(input.value, minimo, maximo);

        input.value = valorLimitado;
        slider.value = valorLimitado;

        if (callback) {
            callback();
        }
    });
}

function prepararControlesNumericos() {
    sincronizarControl(posicionInicial, valorPosicion, reiniciarPosicionVisualSiNoSimula);
    sincronizarControl(velocidadInicial, valorVelocidad);
    sincronizarControl(aceleracion, valorAceleracion);

    sincronizarControl(posicionInicialA, valorPosicionA, reiniciarPosicionVisualSiNoSimula);
    sincronizarControl(velocidadInicialA, valorVelocidadA);
    sincronizarControl(aceleracionA, valorAceleracionA);

    sincronizarControl(posicionInicialB, valorPosicionB, reiniciarPosicionVisualSiNoSimula);
    sincronizarControl(velocidadInicialB, valorVelocidadB);
    sincronizarControl(aceleracionB, valorAceleracionB);
}

function crearEscalaDetallada() {
    const lineaEscala = document.getElementById("lineaEscala");

    if (!lineaEscala) return;

    lineaEscala.innerHTML = "";

    for (let valor = -500; valor <= 500; valor += 50) {
        const marca = document.createElement("span");
        const posicion = ((valor + 500) / 1000) * 100;

        marca.classList.add("marca-escala");
        marca.style.left = `${posicion}%`;

        if (valor % 100 === 0) {
            marca.classList.add("mayor");
            marca.textContent = `${valor} m`;
        } else {
            marca.classList.add("etiqueta-menor");
            marca.textContent = `${valor}`;
        }

        if (valor === 0) {
            marca.classList.add("cero");
            marca.textContent = "0 m";
        }

        lineaEscala.appendChild(marca);
    }
}

function reiniciarPosicionVisualSiNoSimula() {
    if (simulando) return;

    if (modoActual === "clasico") {
        moverVehiculo(vehiculo, Number(posicionInicial.value));
    } else {
        moverVehiculo(vehiculo, Number(posicionInicialA.value));
        moverVehiculo(vehiculoB, Number(posicionInicialB.value));
    }
}


function finalizarSimulacionPorLimite() {
    clearInterval(intervalo);

    simulando = false;
    pausado = false;

    btnPausar.textContent = "Pausar";

    setTimeout(() => {
        abrirGraficas();
    }, 400);
}

function verificarLimite(posicion) {
    if (posicion <= RANGO_MINIMO_ESCALA || posicion >= RANGO_MAXIMO_ESCALA) {
        finalizarSimulacionPorLimite();
        return true;
    }

    return false;
}

function calcularMovimientoClasico() {
    const x0 = Number(posicionInicial.value);
    const v0 = Number(velocidadInicial.value);
    const a = Number(aceleracion.value);

    tiempo += 0.05;

    const posicion = x0 + (v0 * tiempo) + (0.5 * a * tiempo * tiempo);
    const velocidad = v0 + (a * tiempo);

    moverVehiculo(vehiculo, posicion);

    tiempoTexto.textContent = tiempo.toFixed(2);
    velocidadTexto.textContent = `${velocidad.toFixed(2)} m/s`;

    if (verificarLimite(posicion)) {
        moverVehiculo(
            vehiculo,
            posicion < RANGO_MINIMO_ESCALA ? RANGO_MINIMO_ESCALA : RANGO_MAXIMO_ESCALA
        );
    }
}

function calcularMovimientoPersecucion() {
    const x0A = Number(posicionInicialA.value);
    const v0A = Number(velocidadInicialA.value);
    const aA = Number(aceleracionA.value);

    const x0B = Number(posicionInicialB.value);
    const v0B = Number(velocidadInicialB.value);
    const aB = Number(aceleracionB.value);

    tiempo += 0.05;

    const posicionA = x0A + (v0A * tiempo) + (0.5 * aA * tiempo * tiempo);
    const velocidadA = v0A + (aA * tiempo);

    const posicionB = x0B + (v0B * tiempo) + (0.5 * aB * tiempo * tiempo);
    const velocidadB = v0B + (aB * tiempo);

    moverVehiculo(vehiculo, posicionA);
    moverVehiculo(vehiculoB, posicionB);

    tiempoTexto.textContent = tiempo.toFixed(2);
    velocidadTexto.textContent = `${velocidadA.toFixed(2)} m/s`;
    velocidadTextoB.textContent = `${velocidadB.toFixed(2)} m/s`;

    if (
        posicionA <= RANGO_MINIMO_ESCALA ||
        posicionA >= RANGO_MAXIMO_ESCALA ||
        posicionB <= RANGO_MINIMO_ESCALA ||
        posicionB >= RANGO_MAXIMO_ESCALA
    ) {
        moverVehiculo(
            vehiculo,
            posicionA < RANGO_MINIMO_ESCALA ? RANGO_MINIMO_ESCALA :
            posicionA > RANGO_MAXIMO_ESCALA ? RANGO_MAXIMO_ESCALA :
            posicionA
        );

        moverVehiculo(
            vehiculoB,
            posicionB < RANGO_MINIMO_ESCALA ? RANGO_MINIMO_ESCALA :
            posicionB > RANGO_MAXIMO_ESCALA ? RANGO_MAXIMO_ESCALA :
            posicionB
        );

        finalizarSimulacionPorLimite();
    }
}
function ejecutarSimulacion() {
    if (modoActual === "clasico") {
        calcularMovimientoClasico();
    } else {
        calcularMovimientoPersecucion();
    }
}

function iniciarSimulacion() {
    if (simulando && !pausado) return;

    simulando = true;
    pausado = false;
    btnPausar.textContent = "Pausar";

    clearInterval(intervalo);
    intervalo = setInterval(ejecutarSimulacion, 50);
}

function pausarSimulacion() {
    if (!simulando) return;

    if (!pausado) {
        clearInterval(intervalo);
        pausado = true;
        btnPausar.textContent = "Continuar";
    } else {
        pausado = false;
        btnPausar.textContent = "Pausar";
        clearInterval(intervalo);
        intervalo = setInterval(ejecutarSimulacion, 50);
    }
}

function reiniciarSimulacion() {
    clearInterval(intervalo);

    tiempo = 0;
    simulando = false;
    pausado = false;

    tiempoTexto.textContent = "0.00";

    posicionInicial.value = 0;
    velocidadInicial.value = 0;
    aceleracion.value = 0;

    posicionInicialA.value = 0;
    velocidadInicialA.value = 0;
    aceleracionA.value = 0;

    posicionInicialB.value = 0;
    velocidadInicialB.value = 0;
    aceleracionB.value = 0;

    actualizarValoresClasico();
    actualizarValoresPersecucion();

    moverVehiculo(vehiculo, 0);
    moverVehiculo(vehiculoB, 0);

    velocidadTexto.textContent = "0 m/s";
    velocidadTextoB.textContent = "0 m/s";

    btnPausar.textContent = "Pausar";
}

function activarModoClasico() {
    reiniciarSimulacion();

    modoActual = "clasico";

    panelClasico.classList.remove("d-none");
    panelPersecucion.classList.add("d-none");

    vehiculoB.style.display = "none";

    modoClasico.classList.remove("btn-outline-primary");
    modoClasico.classList.add("btn-primary", "modo-activo");

    modoPersecucion.classList.remove("btn-primary", "modo-activo");
    modoPersecucion.classList.add("btn-outline-primary");
}

function activarModoPersecucion() {
    reiniciarSimulacion();

    modoActual = "persecucion";

    panelClasico.classList.add("d-none");
    panelPersecucion.classList.remove("d-none");

    vehiculoB.style.display = "block";

    modoPersecucion.classList.remove("btn-outline-primary");
    modoPersecucion.classList.add("btn-primary", "modo-activo");

    modoClasico.classList.remove("btn-primary", "modo-activo");
    modoClasico.classList.add("btn-outline-primary");
}

function abrirGraficas() {
    pantallaGraficas.classList.add("activa");

    setTimeout(() => {
        crearGraficas();
    }, 50);
}

function cerrarGraficas() {
    pantallaGraficas.classList.remove("activa");
}

function generarDatosGraficas() {
    const tiempos = [];
    const posicionA = [];
    const velocidadA = [];
    const aceleracionSerieA = [];
    const posicionB = [];
    const velocidadB = [];
    const aceleracionSerieB = [];

    const esClasico = modoActual === "clasico";

    const x0A = esClasico ? Number(posicionInicial.value) : Number(posicionInicialA.value);
    const v0A = esClasico ? Number(velocidadInicial.value) : Number(velocidadInicialA.value);
    const aA = esClasico ? Number(aceleracion.value) : Number(aceleracionA.value);

    const x0B = Number(posicionInicialB.value);
    const v0B = Number(velocidadInicialB.value);
    const aB = Number(aceleracionB.value);

    for (let t = 0; t <= 10; t += 0.5) {
        const xA = x0A + (v0A * t) + (0.5 * aA * t * t);
        const vA = v0A + (aA * t);

        tiempos.push(t.toFixed(1));
        posicionA.push(Number(xA.toFixed(2)));
        velocidadA.push(Number(vA.toFixed(2)));
        aceleracionSerieA.push(Number(aA.toFixed(2)));

        if (!esClasico) {
            const xB = x0B + (v0B * t) + (0.5 * aB * t * t);
            const vB = v0B + (aB * t);

            posicionB.push(Number(xB.toFixed(2)));
            velocidadB.push(Number(vB.toFixed(2)));
            aceleracionSerieB.push(Number(aB.toFixed(2)));
        }
    }

    return {
        tiempos,
        posicionA,
        velocidadA,
        aceleracionSerieA,
        posicionB,
        velocidadB,
        aceleracionSerieB,
        esClasico
    };
}

function destruirGraficasAnteriores() {
    if (graficaPosicion) {
        graficaPosicion.destroy();
        graficaPosicion = null;
    }

    if (graficaVelocidad) {
        graficaVelocidad.destroy();
        graficaVelocidad = null;
    }

    if (graficaAceleracion) {
        graficaAceleracion.destroy();
        graficaAceleracion = null;
    }
}

function crearDataset(label, data, color) {
    return {
        label,
        data,
        borderColor: color,
        backgroundColor: color.replace("1)", "0.18)"),
        pointBackgroundColor: color,
        pointBorderColor: "#ffffff",
        pointRadius: 4,
        tension: 0.35,
        fill: true
    };
}

function crearOpcionesGrafica(tituloY) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: "index",
            intersect: false
        },
        plugins: {
            legend: {
                labels: {
                    color: "#ffffff",
                    font: {
                        weight: "bold"
                    }
                }
            },
            tooltip: {
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                titleColor: "#ffffff",
                bodyColor: "#e0f2fe",
                borderColor: "rgba(125, 211, 252, 0.4)",
                borderWidth: 1
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Tiempo (s)",
                    color: "#cbd5e1"
                },
                ticks: {
                    color: "#cbd5e1"
                },
                grid: {
                    color: "rgba(255, 255, 255, 0.08)"
                }
            },
            y: {
                title: {
                    display: true,
                    text: tituloY,
                    color: "#cbd5e1"
                },
                ticks: {
                    color: "#cbd5e1"
                },
                grid: {
                    color: "rgba(255, 255, 255, 0.08)"
                }
            }
        }
    };
}

function crearGraficas() {
    if (typeof Chart === "undefined") {
        console.error("Chart.js no está cargado.");
        return;
    }

    destruirGraficasAnteriores();

    const datos = generarDatosGraficas();

    const canvasPosicion = document.getElementById("graficaPosicion");
    const canvasVelocidad = document.getElementById("graficaVelocidad");
    const canvasAceleracion = document.getElementById("graficaAceleracion");

    if (!canvasPosicion || !canvasVelocidad || !canvasAceleracion) {
        console.error("No se encontraron los canvas de las gráficas.");
        return;
    }

    const datasetsPosicion = [
        crearDataset(datos.esClasico ? "Posición (m)" : "Posición Coche A (m)", datos.posicionA, "rgba(56, 189, 248, 1)")
    ];

    const datasetsVelocidad = [
        crearDataset(datos.esClasico ? "Velocidad (m/s)" : "Velocidad Coche A (m/s)", datos.velocidadA, "rgba(34, 197, 94, 1)")
    ];

    const datasetsAceleracion = [
        crearDataset(datos.esClasico ? "Aceleración (m/s²)" : "Aceleración Coche A (m/s²)", datos.aceleracionSerieA, "rgba(245, 158, 11, 1)")
    ];

    if (!datos.esClasico) {
        datasetsPosicion.push(crearDataset("Posición Coche B (m)", datos.posicionB, "rgba(192, 132, 252, 1)"));
        datasetsVelocidad.push(crearDataset("Velocidad Coche B (m/s)", datos.velocidadB, "rgba(236, 72, 153, 1)"));
        datasetsAceleracion.push(crearDataset("Aceleración Coche B (m/s²)", datos.aceleracionSerieB, "rgba(248, 113, 113, 1)"));
    }

    graficaPosicion = new Chart(canvasPosicion, {
        type: "line",
        data: {
            labels: datos.tiempos,
            datasets: datasetsPosicion
        },
        options: crearOpcionesGrafica("Posición (m)")
    });

    graficaVelocidad = new Chart(canvasVelocidad, {
        type: "line",
        data: {
            labels: datos.tiempos,
            datasets: datasetsVelocidad
        },
        options: crearOpcionesGrafica("Velocidad (m/s)")
    });

    graficaAceleracion = new Chart(canvasAceleracion, {
        type: "line",
        data: {
            labels: datos.tiempos,
            datasets: datasetsAceleracion
        },
        options: crearOpcionesGrafica("Aceleración (m/s²)")
    });
}

function inicializarEventos() {
    btnIniciar.addEventListener("click", iniciarSimulacion);
    btnPausar.addEventListener("click", pausarSimulacion);
    btnReiniciar.addEventListener("click", reiniciarSimulacion);

    modoClasico.addEventListener("click", activarModoClasico);
    modoPersecucion.addEventListener("click", activarModoPersecucion);

    btnGraficas.addEventListener("click", abrirGraficas);
    btnCerrarGraficas.addEventListener("click", cerrarGraficas);

    pantallaGraficas.addEventListener("click", (evento) => {
        if (evento.target === pantallaGraficas) {
            cerrarGraficas();
        }
    });

    window.addEventListener("resize", () => {
        reiniciarPosicionVisualSiNoSimula();
    });
}

function inicializarSimulador() {
    crearEscalaDetallada();
    prepararControlesNumericos();
    inicializarEventos();
    actualizarValoresClasico();
    actualizarValoresPersecucion();
    activarModoClasico();
}

inicializarSimulador();
