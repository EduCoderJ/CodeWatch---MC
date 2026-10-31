package org.example.crm.parceiro90.services;

import org.example.crm.parceiro90.dtos.ChatResponse;
import org.example.crm.parceiro90.dtos.EvolutionWebhook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class WebhookService {

    private static final Logger log = LoggerFactory.getLogger(WebhookService.class);

    // Evita processar duas vezes o mesmo evento reenviado pelo WhatsApp
    // (em memória; para produção, grave em tabela)
    private final Set<String> eventosVistos = ConcurrentHashMap.newKeySet();

    private final ChatService chat;
    private final NotificacaoService notificacao;

    public WebhookService(ChatService chat, NotificacaoService notificacao) {
        this.chat = chat;
        this.notificacao = notificacao;
    }

    @Async
    public void processar(EvolutionWebhook webhook) {
        try {
            var data = webhook.data();
            if (data == null || data.key() == null || data.message() == null) return;
            if (Boolean.TRUE.equals(data.key().fromMe())) return;          // ignora mensagens do próprio bot

            String eventoId = data.key().id();
            String texto = data.message().conversation();
            if (eventoId == null || texto == null || texto.isBlank()) return;
            if (!eventosVistos.add(eventoId)) return;                      // duplicado

            String numero = data.key().remoteJid().replace("@s.whatsapp.net", "");
            ChatResponse resposta = chat.processar(eventoId, numero, texto);
            if (resposta.mensagem() != null) notificacao.enviar(numero, resposta.mensagem());
        } catch (Exception e) {
            log.error("Erro ao processar webhook", e);
        }
    }
}