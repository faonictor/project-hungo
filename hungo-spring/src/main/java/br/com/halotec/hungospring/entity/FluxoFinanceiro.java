package br.com.halotec.hungospring.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class FluxoFinanceiro {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nome;
    private String descricao;
    private String transacao;
    private LocalDateTime dataTransacao;

    @ManyToOne
    private Venda venda;
    private float fluxo;

    public FluxoFinanceiro() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public String getTransacao() { return transacao; }
    public void setTransacao(String transacao) { this.transacao = transacao; }
    public LocalDateTime getDataTransacao() { return dataTransacao; }
    public void setDataTransacao(LocalDateTime dataTransacao) { this.dataTransacao = dataTransacao; }
    public Venda getVenda() { return venda; }
    public void setVenda(Venda venda) { this.venda = venda; }
    public float getFluxo() { return fluxo; }
    public void setFluxo(float fluxo) { this.fluxo = fluxo; }
}
