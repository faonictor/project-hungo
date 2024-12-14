package br.com.halotec.hungospring.controller;

import br.com.halotec.hungospring.entity.Funcionario;
import br.com.halotec.hungospring.service.FuncionarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
public class FuncionarioController {

    @Autowired
    private FuncionarioService funcionarioService;

    @PostMapping("/funcionario")
    public ResponseEntity<Funcionario> salvar(@RequestBody Funcionario funcionario) {
        return funcionarioService.salvar(funcionario);
    }

    @GetMapping("/funcionario")
    public Iterable<Funcionario> listarTodos() {
        return funcionarioService.listarTodos();
    }

    @GetMapping("/funcionario/{id}")
    public ResponseEntity<Funcionario> buscarPorId(@PathVariable Long id) {
        return funcionarioService.buscarPorId(id);
    }

    @DeleteMapping("/funcionario/{id}")
    public ResponseEntity deletar(@PathVariable Long id) {
        return funcionarioService.deletar(id);
    }

    @PutMapping("/funcionario/{id}")
    public ResponseEntity<Funcionario> atualizar(
            @PathVariable Long id,
            @RequestBody Funcionario funcionario) {
        funcionario.setId(id);
        return funcionarioService.salvar(funcionario);
    }

}


