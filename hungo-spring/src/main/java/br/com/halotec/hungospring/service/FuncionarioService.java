package br.com.halotec.hungospring.service;

import br.com.halotec.hungospring.entity.Funcionario;
import br.com.halotec.hungospring.repository.FuncionarioRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FuncionarioService {

    private final FuncionarioRepository funcionarioRepository;

    public FuncionarioService(FuncionarioRepository funcionarioRepository) {
        this.funcionarioRepository = funcionarioRepository;
    }

    @Transactional(readOnly = true)
    public List<Funcionario> listarTodos() {
        return funcionarioRepository.findAll();
    }

    @Transactional
    public Funcionario salvar(Funcionario funcionario) {
        if (funcionario.getId() == null && funcionario.getDataCadastro() == null) {
            funcionario.setDataCadastro(LocalDateTime.now());
        }
        return funcionarioRepository.save(funcionario);
    }

    @Transactional(readOnly = true)
    public Funcionario buscarPorId(Long id) {
        return funcionarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Funcionário não encontrado com o ID: " + id));
    }

    @Transactional
    public void deletar(Long id) {
        if (!funcionarioRepository.existsById(id)) {
            throw new EntityNotFoundException("Funcionário não encontrado com o ID: " + id);
        }
        funcionarioRepository.deleteById(id);
    }
}
