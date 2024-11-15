package br.com.halotec.hungospring.entity;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class Mesa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nome;
    private String status;
}

