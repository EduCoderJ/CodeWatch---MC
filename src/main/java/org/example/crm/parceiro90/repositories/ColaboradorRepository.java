package org.example.crm.parceiro90.repositories;

import org.example.crm.parceiro90.domain.entities.Colaborador;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ColaboradorRepository extends JpaRepository<Colaborador, Long> {
    Optional<Colaborador> findByWhatsapp(String whatsapp);
}