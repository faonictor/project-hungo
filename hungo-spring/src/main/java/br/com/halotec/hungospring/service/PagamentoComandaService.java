package br.com.halotec.hungospring.service;

import br.com.halotec.hungospring.entity.PagamentoComanda;
import br.com.halotec.hungospring.repository.PagamentoComandaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PagamentoComandaService {

    private final PagamentoComandaRepository pagamentoComandaRepository;

    public PagamentoComandaService(PagamentoComandaRepository pagamentoComandaRepository) {
        this.pagamentoComandaRepository = pagamentoComandaRepository;
    }

    @Transactional
    public PagamentoComanda salvar(PagamentoComanda pagamento) {
        if (pagamento.getDataPagamento() == null) {
            pagamento.setDataPagamento(LocalDateTime.now());
        }
        return pagamentoComandaRepository.save(pagamento);
    }

    @Transactional(readOnly = true)
    public List<PagamentoComanda> listarPorVenda(Long vendaId) {
        return pagamentoComandaRepository.findByVendaIdOrderByDataPagamentoAsc(vendaId);
    }
}
