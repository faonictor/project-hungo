package br.com.halotec.hungospring.entity.enums;

public enum TipoAtendimento {
    LOCAL,
    RETIRADA,
    DELIVERY;

    public static TipoAtendimento fromString(String text) {
        if (text == null || text.trim().isEmpty()) {
            return LOCAL;
        }
        for (TipoAtendimento t : TipoAtendimento.values()) {
            if (t.name().equalsIgnoreCase(text)) {
                return t;
            }
        }
        return LOCAL;
    }
}
