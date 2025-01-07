package br.com.halotec.hungospring.controller;

import br.com.halotec.hungospring.entity.Mesa;
import br.com.halotec.hungospring.entity.Venda;
import br.com.halotec.hungospring.service.VendaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @DeleteMapping("/venda/{id}")
    public ResponseEntity deletar(@PathVariable Long id) {
        return vendaService.deletar(id);
    }

    @GetMapping("venda/mesas-disponiveis")
    public ResponseEntity<List<Mesa>> obterMesasDisponiveis() {
        List<Mesa> mesasDisponiveis = vendaService.obterMesasDisponiveis();
        return new ResponseEntity<>(mesasDisponiveis, HttpStatus.OK);
    }

    @PutMapping("/venda/{id}/fechar")
    public ResponseEntity<Venda> fecharVenda(@PathVariable Long id) {
        return ResponseEntity.ok(vendaService.fecharVenda(id));
    }
}