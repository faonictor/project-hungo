package br.com.halotec.hungospring.service;

import br.com.halotec.hungospring.entity.Mesa;
import br.com.halotec.hungospring.repository.MesaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class MesaService {
    @Autowired
    private MesaRepository mesaRepository;

    public Iterable<Mesa> listarTodos() {
        return mesaRepository.findAll();
    }

    public ResponseEntity<Mesa> salvar(Mesa mesa) {
        return new ResponseEntity<>(mesaRepository.save(mesa), HttpStatus.OK);
    }

    public ResponseEntity<Mesa> buscarPorId(Long id) {
        return new ResponseEntity<>(mesaRepository.findById(id).orElseThrow(), HttpStatus.OK);
    }

    public ResponseEntity deletar(Long id) {
        mesaRepository.deleteById(id);
        return new ResponseEntity("{\"mensagem\":\"Mesa Removida com Sucesso\"}", HttpStatus.OK);
    }
}


