package br.com.halotec.hungospring.service;

import br.com.halotec.hungospring.entity.Insumo;
import br.com.halotec.hungospring.repository.InsumoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class InsumoService {
    @Autowired
    private InsumoRepository insumoRepository;

    public Iterable<Insumo> listarTodos() {
        return insumoRepository.findAll();
    }

    public ResponseEntity<Insumo> salvar(Insumo insumo) {
        return new ResponseEntity<>(insumoRepository.save(insumo), HttpStatus.OK);
    }

    public ResponseEntity<Insumo> buscarPorId(Long id) {
        return new ResponseEntity<>(insumoRepository.findById(id).orElseThrow(), HttpStatus.OK);
    }

    public ResponseEntity deletar(Long id) {
        insumoRepository.deleteById(id);
        return new ResponseEntity("{\"mensagem\":\"Insumo Removido com Sucesso\"}", HttpStatus.OK);
    }
}


