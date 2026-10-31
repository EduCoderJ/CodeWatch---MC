package org.example.crm.parceiro90.services;

import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;

@Service
public class ClockService {

    private volatile Duration deslocamento = Duration.ZERO;

    public Instant agora() { return Instant.now().plus(deslocamento); }

    public void avancarHoras(long horas) { deslocamento = deslocamento.plusHours(horas); }

    public void resetar() { deslocamento = Duration.ZERO; }
}