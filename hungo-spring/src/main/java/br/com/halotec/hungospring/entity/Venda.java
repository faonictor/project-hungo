package br.com.halotec.hungospring.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Venda {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // LOCAL, BALCAO, DELIVERY
    private String tipoAtendimento;

    @ManyToOne
    private Mesa mesa;

    @ManyToOne
    private Cliente cliente;

    private String nomeCliente;

    @ManyToOne
    private Endereco endereco;

    private Float taxaEntrega;
    private String formaPagamento;

    private LocalDateTime dataInicioVenda;
    private LocalDateTime dataFimVenda;
    private float total;
    private Float valorPago;

    private String status;
    
    @Column(columnDefinition = "TEXT")
    private String motivoCancelamento;

    @Transient
    private Float totalBruto;

    public Venda() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTipoAtendimento() { return tipoAtendimento; }
    public void setTipoAtendimento(String tipoAtendimento) { this.tipoAtendimento = tipoAtendimento; }
    public Mesa getMesa() { return mesa; }
    public void setMesa(Mesa mesa) { this.mesa = mesa; }
    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }
    public String getNomeCliente() { return nomeCliente; }
    public void setNomeCliente(String nomeCliente) { this.nomeCliente = nomeCliente; }
    public Endereco getEndereco() { return endereco; }
    public void setEndereco(Endereco endereco) { this.endereco = endereco; }
    public Float getTaxaEntrega() { return taxaEntrega; }
    public void setTaxaEntrega(Float taxaEntrega) { this.taxaEntrega = taxaEntrega; }
    public String getFormaPagamento() { return formaPagamento; }
    public void setFormaPagamento(String formaPagamento) { this.formaPagamento = formaPagamento; }
    public LocalDateTime getDataInicioVenda() { return dataInicioVenda; }
    public void setDataInicioVenda(LocalDateTime dataInicioVenda) { this.dataInicioVenda = dataInicioVenda; }
    public LocalDateTime getDataFimVenda() { return dataFimVenda; }
    public void setDataFimVenda(LocalDateTime dataFimVenda) { this.dataFimVenda = dataFimVenda; }
    public float getTotal() { return total; }
    public void setTotal(float total) { this.total = total; }
    public Float getValorPago() { return valorPago; }
    public void setValorPago(Float valorPago) { this.valorPago = valorPago; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getMotivoCancelamento() { return motivoCancelamento; }
    public void setMotivoCancelamento(String motivoCancelamento) { this.motivoCancelamento = motivoCancelamento; }
    public Float getTotalBruto() { return totalBruto; }
    public void setTotalBruto(Float totalBruto) { this.totalBruto = totalBruto; }
}
