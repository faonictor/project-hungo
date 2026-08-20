package br.com.halotec.hungospring.service;

import br.com.halotec.hungospring.entity.Cliente;
import br.com.halotec.hungospring.entity.Endereco;
import br.com.halotec.hungospring.repository.ClienteRepository;
import br.com.halotec.hungospring.repository.EnderecoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final EnderecoRepository enderecoRepository;

    public ClienteService(ClienteRepository clienteRepository, EnderecoRepository enderecoRepository) {
        this.clienteRepository = clienteRepository;
        this.enderecoRepository = enderecoRepository;
    }

    @Transactional(readOnly = true)
    public List<Cliente> listarTodos() {
        return clienteRepository.findAll();
    }

    @Transactional
    public Cliente salvar(Cliente cliente) {
        if (cliente.getId() == null && cliente.getDataCadastro() == null) {
            cliente.setDataCadastro(LocalDateTime.now());
        }
        if (cliente.getStatus() == null) {
            cliente.setStatus(true);
        }
        return clienteRepository.save(cliente);
    }

    @Transactional(readOnly = true)
    public Cliente buscarPorId(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cliente não encontrado com o ID: " + id));
    }

    @Transactional
    public void deletar(Long id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cliente não encontrado com o ID: " + id));

        removerEnderecos(cliente);
        clienteRepository.delete(cliente);
    }

    private void removerEnderecos(Cliente cliente) {
        Long clienteId = cliente.getId();
        if (clienteId != null) {
            List<Endereco> enderecos = enderecoRepository.findByClienteId(clienteId);
            if (enderecos != null && !enderecos.isEmpty()) {
                enderecoRepository.deleteAll(enderecos);
            }
        }
    }
}
