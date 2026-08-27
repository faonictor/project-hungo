package br.com.halotec.hungospring.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "Venda")
public class Venda implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Número sequencial diário da comanda (reinicia a 00:00 todo dia: 1, 2, 3...)
    private Integer numeroComanda;

    // LOCAL, RETIRADA, BALCAO, DELIVERY
    private String tipoAtendimento;

    @ManyToOne
    @JoinColumn(name = "mesa_id")
    private Mesa mesa;

    @ManyToOne
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    private String nomeCliente;

    @ManyToOne
    @JoinColumn(name = "endereco_id")
    private Endereco endereco;

    private Float taxaEntrega;
    private String formaPagamento;

    private LocalDateTime dataInicioVenda;
    private LocalDateTime dataFimVenda;
    private LocalDate dataVencimento;
    private String statusPagamento; // PAGO, PENDENTE, PARCIAL
    private Float total;
    private Float valorPago;
    private Float desconto;

    private String status;

    @Column(columnDefinition = "TEXT")
    private String motivoCancelamento;

    @Transient
    private Float totalBruto;

    public Venda() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getNumeroComanda() {
        return numeroComanda;
    }

    public void setNumeroComanda(Integer numeroComanda) {
        this.numeroComanda = numeroComanda;
    }

    public String getTipoAtendimento() {
        return tipoAtendimento;
    }

    public void setTipoAtendimento(String tipoAtendimento) {
        this.tipoAtendimento = tipoAtendimento;
    }

    public Mesa getMesa() {
        return mesa;
    }

    public void setMesa(Mesa mesa) {
        this.mesa = mesa;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public String getNomeCliente() {
        return nomeCliente;
    }

    public void setNomeCliente(String nomeCliente) {
        this.nomeCliente = nomeCliente;
    }

    public Endereco getEndereco() {
        return endereco;
    }

    public void setEndereco(Endereco endereco) {
        this.endereco = endereco;
    }

    public Float getTaxaEntrega() {
        return taxaEntrega;
    }

    public void setTaxaEntrega(Float taxaEntrega) {
        this.taxaEntrega = taxaEntrega;
    }

    public String getFormaPagamento() {
        return formaPagamento;
    }

    public void setFormaPagamento(String formaPagamento) {
        this.formaPagamento = formaPagamento;
    }

    public LocalDateTime getDataInicioVenda() {
        return dataInicioVenda;
    }

    public void setDataInicioVenda(LocalDateTime dataInicioVenda) {
        this.dataInicioVenda = dataInicioVenda;
    }

    public LocalDateTime getDataFimVenda() {
        return dataFimVenda;
    }

    public void setDataFimVenda(LocalDateTime dataFimVenda) {
        this.dataFimVenda = dataFimVenda;
    }

    public LocalDate getDataVencimento() {
        return dataVencimento;
    }

    public void setDataVencimento(LocalDate dataVencimento) {
        this.dataVencimento = dataVencimento;
    }

    public String getStatusPagamento() {
        return statusPagamento;
    }

    public void setStatusPagamento(String statusPagamento) {
        this.statusPagamento = statusPagamento;
    }

    public Float getTotal() {
        return total != null ? total : 0.0f;
    }

    public void setTotal(Float total) {
        this.total = total;
    }

    public Float getValorPago() {
        return valorPago != null ? valorPago : 0.0f;
    }

    public void setValorPago(Float valorPago) {
        this.valorPago = valorPago;
    }

    public Float getDesconto() {
        return desconto != null ? desconto : 0.0f;
    }

    public void setDesconto(Float desconto) {
        this.desconto = desconto;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMotivoCancelamento() {
        return motivoCancelamento;
    }

    public void setMotivoCancelamento(String motivoCancelamento) {
        this.motivoCancelamento = motivoCancelamento;
    }

    public Float getTotalBruto() {
        return totalBruto;
    }

    public void setTotalBruto(Float totalBruto) {
        this.totalBruto = totalBruto;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Venda venda = (Venda) o;
        return Objects.equals(id, venda.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "Venda{" +
                "id=" + id +
                ", tipoAtendimento='" + tipoAtendimento + '\'' +
                ", status='" + status + '\'' +
                ", total=" + total +
                ", valorPago=" + valorPago +
                '}';
    }
}
