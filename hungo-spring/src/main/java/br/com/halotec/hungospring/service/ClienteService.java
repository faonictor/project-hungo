package br.com.halotec.hungospring.service;

import br.com.halotec.hungospring.entity.Cliente;
import br.com.halotec.hungospring.entity.Endereco;
import br.com.halotec.hungospring.repository.ClienteRepository;
import br.com.halotec.hungospring.repository.EnderecoRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClienteService {
    @Autowired
    private ClienteRepository clienteRepository;

    public Iterable<Cliente> listarTodos() {
        return clienteRepository.findAll();
    }

    public ResponseEntity<Cliente> salvar(Cliente cliente) {
        return new ResponseEntity<>(clienteRepository.save(cliente), HttpStatus.OK);
    }

    public ResponseEntity<Cliente> buscarPorId(Long id) {
        return new ResponseEntity<>(clienteRepository.findById(id).orElseThrow(), HttpStatus.OK);
    }

//    public ResponseEntity deletar(Long id) {
//        clienteRepository.deleteById(id);
//        return new ResponseEntity("{\"mensagem\":\"Cliente Removido com Sucesso\"}", HttpStatus.OK);
//    }

    @Autowired
    private EnderecoRepository enderecoRepository;

    @Transactional
    public ResponseEntity deletar(Long id) {
        // 1. Busca o cliente
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cliente não encontrado com o ID " + id));

        // 2. Remove os endereços associados
        removerEnderecos(cliente);

        // 3. Após remover os endereços, exclui o cliente
        clienteRepository.delete(cliente);

        return new ResponseEntity("{\"mensagem\":\"Cliente e seus endereços removidos com sucesso\"}", HttpStatus.OK);
    }

    // Método para remover os endereços associados ao cliente
    private void removerEnderecos(Cliente cliente) {
        List<Endereco> enderecos = enderecoRepository.findByClienteId(cliente.getId());
        for (Endereco endereco : enderecos) {
            enderecoRepository.delete(endereco); // Exclui cada endereço
        }
    }
}


