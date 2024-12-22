package br.com.halotec.hungospring.dto;

import lombok.Data;

@Data
public class ClienteEnderecoDTO {
    private String nome;
    private String telefone;
    private String email;
    private String senha;
    private String cpf;
    private String rua;
    private int numero;
    private String complemento;
    private String bairro;
    private String cidade;
    private String cep;
}