const cards = document.querySelectorAll(".card-simulador");
const textoModulo = document.getElementById("textoModulo");

const descripciones = {
    "MRU y MRUV": "En este módulo podrás analizar posición, velocidad, aceleración y tiempo en movimientos rectilíneos.",
    "Caída Libre": "Aquí estudiarás cómo los cuerpos caen bajo la acción de la gravedad y cómo cambia su velocidad.",
    "Tiro Parabólico": "Este módulo permite visualizar trayectorias curvas, componentes de velocidad, alcance horizontal y altura máxima.",
    "MCUV": "En este módulo estudiarás el movimiento circular uniformemente variado mediante radio, velocidad angular, aceleración angular, periodo y revoluciones."
};
window.addEventListener("load", () => {
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add("visible");
        }, index * 180);
    });
});

cards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
        const modulo = card.dataset.modulo;
        textoModulo.textContent = descripciones[modulo];
    });

    card.addEventListener("mouseleave", () => {
        textoModulo.textContent = "Pasa el cursor sobre un módulo para ver una breve descripción.";
    });

    card.addEventListener("mousemove", (evento) => {
        const rect = card.getBoundingClientRect();

        const x = evento.clientX - rect.left;
        const y = evento.clientY - rect.top;

        const centroX = rect.width / 2;
        const centroY = rect.height / 2;

        const rotacionX = ((y - centroY) / centroY) * -6;
        const rotacionY = ((x - centroX) / centroX) * 6;

        card.style.transform = `translateY(-16px) scale(1.02) rotateX(${rotacionX}deg) rotateY(${rotacionY}deg)`;
    });

    card.addEventListener("mouseleave", () => {
        card.style.transform = "";
    });
});