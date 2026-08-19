package br.com.halotec.hungospring.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Pedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Cliente cliente;

    @ManyToOne
    private Endereco endereco;

    @ManyToOne
    private Venda venda;

    private LocalDateTime dataHora;
    private LocalDateTime dataInicioPreparo;
    private LocalDateTime dataFimPreparo;
    private String tipoPedido;
    private String statusPedido;
    private String motivoCancelamento;

    public Pedido() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }
    public Endereco getEndereco() { return endereco; }
    public void setEndereco(Endereco endereco) { this.endereco = endereco; }
    public Venda getVenda() { return venda; }
    public void setVenda(Venda venda) { this.venda = venda; }
    public LocalDateTime getDataHora() { return dataHora; }
    public void setDataHora(LocalDateTime dataHora) { this.dataHora = dataHora; }
    public LocalDateTime getDataInicioPreparo() { return dataInicioPreparo; }
    public void setDataInicioPreparo(LocalDateTime dataInicioPreparo) { this.dataInicioPreparo = dataInicioPreparo; }
    public LocalDateTime getDataFimPreparo() { return dataFimPreparo; }
    public void setDataFimPreparo(LocalDateTime dataFimPreparo) { this.dataFimPreparo = dataFimPreparo; }
    public String getTipoPedido() { return tipoPedido; }
    public void setTipoPedido(String tipoPedido) { this.tipoPedido = tipoPedido; }
    public String getStatusPedido() { return statusPedido; }
    public void setStatusPedido(String statusPedido) { this.statusPedido = statusPedido; }
    public String getMotivoCancelamento() { return motivoCancelamento; }
    public void setMotivoCancelamento(String motivoCancelamento) { this.motivoCancelamento = motivoCancelamento; }
}
