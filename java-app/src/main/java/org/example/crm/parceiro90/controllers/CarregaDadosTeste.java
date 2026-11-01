package org.example.crm.parceiro90.controllers;

import org.example.crm.parceiro90.domain.entities.Colaborador;
import org.example.crm.parceiro90.repositories.ColaboradorRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class CarregaDadosTeste implements CommandLineRunner {

    private final ColaboradorRepository colaboradorRepository;

    public CarregaDadosTeste(ColaboradorRepository colaboradorRepository) {
        this.colaboradorRepository = colaboradorRepository;
    }

    @Override
    public void run(String... args) {
        String numero = "5551999887766";
        if (colaboradorRepository.findByWhatsapp(numero).isEmpty()) {
            Colaborador c = new Colaborador();
            c.setNome("Teste");
            c.setWhatsapp(numero);
            c.setIdLoja(1L);
            c.setConsentimento(true);
            colaboradorRepository.save(c);
            System.out.println("✅ Colaborador de teste cadastrado.");
        }
    }
}