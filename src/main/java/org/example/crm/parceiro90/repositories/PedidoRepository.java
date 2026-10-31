package org.example.crm.parceiro90.repositories;

import org.example.crm.parceiro90.domain.entities.Pedido;
import org.example.crm.parceiro90.domain.enums.Situacao;
import org.example.crm.parceiro90.domain.enums.StatusConfirmacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    Optional<Pedido> findByEventoId(String eventoId);

    Optional<Pedido> findFirstByColaboradorIdAndStatusConfirmacaoOrderByIdDesc(
            Long colaboradorId, StatusConfirmacao status);

    List<Pedido> findByLembreteEnviadoFalseAndPrazoLembreteEmBeforeAndSituacaoIn(
            Instant agora, Collection<Situacao> situacoes);
}