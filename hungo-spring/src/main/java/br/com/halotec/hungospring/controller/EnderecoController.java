package br.com.halotec.hungospring.controller;

import br.com.halotec.hungospring.entity.Endereco;
import br.com.halotec.hungospring.service.EnderecoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

//@CrossOrigin(origins = "*")
@CrossOrigin(origins = "http://localhost:5173")
@RestController
public class EnderecoController {

    @Autowired
    private EnderecoService enderecoService;

    @PostMapping("/endereco")
    public ResponseEntity<Endereco> salvar(@RequestBody Endereco endereco) {
        return enderecoService.salvar(endereco);
    }

    @GetMapping("/endereco")
    public Iterable<Endereco> listarTodos() {
        return enderecoService.listarTodos();
    }

    @GetMapping("/endereco/{id}")
    public ResponseEntity<Endereco> buscarPorId(@PathVariable Long id) {
        return enderecoService.buscarPorId(id);
    }

    @GetMapping("/endereco/cliente/{clienteId}")
    public ResponseEntity<Iterable<Endereco>> listarEnderecosPorCliente(@PathVariable Long clienteId) {
        Iterable<Endereco> enderecos = enderecoService.buscarEnderecosPorCliente(clienteId);
        return ResponseEntity.ok(enderecos);
    }

    @DeleteMapping("/endereco/{id}")
    public ResponseEntity deletar(@PathVariable Long id) {
        return enderecoService.deletar(id);
    }

    @PutMapping("/endereco/{id}")
    public ResponseEntity<Endereco> atualizar(
            @PathVariable Long id,
            @RequestBody Endereco endereco) {
        endereco.setId(id);
        return enderecoService.salvar(endereco);
    }
}
