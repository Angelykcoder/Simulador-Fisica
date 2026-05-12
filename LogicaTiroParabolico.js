const zonaParabolica = document.getElementById("zonaParabolica");
const pelota = document.getElementById("pelota");
const rastroPelota = document.getElementById("rastroPelota");

const vectorVx = document.getElementById("vectorVx");
const vectorVy = document.getElementById("vectorVy");
const vectorV = document.getElementById("vectorV");

const etiquetaPelota = document.getElementById("etiquetaPelota");
const posicionPelota = document.getElementById("posicionPelota");

const tiempoTexto = document.getElementById("tiempo");
const hudVx = document.getElementById("hudVx");
const hudVy = document.getElementById("hudVy");
const hudV = document.getElementById("hudV");

const velocidadInicial = document.getElementById("velocidadInicial");
const valorVelocidadInicial = document.getElementById("valorVelocidadInicial");

const anguloLanzamiento = document.getElementById("anguloLanzamiento");
const valorAngulo = document.getElementById("valorAngulo");

const posicionX = document.getElementById("posicionX");
const posicionY = document.getElementById("posicionY");
const alturaMaxima = document.getElementById("alturaMaxima");
const alcanceActual = document.getElementById("alcanceActual");

const btnIniciar = document.getElementById("btnIniciar");
const btnPausar = document.getElementById("btnPausar");
const btnReiniciar = document.getElementById("btnReiniciar");
const btnGraficas = document.getElementById("btnGraficas");

const pantallaGraficas = document.getElementById("pantallaGraficas");
const btnCerrarGraficas = document.getElementById("btnCerrarGraficas");

const GRAVEDAD = 9.8;
const X_MAX = 500;
const Y_MAX = 500;

const MARGEN_X = 70;
const MARGEN_Y = 70;

let tiempo = 0;
let intervalo = null;
let simulando = false;
let pausado = false;

let graficaTrayectoria = null;
let graficaXTiempo = null;
let graficaYTiempo = null;
let graficaVyTiempo = null;

function limitarValor(valor, minimo, maximo) {
    return Math.min(Math.max(Number(valor), minimo), maximo);
}

function gradosARadianes(grados) {
    return grados * Math.PI / 180;
}

function obtenerParametrosIniciales() {
    const v0 = Number(velocidadInicial.value);
    const angulo = Number(anguloLanzamiento.value);
    const radianes = gradosARadianes(angulo);

    const vx0 = v0 * Math.cos(radianes);
    const vy0 = v0 * Math.sin(radianes);

    return {
        v0,
        angulo,
        vx0,
        vy0
    };
}

function obtenerDatosFisicos(t) {
    const { vx0, vy0 } = obtenerParametrosIniciales();

    const x = vx0 * t;
    const y = (vy0 * t) - (0.5 * GRAVEDAD * t * t);

    const vx = vx0;
    const vy = vy0 - (GRAVEDAD * t);
    const v = Math.sqrt((vx * vx) + (vy * vy));

    return { x, y, vx, vy, v };
}

function obtenerPosicionVisual(xMetros, yMetros) {
    const ancho = zonaParabolica.clientWidth;
    const alto = zonaParabolica.clientHeight;

    const anchoUtil = ancho - (MARGEN_X * 2);
    const altoUtil = alto - (MARGEN_Y * 2);

    const xLimitado = limitarValor(xMetros, 0, X_MAX);
    const yLimitado = limitarValor(yMetros, 0, Y_MAX);

    const left = MARGEN_X + ((xLimitado / X_MAX) * anchoUtil);
    const bottom = MARGEN_Y + ((yLimitado / Y_MAX) * altoUtil);

    return { left, bottom };
}

function moverPelota(xMetros, yMetros) {
    const posicion = obtenerPosicionVisual(xMetros, yMetros);

    pelota.style.left = `${posicion.left}px`;
    pelota.style.bottom = `${posicion.bottom}px`;

    etiquetaPelota.style.left = `${posicion.left}px`;
    etiquetaPelota.style.bottom = `${posicion.bottom}px`;

    posicionPelota.textContent = `x: ${xMetros.toFixed(1)} m | y: ${Math.max(yMetros, 0).toFixed(1)} m`;

    moverVectores(posicion.left, posicion.bottom);
}

function moverVectores(left, bottom) {
    vectorVx.style.left = `${left}px`;
    vectorVx.style.bottom = `${bottom}px`;

    vectorVy.style.left = `${left}px`;
    vectorVy.style.bottom = `${bottom}px`;

    vectorV.style.left = `${left}px`;
    vectorV.style.bottom = `${bottom}px`;
}

function actualizarVectores(vx, vy, v) {
    const escalaVector = 2.2;

    const largoVx = Math.min(Math.abs(vx) * escalaVector, 160);
    const largoVy = Math.min(Math.abs(vy) * escalaVector, 160);
    const largoV = Math.min(Math.abs(v) * escalaVector, 190);

    vectorVx.style.width = `${largoVx}px`;
    vectorVx.style.transform = "rotate(0deg)";

    vectorVy.style.width = `${largoVy}px`;

    if (vy >= 0) {
        vectorVy.style.transform = "rotate(-90deg)";
    } else {
        vectorVy.style.transform = "rotate(90deg)";
    }

    const angulo = Math.atan2(-vy, vx) * 180 / Math.PI;

    vectorV.style.width = `${largoV}px`;
    vectorV.style.transform = `rotate(${angulo}deg)`;
}

function actualizarPaneles(x, y, vx, vy, v) {
    posicionX.textContent = limitarValor(x, 0, X_MAX).toFixed(2);
    posicionY.textContent = limitarValor(y, 0, Y_MAX).toFixed(2);

    const { vy0 } = obtenerParametrosIniciales();
    const hMax = (vy0 * vy0) / (2 * GRAVEDAD);

    alturaMaxima.textContent = limitarValor(hMax, 0, Y_MAX).toFixed(2);
    alcanceActual.textContent = limitarValor(x, 0, X_MAX).toFixed(2);

    hudVx.textContent = vx.toFixed(2);
    hudVy.textContent = vy.toFixed(2);
    hudV.textContent = v.toFixed(2);
}

function agregarPuntoRastro(xMetros, yMetros) {
    const punto = document.createElement("span");
    const posicion = obtenerPosicionVisual(xMetros, yMetros);

    punto.classList.add("punto-rastro");
    punto.style.left = `${posicion.left}px`;
    punto.style.bottom = `${posicion.bottom}px`;

    rastroPelota.appendChild(punto);
}

function limpiarRastro() {
    rastroPelota.innerHTML = "";
}

function ejecutarSimulacion() {
    tiempo += 0.05;

    const datos = obtenerDatosFisicos(tiempo);

    moverPelota(datos.x, datos.y);
    actualizarVectores(datos.vx, datos.vy, datos.v);
    actualizarPaneles(datos.x, datos.y, datos.vx, datos.vy, datos.v);
    agregarPuntoRastro(datos.x, datos.y);

    tiempoTexto.textContent = tiempo.toFixed(2);

    if ((datos.y <= 0 && tiempo > 0.1) || datos.x >= X_MAX || datos.y >= Y_MAX) {
        finalizarSimulacion(datos);
    }
}

function iniciarSimulacion() {
    if (simulando && !pausado) return;

    simulando = true;
    pausado = false;

    btnPausar.textContent = "Pausar";

    clearInterval(intervalo);

    intervalo = setInterval(() => {
        ejecutarSimulacion();
    }, 50);
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

        intervalo = setInterval(() => {
            ejecutarSimulacion();
        }, 50);
    }
}

function reiniciarSimulacion() {
    clearInterval(intervalo);

    tiempo = 0;
    simulando = false;
    pausado = false;

    btnPausar.textContent = "Pausar";
    tiempoTexto.textContent = "0.00";

    limpiarRastro();
    actualizarVistaInicial();
}

function finalizarSimulacion(datos) {
    clearInterval(intervalo);

    simulando = false;
    pausado = false;

    btnPausar.textContent = "Pausar";

    moverPelota(
        limitarValor(datos.x, 0, X_MAX),
        limitarValor(datos.y, 0, Y_MAX)
    );

    setTimeout(() => {
        abrirGraficas();
    }, 450);
}

function actualizarVistaInicial() {
    valorVelocidadInicial.value = velocidadInicial.value;
    valorAngulo.value = anguloLanzamiento.value;

    const datos = obtenerDatosFisicos(0);

    moverPelota(0, 0);
    actualizarVectores(datos.vx, datos.vy, datos.v);
    actualizarPaneles(0, 0, datos.vx, datos.vy, datos.v);

    posicionPelota.textContent = "x: 0 m | y: 0 m";
}

function sincronizarControl(slider, input, callback) {
    slider.addEventListener("input", () => {
        input.value = slider.value;
        reiniciarSimulacion();

        if (callback) callback();
    });

    input.addEventListener("input", () => {
        const minimo = Number(slider.min);
        const maximo = Number(slider.max);
        const valorLimitado = limitarValor(input.value, minimo, maximo);

        input.value = valorLimitado;
        slider.value = valorLimitado;

        reiniciarSimulacion();

        if (callback) callback();
    });
}

function prepararControlesNumericos() {
    sincronizarControl(velocidadInicial, valorVelocidadInicial);
    sincronizarControl(anguloLanzamiento, valorAngulo);
}

function crearNumerosX() {
    const contenedor = document.getElementById("numerosX");
    contenedor.innerHTML = "";

    for (let valor = 0; valor <= 500; valor += 50) {
        const numero = document.createElement("span");
        const posicion = obtenerPosicionVisual(valor, 0);

        numero.classList.add("numero-x");
        numero.style.left = `${posicion.left}px`;
        numero.textContent = `${valor} m`;

        contenedor.appendChild(numero);
    }
}

function crearNumerosY() {
    const contenedor = document.getElementById("numerosY");
    contenedor.innerHTML = "";

    for (let valor = 0; valor <= 500; valor += 50) {
        const numero = document.createElement("span");
        const posicion = obtenerPosicionVisual(0, valor);

        numero.classList.add("numero-y");
        numero.style.bottom = `${posicion.bottom}px`;
        numero.textContent = `${valor} m`;

        contenedor.appendChild(numero);
    }
}

function generarDatosGraficas() {
    const tiempos = [];
    const xs = [];
    const ys = [];
    const vys = [];
    const trayectoria = [];

    for (let t = 0; t <= 20; t += 0.25) {
        const datos = obtenerDatosFisicos(t);

        if (datos.y < 0 || datos.x > X_MAX || datos.y > Y_MAX) {
            break;
        }

        tiempos.push(t.toFixed(2));
        xs.push(Number(datos.x.toFixed(2)));
        ys.push(Number(datos.y.toFixed(2)));
        vys.push(Number(datos.vy.toFixed(2)));

        trayectoria.push({
            x: Number(datos.x.toFixed(2)),
            y: Number(datos.y.toFixed(2))
        });
    }

    return {
        tiempos,
        xs,
        ys,
        vys,
        trayectoria
    };
}

function destruirGraficasAnteriores() {
    if (graficaTrayectoria) {
        graficaTrayectoria.destroy();
        graficaTrayectoria = null;
    }

    if (graficaXTiempo) {
        graficaXTiempo.destroy();
        graficaXTiempo = null;
    }

    if (graficaYTiempo) {
        graficaYTiempo.destroy();
        graficaYTiempo = null;
    }

    if (graficaVyTiempo) {
        graficaVyTiempo.destroy();
        graficaVyTiempo = null;
    }
}

function crearGraficas() {
    destruirGraficasAnteriores();

    const datos = generarDatosGraficas();

    const opcionesBase = {
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
                ticks: { color: "#cbd5e1" },
                grid: { color: "rgba(255, 255, 255, 0.08)" }
            },
            y: {
                ticks: { color: "#cbd5e1" },
                grid: { color: "rgba(255, 255, 255, 0.08)" }
            }
        }
    };

    graficaTrayectoria = new Chart(document.getElementById("graficaTrayectoria"), {
        type: "scatter",
        data: {
            datasets: [
                {
                    label: "Trayectoria (Y vs X)",
                    data: datos.trayectoria,
                    borderColor: "#facc15",
                    backgroundColor: "rgba(250, 204, 21, 0.35)",
                    showLine: true,
                    tension: 0.35,
                    pointRadius: 4
                }
            ]
        },
        options: opcionesBase
    });

    graficaXTiempo = new Chart(document.getElementById("graficaXTiempo"), {
        type: "line",
        data: {
            labels: datos.tiempos,
            datasets: [
                {
                    label: "X (m)",
                    data: datos.xs,
                    borderColor: "#38bdf8",
                    backgroundColor: "rgba(56, 189, 248, 0.18)",
                    fill: true,
                    tension: 0.35
                }
            ]
        },
        options: opcionesBase
    });

    graficaYTiempo = new Chart(document.getElementById("graficaYTiempo"), {
        type: "line",
        data: {
            labels: datos.tiempos,
            datasets: [
                {
                    label: "Y (m)",
                    data: datos.ys,
                    borderColor: "#22c55e",
                    backgroundColor: "rgba(34, 197, 94, 0.18)",
                    fill: true,
                    tension: 0.35
                }
            ]
        },
        options: opcionesBase
    });

    graficaVyTiempo = new Chart(document.getElementById("graficaVyTiempo"), {
        type: "line",
        data: {
            labels: datos.tiempos,
            datasets: [
                {
                    label: "Vy (m/s)",
                    data: datos.vys,
                    borderColor: "#f97316",
                    backgroundColor: "rgba(249, 115, 22, 0.18)",
                    fill: true,
                    tension: 0.35
                }
            ]
        },
        options: opcionesBase
    });
}

function abrirGraficas() {
    pantallaGraficas.classList.add("activa");
    crearGraficas();
}

function cerrarGraficas() {
    pantallaGraficas.classList.remove("activa");
}

btnIniciar.addEventListener("click", iniciarSimulacion);
btnPausar.addEventListener("click", pausarSimulacion);
btnReiniciar.addEventListener("click", reiniciarSimulacion);

btnGraficas.addEventListener("click", abrirGraficas);
btnCerrarGraficas.addEventListener("click", cerrarGraficas);

pantallaGraficas.addEventListener("click", (evento) => {
    if (evento.target === pantallaGraficas) {
        cerrarGraficas();
    }
});

window.addEventListener("resize", () => {
    crearNumerosX();
    crearNumerosY();
    actualizarVistaInicial();
});

prepararControlesNumericos();
crearNumerosX();
crearNumerosY();
actualizarVistaInicial();