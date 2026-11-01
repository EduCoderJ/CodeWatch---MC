package org.example.crm.parceiro90.controllers;

import org.example.crm.parceiro90.services.ClockService;
import org.example.crm.parceiro90.services.PedidoService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class AdminController {

    private final ClockService clock;
    private final PedidoService pedidos;

    public AdminController(ClockService clock, PedidoService pedidos) {
        this.clock = clock;
        this.pedidos = pedidos;
    }

    @PostMapping("/admin/clock/avancar")
    public Map<String, Object> avancar(@RequestParam long horas) {
        clock.avancarHoras(horas);
        return Map.of("agoraSimulado", clock.agora().toString());
    }

    @PostMapping("/admin/clock/resetar")
    public Map<String, Object> resetar() {
        clock.resetar();
        return Map.of("agora", clock.agora().toString());
    }

    @PostMapping("/jobs/lembretes/executar")
    public Map<String, Integer> executar() {
        return Map.of("enviados", pedidos.enviarLembretesDevidos());
    }

    // Roda sozinho a cada minuto, usando o relógio (simulado ou real)
    @Scheduled(fixedDelay = 60_000)
    public void agendado() {
        pedidos.enviarLembretesDevidos();
    }
}