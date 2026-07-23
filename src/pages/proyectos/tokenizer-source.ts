/**
 * tokenizer-source.ts — código Python original de NLPProcesadorEsp, la CLI que
 * inspiró la herramienta web. Se muestra tal cual en la página del proyecto.
 */
export const PYTHON_SOURCE = String.raw`import re
import sys

class NLPProcesadorEsp:
    def __init__(self):
        self.sufijos = [
            'ábamos', 'áramos', 'iéramos', 'arían', 'erían', 'irían',
            'mente', 'ando', 'iendo', 'aron', 'eron', 'aban', 'arán', 'erán', 'irán',
            'amos', 'emos', 'imos', 'aba', 'ada', 'ida', 'ado', 'ido', 'ara', 'era',
            'iré', 'aré', 'ar', 'er', 'ir', 'an', 'en', 'as', 'es'
        ]

    def tokenizar(self, texto):
        r"""
        Divide el texto en tokens (palabras y signos de puntuación).
        \w+ captura secuencias de caracteres alfanuméricos (incluyendo acentos).
        [^\w\s] captura signos de puntuación, omitiendo espacios en blanco.
        """
        tokens = re.findall(r'\w+|[^\w\s]', texto)
        return tokens

    def lematizar_heuristico(self, palabra):
        """
        Aplica reglas basadas en heurística para encontrar la 'raíz' de la palabra.
        """
        palabra_min = palabra.lower()

        if not palabra_min.isalpha() or len(palabra_min) <= 3:
            return palabra_min

        if palabra_min.endswith('es') and len(palabra_min) > 4:
            palabra_min = palabra_min[:-2]
        elif palabra_min.endswith('s') and len(palabra_min) > 3:
            palabra_min = palabra_min[:-1]

        for sufijo in self.sufijos:
            if palabra_min.endswith(sufijo):
                if len(palabra_min) - len(sufijo) >= 2:
                    return palabra_min[:-len(sufijo)]

        return palabra_min

    def procesar(self, texto):
        """
        Ejecuta el pipeline completo: tokenización y lematización.
        """
        tokens = self.tokenizar(texto)
        resultado = [(token, self.lematizar_heuristico(token)) for token in tokens]
        return resultado

if __name__ == "__main__":
    nlp = NLPProcesadorEsp()

    print("=== Tokenizador y Lematizador Interactivo ===")
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

        resultados = nlp.procesar(texto_usuario)
        cantidad_tokens = len(resultados)

        print(f"\n=> Se detectaron {cantidad_tokens} tokens en total.")

        print(f"{'TOKEN ORIGINAL':<20} | {'LEMA (RAÍZ)':<20}")
        print("-" * 45)
        for token, lema in resultados:
             print(f"{token:<20} | {lema:<20}")
        print("\n" + "="*45 + "\n")
`;
