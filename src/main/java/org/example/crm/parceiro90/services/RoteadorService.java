package org.example.crm.parceiro90.services;

import org.example.crm.parceiro90.domain.entities.Responsavel;
import org.example.crm.parceiro90.domain.enums.Destino;
import org.example.crm.parceiro90.domain.enums.Papel;
import org.example.crm.parceiro90.repositories.ResponsavelRepository;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.regex.Pattern;

@Service
public class RoteadorService {

    private static final Set<String> CATEGORIAS_RH = Set.of("assedio", "conflito_chefia");

    // Rede de segurança: mesmo que a IA erre a categoria, estes termos forçam o RH.
    // É conservador de propósito: na dúvida, protege quem relata.
    private static final Pattern TERMOS_GRAVES = Pattern.compile(
            "ass[eé]dio|humilh|abus|amea[cç]|discrimin|persegu|(meu|minha) (gerente|chefe|l[ií]der)",
            Pattern.CASE_INSENSITIVE);

    private final ResponsavelRepository responsaveis;

    public RoteadorService(ResponsavelRepository responsaveis) {
        this.responsaveis = responsaveis;
    }

    public Destino destino(String categoria, String textoOriginal) {
        if (CATEGORIAS_RH.contains(categoria)) return Destino.RH;
        if (textoOriginal != null && TERMOS_GRAVES.matcher(textoOriginal).find()) return Destino.RH;
        return Destino.GERENTE;
    }

    // Gerente da loja -> líder de turno -> RH (responsável ausente)
    public Responsavel responsavel(Destino destino, Long idLoja) {
        Responsavel rh = responsaveis.findFirstByPapel(Papel.RH)
                .orElseThrow(() -> new IllegalStateException("Nenhum RH cadastrado"));
        if (destino == Destino.RH) return rh;

        return responsaveis.findFirstByPapelAndIdLoja(Papel.GERENTE, idLoja)
                .or(() -> responsaveis.findFirstByPapelAndIdLoja(Papel.LIDER_TURNO, idLoja))
                .orElse(rh);
    }
}