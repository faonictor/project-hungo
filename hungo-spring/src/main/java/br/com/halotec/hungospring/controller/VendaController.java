package br.com.halotec.hungospring.controller;

import br.com.halotec.hungospring.dto.ReceberPagamentoAPrazoDTO;
import br.com.halotec.hungospring.entity.Mesa;
import br.com.halotec.hungospring.entity.Venda;
import br.com.halotec.hungospring.service.VendaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class VendaController {

    private final VendaService vendaService;

    public VendaController(VendaService vendaService) {
        this.vendaService = vendaService;
    }

    @PostMapping("/venda")
    public ResponseEntity<Venda> salvar(@RequestBody Venda venda) {
        Venda salva = vendaService.salvar(venda);
        return ResponseEntity.status(HttpStatus.CREATED).body(salva);
    }

    @GetMapping("/venda")
    public ResponseEntity<List<Venda>> getVendas() {
        return ResponseEntity.ok(vendaService.buscarVendasEmAberto());
    }

    @GetMapping("/venda/emAberto")
    public ResponseEntity<List<Venda>> buscarVendasEmAberto() {
        return ResponseEntity.ok(vendaService.buscarVendasEmAberto());
    }

    @GetMapping("/venda/fechadas")
    public ResponseEntity<List<Venda>> buscarVendasFechadas() {
        return ResponseEntity.ok(vendaService.buscarVendasFechadas());
    }

    @GetMapping("/venda/a-prazo")
    public ResponseEntity<List<Venda>> buscarVendasAPrazoPendentes() {
        return ResponseEntity.ok(vendaService.buscarVendasAPrazoPendentes());
    }

    @GetMapping("/venda/cliente/{clienteId}/a-prazo")
    public ResponseEntity<List<Venda>> buscarVendasAPrazoPorCliente(@PathVariable Long clienteId) {
        return ResponseEntity.ok(vendaService.buscarVendasAPrazoPorCliente(clienteId));
    }

    @GetMapping("/venda/{id}")
    public ResponseEntity<Venda> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(vendaService.buscarPorId(id));
    }

    @PutMapping("/venda/{id}")
    public ResponseEntity<Venda> atualizar(@PathVariable Long id, @RequestBody Venda venda) {
        return ResponseEntity.ok(vendaService.atualizar(id, venda));
    }

    @DeleteMapping("/venda/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id, @RequestParam(required = false) @Nullable String motivo) {
        vendaService.deletar(id, motivo);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/venda/mesas-disponiveis")
    public ResponseEntity<List<Mesa>> obterMesasDisponiveis() {
        return ResponseEntity.ok(vendaService.obterMesasDisponiveis());
    }

    @PutMapping("/venda/{id}/fechar")
    public ResponseEntity<Venda> fecharVenda(@PathVariable Long id) {
        return ResponseEntity.ok(vendaService.fecharVenda(id));
    }

    @PostMapping("/venda/{id}/receber-a-prazo")
    public ResponseEntity<Venda> receberPagamentoAPrazo(
            @PathVariable Long id,
            @RequestBody ReceberPagamentoAPrazoDTO dto
    ) {
        Venda quitada = vendaService.receberPagamentoAPrazo(
                id,
                dto.getValorRecebido(),
                dto.getFormaPagamentoReal(),
                dto.getDesconto()
        );
        return ResponseEntity.ok(quitada);
    }
}