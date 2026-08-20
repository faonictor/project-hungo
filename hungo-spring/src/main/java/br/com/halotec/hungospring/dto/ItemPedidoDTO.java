package br.com.halotec.hungospring.dto;

public class ItemPedidoDTO {
    private Long id;
    private Long produtoId;
    private Integer quantidade;
    private Float total;
    private String statusItem;
    private String motivoCancelamento;

    public ItemPedidoDTO() {}

    public ItemPedidoDTO(Long id, Long produtoId, Integer quantidade, Float total) {
        this.id = id;
        this.produtoId = produtoId;
        this.quantidade = quantidade;
        this.total = total;
    }

    public ItemPedidoDTO(Long id, Long produtoId, Integer quantidade, Float total, String statusItem, String motivoCancelamento) {
        this.id = id;
        this.produtoId = produtoId;
        this.quantidade = quantidade;
        this.total = total;
        this.statusItem = statusItem;
        this.motivoCancelamento = motivoCancelamento;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProdutoId() { return produtoId; }
    public void setProdutoId(Long produtoId) { this.produtoId = produtoId; }
    public Integer getQuantidade() { return quantidade != null ? quantidade : 0; }
    public void setQuantidade(Integer quantidade) { this.quantidade = quantidade; }
    public Float getTotal() { return total; }
    public void setTotal(Float total) { this.total = total; }
    public String getStatusItem() { return statusItem; }
    public void setStatusItem(String statusItem) { this.statusItem = statusItem; }
    public String getMotivoCancelamento() { return motivoCancelamento; }
    public void setMotivoCancelamento(String motivoCancelamento) { this.motivoCancelamento = motivoCancelamento; }
}
