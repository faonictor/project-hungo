package br.com.halotec.hungospring.dto;

import java.time.LocalDateTime;
import java.util.List;

public class PedidoDTO {
    private Long id;
    private Long clienteId;
    private Long enderecoId;
    private Long vendaId;
    private String tipoPedido;
    private String statusPedido;
    private LocalDateTime dataHora;
    private LocalDateTime dataInicioPreparo;
    private LocalDateTime dataFimPreparo;
    private String motivoCancelamento;
    private List<ItemPedidoDTO> itens;

    public PedidoDTO() {}

    public PedidoDTO(Long id, Long clienteId, Long enderecoId, Long vendaId, String tipoPedido, String statusPedido, LocalDateTime dataHora, LocalDateTime dataInicioPreparo, LocalDateTime dataFimPreparo, String motivoCancelamento, List<ItemPedidoDTO> itens) {
        this.id = id;
        this.clienteId = clienteId;
        this.enderecoId = enderecoId;
        this.vendaId = vendaId;
        this.tipoPedido = tipoPedido;
        this.statusPedido = statusPedido;
        this.dataHora = dataHora;
        this.dataInicioPreparo = dataInicioPreparo;
        this.dataFimPreparo = dataFimPreparo;
        this.motivoCancelamento = motivoCancelamento;
        this.itens = itens;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getClienteId() { return clienteId; }
    public void setClienteId(Long clienteId) { this.clienteId = clienteId; }
    public Long getEnderecoId() { return enderecoId; }
    public void setEnderecoId(Long enderecoId) { this.enderecoId = enderecoId; }
    public Long getVendaId() { return vendaId; }
    public void setVendaId(Long vendaId) { this.vendaId = vendaId; }
    public String getTipoPedido() { return tipoPedido; }
    public void setTipoPedido(String tipoPedido) { this.tipoPedido = tipoPedido; }
    public String getStatusPedido() { return statusPedido; }
    public void setStatusPedido(String statusPedido) { this.statusPedido = statusPedido; }
    public LocalDateTime getDataHora() { return dataHora; }
    public void setDataHora(LocalDateTime dataHora) { this.dataHora = dataHora; }
    public LocalDateTime getDataInicioPreparo() { return dataInicioPreparo; }
    public void setDataInicioPreparo(LocalDateTime dataInicioPreparo) { this.dataInicioPreparo = dataInicioPreparo; }
    public LocalDateTime getDataFimPreparo() { return dataFimPreparo; }
    public void setDataFimPreparo(LocalDateTime dataFimPreparo) { this.dataFimPreparo = dataFimPreparo; }
    public String getMotivoCancelamento() { return motivoCancelamento; }
    public void setMotivoCancelamento(String motivoCancelamento) { this.motivoCancelamento = motivoCancelamento; }
    public List<ItemPedidoDTO> getItens() { return itens; }
    public void setItens(List<ItemPedidoDTO> itens) { this.itens = itens; }
}
