package br.com.halotec.hungospring.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class Insumo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nome;
    private float preco;
    private float quantidade;
    private String unidadeMedida;
}
