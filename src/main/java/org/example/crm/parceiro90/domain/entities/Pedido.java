package org.example.crm.parceiro90.domain.entities;

import jakarta.persistence.*;
import org.example.crm.parceiro90.domain.enums.*;

import java.time.Instant;

@Entity
@Table(name = "pedido")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // idempotência: a mesma mensagem nunca gera dois pedidos
    @Column(name = "evento_id", unique = true, nullable = false)
    private String eventoId;

    private Long colaboradorId;

    @Column(columnDefinition = "TEXT")
    private String resumo;

    private String categoria;

    // responsável citado no relato: não pode acessar o caso
    private Long envolvidoId;

    @Enumerated(EnumType.STRING)
    private Destino destino;

    @Enumerated(EnumType.STRING)
    private StatusConfirmacao statusConfirmacao = StatusConfirmacao.PENDENTE;

    @Enumerated(EnumType.STRING)
    private Situacao situacao = Situacao.ABERTO;

    private Long responsavelId;
    private Instant criadoEm;
    private Instant prazoLembreteEm;
    private boolean lembreteEnviado;

    public Long getId() { return id; }
    public String getEventoId() { return eventoId; }
    public void setEventoId(String eventoId) { this.eventoId = eventoId; }
    public Long getColaboradorId() { return colaboradorId; }
    public void setColaboradorId(Long colaboradorId) { this.colaboradorId = colaboradorId; }
    public String getResumo() { return resumo; }
    public void setResumo(String resumo) { this.resumo = resumo; }
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    public Long getEnvolvidoId() { return envolvidoId; }
    public void setEnvolvidoId(Long envolvidoId) { this.envolvidoId = envolvidoId; }
    public Destino getDestino() { return destino; }
    public void setDestino(Destino destino) { this.destino = destino; }
    public StatusConfirmacao getStatusConfirmacao() { return statusConfirmacao; }
    public void setStatusConfirmacao(StatusConfirmacao s) { this.statusConfirmacao = s; }
    public Situacao getSituacao() { return situacao; }
    public void setSituacao(Situacao situacao) { this.situacao = situacao; }
    public Long getResponsavelId() { return responsavelId; }
    public void setResponsavelId(Long responsavelId) { this.responsavelId = responsavelId; }
    public Instant getCriadoEm() { return criadoEm; }
    public void setCriadoEm(Instant criadoEm) { this.criadoEm = criadoEm; }
    public Instant getPrazoLembreteEm() { return prazoLembreteEm; }
    public void setPrazoLembreteEm(Instant p) { this.prazoLembreteEm = p; }
    public boolean isLembreteEnviado() { return lembreteEnviado; }
    public void setLembreteEnviado(boolean l) { this.lembreteEnviado = l; }
}