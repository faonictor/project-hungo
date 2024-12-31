package br.com.halotec.hungospring.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class VendaDTO {
    private Long id;
    private Long mesaId;   // Relacionamento com Mesa
    private LocalDateTime dataInicioVenda;
    private LocalDateTime dataFimVenda;
    private float total;
}