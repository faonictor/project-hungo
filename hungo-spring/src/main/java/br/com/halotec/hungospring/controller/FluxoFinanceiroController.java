package br.com.halotec.hungospring.controller;

import br.com.halotec.hungospring.entity.FluxoFinanceiro;
import br.com.halotec.hungospring.service.FluxoFinanceiroService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
public class FluxoFinanceiroController {

    @Autowired
    private FluxoFinanceiroService fluxoFinanceiroService;

    @PostMapping("/fluxo")
    public ResponseEntity<FluxoFinanceiro> salvar(@RequestBody FluxoFinanceiro fluxoFinanceiro) {
        return fluxoFinanceiroService.salvar(fluxoFinanceiro);
    }

    @GetMapping("/fluxo")
    public Iterable<FluxoFinanceiro> listarTodos() {
        return fluxoFinanceiroService.listarTodos();
    }

    @GetMapping("/fluxo/{id}")
    public ResponseEntity<FluxoFinanceiro> buscarPorId(@PathVariable Long id) {
        return fluxoFinanceiroService.buscarPorId(id);
    }

    @DeleteMapping("/fluxo/{id}")
    public ResponseEntity deletar(@PathVariable Long id) {
        return fluxoFinanceiroService.deletar(id);
    }

    @PutMapping("/fluxo/{id}")
    public ResponseEntity<FluxoFinanceiro> atualizar(
            @PathVariable Long id,
            @RequestBody FluxoFinanceiro fluxoFinanceiro) {
        fluxoFinanceiro.setId(id);
        return fluxoFinanceiroService.salvar(fluxoFinanceiro);
    }

}
