package org.example.crm.parceiro90.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class NotificacaoService {

    private static final Logger log = LoggerFactory.getLogger(NotificacaoService.class);

    private final boolean ativo;
    private final String instancia;
    private final RestClient http;

    public NotificacaoService(@Value("${app.evolution-ativo}") boolean ativo,
                              @Value("${app.evolution-url}") String url,
                              @Value("${app.evolution-key}") String key,
                              @Value("${app.evolution-instance}") String instancia) {
        this.ativo = ativo;
        this.instancia = instancia;
        this.http = RestClient.builder().baseUrl(url).defaultHeader("apikey", key).build();
    }

    public void enviar(String numero, String texto) {
        log.info("[WHATSAPP -> {}] {}", numero, texto);
        if (!ativo) return;
        try {
            http.post()
                    .uri("/message/sendText/{instancia}", instancia)
                    .body(Map.of("number", numero, "text", texto))
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            log.warn("Falha ao enviar WhatsApp: {}", e.getMessage());
        }
    }
}