package br.com.halotec.hungospring.entity;

import jakarta.persistence.*;

@Entity
public class Insumo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nome;
    private float preco;
    private float quantidade;
    private String unidadeMedida;

    public Insumo() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public float getPreco() { return preco; }
    public void setPreco(float preco) { this.preco = preco; }
    public float getQuantidade() { return quantidade; }
    public void setQuantidade(float quantidade) { this.quantidade = quantidade; }
    public String getUnidadeMedida() { return unidadeMedida; }
    public void setUnidadeMedida(String unidadeMedida) { this.unidadeMedida = unidadeMedida; }
}
