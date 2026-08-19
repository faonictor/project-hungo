package br.com.halotec.hungospring.entity;

import jakarta.persistence.*;

@Entity
public class ProdutoInsumo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int quantidade;

    @ManyToOne
    private Produto produto;

    @ManyToOne
    private Insumo insumo;

    public ProdutoInsumo() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public int getQuantidade() { return quantidade; }
    public void setQuantidade(int quantidade) { this.quantidade = quantidade; }
    public Produto getProduto() { return produto; }
    public void setProduto(Produto produto) { this.produto = produto; }
    public Insumo getInsumo() { return insumo; }
    public void setInsumo(Insumo insumo) { this.insumo = insumo; }
}