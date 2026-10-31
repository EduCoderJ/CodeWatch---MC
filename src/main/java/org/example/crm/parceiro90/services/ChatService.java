package org.example.crm.parceiro90.services;

import org.example.crm.parceiro90.domain.entities.Colaborador;
import org.example.crm.parceiro90.domain.entities.Pedido;
import org.example.crm.parceiro90.domain.enums.Opcao;
import org.example.crm.parceiro90.domain.enums.StatusConfirmacao;
import org.example.crm.parceiro90.dtos.AnaliseIa;
import org.example.crm.parceiro90.dtos.ChatResponse;
import org.example.crm.parceiro90.exceptions.IaIndisponivelException;
import org.example.crm.parceiro90.repositories.ColaboradorRepository;
import org.example.crm.parceiro90.repositories.PedidoRepository;
import org.springframework.stereotype.Service;

@Service
public class ChatService {

    private final ColaboradorRepository colaboradores;
    private final PedidoRepository pedidos;
    private final IaService ia;
    private final PedidoService pedidoService;

    public ChatService(ColaboradorRepository colaboradores, PedidoRepository pedidos,
                       IaService ia, PedidoService pedidoService) {
        this.colaboradores = colaboradores;
        this.pedidos = pedidos;
        this.ia = ia;
        this.pedidoService = pedidoService;
    }

    public ChatResponse processar(String eventoId, String whatsapp, String texto) {
        Colaborador c = colaboradores.findByWhatsapp(whatsapp).orElse(null);
        if (c == null) {
            return new ChatResponse(null, "Não encontrei seu cadastro. Fale com seu líder.");
        }

        // Consentimento (participação é voluntária)
        if (!c.isConsentimento()) {
            if (texto.trim().equalsIgnoreCase("sim")) {
                c.setConsentimento(true);
                colaboradores.save(c);
                return new ChatResponse(null, "Obrigado, " + c.getNome() + "! Só o que você confirmar "
                        + "será encaminhado a alguém. Como foi seu dia?");
            }
            return new ChatResponse(null, "Oi! Sou a IA do Méqui, uma assistente virtual. Participar é uma "
                    + "escolha sua e nada é encaminhado sem a sua confirmação. Responda SIM para começar.");
        }

        // 1) O texto é uma resposta 1-4 a um pedido pendente?
        String limpo = texto.trim();
        var pendente = pedidos.findFirstByColaboradorIdAndStatusConfirmacaoOrderByIdDesc(
                c.getId(), StatusConfirmacao.PENDENTE);
        if (pendente.isPresent() && limpo.matches("[1-4]")) {
            Opcao opcao = Opcao.values()[Integer.parseInt(limpo) - 1];
            pedidoService.aplicarOpcao(pendente.get().getId(), opcao);
            return new ChatResponse(pendente.get().getId(), null);   // mensagens já enviadas pelo service
        }

        // 2) Análise da IA
        AnaliseIa analise;
        try {
            analise = ia.analisar(texto);
        } catch (IaIndisponivelException e) {
            return new ChatResponse(null, "Estou com instabilidade agora. Se precisar de ajuda, "
                    + "responda 4 e uma pessoa fala com você.");
        }

        if (analise.infoInsuficiente() || "ambiguo".equals(analise.intencao())) {
            return new ChatResponse(null, "Quer me contar um pouco mais? Assim eu entendo melhor.");
        }
        if ("duvida".equals(analise.intencao())) {
            // Aqui entra o RAG (busca no material da Kallopolli) na próxima fase
            return new ChatResponse(null, "Boa pergunta! Ainda estou aprendendo o material de treinamento. "
                    + "Quer que eu avise seu líder para te ajudar?");
        }
        if ("saudacao".equals(analise.intencao())) {
            return new ChatResponse(null, "Oi! Como foi o seu dia?");
        }

        // 3) Desabafo ou pedido de apoio -> alça de confirmação (human-in-the-loop)
        Pedido p = pedidoService.criarPendente(eventoId, c, analise, texto);
        String mensagem = "Entendi: \"" + analise.resumo() + "\"\nO que você prefere?\n"
                + "1) Confirmar e encaminhar\n"
                + "2) Corrigir\n"
                + "3) Não encaminhar\n"
                + "4) Pedir ajuda direta";
        return new ChatResponse(p.getId(), mensagem);
    }
}