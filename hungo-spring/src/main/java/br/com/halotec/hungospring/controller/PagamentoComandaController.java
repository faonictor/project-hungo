package br.com.halotec.hungospring.controller;

import br.com.halotec.hungospring.entity.PagamentoComanda;
import br.com.halotec.hungospring.service.PagamentoComandaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pagamentos-comanda")
public class PagamentoComandaController {

    @Autowired
    private PagamentoComandaService pagamentoComandaService;

    @PostMapping
    public ResponseEntity<PagamentoComanda> salvar(@RequestBody PagamentoComanda pagamento) {
        return pagamentoComandaService.salvar(pagamento);
    }

    @GetMapping("/venda/{vendaId}")
    public ResponseEntity<List<PagamentoComanda>> listarPorVenda(@PathVariable Long vendaId) {
        return pagamentoComandaService.listarPorVenda(vendaId);
    }
}
