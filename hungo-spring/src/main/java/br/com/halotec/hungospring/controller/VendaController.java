package br.com.halotec.hungospring.controller;

import br.com.halotec.hungospring.entity.Venda;
import br.com.halotec.hungospring.service.VendaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

//@CrossOrigin(origins = "*")
@CrossOrigin(origins = "http://localhost:5173")
@RestController
public class VendaController {

    @Autowired
    private VendaService vendaService;

    @PostMapping("/venda")
    public ResponseEntity<Venda> salvar(@RequestBody Venda venda) {
        return vendaService.salvar(venda);
    }

    @GetMapping("/venda")
    public Iterable<Venda> listarTodos() {
        return vendaService.listarTodos();
    }

    @GetMapping("/venda/{id}")
    public ResponseEntity<Venda> buscarPorId(@PathVariable Long id) {
        return vendaService.buscarPorId(id);
    }

    @DeleteMapping("/venda/{id}")
    public ResponseEntity deletar(@PathVariable Long id) {
        return vendaService.deletar(id);
    }

    @PutMapping("/venda/{id}")
    public ResponseEntity<Venda> atualizar(
            @PathVariable Long id,
            @RequestBody Venda venda) {
        venda.setId(id);
        return vendaService.salvar(venda);
    }
}