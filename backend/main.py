import os
import json
import uuid

import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'), override=True)

app = FastAPI(title="Kallopolli HR Integration Core", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_key_val = os.getenv("LLM_API_KEY")
if not api_key_val:
    raise ValueError("A variável LLM_API_KEY não foi encontrada! Verifica o arquivo .env.")

openai_client = OpenAI(
    api_key=api_key_val,
    base_url=os.getenv("LLM_BASE_URL", "https://api.groq.com/openai/v1"),
)
LLM_MODEL = "openai/gpt-oss-20b"
print("Modelo em uso:", LLM_MODEL)

JAVA_API_URL = os.getenv("JAVA_API_URL", "http://localhost:8080/api/relatos")
print("Java em:", JAVA_API_URL)

INFO_LOJA = """
INFORMAÇÕES DA LOJA:

UNIFORME:
- Camisa oficial limpa e passada, calça preta e sapato preto fechado e antiderrapante.
- Boné ou touca obrigatório, com todo o cabelo preso e coberto.
- Crachá sempre visível, na altura do peito.
- Sem anéis, pulseiras, relógio, brincos grandes ou colares na área de produção.
- Unhas curtas, limpas e sem esmalte. Barba aparada ou com protetor.
- Lavar as mãos ao chegar, após usar o banheiro e ao trocar de tarefa.

CHAPA:
- Aquecer a chapa até a temperatura de trabalho (exemplo: 200 °C) antes de iniciar.
- Conferir o termômetro no início do turno e registrar na planilha.
- Tempo de cozimento do hambúrguer conforme o manual (exemplo: cerca de 1 minuto por lado). Nunca servir carne mal passada.
- Limpar a chapa com a espátula entre os lotes e fazer a limpeza completa no fechamento.
- Usar luvas térmicas e espátula. Nunca tocar na chapa com as mãos.
- Se a chapa não atingir a temperatura certa, parar e avisar o gestor.

BATATAS:
- A fritadeira deve estar na temperatura de trabalho (exemplo: 175 °C) antes de colocar a batata.
- Tempo de fritura (exemplo: cerca de 3 minutos), sempre com o timer.
- Escorrer bem, salgar na hora e servir.
- Batata pronta e não servida vale por pouco tempo (exemplo: 7 minutos). Passou disso, descartar.
- Não encher demais o cesto.
- Usar luvas e avental, e cuidado com respingos de óleo quente.
"""

SYSTEM_PROMPT = """Você é a MIA, assistente virtual dos colaboradores do MC.
Ajuda com acolhimento do RH e com dúvidas do dia a dia da loja.
Responda sempre em português do Brasil, com tom simpático, claro e profissional.

Regras:
- Lembre-se de que estamos em um ambiente profissional. Quando o colaborador relatar um problema, seja acolhedor e empático.
- Respostas curtas: no máximo 2 frases e 60 palavras. Seja direto, sem listas e sem repetir a pergunta.
- Acolha o colaborador primeiro quando ele relatar um problema, depois oriente.
- Use apenas as INFORMAÇÕES DA LOJA abaixo. Se a resposta não estiver lá, diga que vai verificar com o gestor. Nunca invente regras, tempos, temperaturas ou prazos.
- Só diga que o caso será encaminhado ao RH quando for MUITO grave: assédio, discriminação, violência, acidente ou risco real à saúde ou à segurança. Nesses casos, diga que será encaminhado com prioridade ao RH e ao canal de ética.
- Em qualquer outra situação (cansaço, dúvida, reclamação comum, desconforto leve), acolha e oriente normalmente, sem falar em RH nem em encaminhamento.
- Não faça diagnósticos médicos nem aconselhamento jurídico. Em caso de queimadura ou acidente, mande avisar o gestor na hora.
""" + INFO_LOJA

CATEGORIAS = [
    "assedio", "discriminacao", "saude_seguranca",
    "risco_desistencia", "cansaco_sobrecarga", "desmotivacao",
    "salario_beneficios", "relacionamento_gestor", "jornada_ferias", "duvida_sem_resposta",
    "equipamento_operacao", "outros",
]

PROMPT_ANALISE = f"""Você analisa mensagens de colaboradores para o RH.
Responda APENAS com um JSON válido neste formato:

{{"registrar": true, "resumo": "...", "categoria": "..."}}

Regras:
- "registrar": true quando a mensagem trouxer um relato, queixa, problema ou pedido que o RH deva acompanhar.
  Cansaço, sobrecarga, desânimo e vontade de desistir ou sair do emprego SEMPRE devem ser registrados.
  Perguntas cuja resposta NÃO está nas INFORMAÇÕES DA LOJA também devem ser registradas.
- Use "registrar": false para cumprimentos, agradecimentos (ex.: "oi", "obrigado") e perguntas que as INFORMAÇÕES DA LOJA já respondem (ex.: "como é o uniforme?").
- "resumo": 1 a 2 frases, neutras, só com os fatos relatados, em português do Brasil.
  Se for uma pergunta, escreva o resumo como a pergunta reescrita de forma clara.
- "categoria": uma destas opções: {', '.join(CATEGORIAS)}.

Como escolher a categoria:
- duvida_sem_resposta: o colaborador faz uma PERGUNTA cuja resposta NÃO está nas INFORMAÇÕES DA LOJA (ex.: horário do intervalo, valor do vale, regra de folga).
- risco_desistencia: fala em pedir demissão, desistir, sair do emprego ou diz que não aguenta mais trabalhar ali.
- cansaco_sobrecarga: cansaço, exaustão, excesso de tarefas, falta de descanso ou de folgas.
- desmotivacao: desânimo, falta de vontade de ir trabalhar, sentir-se desvalorizado.
- saude_seguranca: somente risco físico real, como acidente, queimadura ou mal-estar grave.
- Se a mensagem se encaixar em mais de uma, escolha a mais grave, nesta ordem: assedio, discriminacao, saude_seguranca, risco_desistencia, cansaco_sobrecarga, desmotivacao.
""" + INFO_LOJA

FALLBACK_RESPOSTA = (
    "Olá! O seu relato foi registrado com sucesso no sistema do RH. "
    "A nossa equipe analisará a situação e entrará em contato em breve."
)

class WebhookWhatsApp(BaseModel):
    remetente: str = Field(..., min_length=8, max_length=20)
    mensagem: str = Field(..., min_length=1, max_length=1000)

def responder_colaborador(mensagem: str) -> str:
    try:
        resposta = openai_client.chat.completions.create(
            model=LLM_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": mensagem},
            ],
            max_tokens=400,
            timeout=20,
        )
        conteudo = resposta.choices[0].message.content
        return conteudo.strip() if conteudo else FALLBACK_RESPOSTA
    except Exception as e:
        print(f"Falha na resposta da IA: {type(e).__name__}: {e}")
        return FALLBACK_RESPOSTA

def analisar_para_rh(mensagem: str) -> dict:
    try:
        resposta = openai_client.chat.completions.create(
            model=LLM_MODEL,
            messages=[
                {"role": "system", "content": PROMPT_ANALISE},
                {"role": "user", "content": mensagem},
            ],
            response_format={"type": "json_object"},
            max_tokens=600,
            timeout=20,
        )
        dados = json.loads(resposta.choices[0].message.content)
        categoria = dados.get("categoria", "outros")
        if categoria not in CATEGORIAS:
            categoria = "outros"
        return {
            "registrar": bool(dados.get("registrar", True)),
            "resumo": dados.get("resumo") or mensagem[:300],
            "categoria": categoria,
        }
    except Exception as e:
        print(f"Falha na análise para o RH: {type(e).__name__}: {e}")
        return {"registrar": True, "resumo": mensagem[:300], "categoria": "outros"}

def salvar_no_java(evento_id: str, remetente: str, resumo: str, categoria: str) -> dict | None:
    try:
        resp = httpx.post(
            JAVA_API_URL,
            json={
                "eventoId": evento_id,
                "remetente": remetente,
                "resumo": resumo,
                "categoria": categoria,
            },
            timeout=10,
        )
        resp.raise_for_status()
        return resp.json()
    except httpx.HTTPStatusError as e:
        print(f"Java recusou o relato ({e.response.status_code}): {e.response.text}")
    except Exception as e:
        print(f"Falha ao falar com o Java: {type(e).__name__}: {e}")
    return None

@app.get("/")
def read_root():
    return {"status": "online", "sistema": "Kallopolli RH & AI Core"}

@app.post("/api/whatsapp/webhook")
def receber_webhook_whatsapp(payload: WebhookWhatsApp):
    resposta = responder_colaborador(payload.mensagem)
    analise = analisar_para_rh(payload.mensagem)
    print("Análise:", analise)

    salvo = None
    if analise["registrar"]:
        salvo = salvar_no_java(
            str(uuid.uuid4()), payload.remetente, analise["resumo"], analise["categoria"]
        )
        print("Relato enviado ao Java." if salvo else "Relato NÃO foi salvo no Java.")
    else:
        print("Mensagem simples: não registrada no RH.")

    return {
        "sucesso": True,
        "salvo_no_rh": salvo is not None,
        "id_registro": (salvo or {}).get("id"),
        "parecer_rh": resposta,
    }