package br.com.halotec.hungospring.controller;

import br.com.halotec.hungospring.entity.Insumo;
import br.com.halotec.hungospring.service.InsumoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
public class InsumoController {

    @Autowired
    private InsumoService insumoService;

    @PostMapping("/insumo")
    public ResponseEntity<Insumo> salvar(@RequestBody Insumo insumo) {
        return insumoService.salvar(insumo);
    }

    @GetMapping("/insumo")
    public Iterable<Insumo> listarTodos() {
        return insumoService.listarTodos();
    }

    @GetMapping("/insumo/{id}")
    public ResponseEntity<Insumo> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(insumoService.buscarPorId(id));
    }

    @DeleteMapping("/insumo/{id}")
    public ResponseEntity deletar(@PathVariable Long id) {
        return insumoService.deletar(id);
    }

    @PutMapping("/insumo/{id}")
    public ResponseEntity<Insumo> atualizar(@PathVariable Long id, @RequestBody Insumo insumo) {
        insumo.setId(id);
        return insumoService.salvar(insumo);
    }
}


