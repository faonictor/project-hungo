package br.com.halotec.hungospring.service;

import br.com.halotec.hungospring.entity.Venda;
import br.com.halotec.hungospring.repository.VendaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class VendaService {
    @Autowired
    private VendaRepository vendaRepository;

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
}


