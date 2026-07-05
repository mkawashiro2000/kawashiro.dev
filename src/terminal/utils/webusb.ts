/**
 * webusb.ts — Interfaz de hardware tangible (WebUSB / ESC/POS).
 *
 * Rompe la caja de arena del navegador para interceptar el bus USB físico de
 * una impresora térmica de Punto de Venta (EPSON y compatibles) e inyectar
 * tramas binarias imperativas del protocolo ESC/POS.
 *
 * El comando `print resume` de la Terminal UI invoca `printResumeToThermal`,
 * pasando un callback de log que refleja cada paso en el búfer de la terminal.
 */

// Comandos ESC/POS de bajo nivel (hexadecimales imperativos).
const ESC = 0x1b;
const GS = 0x1d;

const CMD_INIT = [ESC, 0x40]; // ESC @  -> Reinicializar la impresora
const CMD_ALIGN_CENTER = [ESC, 0x61, 0x01]; // ESC a 1
const CMD_ALIGN_LEFT = [ESC, 0x61, 0x00]; // ESC a 0
const CMD_BOLD_ON = [ESC, 0x45, 0x01]; // ESC E 1
const CMD_BOLD_OFF = [ESC, 0x45, 0x00]; // ESC E 0
const CMD_DOUBLE_SIZE = [GS, 0x21, 0x11]; // GS ! 0x11 -> doble alto y ancho
const CMD_NORMAL_SIZE = [GS, 0x21, 0x00]; // GS ! 0
const CMD_FEED_CUT = [GS, 0x56, 0x41, 0x03]; // GS V A n -> avanzar y corte parcial

// Identificador de clase USB de impresoras (bInterfaceClass = 7).
const USB_PRINTER_CLASS = 0x07;

type LogFn = (msg: string) => void;

/**
 * Serializa una cadena ASCII a bytes para el flujo ESC/POS.
 * Las impresoras térmicas usan una tabla de códigos de un solo byte.
 */
function encodeText(text: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < text.length; i++) {
    bytes.push(text.charCodeAt(i) & 0xff);
  }
  return bytes;
}

function line(text = ''): number[] {
  return [...encodeText(text), 0x0a]; // LF
}

/**
 * Construye la trama binaria completa del currículo vital.
 */
function buildResumeFrame(): Uint8Array {
  const payload: number[] = [
    ...CMD_INIT,
    ...CMD_ALIGN_CENTER,
    ...CMD_DOUBLE_SIZE,
    ...CMD_BOLD_ON,
    ...line('MITSUNORI KAWASHIRO'),
    ...CMD_NORMAL_SIZE,
    ...CMD_BOLD_OFF,
    ...line('Ingenieria de Software // Zero Trust Edge'),
    ...line('--------------------------------'),
    ...CMD_ALIGN_LEFT,
    ...line('PERFIL'),
    ...line(' Arquitecturas ASGI concurrentes,'),
    ...line(' criptografia fiscal (DGII e-CF) e'),
    ...line(' infraestructura ARM64 autogestionada.'),
    ...line(),
    ...line('STACK'),
    ...line(' Astro / React / Zustand'),
    ...line(' FastAPI / SSE / Docker'),
    ...line(' Cloudflare Zero Trust'),
    ...line(),
    ...line('CONTACTO'),
    ...line(' https://kawashiro.dev'),
    ...line(),
    ...CMD_ALIGN_CENTER,
    ...line('* Impreso via WebUSB ESC/POS *'),
    ...CMD_FEED_CUT,
  ];
  return new Uint8Array(payload);
}

/**
 * Solicita al usuario una impresora USB, reclama la interfaz y despacha la trama.
 * Cada paso se refleja en la terminal mediante `log`.
 */
export async function printResumeToThermal(log: LogFn): Promise<void> {
  // `navigator.usb` solo existe en contextos seguros (https / localhost) y
  // en navegadores basados en Chromium con WebUSB habilitado.
  const usb = (navigator as unknown as { usb?: USB }).usb;

  if (!usb) {
    log('[ERROR] WebUSB no esta disponible en este navegador o contexto.');
    log('        Requiere Chromium sobre un origen seguro (https/localhost).');
    return;
  }

  let device: USBDevice | undefined;

  try {
    // Filtramos por dispositivos que expongan la clase de impresora USB.
    device = await usb.requestDevice({
      filters: [{ classCode: USB_PRINTER_CLASS }],
    });
  } catch {
    log('[ABORTADO] No se selecciono ninguna impresora.');
    return;
  }

  try {
    log(`Dispositivo interceptado: ${device.productName ?? 'USB Printer'}`);
    await device.open();

    if (device.configuration === null) {
      await device.selectConfiguration(1);
    }

    // Localizamos la interfaz de impresora y su endpoint OUT (bulk).
    const iface = device.configuration?.interfaces.find((i) =>
      i.alternate.interfaceClass === USB_PRINTER_CLASS,
    );

    if (!iface) {
      log('[ERROR] El dispositivo no expone una interfaz de impresora ESC/POS.');
      await device.close();
      return;
    }

    await device.claimInterface(iface.interfaceNumber);

    const endpoint = iface.alternate.endpoints.find(
      (e) => e.direction === 'out' && e.type === 'bulk',
    );

    if (!endpoint) {
      log('[ERROR] No se encontro un endpoint OUT bulk para el flujo binario.');
      await device.close();
      return;
    }

    log('Interfaz reclamada. Inyectando trama hexadecimal ESC/POS...');
    const frame = buildResumeFrame();
    await device.transferOut(endpoint.endpointNumber, frame);

    log(`Trama de ${frame.byteLength} bytes despachada al bus fisico.`);
    log('[OK] Impresion mecanica del CV completada.');

    await device.releaseInterface(iface.interfaceNumber);
    await device.close();
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    log(`[ERROR] Fallo en la transferencia USB: ${detail}`);
    try {
      await device?.close();
    } catch {
      /* La impresora ya pudo haberse desconectado del bus. */
    }
  }
}
