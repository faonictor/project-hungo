package br.com.halotec.hungospring.controller;

import br.com.halotec.hungospring.dto.ClienteEnderecoDTO;
import br.com.halotec.hungospring.entity.Cliente;
import br.com.halotec.hungospring.service.ClienteEnderecoService;
import br.com.halotec.hungospring.service.ClienteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ClienteController {

    private final ClienteService clienteService;
    private final ClienteEnderecoService clienteEnderecoService;

    public ClienteController(ClienteService clienteService, ClienteEnderecoService clienteEnderecoService) {
        this.clienteService = clienteService;
        this.clienteEnderecoService = clienteEnderecoService;
    }

    @PostMapping("/cliente-endereco")
    public ResponseEntity<Cliente> salvarClienteEndereco(@RequestBody ClienteEnderecoDTO clienteEnderecoDTO) {
        Cliente salvo = clienteEnderecoService.salvarClienteEndereco(clienteEnderecoDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    @PostMapping("/cliente")
    public ResponseEntity<Cliente> salvar(@RequestBody Cliente cliente) {
        Cliente salvo = clienteService.salvar(cliente);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    @GetMapping("/cliente")
    public ResponseEntity<List<Cliente>> listarTodos() {
        return ResponseEntity.ok(clienteService.listarTodos());
    }

    @GetMapping("/cliente/{id}")
    public ResponseEntity<Cliente> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(clienteService.buscarPorId(id));
    }

    @DeleteMapping("/cliente/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        clienteService.deletar(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/cliente/{id}")
    public ResponseEntity<Cliente> atualizar(
            @PathVariable Long id,
            @RequestBody Cliente cliente) {
        cliente.setId(id);
        return ResponseEntity.ok(clienteService.salvar(cliente));
    }
}