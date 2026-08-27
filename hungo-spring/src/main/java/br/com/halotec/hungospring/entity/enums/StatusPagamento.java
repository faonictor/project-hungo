package br.com.halotec.hungospring.entity.enums;

public enum StatusPagamento {
    PENDENTE,
    PARCIAL,
    PAGO;

    public static StatusPagamento fromString(String text) {
        if (text == null || text.trim().isEmpty()) {
            return PENDENTE;
        }
        for (StatusPagamento s : StatusPagamento.values()) {
            if (s.name().equalsIgnoreCase(text)) {
                return s;
            }
        }
        return PENDENTE;
    }
}
