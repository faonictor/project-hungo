package br.com.halotec.hungospring.entity.enums;

public enum StatusPedido {
    ABERTO("Aberto"),
    EM_PREPARO("Em preparo"),
    CONCLUIDO("Concluído"),
    CANCELADO("Cancelado");

    private final String descricao;

    StatusPedido(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }

    public static StatusPedido fromString(String text) {
        if (text == null || text.trim().isEmpty()) {
            return ABERTO;
        }
        for (StatusPedido s : StatusPedido.values()) {
            if (s.name().equalsIgnoreCase(text) || s.descricao.equalsIgnoreCase(text) ||
                (s == CONCLUIDO && "Concluido".equalsIgnoreCase(text))) {
                return s;
            }
        }
        return ABERTO;
    }
}
