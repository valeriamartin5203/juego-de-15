
"use strict";

// ============================================
// CONFIGURACIÓN DEL JUEGO
// ============================================

const META = [
    1, 2, 3, 4,
    5, 6, 7, 8,
    9, 10, 11, 12,
    13, 14, 15, 0
];

const TAMANO = 4;
const MAX_NODOS = 120000;

let tablero = [...META];
let tableroInicial = [...META];
let movimientos = 0;
let inicioTiempo = null;
let intervaloTiempo = null;
let bloqueado = false;
let partidaFinalizada = false;

function leerPuntaje(clave) {
    const valor = Number(localStorage.getItem(clave));
    return Number.isFinite(valor) && valor >= 0 ? valor : 0;
}

let victorias = leerPuntaje("juego15Victorias");
let derrotas = leerPuntaje("juego15Derrotas");

// Elementos HTML
const elementoTablero = document.getElementById("tablero");
const elementoMovimientos = document.getElementById("movimientos");
const elementoTiempo = document.getElementById("tiempo");
const elementoEstado = document.getElementById("estado");
const elementoMensaje = document.getElementById("mensaje");
const elementoNodos = document.getElementById("nodos");
const elementoPasos = document.getElementById("pasos");
const elementoVictorias = document.getElementById("victorias");
const elementoDerrotas = document.getElementById("derrotas");

const btnMezclar = document.getElementById("btnMezclar");
const btnResolver = document.getElementById("btnResolver");
const btnReiniciar = document.getElementById("btnReiniciar");

// ============================================
// DIBUJAR EL TABLERO
// ============================================

function dibujarTablero() {
    elementoTablero.innerHTML = "";

    tablero.forEach((numero, indice) => {
        const ficha = document.createElement("button");

        ficha.type = "button";
        ficha.className = "ficha";
        ficha.setAttribute(
            "aria-label",
            numero === 0 ? "Espacio vacío" : `Ficha ${numero}`
        );

        if (numero === 0) {
            ficha.classList.add("vacia");
            ficha.textContent = "";
            ficha.disabled = true;
        } else {
            ficha.textContent = numero;
            ficha.disabled = bloqueado;
            ficha.addEventListener("click", () => moverFicha(indice));
        }

        elementoTablero.appendChild(ficha);
    });

    elementoMovimientos.textContent = movimientos;
}

function mostrarMensaje(texto) {
    elementoMensaje.textContent = texto;
}

function actualizarBotones() {
    btnMezclar.disabled = bloqueado;
    btnResolver.disabled = bloqueado;
    btnReiniciar.disabled = bloqueado;
}

// ============================================
// MOVIMIENTOS DEL JUGADOR
// ============================================

function sonAdyacentes(indiceA, indiceB) {
    const filaA = Math.floor(indiceA / TAMANO);
    const columnaA = indiceA % TAMANO;

    const filaB = Math.floor(indiceB / TAMANO);
    const columnaB = indiceB % TAMANO;

    return (
        Math.abs(filaA - filaB) +
        Math.abs(columnaA - columnaB)
    ) === 1;
}

function moverFicha(indice) {
    if (bloqueado) return;

    const indiceVacio = tablero.indexOf(0);

    if (!sonAdyacentes(indice, indiceVacio)) {
        mostrarMensaje(
            "Solo puedes mover una ficha que esté junto al espacio vacío."
        );
        return;
    }

    [tablero[indice], tablero[indiceVacio]] =
        [tablero[indiceVacio], tablero[indice]];

    movimientos++;

    iniciarCronometro();
    dibujarTablero();

    if (estaResuelto(tablero)) {
        registrarResultado("victoria");
        finalizarPartida("¡Felicidades! Has resuelto el juego.", "Victoria");
    } else {
        elementoEstado.textContent = "Jugando";
        mostrarMensaje("¡Bien! Sigue ordenando las fichas.");
    }
}

// ============================================
// COMPROBAR SI EL JUEGO ESTÁ RESUELTO
// ============================================

function estaResuelto(estado) {
    return estado.every((numero, indice) => numero === META[indice]);
}

// ============================================
// CRONÓMETRO
// ============================================

function iniciarCronometro() {
    if (inicioTiempo !== null) return;

    inicioTiempo = Date.now();

    intervaloTiempo = setInterval(() => {
        const segundos = Math.floor(
            (Date.now() - inicioTiempo) / 1000
        );

        const minutos = Math.floor(segundos / 60);
        const restantes = segundos % 60;

        elementoTiempo.textContent =
            String(minutos).padStart(2, "0") + ":" +
            String(restantes).padStart(2, "0");
    }, 250);
}

function detenerCronometro() {
    if (intervaloTiempo !== null) {
        clearInterval(intervaloTiempo);
        intervaloTiempo = null;
    }
}

function finalizarPartida(mensaje, estado = "Resuelto") {
    detenerCronometro();
    elementoEstado.textContent = estado;
    mostrarMensaje(mensaje);
}

function registrarResultado(tipo) {
    if (partidaFinalizada) return;

    partidaFinalizada = true;

    if (tipo === "victoria") {
        victorias++;
        localStorage.setItem("juego15Victorias", victorias);
        elementoVictorias.textContent = victorias;
    } else {
        derrotas++;
        localStorage.setItem("juego15Derrotas", derrotas);
        elementoDerrotas.textContent = derrotas;
    }
}

// ============================================
// MEZCLAR EL TABLERO
// ============================================

function mezclarTablero() {
    if (bloqueado) return;

    detenerCronometro();
    inicioTiempo = null;
    movimientos = 0;
    partidaFinalizada = false;

    const tableroAnterior = tableroInicial.join(",");
    do {
        tablero = [...META];
        let indiceAnterior = -1;
        const cantidadMovimientos = 24 + Math.floor(Math.random() * 13);

        for (let i = 0; i < cantidadMovimientos; i++) {
            const vacio = tablero.indexOf(0);
            const vecinos = obtenerVecinos(vacio).filter(
                indice => indice !== indiceAnterior
            );
            const elegido =
                vecinos[Math.floor(Math.random() * vecinos.length)];

            [tablero[vacio], tablero[elegido]] =
                [tablero[elegido], tablero[vacio]];
            indiceAnterior = vacio;
        }
    } while (estaResuelto(tablero) || tablero.join(",") === tableroAnterior);

    tableroInicial = [...tablero];

    elementoTiempo.textContent = "00:00";
    elementoNodos.textContent = "0";
    elementoPasos.textContent = "0";
    elementoEstado.textContent = "Listo";

    dibujarTablero();
    mostrarMensaje(
        "Tablero mezclado. Resuélvelo tú o utiliza el botón Resolver con A*."
    );
}

function reiniciarJuego() {
    if (bloqueado) return;

    detenerCronometro();
    inicioTiempo = null;
    tablero = [...tableroInicial];
    movimientos = 0;
    partidaFinalizada = false;

    elementoTiempo.textContent = "00:00";
    elementoNodos.textContent = "0";
    elementoPasos.textContent = "0";
    elementoEstado.textContent = "Listo";

    dibujarTablero();
    mostrarMensaje("Partida reiniciada. ¡Inténtalo de nuevo!");
}

// ============================================
// A*: ALGORITMO DE BÚSQUEDA
// ============================================

// Obtener posiciones vecinas de una casilla.
function obtenerVecinos(indice) {
    const fila = Math.floor(indice / TAMANO);
    const columna = indice % TAMANO;
    const vecinos = [];

    if (fila > 0) vecinos.push(indice - TAMANO);
    if (fila < TAMANO - 1) vecinos.push(indice + TAMANO);
    if (columna > 0) vecinos.push(indice - 1);
    if (columna < TAMANO - 1) vecinos.push(indice + 1);

    return vecinos;
}

// Distancia Manhattan: suma las distancias de cada
// ficha a su posición correcta, sin contar el cero.
function distanciaManhattan(estado) {
    let distancia = 0;

    for (let indice = 0; indice < estado.length; indice++) {
        const numero = estado[indice];

        if (numero === 0) continue;

        const destino = numero - 1;

        const filaActual = Math.floor(indice / TAMANO);
        const columnaActual = indice % TAMANO;

        const filaDestino = Math.floor(destino / TAMANO);
        const columnaDestino = destino % TAMANO;

        distancia +=
            Math.abs(filaActual - filaDestino) +
            Math.abs(columnaActual - columnaDestino);
    }

    return distancia;
}

// ============================================
// COLA DE PRIORIDAD (MIN-HEAP)
// Extrae primero el nodo con menor f(n) = g(n) + h(n)
// ============================================

class ColaPrioridad {
    constructor() {
        this.elementos = [];
    }

    get length() {
        return this.elementos.length;
    }

    insertar(nodo) {
        this.elementos.push(nodo);

        let indice = this.elementos.length - 1;

        while (indice > 0) {
            const padre = Math.floor((indice - 1) / 2);

            if (!this.esMenor(
                this.elementos[indice],
                this.elementos[padre]
            )) break;

            [this.elementos[indice], this.elementos[padre]] =
                [this.elementos[padre], this.elementos[indice]];

            indice = padre;
        }
    }

    extraer() {
        if (this.elementos.length === 0) return null;

        const primero = this.elementos[0];
        const ultimo = this.elementos.pop();

        if (this.elementos.length > 0) {
            this.elementos[0] = ultimo;
            this.bajar(0);
        }

        return primero;
    }

    esMenor(a, b) {
        if (a.f !== b.f) return a.f < b.f;
        return a.h < b.h;
    }

    bajar(indice) {
        const longitud = this.elementos.length;

        while (true) {
            let menor = indice;
            const izquierda = 2 * indice + 1;
            const derecha = 2 * indice + 2;

            if (
                izquierda < longitud &&
                this.esMenor(
                    this.elementos[izquierda],
                    this.elementos[menor]
                )
            ) {
                menor = izquierda;
            }

            if (
                derecha < longitud &&
                this.esMenor(
                    this.elementos[derecha],
                    this.elementos[menor]
                )
            ) {
                menor = derecha;
            }

            if (menor === indice) break;

            [this.elementos[indice], this.elementos[menor]] =
                [this.elementos[menor], this.elementos[indice]];

            indice = menor;
        }
    }
}

// ============================================
// BUSCAR SOLUCIÓN CON A*
// ============================================

async function resolverAEstrella() {
    if (bloqueado) return;

    if (estaResuelto(tablero)) {
        mostrarMensaje("El tablero ya está resuelto.");
        return;
    }

    bloqueado = true;
    actualizarBotones();

    detenerCronometro();
    iniciarCronometro();

    elementoEstado.textContent = "Buscando";
    elementoNodos.textContent = "0";
    elementoPasos.textContent = "0";

    mostrarMensaje(
        "A* está explorando estados. Esto puede tardar según la dificultad."
    );

    // Copiamos el tablero inicial para trabajar con él.
    const inicial = [...tablero];
    const claveInicial = inicial.join(",");

    const abiertos = new ColaPrioridad();

    // g(n): costo real; h(n): heurística; f(n): g(n) + h(n).
    const heuristicaInicial = distanciaManhattan(inicial);

    abiertos.insertar({
        estado: inicial,
        clave: claveInicial,
        g: 0,
        h: heuristicaInicial,
        f: heuristicaInicial,
        padre: null
    });

    // Mejor costo g encontrado para cada estado.
    const mejoresCostos = new Map();
    mejoresCostos.set(claveInicial, 0);

    let explorados = 0;
    let solucion = null;

    try {
        while (abiertos.length > 0 && explorados < MAX_NODOS) {
            const actual = abiertos.extraer();

            // Ignorar nodos que ya tienen un camino mejor.
            if (actual.g !== mejoresCostos.get(actual.clave)) {
                continue;
            }

            explorados++;

            if (explorados % 500 === 0) {
                elementoNodos.textContent =
                    explorados.toLocaleString("es-MX");

                // Permite que el navegador actualice la interfaz.
                await new Promise(resolve => setTimeout(resolve, 0));
            }

            if (estaResuelto(actual.estado)) {
                solucion = actual;
                break;
            }

            const indiceVacio = actual.estado.indexOf(0);

            for (const vecino of obtenerVecinos(indiceVacio)) {
                const siguiente = [...actual.estado];

                // Mover una ficha al espacio vacío.
                [siguiente[indiceVacio], siguiente[vecino]] =
                    [siguiente[vecino], siguiente[indiceVacio]];

                const clave = siguiente.join(",");
                const nuevoG = actual.g + 1;

                const costoAnterior = mejoresCostos.get(clave);

                if (
                    costoAnterior !== undefined &&
                    nuevoG >= costoAnterior
                ) {
                    continue;
                }

                const h = distanciaManhattan(siguiente);

                const nuevoNodo = {
                    estado: siguiente,
                    clave: clave,
                    g: nuevoG,
                    h: h,
                    f: nuevoG + h,
                    padre: actual
                };

                mejoresCostos.set(clave, nuevoG);
                abiertos.insertar(nuevoNodo);
            }
        }

        elementoNodos.textContent =
            explorados.toLocaleString("es-MX");

        if (solucion === null) {
            elementoEstado.textContent = "Sin solución";
            mostrarMensaje(
                `No se encontró una solución dentro del límite de ${MAX_NODOS.toLocaleString("es-MX")} nodos. ` +
                "Prueba a mezclar de nuevo el tablero."
            );
            return;
        }

        // Reconstruir el camino desde la meta hasta el inicio.
        const camino = [];
        let nodo = solucion;

        while (nodo !== null) {
            camino.push(nodo.estado);
            nodo = nodo.padre;
        }

        camino.reverse();

        elementoPasos.textContent = String(camino.length - 1);
        elementoEstado.textContent = "Solución";
        registrarResultado("derrota");
        mostrarMensaje(
            `¡Solución encontrada! A* encontró una ruta de ${camino.length - 1} movimientos.`
        );

        // Reproducir los estados encontrados.
        for (let i = 1; i < camino.length; i++) {
            tablero = [...camino[i]];
            movimientos++;
            dibujarTablero();

            await new Promise(resolve => setTimeout(resolve, 180));
        }

        finalizarPartida(
            `¡Resuelto por A*! La solución utilizó ${camino.length - 1} movimientos.`,
            "Derrota"
        );

    } catch (error) {
        console.error("Error durante la búsqueda A*:", error);
        elementoEstado.textContent = "Error";
        mostrarMensaje("Ocurrió un error al resolver el tablero.");
    } finally {
        bloqueado = false;
        actualizarBotones();
    }
}

// ============================================
// CONECTAR LOS BOTONES
// ============================================

btnMezclar.addEventListener("click", mezclarTablero);
btnResolver.addEventListener("click", resolverAEstrella);
btnReiniciar.addEventListener("click", reiniciarJuego);

// Estado inicial
elementoVictorias.textContent = victorias;
elementoDerrotas.textContent = derrotas;
mezclarTablero();
