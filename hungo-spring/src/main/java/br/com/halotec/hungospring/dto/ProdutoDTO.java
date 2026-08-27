package br.com.halotec.hungospring.dto;

import java.math.BigDecimal;

public class ProdutoDTO {
    private Long id;
    private String nome;
    private BigDecimal preco;
    private Long categoriaId;
    private Boolean tipo;
    private Boolean favorito = false;

    public ProdutoDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public BigDecimal getPreco() { return preco; }
    public void setPreco(BigDecimal preco) { this.preco = preco; }
    public Long getCategoriaId() { return categoriaId; }
    public void setCategoriaId(Long categoriaId) { this.categoriaId = categoriaId; }
    public Boolean getTipo() { return tipo; }
    public void setTipo(Boolean tipo) { this.tipo = tipo; }
    public Boolean getFavorito() { return favorito; }
    public void setFavorito(Boolean favorito) { this.favorito = favorito; }
}