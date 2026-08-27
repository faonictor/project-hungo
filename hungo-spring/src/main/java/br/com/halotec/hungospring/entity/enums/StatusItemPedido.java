package br.com.halotec.hungospring.entity.enums;

public enum StatusItemPedido {
    ATIVO("Ativo"),
    CANCELADO("Cancelado");

    private final String descricao;

    StatusItemPedido(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }

    public static StatusItemPedido fromString(String text) {
        if (text == null || text.trim().isEmpty()) {
            return ATIVO;
        }
        for (StatusItemPedido s : StatusItemPedido.values()) {
            if (s.name().equalsIgnoreCase(text) || s.descricao.equalsIgnoreCase(text)) {
                return s;
            }
        }
        return ATIVO;
    }
}
