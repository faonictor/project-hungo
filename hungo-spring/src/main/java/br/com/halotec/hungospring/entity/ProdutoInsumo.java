package br.com.halotec.hungospring.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
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
}