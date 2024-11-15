package br.com.halotec.hungospring.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
public class Venda {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Mesa mesa;

    private LocalDateTime dataInicioVenda;
    private LocalDateTime dataFimVenda;
    private float total;
}
