package br.com.halotec.hungospring.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
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
}


//    @OneToOne
//    private Funcionario funcionario;
