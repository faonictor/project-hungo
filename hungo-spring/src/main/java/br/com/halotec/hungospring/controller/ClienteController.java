package br.com.halotec.hungospring.controller;

import br.com.halotec.hungospring.dto.ClienteEnderecoDTO;
import br.com.halotec.hungospring.entity.Cliente;
import br.com.halotec.hungospring.service.ClienteEnderecoService;
import br.com.halotec.hungospring.service.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

//@CrossOrigin(origins = "*")
@CrossOrigin(origins = "http://localhost:5173")
@RestController
public class ClienteController {

    @Autowired
    private ClienteService clienteService;

    @Autowired
    private ClienteEnderecoService clienteEnderecoService;

    // Endpoint para salvar Cliente e Endereco
    @PostMapping("/cliente-endereco")
    public ResponseEntity<Cliente> salvarClienteEndereco(@RequestBody ClienteEnderecoDTO clienteEnderecoDTO) {
        return clienteEnderecoService.salvarClienteEndereco(clienteEnderecoDTO);
    }

    @PostMapping("/cliente")
    public ResponseEntity<Cliente> salvar(@RequestBody Cliente cliente) {
        return clienteService.salvar(cliente);
    }

    @GetMapping("/cliente")
    public Iterable<Cliente> listarTodos() {
        return clienteService.listarTodos();
    }

    @GetMapping("/cliente/{id}")
    public ResponseEntity<Cliente> buscarPorId(@PathVariable Long id) {
        return clienteService.buscarPorId(id);
    }

    @DeleteMapping("/cliente/{id}")
    public ResponseEntity deletar(@PathVariable Long id) {
        return clienteService.deletar(id);
    }

    @PutMapping("/cliente/{id}")
    public ResponseEntity<Cliente> atualizar(
            @PathVariable Long id,
            @RequestBody Cliente cliente) {
        cliente.setId(id);
        return clienteService.salvar(cliente);
    }
}