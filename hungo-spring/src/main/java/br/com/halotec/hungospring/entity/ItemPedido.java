package br.com.halotec.hungospring.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
public class ItemPedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JsonIgnoreProperties({"venda", "cliente", "endereco"})
    private Pedido pedido;

    @ManyToOne
    private Produto produto;
    private int quantidade;
    private float total;
    private String statusItem;
    private String motivoCancelamento;

    public ItemPedido() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Pedido getPedido() { return pedido; }
    public void setPedido(Pedido pedido) { this.pedido = pedido; }
    public Produto getProduto() { return produto; }
    public void setProduto(Produto produto) { this.produto = produto; }
    public int getQuantidade() { return quantidade; }
    public void setQuantidade(int quantidade) { this.quantidade = quantidade; }
    public float getTotal() { return total; }
    public void setTotal(float total) { this.total = total; }
    public String getStatusItem() { return statusItem; }
    public void setStatusItem(String statusItem) { this.statusItem = statusItem; }
    public String getMotivoCancelamento() { return motivoCancelamento; }
    public void setMotivoCancelamento(String motivoCancelamento) { this.motivoCancelamento = motivoCancelamento; }

    public Long getVendaId() {
        return (pedido != null && pedido.getVenda() != null) ? pedido.getVenda().getId() : null;
    }
}
