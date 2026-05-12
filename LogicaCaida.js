const pelota = document.getElementById("pelota");
const etiquetaVelocidadPelota = document.getElementById("etiquetaVelocidadPelota");
const zonaMovimiento = document.getElementById("zonaMovimiento");

const tiempoTexto = document.getElementById("tiempo");
const velocidadPelota = document.getElementById("velocidadPelota");
const modoActualTexto = document.getElementById("modoActualTexto");

const btnCaidaLibre = document.getElementById("btnCaidaLibre");
const btnTiroArriba = document.getElementById("btnTiroArriba");
const btnTiroAbajo = document.getElementById("btnTiroAbajo");

const btnIniciar = document.getElementById("btnIniciar");
const btnPausar = document.getElementById("btnPausar");
const btnReiniciar = document.getElementById("btnReiniciar");
const btnGraficas = document.getElementById("btnGraficas");

const alturaInicial = document.getElementById("alturaInicial");
const velocidadInicial = document.getElementById("velocidadInicial");

const valorAlturaInicial = document.getElementById("valorAlturaInicial");
const valorVelocidadInicial = document.getElementById("valorVelocidadInicial");

const alturaActual = document.getElementById("alturaActual");
const velocidadActual = document.getElementById("velocidadActual");
const alturaMaxima = document.getElementById("alturaMaxima");
const notaVelocidad = document.getElementById("notaVelocidad");
const controlVelocidadInicial = document.getElementById("controlVelocidadInicial");

const pantallaGraficas = document.getElementById("pantallaGraficas");
const btnCerrarGraficas = document.getElementById("btnCerrarGraficas");

let tiempo = 0;
let intervalo = null;
let simulando = false;
let pausado = false;
let modoActual = "caida";
let alturaMaximaAlcanzada = 0;


const ALTURA_MAXIMA = 500;
const GRAVEDAD = 9.8;

let graficaAltura = null;
let graficaVelocidad = null;
let graficaAceleracion = null;

function limitarValor(valor, minimo, maximo) {
    return Math.min(Math.max(Number(valor), minimo), maximo);
}

function sincronizarControl(slider, input) {
    slider.addEventListener("input", () => {
        input.value = slider.value;
        reiniciarEstadoVisual();
    });

    input.addEventListener("input", () => {
        const minimo = Number(slider.min);
        const maximo = Number(slider.max);
        const valorLimitado = limitarValor(input.value, minimo, maximo);

        input.value = valorLimitado;
        slider.value = valorLimitado;

        reiniciarEstadoVisual();
    });
}

function prepararControlesNumericos() {
    sincronizarControl(alturaInicial, valorAlturaInicial);
    sincronizarControl(velocidadInicial, valorVelocidadInicial);
}

/* Escala lateral 0 a 500 */
function crearEscalaVertical() {
    const lineaVertical = document.getElementById("lineaVertical");

    if (!lineaVertical) return;

    lineaVertical.innerHTML = "";

    const margenInferior = 70;
    const margenSuperior = 70;
    const alturaZona = lineaVertical.clientHeight;
    const alturaUtil = alturaZona - margenInferior - margenSuperior;

    for (let valor = 0; valor <= 500; valor += 50) {
        const marca = document.createElement("span");
        const proporcion = valor / ALTURA_MAXIMA;
        const posicionPx = margenInferior + (proporcion * alturaUtil);

        marca.classList.add("marca-altura");
        marca.style.bottom = `${posicionPx}px`;

        if (valor % 100 === 0) {
            marca.classList.add("mayor");
            marca.textContent = `${valor} m`;
        } else {
            marca.textContent = `${valor}`;
        }

        if (valor === 0) {
            marca.classList.add("cero");
        }

        if (valor === 500) {
            marca.classList.add("maxima");
        }

        lineaVertical.appendChild(marca);
    }
}

/* Números dentro de la cuadrícula */
function crearNumerosCuadricula() {
    const contenedor = document.getElementById("numerosCuadricula");

    if (!contenedor) return;

    contenedor.innerHTML = "";

    const margenInferior = 70;
    const margenSuperior = 70;
    const alturaZona = zonaMovimiento.clientHeight;
    const alturaUtil = alturaZona - margenInferior - margenSuperior;

    for (let valor = 0; valor <= 500; valor += 50) {
        const numero = document.createElement("span");
        const proporcion = valor / ALTURA_MAXIMA;
        const posicionPx = margenInferior + (proporcion * alturaUtil);

        numero.classList.add("numero-cuadricula");
        numero.style.bottom = `${posicionPx}px`;
        numero.textContent = `${valor} m`;

        contenedor.appendChild(numero);
    }
}

function obtenerAlturaVisualPx(alturaMetros) {
    const alturaZona = zonaMovimiento.clientHeight;

    /*
        Márgenes internos para que la pelota, etiqueta y números
        no se corten en 0 m ni en 500 m.
    */
    const margenInferior = 70;
    const margenSuperior = 70;

    const alturaUtil = alturaZona - margenInferior - margenSuperior;
    const alturaLimitada = limitarValor(alturaMetros, 0, ALTURA_MAXIMA);
    const proporcion = alturaLimitada / ALTURA_MAXIMA;

    return margenInferior + (proporcion * alturaUtil);
}
function moverPelota(alturaMetros) {
    const desplazamientoPx = obtenerAlturaVisualPx(alturaMetros);

    pelota.style.bottom = `${desplazamientoPx}px`;

    // Etiqueta a la izquierda y ligeramente arriba de la pelota
    etiquetaVelocidadPelota.style.bottom = `${desplazamientoPx + 10}px`;
}

function limpiarRastro() {
    const rastro = document.getElementById("rastroPelota");

    if (!rastro) return;

    rastro.innerHTML = "";
}

function agregarPuntoRastro(alturaMetros) {
    const rastro = document.getElementById("rastroPelota");

    if (!rastro) return;

    const punto = document.createElement("span");
    const desplazamientoPx = obtenerAlturaVisualPx(alturaMetros);

    punto.classList.add("punto-rastro");
    punto.style.bottom = `${desplazamientoPx}px`;

    rastro.appendChild(punto);

    if (rastro.children.length > 70) {
        rastro.removeChild(rastro.firstElementChild);
    }
}

/*
    Convención usada:
    - En caída libre y tiro hacia abajo se muestra velocidad positiva hacia abajo.
    - La gravedad se toma como +9.8 m/s² hacia abajo.
    - La altura se mide desde el suelo: 0 m abajo, 500 m arriba.
*/
function obtenerDatosFisicos(t) {
    const y0 = Number(alturaInicial.value);
    const v0 = Number(velocidadInicial.value);
    const g = GRAVEDAD;

    let y;
    let v;
    let a = g;

    if (modoActual === "caida") {
        /*
            Caída libre:
            v0 = 0
            desplazamiento hacia abajo = 1/2gt²
            altura = y0 - 1/2gt²
            velocidad hacia abajo = gt
        */
        y = y0 - (0.5 * g * t * t);
        v = g * t;
    }

    if (modoActual === "arriba") {
        /*
            Tiro vertical hacia arriba:
            mientras sube, la velocidad disminuye por gravedad.
            altura = y0 + v0t - 1/2gt²
            velocidad = v0 - gt
        */
        y = y0 + (v0 * t) - (0.5 * g * t * t);
        v = v0 - (g * t);
        a = -g;
    }

    if (modoActual === "abajo") {
        /*
            Tiro vertical hacia abajo:
            velocidad inicial hacia abajo.
            altura = y0 - v0t - 1/2gt²
            velocidad hacia abajo = v0 + gt
        */
        y = y0 - (v0 * t) - (0.5 * g * t * t);
        v = v0 + (g * t);
    }

    return { y, v, a };
}
function calcularAlturaMaximaTeorica() {
    const y0 = Number(alturaInicial.value);
    const v0 = Number(velocidadInicial.value);
    const g = GRAVEDAD;

    if (modoActual === "arriba") {
        const alturaExtra = (v0 * v0) / (2 * g);
        return limitarValor(y0 + alturaExtra, 0, ALTURA_MAXIMA);
    }

    return y0;
}


function actualizarPanelDatos(y, v) {
    const alturaLimitada = limitarValor(y, 0, ALTURA_MAXIMA);

    alturaActual.textContent = alturaLimitada.toFixed(2);
    velocidadActual.textContent = v.toFixed(2);
    velocidadPelota.textContent = `${v.toFixed(2)} m/s`;

    if (alturaLimitada > alturaMaximaAlcanzada) {
        alturaMaximaAlcanzada = alturaLimitada;
    }

    alturaMaxima.textContent = alturaMaximaAlcanzada.toFixed(2);
}

function actualizarVistaInicial() {
    const y0 = Number(alturaInicial.value);

    valorAlturaInicial.value = alturaInicial.value;
    valorVelocidadInicial.value = velocidadInicial.value;

    moverPelota(y0);

    alturaActual.textContent = y0.toFixed(2);
    velocidadActual.textContent = "0.00";
    velocidadPelota.textContent = "0 m/s";

    alturaMaximaAlcanzada = y0;

    if (modoActual === "arriba") {
        alturaMaxima.textContent = calcularAlturaMaximaTeorica().toFixed(2);
    } else {
        alturaMaxima.textContent = y0.toFixed(2);
    }
}

function reiniciarEstadoVisual() {
    clearInterval(intervalo);

    tiempo = 0;
    simulando = false;
    pausado = false;

    tiempoTexto.textContent = "0.00";
    btnPausar.textContent = "Pausar";

    alturaMaximaAlcanzada = Number(alturaInicial.value);

    limpiarRastro();
    actualizarVistaInicial();
}

function ejecutarSimulacion() {
    tiempo += 0.05;

    const datos = obtenerDatosFisicos(tiempo);

    moverPelota(datos.y);
    agregarPuntoRastro(datos.y);
    actualizarPanelDatos(datos.y, datos.v);

    tiempoTexto.textContent = tiempo.toFixed(2);

    if (datos.y <= 0 || datos.y >= ALTURA_MAXIMA) {
        finalizarSimulacionPorLimite(datos.y);
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

    alturaInicial.value = 500;
    valorAlturaInicial.value = 500;

    if (modoActual === "caida") {
        velocidadInicial.value = 0;
        valorVelocidadInicial.value = 0;
    }

    alturaMaximaAlcanzada = Number(alturaInicial.value);

    limpiarRastro();
    actualizarVistaInicial();
}
function finalizarSimulacionPorLimite(alturaFinal) {
    clearInterval(intervalo);

    simulando = false;
    pausado = false;

    btnPausar.textContent = "Pausar";

    const alturaAjustada = alturaFinal <= 0 ? 0 : ALTURA_MAXIMA;

    moverPelota(alturaAjustada);

    // Quitar el rastro cuando termina la simulación
    limpiarRastro();

    setTimeout(() => {
        abrirGraficas();
    }, 450);
}

function activarBotonModo(botonActivo) {
    const botones = [btnCaidaLibre, btnTiroArriba, btnTiroAbajo];

    botones.forEach((boton) => {
        boton.classList.remove("btn-primary", "modo-activo");
        boton.classList.add("btn-outline-primary");
    });

    botonActivo.classList.remove("btn-outline-primary");
    botonActivo.classList.add("btn-primary", "modo-activo");
}

function activarCaidaLibre() {
    modoActual = "caida";
    modoActualTexto.textContent = "Caída Libre";

    clearInterval(intervalo);

    tiempo = 0;
    simulando = false;
    pausado = false;

    velocidadInicial.value = 0;
    valorVelocidadInicial.value = 0;

    controlVelocidadInicial.classList.add("control-oculto");

    if (notaVelocidad) {
        notaVelocidad.textContent = "En caída libre v₀ = 0 y la velocidad aumenta por g = 9.8 m/s².";
    }

    activarBotonModo(btnCaidaLibre);
    limpiarRastro();
    actualizarVistaInicial();

    tiempoTexto.textContent = "0.00";
    btnPausar.textContent = "Pausar";
}

function activarTiroArriba() {
    modoActual = "arriba";
    modoActualTexto.textContent = "Tiro Vertical hacia Arriba";

    clearInterval(intervalo);

    tiempo = 0;
    simulando = false;
    pausado = false;

    controlVelocidadInicial.classList.remove("control-oculto");

    velocidadInicial.disabled = false;
    valorVelocidadInicial.disabled = false;

    velocidadInicial.value = 40;
    valorVelocidadInicial.value = 40;

    if (notaVelocidad) {
        notaVelocidad.textContent = "En tiro vertical hacia arriba, la velocidad inicial se opone a la gravedad.";
    }

    activarBotonModo(btnTiroArriba);
    limpiarRastro();
    actualizarVistaInicial();

    tiempoTexto.textContent = "0.00";
    btnPausar.textContent = "Pausar";
}

function activarTiroAbajo() {
    modoActual = "abajo";
    modoActualTexto.textContent = "Tiro Vertical hacia Abajo";

    clearInterval(intervalo);

    tiempo = 0;
    simulando = false;
    pausado = false;

    controlVelocidadInicial.classList.remove("control-oculto");

    velocidadInicial.disabled = false;
    valorVelocidadInicial.disabled = false;

    velocidadInicial.value = 20;
    valorVelocidadInicial.value = 20;

    if (notaVelocidad) {
        notaVelocidad.textContent = "En tiro vertical hacia abajo, la velocidad inicial se suma al efecto de la gravedad.";
    }

    activarBotonModo(btnTiroAbajo);
    limpiarRastro();
    actualizarVistaInicial();

    tiempoTexto.textContent = "0.00";
    btnPausar.textContent = "Pausar";
}

function generarDatosGraficas() {
    const tiempos = [];
    const alturas = [];
    const velocidades = [];
    const aceleraciones = [];

    for (let t = 0; t <= 15; t += 0.25) {
        const datos = obtenerDatosFisicos(t);

        if (datos.y < 0 || datos.y > ALTURA_MAXIMA) {
            break;
        }

        tiempos.push(t.toFixed(2));
        alturas.push(Number(datos.y.toFixed(2)));
        velocidades.push(Number(datos.v.toFixed(2)));
        aceleraciones.push(Number(datos.a.toFixed(2)));
    }

    return {
        tiempos,
        alturas,
        velocidades,
        aceleraciones
    };
}

function destruirGraficasAnteriores() {
    if (graficaAltura) {
        graficaAltura.destroy();
        graficaAltura = null;
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

function crearGraficas() {
    destruirGraficasAnteriores();

    const datos = generarDatosGraficas();

    const canvasAltura = document.getElementById("graficaAltura");
    const canvasVelocidad = document.getElementById("graficaVelocidad");
    const canvasAceleracion = document.getElementById("graficaAceleracion");

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
                ticks: {
                    color: "#cbd5e1"
                },
                grid: {
                    color: "rgba(255, 255, 255, 0.08)"
                }
            }
        }
    };

    graficaAltura = new Chart(canvasAltura, {
        type: "line",
        data: {
            labels: datos.tiempos,
            datasets: [
                {
                    label: "Altura (m)",
                    data: datos.alturas,
                    borderColor: "#38bdf8",
                    backgroundColor: "rgba(56, 189, 248, 0.18)",
                    pointBackgroundColor: "#38bdf8",
                    pointBorderColor: "#ffffff",
                    pointRadius: 4,
                    tension: 0.35,
                    fill: true
                }
            ]
        },
        options: opcionesBase
    });

    graficaVelocidad = new Chart(canvasVelocidad, {
        type: "line",
        data: {
            labels: datos.tiempos,
            datasets: [
                {
                    label: "Velocidad (m/s)",
                    data: datos.velocidades,
                    borderColor: "#22c55e",
                    backgroundColor: "rgba(34, 197, 94, 0.18)",
                    pointBackgroundColor: "#22c55e",
                    pointBorderColor: "#ffffff",
                    pointRadius: 4,
                    tension: 0.35,
                    fill: true
                }
            ]
        },
        options: opcionesBase
    });

    graficaAceleracion = new Chart(canvasAceleracion, {
        type: "line",
        data: {
            labels: datos.tiempos,
            datasets: [
                {
                    label: "Aceleración (m/s²)",
                    data: datos.aceleraciones,
                    borderColor: "#f59e0b",
                    backgroundColor: "rgba(245, 158, 11, 0.18)",
                    pointBackgroundColor: "#f59e0b",
                    pointBorderColor: "#ffffff",
                    pointRadius: 4,
                    tension: 0.35,
                    fill: true
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

btnCaidaLibre.addEventListener("click", activarCaidaLibre);
btnTiroArriba.addEventListener("click", activarTiroArriba);
btnTiroAbajo.addEventListener("click", activarTiroAbajo);

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

crearEscalaVertical();
crearNumerosCuadricula();
prepararControlesNumericos();
activarCaidaLibre();