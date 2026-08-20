package br.com.halotec.hungospring.controller;

import br.com.halotec.hungospring.entity.Mesa;
import br.com.halotec.hungospring.service.MesaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/mesa")
public class MesaController {

    private final MesaService mesaService;

    public MesaController(MesaService mesaService) {
        this.mesaService = mesaService;
    }

    @PostMapping
    public ResponseEntity<Mesa> salvar(@RequestBody Mesa mesa) {
        Mesa salva = mesaService.salvar(mesa);
        return ResponseEntity.status(HttpStatus.CREATED).body(salva);
    }

    @GetMapping
    public ResponseEntity<List<Mesa>> listarTodos() {
        return ResponseEntity.ok(mesaService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Mesa> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(mesaService.buscarPorId(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        mesaService.deletar(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Mesa> atualizar(
            @PathVariable Long id,
            @RequestBody Mesa mesa) {
        mesa.setId(id);
        return ResponseEntity.ok(mesaService.salvar(mesa));
    }
}
