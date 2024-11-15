package br.com.halotec.hungospring.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class FluxoFinanceiro {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nome;
    private String descricao;

    @ManyToOne
    private Venda venda;
    private float saida;

    @OneToOne
    private Funcionario funcionario;
}
