package br.com.halotec.hungospring.entity.enums;

public enum StatusVenda {
    ABERTA,
    ENCERRADA,
    CANCELADA;

    public static StatusVenda fromString(String text) {
        if (text == null || text.trim().isEmpty()) {
            return ABERTA;
        }
        for (StatusVenda s : StatusVenda.values()) {
            if (s.name().equalsIgnoreCase(text)) {
                return s;
            }
        }
        return ABERTA;
    }
}
