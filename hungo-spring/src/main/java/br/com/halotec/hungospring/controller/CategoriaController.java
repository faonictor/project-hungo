package br.com.halotec.hungospring.controller;

import br.com.halotec.hungospring.entity.Categoria;
import br.com.halotec.hungospring.service.CategoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
public class CategoriaController {

    @Autowired
    private CategoriaService categoriaService;

    @PostMapping("/categoria")
    public ResponseEntity<Categoria> salvar(@RequestBody Categoria categoria) {
        return categoriaService.salvar(categoria);
    }

    @GetMapping("/categoria")
    public Iterable<Categoria> listarTodos() {
        return categoriaService.listarTodos();
    }

    @GetMapping("/categoria/{id}")
    public ResponseEntity<Categoria> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(categoriaService.buscarPorId(id).getBody());
    }

    @DeleteMapping("/categoria/{id}")
    public ResponseEntity deletar(@PathVariable Long id) {
        return categoriaService.deletar(id);
    }

    @PutMapping("/categoria/{id}")
    public ResponseEntity<Categoria> atualizar(@PathVariable Long id, @RequestBody Categoria categoria) {
        categoria.setId(id);
        return categoriaService.salvar(categoria);
    }
}


