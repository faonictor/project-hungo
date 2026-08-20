package br.com.halotec.hungospring.controller;

import br.com.halotec.hungospring.entity.Insumo;
import br.com.halotec.hungospring.service.InsumoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/insumo")
public class InsumoController {

    private final InsumoService insumoService;

    public InsumoController(InsumoService insumoService) {
        this.insumoService = insumoService;
    }

    @PostMapping
    public ResponseEntity<Insumo> salvar(@RequestBody Insumo insumo) {
        Insumo salvo = insumoService.salvar(insumo);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    @GetMapping
    public ResponseEntity<List<Insumo>> listarTodos() {
        return ResponseEntity.ok(insumoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Insumo> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(insumoService.buscarPorId(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        insumoService.deletar(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Insumo> atualizar(
            @PathVariable Long id,
            @RequestBody Insumo insumo) {
        insumo.setId(id);
        return ResponseEntity.ok(insumoService.salvar(insumo));
    }
}
