package org.example.crm.parceiro90.exceptions;

public class IaIndisponivelException extends RuntimeException {
    public IaIndisponivelException(Throwable causa) {
        super("Serviço de IA indisponível", causa);
    }
}