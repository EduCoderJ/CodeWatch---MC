package org.example.crm.parceiro90.domain.entities;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "colaborador")
public class Colaborador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    @Column(unique = true)
    private String whatsapp;

    private LocalDate dataAdmissao;
    private Long idLoja;
    private boolean consentimento;

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getWhatsapp() { return whatsapp; }
    public void setWhatsapp(String whatsapp) { this.whatsapp = whatsapp; }
    public LocalDate getDataAdmissao() { return dataAdmissao; }
    public void setDataAdmissao(LocalDate dataAdmissao) { this.dataAdmissao = dataAdmissao; }
    public Long getIdLoja() { return idLoja; }
    public void setIdLoja(Long idLoja) { this.idLoja = idLoja; }
    public boolean isConsentimento() { return consentimento; }
    public void setConsentimento(boolean consentimento) { this.consentimento = consentimento; }
}