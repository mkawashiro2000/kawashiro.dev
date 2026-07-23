/**
 * sentiment-source.ts — código Python REAL que ejecuta esta herramienta.
 * Es el endpoint FastAPI que corre en el edge-api de la Raspberry Pi
 * (backend/main.py + backend/sentiment_dict.py); no es una recreación.
 */
export const PYTHON_SOURCE = String.raw`# backend/sentiment_dict.py — diccionario léxico de sentimiento en español
POSITIVE_WORDS: set[str] = {
    # Satisfacción / calidad general
    "bueno", "buena", "excelente", "genial", "increíble", "feliz",
    "alegre", "contento", "maravilloso", "perfecto", "recomendado",
    # ... ~200 términos en total
}

NEGATIVE_WORDS: set[str] = {
    # Calidad / insatisfacción general
    "malo", "mala", "terrible", "horrible", "pésimo", "triste",
    "enojado", "molesto", "decepcionante", "lento", "caro",
    # ... ~200 términos en total
}


# backend/main.py — el endpoint que analiza el texto
WORD_PATTERN = re.compile(r"[a-záéíóúñü]+", re.IGNORECASE)


class SentimentRequest(BaseModel):
    text: str


@app.post("/api/v1/sentiment")
async def analyze_sentiment(payload: SentimentRequest):
    """
    Análisis de sentimiento basado en diccionario léxico (positivo/negativo).
    Cuenta coincidencias en el texto y determina la polaridad dominante.
    """
    words = [w.lower() for w in WORD_PATTERN.findall(payload.text)]

    positive_matches = [w for w in words if w in POSITIVE_WORDS]
    negative_matches = [w for w in words if w in NEGATIVE_WORDS]

    pos_count = len(positive_matches)
    neg_count = len(negative_matches)
    sentiment_total = pos_count + neg_count

    if pos_count > neg_count:
        verdict = "positivo"
    elif neg_count > pos_count:
        verdict = "negativo"
    else:
        verdict = "neutral"

    # Porcentajes relativos a las palabras con carga emocional detectadas
    # (no al total del texto, ya que la mayoría de palabras son neutras).
    positive_pct = round(pos_count / sentiment_total * 100, 1) if sentiment_total else 0.0
    negative_pct = round(neg_count / sentiment_total * 100, 1) if sentiment_total else 0.0

    return {
        "verdict": verdict,
        "positive_count": pos_count,
        "negative_count": neg_count,
        "positive_percentage": positive_pct,
        "negative_percentage": negative_pct,
        "positive_words": positive_matches,
        "negative_words": negative_matches,
        "word_count": len(words),
        "sentiment_word_count": sentiment_total,
    }
`;
