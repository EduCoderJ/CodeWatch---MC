import os
import traceback

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from openai import OpenAI

from .database import engine, Base, get_db
from .models import RelatoColaborador

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Kallopolli HR Integration Core", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== Configuração da IA =====
api_key_val = os.getenv("LLM_API_KEY")

if not api_key_val:
    raise ValueError("A variável LLM_API_KEY não foi encontrada! Verifica o arquivo .env.")

openai_client = OpenAI(
    api_key=api_key_val,
    base_url=os.getenv("LLM_BASE_URL", "https://api.groq.com/openai/v1"),
)
LLM_MODEL = os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")

# ===== Prompt do RH =====
SYSTEM_PROMPT = """Você é o assistente de acolhimento do RH da Kallopolli.
Responda sempre em português do Brasil, com tom empático, claro e profissional.

Regras:
- Acolha o colaborador primeiro, depois oriente.
- Não invente políticas, prazos ou valores da empresa. Se não souber, diga que o RH vai verificar.
- Se o relato envolver assédio, discriminação, violência, risco à saúde ou à segurança, informe que o caso será encaminhado com prioridade ao RH e ao canal de ética.
- Não faça diagnósticos médicos ou psicológicos nem aconselhamento jurídico.
- Respostas curtas: no máximo 5 frases."""


# ===== Modelos de entrada =====
class WebhookWhatsApp(BaseModel):
    remetente: str = Field(..., min_length=8, max_length=20)
    mensagem: str = Field(..., min_length=1, max_length=1000, description="Mensagem do colaborador com limite seguro")


# ===== Rotas =====
@app.get("/")
def read_root():
    return {"status": "online", "sistema": "Kallopolli RH & AI Core"}


@app.post("/api/whatsapp/webhook")
def receber_webhook_whatsapp(payload: WebhookWhatsApp, db: Session = Depends(get_db)):
    analise_texto = ""

    try:
        resposta_ia = openai_client.chat.completions.create(
            model=LLM_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": payload.mensagem},
            ],
            timeout=20,
        )

        conteudo = resposta_ia.choices[0].message.content
        analise_texto = conteudo if conteudo else "Sem resposta gerada pela IA."

    except Exception as e:
        print(f"⚠️ Falha na chamada da IA: {type(e).__name__}: {e}")
        traceback.print_exc()

    try:
        novo_relato = RelatoColaborador(
            remetente=payload.remetente,
            mensagem_original=payload.mensagem,
            analise_ia=analise_texto,
            status="Analisado"
        )
        db.add(novo_relato)
        db.commit()
        db.refresh(novo_relato)

        return {
            "sucesso": True,
            "id_registro": novo_relato.id,
            "parecer_rh": analise_texto
        }
    except Exception as db_err:
        print("--- ERRO NO BANCO DE DADOS ---")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro interno no banco: {str(db_err)}")


@app.get("/api/rh/relatos")
def listar_relatos(db: Session = Depends(get_db)):
    relatos = db.query(RelatoColaborador).all()
    return relatos