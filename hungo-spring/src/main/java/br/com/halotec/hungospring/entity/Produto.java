package br.com.halotec.hungospring.entity;

import jakarta.persistence.*;

@Entity
public class Produto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nome;
    private Float preco;
    private Boolean tipo;
    private Boolean favorito = false;

    @ManyToOne
    private Categoria categoria;

    public Produto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public Float getPreco() { return preco; }
    public void setPreco(Float preco) { this.preco = preco; }
    public Boolean getTipo() { return tipo; }
    public void setTipo(Boolean tipo) { this.tipo = tipo; }
    public Boolean getFavorito() { return favorito; }
    public void setFavorito(Boolean favorito) { this.favorito = favorito; }
    public Categoria getCategoria() { return categoria; }
    public void setCategoria(Categoria categoria) { this.categoria = categoria; }
}
