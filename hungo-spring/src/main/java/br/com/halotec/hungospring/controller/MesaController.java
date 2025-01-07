package br.com.halotec.hungospring.controller;

import br.com.halotec.hungospring.entity.Mesa;
import br.com.halotec.hungospring.service.MesaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

//@CrossOrigin(origins = "*")
@CrossOrigin(origins = "http://localhost:5173")
@RestController
public class MesaController {

    @Autowired
    private MesaService mesaService;

    @PostMapping("/mesa")
    public ResponseEntity<Mesa> salvar(@RequestBody Mesa mesa) {
        return mesaService.salvar(mesa);
    }

    @GetMapping("/mesa")
    public Iterable<Mesa> listarTodos() {
        return mesaService.listarTodos();
    }

    @GetMapping("/mesa/{id}")
    public ResponseEntity<Mesa> buscarPorId(@PathVariable Long id) {
        return mesaService.buscarPorId(id);
    }

    @DeleteMapping("/mesa/{id}")
    public ResponseEntity deletar(@PathVariable Long id) {
        return mesaService.deletar(id);
    }

    @PutMapping("/mesa/{id}")
    public ResponseEntity<Mesa> atualizar(
            @PathVariable Long id,
            @RequestBody Mesa mesa) {
        mesa.setId(id);
        return mesaService.salvar(mesa);
    }
}


