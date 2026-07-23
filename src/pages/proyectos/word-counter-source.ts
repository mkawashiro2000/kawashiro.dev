/**
 * word-counter-source.ts — versión Python del contador de palabras.
 * Equivalente exacto del análisis que corre en el navegador, empaquetado como
 * CLI interactiva para que cualquiera pueda copiarlo y ejecutarlo local.
 */
export const PYTHON_SOURCE = String.raw`import re
import sys

class ContadorTexto:
    """
    Analiza la composición de un texto: palabras, caracteres, dígitos
    y símbolos especiales. Mismas reglas que la versión web.
    """

    # Dígitos del 0 al 9
    PATRON_DIGITO = re.compile(r'[0-9]')

    # Todo lo que no sea letra (incluidas acentuadas), número o espacio:
    # signos de puntuación, símbolos, emojis...
    PATRON_ESPECIAL = re.compile(r'[^a-zA-ZÀ-ÿ0-9\s]')

    def analizar(self, texto):
        # split() sin argumentos separa por cualquier bloque de espacios
        # y descarta los extremos, así que "  hola   mundo " -> 2 palabras.
        palabras = texto.split() if texto.strip() else []

        return {
            'palabras': len(palabras),
            'caracteres': len(texto),
            'digitos': len(self.PATRON_DIGITO.findall(texto)),
            'especiales': len(self.PATRON_ESPECIAL.findall(texto)),
        }

if __name__ == "__main__":
    contador = ContadorTexto()

    print("=== Contador de Palabras Interactivo ===")
    print("Escribe tu texto y presiona Enter. Escribe 'salir' para terminar.\n")

    while True:
        try:
            texto_usuario = input("ingresa texto> ")
        except (KeyboardInterrupt, EOFError):
            print("\nSaliendo del programa...")
            sys.exit(0)

        if texto_usuario.strip().lower() == 'salir':
            print("Saliendo del programa...")
            break

        if not texto_usuario.strip():
            continue

        stats = contador.analizar(texto_usuario)

        print()
        print(f"{'MÉTRICA':<20} | {'CANTIDAD':>10}")
        print("-" * 33)
        print(f"{'Palabras':<20} | {stats['palabras']:>10}")
        print(f"{'Caracteres':<20} | {stats['caracteres']:>10}")
        print(f"{'Dígitos':<20} | {stats['digitos']:>10}")
        print(f"{'Especiales':<20} | {stats['especiales']:>10}")
        print("\n" + "=" * 33 + "\n")
`;
