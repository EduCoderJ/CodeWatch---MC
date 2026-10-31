package org.example.crm.parceiro90.dtos;

import org.example.crm.parceiro90.domain.entities.Pedido;
import org.example.crm.parceiro90.domain.enums.Destino;
import org.example.crm.parceiro90.domain.enums.Situacao;
import org.example.crm.parceiro90.domain.enums.StatusConfirmacao;

import java.time.Instant;

public record PedidoResponse(Long id, String categoria, Destino destino,
                             StatusConfirmacao statusConfirmacao, Situacao situacao,
                             Instant prazoLembreteEm) {

    public static PedidoResponse de(Pedido p) {
        return new PedidoResponse(p.getId(), p.getCategoria(), p.getDestino(),
                p.getStatusConfirmacao(), p.getSituacao(), p.getPrazoLembreteEm());
    }
}