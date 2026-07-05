kawashiro.dev | Ecosistema Web Dual-Mode
Ingeniería de Software, Infraestructura Zero Trust y Criptografía Fiscal
Este repositorio contiene el código fuente y la especificación arquitectónica de mi portafolio web personal. Más que una exhibición estática, el dominio opera como un Ecosistema Dual: un embudo de conversión limpio para perfiles ejecutivos y una demostración pragmática de ingeniería de sistemas de alto nivel para líderes técnicos.
El Paradigma Dual
La arquitectura bifurca la experiencia del usuario para satisfacer dos expectativas cognitivas diametralmente opuestas, manteniendo un estado global estrictamente coherente entre ambas:
Modo Casual (Business UI): Diseño minimalista y accesible. Optimizado para reclutadores y gerentes, prioriza la jerarquía visual de resultados corporativos y un rendimiento extremo (Core Web Vitals prístinos con latencia cero).
Modo PRO (Terminal UI): Un emulador de línea de comandos (CLI) renderizado en el cliente. Permite a los ingenieros evaluar el ecosistema mediante comandos UNIX, telemetría real del servidor y ejecución de scripts interactivos.
Arquitectura de Renderizado (Frontend)
El contenedor principal emplea un paradigma de Arquitectura de Islas impulsado por Astro, garantizando la máxima eficiencia en la entrega de contenido, mientras encapsula la carga computacional en React.
Especificación	Tecnología	Implementación Estratégica
Meta-Framework	Astro	Payload inicial de JavaScript de 0 KB para el Modo Casual. HTML estático puro servido en < 50ms (TTFB).
Contenedor Interactivo	React	Hibridación aislada. El emulador de terminal se carga selectivamente (client:load) sin bloquear el hilo principal.
Gestión de Estado	Zustand	Puente ininterrumpido entre modos. Implementa selectores atómicos y almacenamiento persistente seguro contra discrepancias de hidratación (Hydration Mismatches).
Sistema de Diseño	Tailwind CSS v4	Motor CSS-first (@theme). Permutación instantánea del sistema visual mediante cascada de variables nativas, con coste computacional nulo.
Ingeniería del Motor CLI (Modo PRO)
La Terminal UI no es una animación genérica; es un analizador sintáctico construido sobre fundamentos de ciencias de la computación:
Algoritmia Lexical: Operado mediante un modelo síncrono de extracción (pull update) que divide cadenas en tokens estructurales y enruta argumentos asíncronamente.
Autocompletado de Alto Rendimiento: Intercepción nativa del teclado (Tabulación) conectada a una estructura de datos de árbol Trie, resolviendo prefijos predictivos en tiempo constante.
Retención de Memoria Muscular: Emulación exacta del historial direccional (flechas arriba/abajo) inyectando la matriz inmutable de ejecuciones previas al búfer de React.
Cinemática y Renderizado Físico (GPU)
El cambio de contexto entre interfaces impone peso tecnológico mediante transiciones espaciales controladas:
Coreografía Espacial (Framer Motion): Transición 3D Fold impulsada por una ecuación diferencial de oscilador armónico amortiguado para rotación en perspectiva física:
m 
dt 
2
 
d 
2
 x
​	
 +c 
dt
dx
​	
 +kx=0
Shaders Analógicos CSS: Efectos estéticos Glitch y distorsión de tubos de rayos catódicos (CRT). Operados 100% mediante polígonos CSS (clip-path) en la GPU para evadir caídas de framerate en el hilo de JavaScript.
Backend, Telemetría y SecOps (Homelab Edge)
La plataforma interactúa en vivo con un entorno de hardware autogestionado sobre arquitecturas ARM64 (Raspberry Pi OS Lite).
Microservicio Concurrente: Cimentado en FastAPI (Python) bajo especificaciones ASGI para rendimiento superlativo.
Transmisión de Hardware (SSE): Sustituye WebSockets bidireccionales por Server-Sent Events para inyectar telemetría en tiempo real (consumos de RAM, CPU) directamente al comando htop del cliente.
Contenedorización Efímera: Dockerfiles multi-stage que aplican ejecución exec form, transfiriendo el PID 1 al intérprete para garantizar cierres y apagados resilientes (graceful shutdowns).
Infraestructura Zero Trust: El ecosistema repudia el Port Forwarding. Un demonio de Cloudflare Tunnels crea túneles salientes y encriptados, absorbiendo ataques volumétricos perimetrales sin exponer direcciones IP de origen locales.
Integraciones Radicales (Casos de Uso)
1. Interfaz de Hardware Tangible (WebUSB)
El comando print resume rompe la caja de arena del navegador. Utiliza protocolos binarios ESC/POS de EPSON mediante la API WebUSB para interceptar buses físicos de la red local, inyectar tramas hexadecimales imperativas y ejecutar impresión mecánica del currículo vital en dispositivos térmicos (Punto de Venta) con algoritmos de entramado (dithering).
2. Criptografía Fiscal Institucional (DGII)
Mediante el comando cat dgii-xml-signer.md, se audita un caso de estudio extraído del sistema Lex32. Demuestra dominio empresarial en la canonicalización estructural XML (C14N) y firma digital inmutable mediante infraestructura de clave pública (X.509 RSA-SHA256) exigidas por las regulaciones del Estado para la Facturación Electrónica B2B (e-CF).
Desarrollado pragmáticamente por Mitsunori Kawashiro Batista.
