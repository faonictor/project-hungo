package br.com.halotec.hungospring.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class PagamentoComanda {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Venda venda;

    private float valorPago;
    private String formaPagamento;
    private String tipo; // PARCIAL ou TOTAL
    private float totalAntes;
    private float saldoRestante;
    private float desconto;
    private LocalDateTime dataPagamento;

    public PagamentoComanda() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Venda getVenda() { return venda; }
    public void setVenda(Venda venda) { this.venda = venda; }
    public float getValorPago() { return valorPago; }
    public void setValorPago(float valorPago) { this.valorPago = valorPago; }
    public String getFormaPagamento() { return formaPagamento; }
    public void setFormaPagamento(String formaPagamento) { this.formaPagamento = formaPagamento; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public float getTotalAntes() { return totalAntes; }
    public void setTotalAntes(float totalAntes) { this.totalAntes = totalAntes; }
    public float getSaldoRestante() { return saldoRestante; }
    public void setSaldoRestante(float saldoRestante) { this.saldoRestante = saldoRestante; }
    public float getDesconto() { return desconto; }
    public void setDesconto(float desconto) { this.desconto = desconto; }
    public LocalDateTime getDataPagamento() { return dataPagamento; }
    public void setDataPagamento(LocalDateTime dataPagamento) { this.dataPagamento = dataPagamento; }
}
