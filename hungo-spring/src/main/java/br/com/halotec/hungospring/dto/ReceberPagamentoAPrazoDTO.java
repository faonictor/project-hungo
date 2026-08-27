package br.com.halotec.hungospring.dto;

import java.io.Serializable;

public class ReceberPagamentoAPrazoDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Float valorRecebido;
    private String formaPagamentoReal;
    private Float desconto;

    public ReceberPagamentoAPrazoDTO() {}

    public ReceberPagamentoAPrazoDTO(Float valorRecebido, String formaPagamentoReal, Float desconto) {
        this.valorRecebido = valorRecebido;
        this.formaPagamentoReal = formaPagamentoReal;
        this.desconto = desconto;
    }

    public Float getValorRecebido() {
        return valorRecebido;
    }

    public void setValorRecebido(Float valorRecebido) {
        this.valorRecebido = valorRecebido;
    }

    public String getFormaPagamentoReal() {
        return formaPagamentoReal;
    }

    public void setFormaPagamentoReal(String formaPagamentoReal) {
        this.formaPagamentoReal = formaPagamentoReal;
    }

    public Float getDesconto() {
        return desconto;
    }

    public void setDesconto(Float desconto) {
        this.desconto = desconto;
    }
}
