from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from .database import Base

class RelatoColaborador(Base):
    __tablename__ = "relatos_rh"

    id = Column(Integer, primary_key=True, index=True)
    remetente = Column(String(50), nullable=False) # Ex: Número do WhatsApp
    mensagem_original = Column(Text, nullable=False)
    analise_ia = Column(Text, nullable=True)
    status = Column(String(30), default="Pendente")
    criado_em = Column(DateTime, default=datetime.utcnow)