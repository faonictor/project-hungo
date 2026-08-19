package br.com.halotec.hungospring.service;

import br.com.halotec.hungospring.entity.PagamentoComanda;
import br.com.halotec.hungospring.repository.PagamentoComandaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PagamentoComandaService {

    @Autowired
    private PagamentoComandaRepository pagamentoComandaRepository;

    public ResponseEntity<PagamentoComanda> salvar(PagamentoComanda pagamento) {
        if (pagamento.getDataPagamento() == null) {
            pagamento.setDataPagamento(LocalDateTime.now());
        }
        PagamentoComanda salvo = pagamentoComandaRepository.save(pagamento);
        return new ResponseEntity<>(salvo, HttpStatus.CREATED);
    }

    public ResponseEntity<List<PagamentoComanda>> listarPorVenda(Long vendaId) {
        List<PagamentoComanda> lista = pagamentoComandaRepository.findByVendaIdOrderByDataPagamentoAsc(vendaId);
        return new ResponseEntity<>(lista, HttpStatus.OK);
    }
}
