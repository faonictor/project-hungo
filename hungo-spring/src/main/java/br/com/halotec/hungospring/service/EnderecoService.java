package br.com.halotec.hungospring.service;

import br.com.halotec.hungospring.entity.Endereco;
import br.com.halotec.hungospring.repository.EnderecoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EnderecoService {

    private final EnderecoRepository enderecoRepository;

    public EnderecoService(EnderecoRepository enderecoRepository) {
        this.enderecoRepository = enderecoRepository;
    }

    @Transactional(readOnly = true)
    public List<Endereco> listarTodos() {
        return enderecoRepository.findAll();
    }

    @Transactional
    public Endereco salvar(Endereco endereco) {
        return enderecoRepository.save(endereco);
    }

    @Transactional(readOnly = true)
    public Endereco buscarPorId(Long id) {
        return enderecoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Endereço não encontrado com o ID: " + id));
    }

    @Transactional
    public void deletar(Long id) {
        if (!enderecoRepository.existsById(id)) {
            throw new EntityNotFoundException("Endereço não encontrado com o ID: " + id);
        }
        enderecoRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<Endereco> buscarEnderecosPorCliente(Long clienteId) {
        return enderecoRepository.findByClienteId(clienteId);
    }
}
