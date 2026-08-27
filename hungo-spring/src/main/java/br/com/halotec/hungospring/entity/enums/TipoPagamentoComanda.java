package br.com.halotec.hungospring.entity.enums;

public enum TipoPagamentoComanda {
    TOTAL,
    PARCIAL,
    QUITACAO_A_PRAZO,
    DEBITO_PARCIAL;

    public static TipoPagamentoComanda fromString(String text) {
        if (text == null || text.trim().isEmpty()) {
            return TOTAL;
        }
        for (TipoPagamentoComanda t : TipoPagamentoComanda.values()) {
            if (t.name().equalsIgnoreCase(text)) {
                return t;
            }
        }
        return TOTAL;
    }
}
