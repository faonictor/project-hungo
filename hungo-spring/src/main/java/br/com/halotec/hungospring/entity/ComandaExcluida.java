package br.com.halotec.hungospring.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class ComandaExcluida {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long comandaId;
    private LocalDateTime dataHoraExclusao;
    private String nomeCliente;
    private float valorTotal;

    @Column(columnDefinition = "TEXT")
    private String motivo;

    public ComandaExcluida() {}

    public ComandaExcluida(Long comandaId, LocalDateTime dataHoraExclusao, String nomeCliente, float valorTotal, String motivo) {
        this.comandaId = comandaId;
        this.dataHoraExclusao = dataHoraExclusao;
        this.nomeCliente = nomeCliente;
        this.valorTotal = valorTotal;
        this.motivo = motivo;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getComandaId() { return comandaId; }
    public void setComandaId(Long comandaId) { this.comandaId = comandaId; }
    public LocalDateTime getDataHoraExclusao() { return dataHoraExclusao; }
    public void setDataHoraExclusao(LocalDateTime dataHoraExclusao) { this.dataHoraExclusao = dataHoraExclusao; }
    public String getNomeCliente() { return nomeCliente; }
    public void setNomeCliente(String nomeCliente) { this.nomeCliente = nomeCliente; }
    public float getValorTotal() { return valorTotal; }
    public void setValorTotal(float valorTotal) { this.valorTotal = valorTotal; }
    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }
}
