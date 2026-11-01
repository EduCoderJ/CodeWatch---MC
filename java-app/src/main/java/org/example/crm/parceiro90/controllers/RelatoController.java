package org.example.crm.parceiro90.controllers;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.example.crm.parceiro90.domain.entities.Colaborador;
import org.example.crm.parceiro90.domain.entities.Pedido;
import org.example.crm.parceiro90.repositories.ColaboradorRepository;
import org.example.crm.parceiro90.repositories.PedidoRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/relatos")
public class RelatoController {

    private final ColaboradorRepository colaboradorRepository;
    private final PedidoRepository pedidoRepository;

    public RelatoController(ColaboradorRepository colaboradorRepository,
                            PedidoRepository pedidoRepository) {
        this.colaboradorRepository = colaboradorRepository;
        this.pedidoRepository = pedidoRepository;
    }

    // Dados que o Python envia
    public record RelatoRequest(String eventoId, String remetente, String resumo, String categoria) {}

    // Dados que o Java devolve
    public record RelatoResponse(Long id, String eventoId, Long colaboradorId, String resumo,
                                 String categoria, String situacao, String statusConfirmacao,
                                 Instant criadoEm) {}

    @PostMapping
    public ResponseEntity<?> criar(@RequestBody RelatoRequest req) {
        if (vazio(req.eventoId()) || vazio(req.remetente()) || vazio(req.resumo())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("erro", "eventoId, remetente e resumo são obrigatórios"));
        }

        Optional<Pedido> existente = pedidoRepository.findByEventoId(req.eventoId());
        if (existente.isPresent()) {
            return ResponseEntity.ok(toResponse(existente.get()));
        }

        Colaborador colaborador = colaboradorRepository.findByWhatsapp(req.remetente()).orElse(null);
        if (colaborador == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("erro", "Colaborador não cadastrado para este WhatsApp"));
        }
        if (!colaborador.isConsentimento()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("erro", "Colaborador sem consentimento para uso do canal"));
        }

        Pedido pedido = new Pedido();
        pedido.setEventoId(req.eventoId());
        pedido.setColaboradorId(colaborador.getId());
        pedido.setResumo(req.resumo());
        pedido.setCategoria(req.categoria());
        pedido.setCriadoEm(Instant.now());

        pedidoRepository.save(pedido);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(pedido));
    }

    @GetMapping
    public List<RelatoResponse> listar() {
        return pedidoRepository.findAll(Sort.by(Sort.Direction.DESC, "criadoEm")).stream()
                .map(this::toResponse)
                .toList();
    }

    private boolean vazio(String s) {
        return s == null || s.isBlank();
    }

    private RelatoResponse toResponse(Pedido p) {
        return new RelatoResponse(
                p.getId(), p.getEventoId(), p.getColaboradorId(), p.getResumo(),
                p.getCategoria(),
                p.getSituacao() != null ? p.getSituacao().name() : null,
                p.getStatusConfirmacao() != null ? p.getStatusConfirmacao().name() : null,
                p.getCriadoEm());
    }
}