package br.com.halotec.hungospring.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
public class Pedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Cliente cliente;

    @ManyToOne
    private Endereco endereco;

    @ManyToOne
    private Venda venda;

    private LocalDateTime dataHora;
    private String tipoPedido;
    private String statusPedido;
}
