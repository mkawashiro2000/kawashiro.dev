---
title: "Construyendo una terminal que los visitantes de verdad quieren usar"
description: "La shell interactiva de kawashiro.dev: salida typewriter, telemetría real, un guestbook en SQLite, juegos y los easter eggs que todo dev intenta."
pubDate: 2026-07-23
tags: ["react", "typescript", "ux", "terminal"]
---

El modo PRO de este sitio es una terminal falsa — pero del mejor tipo de falsedad: todo lo que *muestra* es real, solo la shell en sí es teatro. Esto es lo que hizo falta para que se sienta viva.

## La capa de ilusión

Un emulador de terminal convence por los detalles pequeños, no por las funciones grandes:

- **Secuencia de boot.** Al entrar al modo PRO se reproducen líneas `[  OK  ]` estilo systemd con cadencia de 110ms antes de que aparezca el prompt. Puro teatro, credibilidad instantánea.
- **Salida typewriter.** La salida de los comandos se vacía de una cola a ~26ms por línea en vez de aparecer de golpe. `Ctrl+L` limpia, `Ctrl+C` imprime el clásico `^C`.
- **Autocompletado con Tab.** Un trie sobre el léxico de comandos; los prefijos ambiguos imprimen los candidatos en columnas, como bash.
- **Una cola, no una cadena de `setTimeout`.** Toda la salida pasa por un solo bucle de drenado, así que un tecleador rápido no puede entrelazar la salida de dos comandos.

## La capa real

Lo convincente es que los datos no son de mentira:

- `htop` abre un stream de Server-Sent Events con la CPU, RAM y temperatura del SoC reales de la Raspberry Pi que sirve la página, con un sparkline ASCII de los últimos 60 segundos.
- `neofetch` consulta `/api/v1/sysinfo` — versión real del kernel, uptime real, load average real.
- `weather` muestra el clima en vivo de Constanza, donde el servidor está físicamente, vía Open-Meteo con caché de 10 minutos.
- `guestbook sign <mensaje>` escribe en una base SQLite dentro de la Pi (limitado a una firma por IP por minuto, tope de 500 filas).

## La capa divertida

Todo dev teclea las mismas cosas en una terminal ajena. Todas están cubiertas:

- `sudo rm -rf /` → un descenso dramático a `/var/lib/sueños`, abortado por "instinto de protección".
- `sudo apt update` → una actualización de Debian plausible que termina abriendo un video que no pediste.
- `matrix` → lluvia de katakana a pantalla completa en un canvas. Cualquier tecla te despierta.
- `cowsay`, `fortune`, y sí, `fortune | cowsay` funciona.
- `typing` → test de WPM, porque una terminal es un lugar de teclado ante todo.

## Lo que le diría a quien construya una

1. Haz la salida honesta. Un número real vale más que diez dashboards falsos.
2. Respeta la memoria muscular: flechas para el historial, Tab para completar, Ctrl+L, Ctrl+C. Romper eso rompe el hechizo.
3. El móvil necesita otro contrato — input de 16px (o iOS hace zoom), sin robo de foco al scrollear, chips de comandos en vez de teclear.
