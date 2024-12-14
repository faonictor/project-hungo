package br.com.halotec.hungospring.service;

import br.com.halotec.hungospring.entity.FluxoFinanceiro;
import br.com.halotec.hungospring.repository.FluxoFinanceiroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class FluxoFinanceiroService {
    @Autowired
    private FluxoFinanceiroRepository fluxoFinanceiroRepository;

    public Iterable<FluxoFinanceiro> listarTodos() {
        return fluxoFinanceiroRepository.findAll();
    }

    public ResponseEntity<FluxoFinanceiro> salvar(FluxoFinanceiro fluxoFinanceiro) {
        return new ResponseEntity<>(fluxoFinanceiroRepository.save(fluxoFinanceiro), HttpStatus.OK);
    }

    public ResponseEntity<FluxoFinanceiro> buscarPorId(Long id) {
        return new ResponseEntity<>(fluxoFinanceiroRepository.findById(id).orElseThrow(), HttpStatus.OK);
    }

    public ResponseEntity deletar(Long id) {
        fluxoFinanceiroRepository.deleteById(id);
        return new ResponseEntity("{\"mensagem\":\"Fluxo Removido com Sucesso\"}", HttpStatus.OK);
    }
}


