package br.com.halotec.hungospring.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "PagamentoComanda")
public class PagamentoComanda implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venda_id")
    private Venda venda;

    @Column(precision = 10, scale = 2)
    private BigDecimal valorPago;

    private String formaPagamento;
    private String tipo;

    @Column(precision = 10, scale = 2)
    private BigDecimal totalAntes;

    @Column(precision = 10, scale = 2)
    private BigDecimal saldoRestante;

    @Column(precision = 10, scale = 2)
    private BigDecimal desconto;

    private LocalDateTime dataPagamento;

    public PagamentoComanda() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Venda getVenda() {
        return venda;
    }

    public void setVenda(Venda venda) {
        this.venda = venda;
    }

    public BigDecimal getValorPago() {
        return valorPago != null ? valorPago : BigDecimal.ZERO;
    }

    public void setValorPago(BigDecimal valorPago) {
        this.valorPago = valorPago;
    }

    public String getFormaPagamento() {
        return formaPagamento;
    }

    public void setFormaPagamento(String formaPagamento) {
        this.formaPagamento = formaPagamento;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public BigDecimal getTotalAntes() {
        return totalAntes != null ? totalAntes : BigDecimal.ZERO;
    }

    public void setTotalAntes(BigDecimal totalAntes) {
        this.totalAntes = totalAntes;
    }

    public BigDecimal getSaldoRestante() {
        return saldoRestante != null ? saldoRestante : BigDecimal.ZERO;
    }

    public void setSaldoRestante(BigDecimal saldoRestante) {
        this.saldoRestante = saldoRestante;
    }

    public BigDecimal getDesconto() {
        return desconto != null ? desconto : BigDecimal.ZERO;
    }

    public void setDesconto(BigDecimal desconto) {
        this.desconto = desconto;
    }

    public LocalDateTime getDataPagamento() {
        return dataPagamento;
    }

    public void setDataPagamento(LocalDateTime dataPagamento) {
        this.dataPagamento = dataPagamento;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PagamentoComanda that = (PagamentoComanda) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "PagamentoComanda{" +
                "id=" + id +
                ", valorPago=" + valorPago +
                ", formaPagamento='" + formaPagamento + '\'' +
                ", tipo='" + tipo + '\'' +
                ", dataPagamento=" + dataPagamento +
                '}';
    }
}
