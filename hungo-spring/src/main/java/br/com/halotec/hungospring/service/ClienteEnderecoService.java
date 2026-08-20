package br.com.halotec.hungospring.service;

import br.com.halotec.hungospring.dto.ClienteEnderecoDTO;
import br.com.halotec.hungospring.entity.Cliente;
import br.com.halotec.hungospring.entity.Endereco;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class ClienteEnderecoService {

    private final ClienteService clienteService;
    private final EnderecoService enderecoService;

    public ClienteEnderecoService(ClienteService clienteService, EnderecoService enderecoService) {
        this.clienteService = clienteService;
        this.enderecoService = enderecoService;
    }

    @Transactional
    public Cliente salvarClienteEndereco(ClienteEnderecoDTO dto) {
        Cliente cliente = new Cliente();
        cliente.setNome(dto.getNome());
        cliente.setTelefone(dto.getTelefone());
        cliente.setEmail(dto.getEmail());
        cliente.setCpf(dto.getCpf());
        cliente.setSenha(dto.getSenha());
        cliente.setDataCadastro(LocalDateTime.now());
        cliente.setStatus(dto.getStatus() != null ? dto.getStatus() : true);

        Cliente clienteSalvo = clienteService.salvar(cliente);

        if (dto.getRua() != null && !dto.getRua().trim().isEmpty()) {
            Endereco endereco = new Endereco();
            endereco.setRua(dto.getRua());
            endereco.setNumero(dto.getNumero());
            endereco.setComplemento(dto.getComplemento());
            endereco.setBairro(dto.getBairro());
            endereco.setCidade(dto.getCidade());
            endereco.setCep(dto.getCep());
            endereco.setCliente(clienteSalvo);

            enderecoService.salvar(endereco);
        }

        return clienteSalvo;
    }
}