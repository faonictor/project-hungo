package br.com.halotec.hungospring.service;

import br.com.halotec.hungospring.entity.Insumo;
import br.com.halotec.hungospring.repository.InsumoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class InsumoService {

    private final InsumoRepository insumoRepository;

    public InsumoService(InsumoRepository insumoRepository) {
        this.insumoRepository = insumoRepository;
    }

    @Transactional(readOnly = true)
    public List<Insumo> listarTodos() {
        return insumoRepository.findAll();
    }

    @Transactional
    public Insumo salvar(Insumo insumo) {
        return insumoRepository.save(insumo);
    }

    @Transactional(readOnly = true)
    public Insumo buscarPorId(Long id) {
        return insumoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Insumo não encontrado com o ID: " + id));
    }

    @Transactional
    public void deletar(Long id) {
        if (!insumoRepository.existsById(id)) {
            throw new EntityNotFoundException("Insumo não encontrado com o ID: " + id);
        }
        insumoRepository.deleteById(id);
    }
}
