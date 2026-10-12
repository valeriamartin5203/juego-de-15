# Juego del 15

Juego de puzzle en el navegador. El objetivo es ordenar las fichas del 1 al 15; también puedes ver cómo el algoritmo A* encuentra y reproduce una solución.

## Cómo jugar

1. Abre `index.html` en un navegador moderno. No necesitas instalar dependencias ni iniciar un servidor.
2. Pulsa una ficha que esté junto al espacio vacío para moverla.
3. Ordena las fichas hasta dejar el espacio vacío al final:

```text
 1   2   3   4
 5   6   7   8
 9  10  11  12
13  14  15   _
```

## Controles y marcador

- **Mezclar fichas:** inicia una nueva partida con un tablero aleatorio y resoluble.
- **Resolver con A*:** busca una solución y la muestra paso a paso. Si A* resuelve el tablero, se registra como derrota del jugador.
- **Reiniciar:** vuelve al tablero inicial de la partida actual sin cambiar el marcador.
- Resolver el tablero manualmente registra una victoria.

El juego muestra movimientos, tiempo, estado, nodos explorados y pasos de la solución. Las victorias y derrotas se guardan en el almacenamiento local del navegador, por lo que se conservan entre visitas en ese navegador.

## Algoritmo A*

A* prioriza estados usando $f(n) = g(n) + h(n)$:

- $g(n)$ es el número de movimientos desde el inicio.
- $h(n)$ es la distancia Manhattan estimada hasta la meta.
- $f(n)$ combina el costo recorrido y el costo estimado restante.

La búsqueda utiliza una cola de prioridad y explora como máximo 120,000 nodos por intento. La mezcla se genera aplicando movimientos legales desde el tablero resuelto, así que siempre conserva una solución.

## Archivos

- `index.html`: estructura y contenido de la página.
- `styles.css`: diseño adaptable, fichas amarillas y textura de madera del tablero.
- `script.js`: reglas, cronómetro, marcador y búsqueda A*.

## Tecnologías

HTML, CSS y JavaScript, sin bibliotecas externas.

## Pagina web
El juego esta subido en render como un sitio externo, este es el link:

https://juego-de-15.onrender.com

