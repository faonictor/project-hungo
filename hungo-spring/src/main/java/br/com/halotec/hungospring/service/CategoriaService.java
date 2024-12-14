package br.com.halotec.hungospring.service;

import br.com.halotec.hungospring.entity.Categoria;
import br.com.halotec.hungospring.repository.CategoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class CategoriaService {
    @Autowired
    private CategoriaRepository categoriaRepository;

    public Iterable<Categoria> listarTodos() {
        return categoriaRepository.findAll();
    }

    public ResponseEntity<Categoria> salvar(Categoria categoria) {
        return new ResponseEntity<>(categoriaRepository.save(categoria), HttpStatus.OK);
    }

    public ResponseEntity<Categoria> buscarPorId(Long id) {
        return new ResponseEntity<>(categoriaRepository.findById(id).orElseThrow(), HttpStatus.OK);
    }

    public ResponseEntity deletar(Long id) {
        categoriaRepository.deleteById(id);
        return new ResponseEntity("{\"mensagem\":\"Categoria Removida com Sucesso\"}", HttpStatus.OK);
    }
}

