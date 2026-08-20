package br.com.halotec.hungospring.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "ComandaExcluida")
public class ComandaExcluida implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long comandaId;
    private LocalDateTime dataHoraExclusao;
    private String nomeCliente;
    private Float valorTotal;

    @Column(columnDefinition = "TEXT")
    private String motivo;

    public ComandaExcluida() {}

    public ComandaExcluida(Long comandaId, LocalDateTime dataHoraExclusao, String nomeCliente, Float valorTotal, String motivo) {
        this.comandaId = comandaId;
        this.dataHoraExclusao = dataHoraExclusao;
        this.nomeCliente = nomeCliente;
        this.valorTotal = valorTotal;
        this.motivo = motivo;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getComandaId() {
        return comandaId;
    }

    public void setComandaId(Long comandaId) {
        this.comandaId = comandaId;
    }

    public LocalDateTime getDataHoraExclusao() {
        return dataHoraExclusao;
    }

    public void setDataHoraExclusao(LocalDateTime dataHoraExclusao) {
        this.dataHoraExclusao = dataHoraExclusao;
    }

    public String getNomeCliente() {
        return nomeCliente;
    }

    public void setNomeCliente(String nomeCliente) {
        this.nomeCliente = nomeCliente;
    }

    public Float getValorTotal() {
        return valorTotal;
    }

    public void setValorTotal(Float valorTotal) {
        this.valorTotal = valorTotal;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ComandaExcluida that = (ComandaExcluida) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "ComandaExcluida{" +
                "id=" + id +
                ", comandaId=" + comandaId +
                ", nomeCliente='" + nomeCliente + '\'' +
                ", valorTotal=" + valorTotal +
                '}';
    }
}
