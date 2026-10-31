package org.example.crm.parceiro90.services;

import org.example.crm.parceiro90.domain.entities.Colaborador;
import org.example.crm.parceiro90.domain.entities.Pedido;
import org.example.crm.parceiro90.domain.entities.Responsavel;
import org.example.crm.parceiro90.domain.enums.*;
import org.example.crm.parceiro90.dtos.AnaliseIa;
import org.example.crm.parceiro90.exceptions.PedidoNaoEncontradoException;
import org.example.crm.parceiro90.repositories.ColaboradorRepository;
import org.example.crm.parceiro90.repositories.PedidoRepository;
import org.example.crm.parceiro90.repositories.ResponsavelRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class PedidoService {

    private final PedidoRepository pedidos;
    private final ColaboradorRepository colaboradores;
    private final ResponsavelRepository responsaveis;
    private final RoteadorService roteador;
    private final NotificacaoService notificacao;
    private final ClockService clock;
    private final long lembreteHoras;

    public PedidoService(PedidoRepository pedidos, ColaboradorRepository colaboradores,
                         ResponsavelRepository responsaveis, RoteadorService roteador,
                         NotificacaoService notificacao, ClockService clock,
                         @Value("${app.lembrete-horas}") long lembreteHoras) {
        this.pedidos = pedidos;
        this.colaboradores = colaboradores;
        this.responsaveis = responsaveis;
        this.roteador = roteador;
        this.notificacao = notificacao;
        this.clock = clock;
        this.lembreteHoras = lembreteHoras;
    }

    public Pedido buscar(Long id) {
        return pedidos.findById(id).orElseThrow(() -> new PedidoNaoEncontradoException(id));
    }

    // Repetir a mesma mensagem (mesmo eventoId) devolve o pedido existente
    @Transactional
    public Pedido criarPendente(String eventoId, Colaborador colaborador, AnaliseIa analise, String textoOriginal) {
        return pedidos.findByEventoId(eventoId).orElseGet(() -> {
            Pedido p = new Pedido();
            p.setEventoId(eventoId);
            p.setColaboradorId(colaborador.getId());
            p.setResumo(analise.resumo());
            p.setCategoria(analise.categoria());
            p.setDestino(roteador.destino(analise.categoria(), textoOriginal));
            p.setCriadoEm(clock.agora());
            return pedidos.save(p);
        });
    }

    @Transactional
    public Pedido aplicarOpcao(Long pedidoId, Opcao opcao) {
        Pedido p = buscar(pedidoId);
        if (p.getStatusConfirmacao() != StatusConfirmacao.PENDENTE) return p;   // idempotente

        Colaborador c = colaboradores.findById(p.getColaboradorId()).orElseThrow();

        switch (opcao) {
            case CONFIRMAR -> {
                Responsavel r = roteador.responsavel(p.getDestino(), c.getIdLoja());
                p.setResponsavelId(r.getId());
                p.setStatusConfirmacao(StatusConfirmacao.CONFIRMADO);
                p.setSituacao(Situacao.ENCAMINHADO);
                p.setPrazoLembreteEm(clock.agora().plus(lembreteHoras, ChronoUnit.HOURS));

                // aviso com informação mínima + referência ao pedido
                String urgencia = p.getDestino() == Destino.RH ? "(canal RH)" : "ainda hoje";
                notificacao.enviar(r.getWhatsapp(), "Pedido #" + p.getId()
                        + ": uma pessoa nova na equipe pode precisar de contato " + urgencia
                        + ". Responda 1 = conversei | 2 = não consegui.");
                // transparência: o colaborador sabe quem foi avisado
                notificacao.enviar(c.getWhatsapp(), "Combinado, avisei " + r.getPapel()
                        + ". Você pode me chamar quando quiser.");
            }
            case NAO_ENCAMINHAR -> {
                p.setStatusConfirmacao(StatusConfirmacao.NAO_ENCAMINHADO);   // sem alerta
                p.setResumo(null);                                           // não guarda o conteúdo
                notificacao.enviar(c.getWhatsapp(), "Tudo bem, não vou avisar ninguém.");
            }
            case AJUDA_DIRETA -> {
                p.setStatusConfirmacao(StatusConfirmacao.AJUDA_DIRETA);      // não passa pela IA
                notificacao.enviar(c.getWhatsapp(), "Vou pedir para uma pessoa entrar em contato com você.");
            }
            case CORRIGIR -> notificacao.enviar(c.getWhatsapp(), "Pode me mandar o texto corrigido?");
        }
        return pedidos.save(p);
    }

    // Atualiza o MESMO pedido. "Conversei" não resolve o caso sozinho.
    @Transactional
    public Pedido registrarRetorno(Long pedidoId, boolean conversou) {
        Pedido p = buscar(pedidoId);
        if (conversou) {
            p.setSituacao(Situacao.CONTATO_REALIZADO);
        } else {
            p.setSituacao(Situacao.SEM_SUCESSO);                              // pendência continua
            p.setLembreteEnviado(false);
            p.setPrazoLembreteEm(clock.agora().plus(lembreteHoras, ChronoUnit.HOURS));
        }
        return pedidos.save(p);
    }

    @Transactional
    public Pedido concluir(Long pedidoId) {
        Pedido p = buscar(pedidoId);
        p.setSituacao(Situacao.CONCLUIDO);
        return pedidos.save(p);
    }

    @Transactional
    public int enviarLembretesDevidos() {
        List<Pedido> devidos = pedidos.findByLembreteEnviadoFalseAndPrazoLembreteEmBeforeAndSituacaoIn(
                clock.agora(), List.of(Situacao.ENCAMINHADO, Situacao.SEM_SUCESSO));

        for (Pedido p : devidos) {
            responsaveis.findById(p.getResponsavelId()).ifPresent(r ->
                    notificacao.enviar(r.getWhatsapp(),
                            "Lembrete: o pedido #" + p.getId() + " ainda aguarda retorno."));
            p.setLembreteEnviado(true);
        }
        pedidos.saveAll(devidos);
        return devidos.size();
    }
}