package org.example.crm.parceiro90.controllers;

import org.example.crm.parceiro90.domain.entities.Pedido;
import org.example.crm.parceiro90.dtos.OpcaoRequest;
import org.example.crm.parceiro90.dtos.PedidoResponse;
import org.example.crm.parceiro90.dtos.RetornoRequest;
import org.example.crm.parceiro90.services.PedidoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService service;

    public PedidoController(PedidoService service) { this.service = service; }

    @PostMapping("/{id}/confirmacao")
    public PedidoResponse confirmar(@PathVariable Long id, @RequestBody OpcaoRequest req) {
        return PedidoResponse.de(service.aplicarOpcao(id, req.opcao()));
    }

    @PostMapping("/{id}/retorno")
    public PedidoResponse retorno(@PathVariable Long id, @RequestBody RetornoRequest req) {
        return PedidoResponse.de(service.registrarRetorno(id, req.conversou()));
    }

    @PatchMapping("/{id}/concluir")
    public PedidoResponse concluir(@PathVariable Long id) {
        return PedidoResponse.de(service.concluir(id));
    }

    // Quem está envolvido no relato NÃO acessa o caso
    @GetMapping("/{id}")
    public ResponseEntity<PedidoResponse> ver(@PathVariable Long id,
                                              @RequestHeader("X-Responsavel-Id") Long quemPede) {
        Pedido p = service.buscar(id);
        if (quemPede.equals(p.getEnvolvidoId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(PedidoResponse.de(p));
    }
}