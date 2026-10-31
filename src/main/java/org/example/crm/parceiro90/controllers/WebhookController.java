package org.example.crm.parceiro90.controllers;

import org.example.crm.parceiro90.dtos.EvolutionWebhook;
import org.example.crm.parceiro90.services.WebhookService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/webhook")
public class WebhookController {

    private final WebhookService webhookService;

    public WebhookController(WebhookService webhookService) {
        this.webhookService = webhookService;
    }

    @PostMapping("/whatsapp")
    public ResponseEntity<Void> receber(@RequestBody EvolutionWebhook webhook) {
        webhookService.processar(webhook);     // roda em segundo plano (@Async)
        return ResponseEntity.ok().build();    // ACK imediato
    }
}