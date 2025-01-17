package br.com.halotec.hungospring.service;

import br.com.halotec.hungospring.entity.Cliente;
import br.com.halotec.hungospring.entity.Endereco;
import br.com.halotec.hungospring.dto.ClienteEnderecoDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class ClienteEnderecoService {

    @Autowired
    private ClienteService clienteService;

    @Autowired
    private EnderecoService enderecoService;

//    // Metodo responsável por criar o Cliente e o Endereco
//    public ResponseEntity<Cliente> salvarClienteEndereco(ClienteEnderecoDTO clienteEnderecoDTO) {
//        // Criar o cliente
//        Cliente cliente = new Cliente();
//        cliente.setNome(clienteEnderecoDTO.getNome());
//        cliente.setTelefone(clienteEnderecoDTO.getTelefone());
//        cliente.setEmail(clienteEnderecoDTO.getEmail());
//        cliente.setCpf(clienteEnderecoDTO.getCpf());
//        cliente.setSenha(clienteEnderecoDTO.getSenha());
//        cliente.setDataCadastro(java.time.LocalDateTime.now());
//
//        // Salvar o cliente
//        cliente = clienteService.salvar(cliente).getBody();  // Aqui podemos usar a resposta do metodo salvar
//
//        // Criar o endereço
//        Endereco endereco = new Endereco();
//        endereco.setRua(clienteEnderecoDTO.getRua());
//        endereco.setNumero(clienteEnderecoDTO.getNumero());
//        endereco.setComplemento(clienteEnderecoDTO.getComplemento());
//        endereco.setBairro(clienteEnderecoDTO.getBairro());
//        endereco.setCidade(clienteEnderecoDTO.getCidade());
//        endereco.setCep(clienteEnderecoDTO.getCep());
//        endereco.setCliente(cliente); // Relacionando o endereço ao cliente
//
//        // Salvar o endereço
//        enderecoService.salvar(endereco);
//
//        return ResponseEntity.ok(cliente); // Retorna o cliente após salvar
//    }

    public ResponseEntity<Cliente> salvarClienteEndereco(ClienteEnderecoDTO clienteEnderecoDTO) {
        // Criar o cliente
        Cliente cliente = new Cliente();
        cliente.setNome(clienteEnderecoDTO.getNome());
        cliente.setTelefone(clienteEnderecoDTO.getTelefone());
        cliente.setEmail(clienteEnderecoDTO.getEmail());
        cliente.setCpf(clienteEnderecoDTO.getCpf());
        cliente.setSenha(clienteEnderecoDTO.getSenha());
        cliente.setDataCadastro(java.time.LocalDateTime.now());
        cliente.setStatus(true); // Cliente começa como ativo

        // Salvar o cliente
        cliente = clienteService.salvar(cliente).getBody(); // Aqui podemos usar a resposta do método salvar

        // Criar o endereço
        Endereco endereco = new Endereco();
        endereco.setRua(clienteEnderecoDTO.getRua());
        endereco.setNumero(clienteEnderecoDTO.getNumero());
        endereco.setComplemento(clienteEnderecoDTO.getComplemento());
        endereco.setBairro(clienteEnderecoDTO.getBairro());
        endereco.setCidade(clienteEnderecoDTO.getCidade());
        endereco.setCep(clienteEnderecoDTO.getCep());
        endereco.setCliente(cliente); // Relacionando o endereço ao cliente

        // Salvar o endereço
        enderecoService.salvar(endereco);

        return ResponseEntity.ok(cliente); // Retorna o cliente após salvar
    }
}