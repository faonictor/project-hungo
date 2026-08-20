package br.com.halotec.hungospring.controller;

import br.com.halotec.hungospring.entity.PagamentoComanda;
import br.com.halotec.hungospring.service.PagamentoComandaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pagamentos-comanda")
public class PagamentoComandaController {

    private final PagamentoComandaService pagamentoComandaService;

    public PagamentoComandaController(PagamentoComandaService pagamentoComandaService) {
        this.pagamentoComandaService = pagamentoComandaService;
    }

    @PostMapping
    public ResponseEntity<PagamentoComanda> salvar(@RequestBody PagamentoComanda pagamento) {
        PagamentoComanda salvo = pagamentoComandaService.salvar(pagamento);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    @GetMapping("/venda/{vendaId}")
    public ResponseEntity<List<PagamentoComanda>> listarPorVenda(@PathVariable Long vendaId) {
        return ResponseEntity.ok(pagamentoComandaService.listarPorVenda(vendaId));
    }
}
