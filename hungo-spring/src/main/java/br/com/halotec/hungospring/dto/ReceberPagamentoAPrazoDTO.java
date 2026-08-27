package br.com.halotec.hungospring.dto;

import java.io.Serializable;
import java.math.BigDecimal;

public class ReceberPagamentoAPrazoDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private BigDecimal valorRecebido;
    private String formaPagamentoReal;
    private BigDecimal desconto;

    public ReceberPagamentoAPrazoDTO() {}

    public ReceberPagamentoAPrazoDTO(BigDecimal valorRecebido, String formaPagamentoReal, BigDecimal desconto) {
        this.valorRecebido = valorRecebido;
        this.formaPagamentoReal = formaPagamentoReal;
        this.desconto = desconto;
    }

    public BigDecimal getValorRecebido() {
        return valorRecebido != null ? valorRecebido : BigDecimal.ZERO;
    }

    public void setValorRecebido(BigDecimal valorRecebido) {
        this.valorRecebido = valorRecebido;
    }

    public String getFormaPagamentoReal() {
        return formaPagamentoReal;
    }

    public void setFormaPagamentoReal(String formaPagamentoReal) {
        this.formaPagamentoReal = formaPagamentoReal;
    }

    public BigDecimal getDesconto() {
        return desconto != null ? desconto : BigDecimal.ZERO;
    }

    public void setDesconto(BigDecimal desconto) {
        this.desconto = desconto;
    }
}
