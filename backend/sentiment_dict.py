"""
Diccionario léxico de sentimiento en español (positivo/negativo).

Enfoque basado en diccionario: se cuenta la aparición de palabras conocidas
en cada categoría y se compara la frecuencia para determinar la polaridad
general del texto. No usa modelos de lenguaje ni ponderación semántica.
"""

POSITIVE_WORDS: set[str] = {
    # Satisfacción / calidad general
    "bueno", "buena", "buenos", "buenas", "excelente", "excelentes", "genial",
    "geniales", "increíble", "increible", "increíbles", "increibles", "feliz",
    "felices", "alegre", "alegres", "alegría", "alegria", "contento", "contenta",
    "contentos", "contentas", "maravilloso", "maravillosa", "maravillosos",
    "maravillosas", "fantástico", "fantastico", "fantástica", "fantastica",
    "perfecto", "perfecta", "perfectos", "perfectas", "amor", "amo", "encanta",
    "encantan", "encantador", "encantadora", "gracias", "agradable",
    "agradables", "positivo", "positiva", "positivos", "positivas", "éxito",
    "exito", "exitoso", "exitosa", "ganar", "ganamos", "mejor", "mejores",
    "hermoso", "hermosa", "hermosos", "hermosas", "bonito", "bonita",
    "bonitos", "bonitas", "divertido", "divertida", "divertidos", "divertidas",
    "satisfecho", "satisfecha", "satisfechos", "satisfechas", "recomiendo",
    "recomendable", "recomendado", "recomendada", "útil", "util", "útiles",
    "utiles", "rápido", "rapido", "rápida", "rapida", "cómodo", "comodo",
    "cómoda", "comoda", "fácil", "facil", "fáciles", "faciles", "eficiente",
    "eficientes", "innovador", "innovadora", "impresionante",
    "impresionantes", "brillante", "brillantes", "espectacular",
    "espectaculares", "libertad", "confianza", "seguro", "segura", "estable",
    "sólido", "solido", "sólida", "solida", "amable", "amables",
    "sorprendente", "sorprendentes", "premium", "óptimo", "optimo", "óptima",
    "optima",
    # Emociones/valores humanos positivos (útil en textos sociales/noticias)
    "esperanza", "esperanzador", "esperanzadora", "consuelo", "solidaridad",
    "unión", "union", "apoyo", "apoyar", "paz", "justicia", "cariño", "carino",
    "ternura", "gratitud", "alivio", "aliviado", "aliviada", "superación",
    "superacion", "recuperación", "recuperacion", "celebración",
    "celebracion", "homenaje", "orgullo", "orgulloso", "orgullosa", "unidad",
    "comunidad", "fraternidad", "compasión", "compasion",
}

NEGATIVE_WORDS: set[str] = {
    # Calidad/insatisfacción general
    "malo", "mala", "malos", "malas", "terrible", "terribles", "horrible",
    "horribles", "pésimo", "pesimo", "pésima", "pesima", "triste", "tristes",
    "tristeza", "enojado", "enojada", "enojados", "enojadas", "molesto",
    "molesta", "molestos", "molestas", "odio", "odiar", "decepcionante",
    "decepcionantes", "decepción", "decepcion", "decepciones", "fracaso",
    "fracasos", "perder", "perdimos", "perdió", "perdio", "peor", "peores",
    "feo", "fea", "feos", "feas", "aburrido", "aburrida", "aburridos",
    "aburridas", "insatisfecho", "insatisfecha", "insatisfechos",
    "insatisfechas", "inútil", "inutil", "inútiles", "inutiles", "lento",
    "lenta", "lentos", "lentas", "incómodo", "incomodo", "incómoda",
    "incomoda", "problema", "problemas", "error", "errores", "roto", "rota",
    "rotos", "rotas", "defectuoso", "defectuosa", "defectuosos",
    "defectuosas", "nunca", "jamás", "jamas", "desastre", "desastroso",
    "desastrosa", "queja", "quejas", "difícil", "dificil", "difíciles",
    "dificiles", "confuso", "confusa", "confusos", "confusas", "caro", "cara",
    "caros", "caras", "inestable", "inestables", "inseguro", "insegura",
    "falla", "fallas", "fallo", "fallos", "estafa", "estafas", "engaño",
    "engano", "engaños", "enganos", "vergüenza", "verguenza", "asco",
    "grosero", "grosera", "groseros", "groseras", "abandonado", "abandonada",
    # Muerte / violencia / tragedia (frecuente en textos de noticias)
    "muerte", "muertes", "murió", "murio", "mataron", "matar", "mató", "mato",
    "asesinato", "asesinaron", "asesinado", "asesinada", "homicidio",
    "crimen", "crímenes", "crimenes", "víctima", "victima", "víctimas",
    "victimas", "violencia", "violento", "violenta", "disparo", "disparos",
    "bala", "balas", "tiroteo", "herido", "herida", "heridos", "heridas",
    "sangre", "sangriento", "sangrienta",
    # Duelo / dolor
    "duelo", "luto", "dolor", "dolorosa", "doloroso", "dolorosas",
    "dolorosos", "lágrimas", "lagrimas", "lágrima", "lagrima", "llanto",
    "llantos", "llorar", "lloró", "lloro", "desgarrador", "desgarradora",
    "desgarradores", "desgarradoras", "conmovedor", "conmovedora",
    "conmovedores", "conmovedoras", "tragedia", "trágico", "tragico",
    "trágica", "tragica", "injusticia", "injusto", "injusta", "clamor",
    "sepultura", "sepultan", "sepultado", "sepultada", "velatorio", "funeral",
    "fúnebre", "funebre", "cementerio", "difunto", "difunta", "condolencias",
    "pésame", "pesame", "sufrimiento", "sufrir", "sufre", "angustia",
    "angustiado", "angustiada", "desesperación", "desesperacion",
    "desamparo", "orfandad", "viuda", "viudo", "huérfano", "huerfano",
    "huérfana", "huerfana", "cruel", "crueldad", "brutal", "brutalidad",
    "inhumano", "inhumana",
    # Miedo / ansiedad
    "miedo", "temor", "pánico", "panico", "ansiedad", "depresión",
    "depresion", "soledad", "abandono",
}
