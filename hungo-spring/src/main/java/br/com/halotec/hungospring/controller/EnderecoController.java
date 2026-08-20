package br.com.halotec.hungospring.controller;

import br.com.halotec.hungospring.entity.Endereco;
import br.com.halotec.hungospring.service.EnderecoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/endereco")
public class EnderecoController {

    private final EnderecoService enderecoService;

    public EnderecoController(EnderecoService enderecoService) {
        this.enderecoService = enderecoService;
    }

    @PostMapping
    public ResponseEntity<Endereco> salvar(@RequestBody Endereco endereco) {
        Endereco salvo = enderecoService.salvar(endereco);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    @GetMapping
    public ResponseEntity<List<Endereco>> listarTodos() {
        return ResponseEntity.ok(enderecoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Endereco> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(enderecoService.buscarPorId(id));
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<Endereco>> listarEnderecosPorCliente(@PathVariable Long clienteId) {
        return ResponseEntity.ok(enderecoService.buscarEnderecosPorCliente(clienteId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        enderecoService.deletar(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Endereco> atualizar(
            @PathVariable Long id,
            @RequestBody Endereco endereco) {
        endereco.setId(id);
        return ResponseEntity.ok(enderecoService.salvar(endereco));
    }
}
