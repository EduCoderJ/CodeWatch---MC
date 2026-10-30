import os
import traceback
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from google import genai
from dotenv import load_dotenv

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

api_key_val = os.getenv("GEMINI_API_KEY")

if not api_key_val:
    raise ValueError("A variável GEMINI_API_KEY não foi encontrada! Verifica o arquivo .env.")

gemini_client = genai.Client(api_key=api_key_val)

class WebhookWhatsApp(BaseModel):
    remetente: str = Field(..., min_length=8, max_length=20)
    mensagem: str = Field(..., min_length=1, max_length=1000, description="Mensagem do colaborador com limite seguro")

@app.get("/")
def read_root():
    return {"status": "online", "sistema": "Kallopolli RH & AI Core"}

@app.post("/api/whatsapp/webhook")
def receber_webhook_whatsapp(payload: WebhookWhatsApp, db: Session = Depends(get_db)):
    analise_texto = ""
    
    try:
        prompt_prompt = (
            f"Atue como um assistente de RH empático e profissional. "
            f"Analise o seguinte relato enviado por um colaborador via WhatsApp "
            f"e forneça um parecer de acolhimento e uma sugestão de resposta: '{payload.mensagem}'"
        )

        # Chamada protegida contra instabilidade externa com o modelo gemini-3.8-flash
        resposta_ia = gemini_client.models.generate_content(
            model="gemini-3.8-flash",
            contents=prompt_prompt
        )

        analise_texto = resposta_ia.text if resposta_ia and resposta_ia.text else "Sem resposta gerada pela IA."

    except Exception as ai_err:
        print(f"⚠️ API da Google instável/fora do ar. Ativando fallback instantâneo. Erro: {ai_err}")
        # Fallback ultra-rápido para garantir que o front-end NUNCA trave
        analise_texto = (
            "Olá! O teu relato foi registado com sucesso no sistema do RH. "
            "A nossa equipa analisará a situação e entrará em contacto em breve."
        )

    try:
        # Gravação blindada no SQLite local
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