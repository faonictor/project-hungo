package br.com.halotec.hungospring.service;

import br.com.halotec.hungospring.entity.Cliente;
import br.com.halotec.hungospring.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

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

    public ResponseEntity deletar(Long id) {
        clienteRepository.deleteById(id);
        return new ResponseEntity("{\"mensagem\":\"Cliente Removido com Sucesso\"}", HttpStatus.OK);
    }
}


