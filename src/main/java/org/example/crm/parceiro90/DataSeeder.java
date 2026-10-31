package org.example.crm.parceiro90;

import org.example.crm.parceiro90.domain.entities.Colaborador;
import org.example.crm.parceiro90.domain.entities.Responsavel;
import org.example.crm.parceiro90.domain.enums.Papel;
import org.example.crm.parceiro90.repositories.ColaboradorRepository;
import org.example.crm.parceiro90.repositories.ResponsavelRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataSeeder implements CommandLineRunner {

    private final ColaboradorRepository colaboradores;
    private final ResponsavelRepository responsaveis;

    public DataSeeder(ColaboradorRepository colaboradores, ResponsavelRepository responsaveis) {
        this.colaboradores = colaboradores;
        this.responsaveis = responsaveis;
    }

    @Override
    public void run(String... args) {
        if (colaboradores.count() > 0) return;

        Colaborador ana = new Colaborador();
        ana.setNome("Ana P.");
        ana.setWhatsapp("5551900000001");            // número fictício
        ana.setDataAdmissao(LocalDate.now().minusDays(4));
        ana.setIdLoja(1L);
        ana.setConsentimento(true);
        colaboradores.save(ana);

        Responsavel gerente = new Responsavel();
        gerente.setNome("Gerente Fictício");
        gerente.setPapel(Papel.GERENTE);
        gerente.setIdLoja(1L);
        gerente.setWhatsapp("5551900000010");
        responsaveis.save(gerente);

        Responsavel rh = new Responsavel();
        rh.setNome("RH Fictício");
        rh.setPapel(Papel.RH);
        rh.setWhatsapp("5551900000020");
        responsaveis.save(rh);
    }
}
