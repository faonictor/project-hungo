package br.com.halotec.hungospring.service;

import br.com.halotec.hungospring.entity.Mesa;
import br.com.halotec.hungospring.entity.Venda;
import br.com.halotec.hungospring.repository.ItemPedidoRepository;
import br.com.halotec.hungospring.repository.MesaRepository;
import br.com.halotec.hungospring.repository.VendaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class VendaService {
    @Autowired
    private VendaRepository vendaRepository;

    @Autowired
    private ItemPedidoRepository itemPedidoRepository;
    @Autowired
    private MesaRepository mesaRepository;

    public Iterable<Venda> listarTodos() {
        return vendaRepository.findAll();
    }

    public ResponseEntity<Venda> salvar(Venda venda) {
        return new ResponseEntity<>(vendaRepository.save(venda), HttpStatus.OK);
    }

    public ResponseEntity<Venda> buscarPorId(Long id) {
        return new ResponseEntity<>(vendaRepository.findById(id).orElseThrow(), HttpStatus.OK);
    }

    public ResponseEntity deletar(Long id) {
        vendaRepository.deleteById(id);
        return new ResponseEntity("{\"mensagem\":\"Venda Removida com Sucesso\"}", HttpStatus.OK);
    }

    public List<Venda> buscarVendasEmAberto() {
        return vendaRepository.findByDataFimVendaIsNull();
    }

    public List<Venda> buscarVendasFechadas() {
        return vendaRepository.findByDataFimVendaIsNotNull();
    }

    public Venda fecharVenda(Long id) {
        Venda venda = vendaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Venda não encontrada com o ID: " + id));

        // Soma o total diretamente do ItemPedidoRepository
        float valorTotal = itemPedidoRepository.somarTotalPorVendaId(id);

        venda.setDataFimVenda(LocalDateTime.now());
        venda.setTotal(valorTotal);

        return vendaRepository.save(venda);
    }

    public List<Mesa> obterMesasDisponiveis() {
        return mesaRepository.findByStatus(true);
    }
}