package org.example.crm.parceiro90.domain.entities;

import jakarta.persistence.*;
import org.example.crm.parceiro90.domain.enums.Papel;

@Entity
@Table(name = "responsavel")
public class Responsavel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    @Enumerated(EnumType.STRING)
    private Papel papel;

    private Long idLoja;      // nulo para o RH (vale para todas as lojas)
    private String whatsapp;

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public Papel getPapel() { return papel; }
    public void setPapel(Papel papel) { this.papel = papel; }
    public Long getIdLoja() { return idLoja; }
    public void setIdLoja(Long idLoja) { this.idLoja = idLoja; }
    public String getWhatsapp() { return whatsapp; }
    public void setWhatsapp(String whatsapp) { this.whatsapp = whatsapp; }
}