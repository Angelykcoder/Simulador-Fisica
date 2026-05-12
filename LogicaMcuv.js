const zonaMcuv = document.querySelector(".zona-mcuv");
const pizza = document.getElementById("pizza");
const orbita = document.querySelector(".orbita");

const vectorRadio = document.getElementById("vectorRadio");
const vectorTangencial = document.getElementById("vectorTangencial");
const vectorCentripeta = document.getElementById("vectorCentripeta");
const vectorAceleracionTangencial = document.getElementById("vectorAceleracionTangencial");

const etiquetaRadio = document.querySelector(".etiqueta-radio");
const etiquetaTangencial = document.querySelector(".etiqueta-tangencial");
const etiquetaCentripeta = document.querySelector(".etiqueta-centripeta");
const etiquetaAlpha = document.querySelector(".etiqueta-alpha");

const rastroAngular = document.getElementById("rastroAngular");

const tiempoTexto = document.getElementById("tiempo");
const hudOmega = document.getElementById("hudOmega");
const hudTheta = document.getElementById("hudTheta");
const hudVelocidad = document.getElementById("hudVelocidad");

const radio = document.getElementById("radio");
const omegaInicial = document.getElementById("omegaInicial");
const alpha = document.getElementById("alpha");
const anguloInicial = document.getElementById("anguloInicial");

const valorRadio = document.getElementById("valorRadio");
const valorOmegaInicial = document.getElementById("valorOmegaInicial");
const valorAlpha = document.getElementById("valorAlpha");
const valorAnguloInicial = document.getElementById("valorAnguloInicial");
const btnModoTiempo = document.getElementById("btnModoTiempo");
const btnModoRevoluciones = document.getElementById("btnModoRevoluciones");

const panelTiempo = document.getElementById("panelTiempo");
const panelRevoluciones = document.getElementById("panelRevoluciones");

const duracionSimulacion = document.getElementById("duracionSimulacion");
const valorDuracion = document.getElementById("valorDuracion");

const revolucionesObjetivo = document.getElementById("revolucionesObjetivo");
const valorRevoluciones = document.getElementById("valorRevoluciones");

const datoTheta = document.getElementById("datoTheta");
const datoOmega = document.getElementById("datoOmega");
const datoTangencial = document.getElementById("datoTangencial");
const datoCentripeta = document.getElementById("datoCentripeta");

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
let modoObjetivo = "tiempo";
let graficaTheta = null;
let graficaOmega = null;
let graficaTangencial = null;
let graficaCentripeta = null;

function limitarValor(valor, minimo, maximo) {
    return Math.min(Math.max(Number(valor), minimo), maximo);
}

function obtenerParametros() {
    const r = Number(radio.value);
    const theta0 = (Number(anguloInicial.value) * Math.PI) / 180;
    const w0 = Number(omegaInicial.value);
    const a = Number(alpha.value);

    return { r, theta0, w0, a };
}

function obtenerDatosFisicos(t) {
    const { r, theta0, w0, a } = obtenerParametros();

    const theta = theta0 + (w0 * t) + (0.5 * a * t * t);
    const omega = w0 + (a * t);
    const velocidadTangencial = omega * r;
    const aceleracionTangencial = a * r;
    const aceleracionCentripeta = (omega * omega) * r;

    return {
        theta,
        omega,
        velocidadTangencial,
        aceleracionTangencial,
        aceleracionCentripeta
    };
}

function obtenerCentro() {
    const ancho = zonaMcuv.clientWidth;
    const alto = zonaMcuv.clientHeight;

    return {
        x: ancho / 2,
        y: alto / 2
    };
}

function actualizarOrbita() {
    const { r } = obtenerParametros();
    const diametro = r * 2;

    orbita.style.width = `${diametro}px`;
    orbita.style.height = `${diametro}px`;
}

function moverPizza(theta) {
    const { r } = obtenerParametros();
    const centro = obtenerCentro();

    /*
        Convención tipo transportador:
        0°   = derecha
        90°  = arriba
        180° = izquierda
        270° = abajo
    */
    const x = centro.x + (r * Math.cos(theta));
    const y = centro.y - (r * Math.sin(theta));

    pizza.style.left = `${x}px`;
    pizza.style.top = `${y}px`;

    return { x, y, centro };
}

function colocarVector(vector, x, y, largo, anguloGrados) {
    vector.style.left = `${x}px`;
    vector.style.top = `${y}px`;
    vector.style.width = `${Math.max(largo, 0)}px`;
    vector.style.transform = `rotate(${anguloGrados}deg)`;
}

function colocarEtiqueta(etiqueta, x, y) {
    etiqueta.style.left = `${x}px`;
    etiqueta.style.top = `${y}px`;
}

function actualizarVectores(theta, datos, posicion) {
    const { r } = obtenerParametros();

    const x = posicion.x;
    const y = posicion.y;
    const centro = posicion.centro;

    /*
        En CSS los ángulos positivos giran hacia abajo.
        Por eso usamos -theta para que 90° apunte hacia arriba.
    */
    const thetaGrados = theta * 180 / Math.PI;
    const anguloRadio = -thetaGrados;

    const sentido = datos.omega >= 0 ? 1 : -1;

    /*
        Si omega es positiva, el movimiento va en sentido antihorario:
        0° derecha -> 90° arriba -> 180° izquierda.
    */
    const anguloTangencial = anguloRadio - (90 * sentido);

    /*
        Aceleración centrípeta siempre apunta hacia el centro.
    */
    const anguloCentripeto = anguloRadio + 180;

    /*
        Aceleración tangencial depende del signo de alpha.
    */
    const anguloAceleracionTangencial = datos.aceleracionTangencial >= 0
        ? anguloRadio - 90
        : anguloRadio + 90;

    const escalaVelocidad = 0.16;
    const escalaAceleracion = 0.018;

    const largoRadio = r;
    const largoTangencial = Math.min(Math.abs(datos.velocidadTangencial) * escalaVelocidad, 180);
    const largoCentripeto = Math.min(Math.abs(datos.aceleracionCentripeta) * escalaAceleracion, 180);
    const largoAT = Math.min(Math.abs(datos.aceleracionTangencial) * escalaAceleracion * 8, 160);

    colocarVector(vectorRadio, centro.x, centro.y, largoRadio, anguloRadio);
    colocarVector(vectorTangencial, x, y, largoTangencial, anguloTangencial);
    colocarVector(vectorCentripeta, x, y, largoCentripeto, anguloCentripeto);
    colocarVector(vectorAceleracionTangencial, x, y, largoAT, anguloAceleracionTangencial);

    colocarEtiqueta(
        etiquetaRadio,
        centro.x + (r * 0.45 * Math.cos(theta)),
        centro.y - (r * 0.45 * Math.sin(theta))
    );

    colocarEtiqueta(
        etiquetaTangencial,
        x + 35 * Math.cos((anguloTangencial * Math.PI) / 180),
        y + 35 * Math.sin((anguloTangencial * Math.PI) / 180)
    );

    colocarEtiqueta(
        etiquetaCentripeta,
        x + 42 * Math.cos((anguloCentripeto * Math.PI) / 180),
        y + 42 * Math.sin((anguloCentripeto * Math.PI) / 180)
    );

    colocarEtiqueta(
        etiquetaAlpha,
        x + 48 * Math.cos((anguloAceleracionTangencial * Math.PI) / 180),
        y + 48 * Math.sin((anguloAceleracionTangencial * Math.PI) / 180)
    );
}

function agregarPuntoRastro(x, y) {
    const punto = document.createElement("span");

    punto.classList.add("punto-rastro");
    punto.style.left = `${x}px`;
    punto.style.top = `${y}px`;

    rastroAngular.appendChild(punto);
}

function limpiarRastro() {
    rastroAngular.innerHTML = "";
}

function actualizarPaneles(datos) {
    tiempoTexto.textContent = tiempo.toFixed(2);

    hudOmega.textContent = datos.omega.toFixed(2);
    hudTheta.textContent = datos.theta.toFixed(2);
    hudVelocidad.textContent = datos.velocidadTangencial.toFixed(2);

    datoTheta.textContent = datos.theta.toFixed(2);
    datoOmega.textContent = datos.omega.toFixed(2);
    datoTangencial.textContent = datos.velocidadTangencial.toFixed(2);
    datoCentripeta.textContent = datos.aceleracionCentripeta.toFixed(2);
}

function ejecutarSimulacion() {
    tiempo += 0.04;

    const datos = obtenerDatosFisicos(tiempo);
    const posicion = moverPizza(datos.theta);

    actualizarVectores(datos.theta, datos, posicion);
    actualizarPaneles(datos);
    agregarPuntoRastro(posicion.x, posicion.y);

    if (debeFinalizarSimulacion(datos)) {
        finalizarSimulacion();
    }
}

function activarModoTiempo() {
    modoObjetivo = "tiempo";

    panelTiempo.classList.remove("d-none");
    panelRevoluciones.classList.add("d-none");

    btnModoTiempo.classList.remove("btn-outline-primary");
    btnModoTiempo.classList.add("btn-primary", "modo-activo");

    btnModoRevoluciones.classList.remove("btn-primary", "modo-activo");
    btnModoRevoluciones.classList.add("btn-outline-primary");

    reiniciarSimulacion();
}

function activarModoRevoluciones() {
    modoObjetivo = "revoluciones";

    panelTiempo.classList.add("d-none");
    panelRevoluciones.classList.remove("d-none");

    btnModoRevoluciones.classList.remove("btn-outline-primary");
    btnModoRevoluciones.classList.add("btn-primary", "modo-activo");

    btnModoTiempo.classList.remove("btn-primary", "modo-activo");
    btnModoTiempo.classList.add("btn-outline-primary");

    reiniciarSimulacion();
}

function obtenerLimiteSimulacion() {
    if (modoObjetivo === "tiempo") {
        return Number(duracionSimulacion.value);
    }

    const revoluciones = Number(revolucionesObjetivo.value);
    return revoluciones * 2 * Math.PI;
}

function debeFinalizarSimulacion(datos) {
    if (modoObjetivo === "tiempo") {
        return tiempo >= Number(duracionSimulacion.value);
    }

    const thetaObjetivo = Number(revolucionesObjetivo.value) * 2 * Math.PI;

    return Math.abs(datos.theta) >= thetaObjetivo;
}

function finalizarSimulacion() {
    clearInterval(intervalo);

    simulando = false;
    pausado = false;

    btnPausar.textContent = "Pausar";

    setTimeout(() => {
        abrirGraficas();
    }, 450);
}


function iniciarSimulacion() {
    if (simulando && !pausado) return;

    simulando = true;
    pausado = false;

    btnPausar.textContent = "Pausar";

    clearInterval(intervalo);

    intervalo = setInterval(() => {
        ejecutarSimulacion();
    }, 40);
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
        }, 40);
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

function actualizarVistaInicial() {
    valorRadio.value = radio.value;
    valorAnguloInicial.value = anguloInicial.value;
    valorOmegaInicial.value = omegaInicial.value;
    valorAlpha.value = alpha.value;

    actualizarOrbita();

    const datos = obtenerDatosFisicos(0);
    const posicion = moverPizza(datos.theta);

    actualizarVectores(datos.theta, datos, posicion);
    actualizarPaneles(datos);
}

function sincronizarControl(slider, input) {
    slider.addEventListener("input", () => {
        input.value = slider.value;
        reiniciarSimulacion();
    });

    input.addEventListener("input", () => {
        const minimo = Number(slider.min);
        const maximo = Number(slider.max);
        const valorLimitado = limitarValor(input.value, minimo, maximo);

        input.value = valorLimitado;
        slider.value = valorLimitado;

        reiniciarSimulacion();
    });
}

function prepararControles() {
    sincronizarControl(radio, valorRadio);
    sincronizarControl(anguloInicial, valorAnguloInicial);
    sincronizarControl(omegaInicial, valorOmegaInicial);
    sincronizarControl(alpha, valorAlpha);
    sincronizarControl(duracionSimulacion, valorDuracion);
    sincronizarControl(revolucionesObjetivo, valorRevoluciones);
}

function generarDatosGraficas() {
    const tiempos = [];
    const thetas = [];
    const omegas = [];
    const tangenciales = [];
    const centripetas = [];

    const limite = modoObjetivo === "tiempo"
        ? Number(duracionSimulacion.value)
        : 30;

    for (let t = 0; t <= limite; t += 0.25) {
        const datos = obtenerDatosFisicos(t);

        tiempos.push(t.toFixed(2));
        thetas.push(Number(datos.theta.toFixed(2)));
        omegas.push(Number(datos.omega.toFixed(2)));
        tangenciales.push(Number(datos.velocidadTangencial.toFixed(2)));
        centripetas.push(Number(datos.aceleracionCentripeta.toFixed(2)));

        if (modoObjetivo === "revoluciones") {
            const thetaObjetivo = Number(revolucionesObjetivo.value) * 2 * Math.PI;

            if (Math.abs(datos.theta) >= thetaObjetivo) {
                break;
            }
        }
    }

    return {
        tiempos,
        thetas,
        omegas,
        tangenciales,
        centripetas
    };
}
function destruirGraficasAnteriores() {
    if (graficaTheta) graficaTheta.destroy();
    if (graficaOmega) graficaOmega.destroy();
    if (graficaTangencial) graficaTangencial.destroy();
    if (graficaCentripeta) graficaCentripeta.destroy();

    graficaTheta = null;
    graficaOmega = null;
    graficaTangencial = null;
    graficaCentripeta = null;
}

function crearGrafica(canvasId, etiqueta, datos, colorBorde, colorFondo, labels) {
    return new Chart(document.getElementById(canvasId), {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: etiqueta,
                    data: datos,
                    borderColor: colorBorde,
                    backgroundColor: colorFondo,
                    fill: true,
                    tension: 0.35
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: "#ffffff",
                        font: {
                            weight: "bold"
                        }
                    }
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
        }
    });
}

function crearGraficas() {
    destruirGraficasAnteriores();

    const datos = generarDatosGraficas();

    graficaTheta = crearGrafica(
        "graficaTheta",
        "θ (rad)",
        datos.thetas,
        "#facc15",
        "rgba(250, 204, 21, 0.18)",
        datos.tiempos
    );

    graficaOmega = crearGrafica(
        "graficaOmega",
        "ω (rad/s)",
        datos.omegas,
        "#38bdf8",
        "rgba(56, 189, 248, 0.18)",
        datos.tiempos
    );

    graficaTangencial = crearGrafica(
        "graficaTangencial",
        "v = ωR (m/s)",
        datos.tangenciales,
        "#22c55e",
        "rgba(34, 197, 94, 0.18)",
        datos.tiempos
    );

    graficaCentripeta = crearGrafica(
        "graficaCentripeta",
        "ac = ω²R (m/s²)",
        datos.centripetas,
        "#ef4444",
        "rgba(239, 68, 68, 0.18)",
        datos.tiempos
    );
}
function crearNumerosXMcuv() {
    const contenedor = document.getElementById("numerosXMcuv");

    if (!contenedor) return;

    contenedor.innerHTML = "";

    const ancho = zonaMcuv.clientWidth;
    const centroX = ancho / 2;

    for (let valor = -200; valor <= 200; valor += 50) {
        const numero = document.createElement("span");
        const x = centroX + valor;

        numero.classList.add("numero-x-mcuv");

        if (valor === 0) {
            numero.classList.add("cero");
        }

        numero.style.left = `${x}px`;
        numero.textContent = `${valor}`;

        contenedor.appendChild(numero);
    }
}

function crearNumerosYMcuv() {
    const contenedor = document.getElementById("numerosYMcuv");

    if (!contenedor) return;

    contenedor.innerHTML = "";

    const alto = zonaMcuv.clientHeight;
    const centroY = alto / 2;

    for (let valor = -200; valor <= 200; valor += 50) {
        const numero = document.createElement("span");
        const y = centroY - valor;

        numero.classList.add("numero-y-mcuv");

        if (valor === 0) {
            numero.classList.add("cero");
        }

        numero.style.top = `${y}px`;
        numero.textContent = `${valor}`;

        contenedor.appendChild(numero);
    }
}

function crearCuadriculaMcuv() {
    crearNumerosXMcuv();
    crearNumerosYMcuv();
}

function abrirGraficas() {
    pantallaGraficas.classList.add("activa");
    crearGraficas();
}

function cerrarGraficas() {
    pantallaGraficas.classList.remove("activa");
}
btnModoTiempo.addEventListener("click", activarModoTiempo);
btnModoRevoluciones.addEventListener("click", activarModoRevoluciones);
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
    crearCuadriculaMcuv();
    reiniciarSimulacion();
});

prepararControles();
crearCuadriculaMcuv();
activarModoTiempo();
actualizarVistaInicial();