package br.com.halotec.hungospring.controller;

import br.com.halotec.hungospring.entity.Mesa;
import br.com.halotec.hungospring.entity.Venda;
import br.com.halotec.hungospring.service.VendaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class VendaController {

    @Autowired
    private VendaService vendaService;

    @PostMapping("/venda")
    public ResponseEntity<Venda> salvar(@RequestBody Venda venda) {
        return vendaService.salvar(venda);
    }

    @GetMapping("/venda")
    public ResponseEntity<List<Venda>> getVendas() {
        List<Venda> vendas = vendaService.buscarVendasEmAberto();
        return ResponseEntity.ok(vendas);
    }

    @GetMapping("/venda/emAberto")
    public List<Venda> buscarVendasEmAberto() {
        return vendaService.buscarVendasEmAberto();
    }

    @GetMapping("/venda/fechadas")
    public List<Venda> buscarVendasFechadas() {
        return vendaService.buscarVendasFechadas();
    }

    @GetMapping("/venda/{id}")
    public ResponseEntity<Venda> buscarPorId(@PathVariable Long id) {
        return vendaService.buscarPorId(id);
    }

    @PutMapping("/venda/{id}")
    public ResponseEntity<Venda> atualizar(@PathVariable Long id, @RequestBody Venda venda) {
        return vendaService.atualizar(id, venda);
    }

    @DeleteMapping("/venda/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id, @RequestParam(required = false) String motivo) {
        return vendaService.deletar(id, motivo);
    }

    @GetMapping("venda/mesas-disponiveis")
    public ResponseEntity<List<Mesa>> obterMesasDisponiveis() {
        List<Mesa> mesasDisponiveis = vendaService.obterMesasDisponiveis();
        return new ResponseEntity<>(mesasDisponiveis, HttpStatus.OK);
    }

    @PutMapping("/venda/{id}/fechar")
    public ResponseEntity<?> fecharVenda(@PathVariable Long id) {
        try {
            Venda vendaFechada = vendaService.fecharVenda(id);
            return ResponseEntity.ok(vendaFechada);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }
}