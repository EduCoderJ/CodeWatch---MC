package org.example.crm.parceiro90.controllers;

import org.example.crm.parceiro90.dtos.ChatRequest;
import org.example.crm.parceiro90.dtos.ChatResponse;
import org.example.crm.parceiro90.services.ChatService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chat;

    public ChatController(ChatService chat) { this.chat = chat; }

    @PostMapping
    public ChatResponse conversar(@RequestBody ChatRequest req) {
        return chat.processar(req.eventoId(), req.whatsapp(), req.texto());
    }
}