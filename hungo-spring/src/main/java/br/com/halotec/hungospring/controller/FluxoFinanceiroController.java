package br.com.halotec.hungospring.controller;

import br.com.halotec.hungospring.entity.FluxoFinanceiro;
import br.com.halotec.hungospring.service.FluxoFinanceiroService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/fluxo")
public class FluxoFinanceiroController {

    private final FluxoFinanceiroService fluxoFinanceiroService;

    public FluxoFinanceiroController(FluxoFinanceiroService fluxoFinanceiroService) {
        this.fluxoFinanceiroService = fluxoFinanceiroService;
    }

    @PostMapping
    public ResponseEntity<FluxoFinanceiro> salvar(@RequestBody FluxoFinanceiro fluxoFinanceiro) {
        FluxoFinanceiro salvo = fluxoFinanceiroService.salvar(fluxoFinanceiro);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    @GetMapping
    public ResponseEntity<List<FluxoFinanceiro>> listarTodos() {
        return ResponseEntity.ok(fluxoFinanceiroService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FluxoFinanceiro> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(fluxoFinanceiroService.buscarPorId(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        fluxoFinanceiroService.deletar(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<FluxoFinanceiro> atualizar(
            @PathVariable Long id,
            @RequestBody FluxoFinanceiro fluxoFinanceiro) {
        fluxoFinanceiro.setId(id);
        return ResponseEntity.ok(fluxoFinanceiroService.salvar(fluxoFinanceiro));
    }
}
