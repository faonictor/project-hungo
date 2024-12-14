package br.com.halotec.hungospring.service;

import br.com.halotec.hungospring.entity.Funcionario;
import br.com.halotec.hungospring.repository.FuncionarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class FuncionarioService {

    @Autowired
    private FuncionarioRepository funcionarioRepository;

    public Iterable<Funcionario> listarTodos() {
        return funcionarioRepository.findAll();
    }

    public ResponseEntity<Funcionario> salvar(Funcionario funcionario) {
        return ResponseEntity.ok(funcionarioRepository.save(funcionario));
    }

    public ResponseEntity<Funcionario> buscarPorId(Long id) {
        return ResponseEntity.ok(funcionarioRepository.findById(id).orElseThrow());
    }

    public ResponseEntity<?> deletar(Long id) {
        funcionarioRepository.deleteById(id);
        return ResponseEntity.ok("{\"mensagem\":\"funcionario Removido com Sucesso\"}");
    }
}

