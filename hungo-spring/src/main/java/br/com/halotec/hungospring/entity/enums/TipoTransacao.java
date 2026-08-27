package br.com.halotec.hungospring.entity.enums;

public enum TipoTransacao {
    ENTRADA("Entrada"),
    SAIDA("Saída");

    private final String descricao;

    TipoTransacao(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }

    public static TipoTransacao fromString(String text) {
        if (text == null || text.trim().isEmpty()) {
            return ENTRADA;
        }
        for (TipoTransacao t : TipoTransacao.values()) {
            if (t.name().equalsIgnoreCase(text) || t.descricao.equalsIgnoreCase(text) ||
                (t == SAIDA && "Saida".equalsIgnoreCase(text))) {
                return t;
            }
        }
        return ENTRADA;
    }
}
