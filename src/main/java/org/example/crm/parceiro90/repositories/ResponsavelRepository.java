package org.example.crm.parceiro90.repositories;

import org.example.crm.parceiro90.domain.entities.Responsavel;
import org.example.crm.parceiro90.domain.enums.Papel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ResponsavelRepository extends JpaRepository<Responsavel, Long> {
    Optional<Responsavel> findFirstByPapelAndIdLoja(Papel papel, Long idLoja);
    Optional<Responsavel> findFirstByPapel(Papel papel);
}