package br.com.halotec.hungospring.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "PagamentoComanda")
public class PagamentoComanda implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "venda_id")
    private Venda venda;

    private Float valorPago;
    private String formaPagamento;
    private String tipo; // PARCIAL ou TOTAL
    private Float totalAntes;
    private Float saldoRestante;
    private Float desconto;
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

    public Float getValorPago() {
        return valorPago != null ? valorPago : 0.0f;
    }

    public void setValorPago(Float valorPago) {
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

    public Float getTotalAntes() {
        return totalAntes != null ? totalAntes : 0.0f;
    }

    public void setTotalAntes(Float totalAntes) {
        this.totalAntes = totalAntes;
    }

    public Float getSaldoRestante() {
        return saldoRestante != null ? saldoRestante : 0.0f;
    }

    public void setSaldoRestante(Float saldoRestante) {
        this.saldoRestante = saldoRestante;
    }

    public Float getDesconto() {
        return desconto != null ? desconto : 0.0f;
    }

    public void setDesconto(Float desconto) {
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
