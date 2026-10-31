package org.example.crm.parceiro90.dtos;

// Só os campos que usamos; o resto é ignorado.
// Confira o formato na documentação da sua versão da Evolution API.
public record EvolutionWebhook(String event, Data data) {
    public record Data(Key key, Message message) {}
    public record Key(String id, String remoteJid, Boolean fromMe) {}
    public record Message(String conversation) {}
}
