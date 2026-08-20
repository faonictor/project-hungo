package br.com.halotec.hungospring.service;

import br.com.halotec.hungospring.entity.Mesa;
import br.com.halotec.hungospring.repository.MesaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class MesaService {

    private final MesaRepository mesaRepository;

    public MesaService(MesaRepository mesaRepository) {
        this.mesaRepository = mesaRepository;
    }

    @Transactional(readOnly = true)
    public List<Mesa> listarTodos() {
        List<Mesa> mesas = new ArrayList<>(mesaRepository.findAll());

        mesas.sort((m1, m2) -> {
            if (m1.getNome() == null) return -1;
            if (m2.getNome() == null) return 1;
            int num1 = extrairNumero(m1.getNome());
            int num2 = extrairNumero(m2.getNome());
            if (num1 != num2) {
                return Integer.compare(num1, num2);
            }
            return m1.getNome().compareToIgnoreCase(m2.getNome());
        });

        return mesas;
    }

    private int extrairNumero(String nome) {
        String digits = nome.replaceAll("\\D+", "");
        if (digits.isEmpty()) return 999999;
        try {
            return Integer.parseInt(digits);
        } catch (NumberFormatException e) {
            return 999999;
        }
    }

    @Transactional
    public Mesa salvar(Mesa mesa) {
        if (mesa.getStatus() == null) {
            mesa.setStatus(true);
        }
        return mesaRepository.save(mesa);
    }

    @Transactional(readOnly = true)
    public Mesa buscarPorId(Long id) {
        return mesaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Mesa não encontrada com o ID: " + id));
    }

    @Transactional
    public void deletar(Long id) {
        if (!mesaRepository.existsById(id)) {
            throw new EntityNotFoundException("Mesa não encontrada com o ID: " + id);
        }
        mesaRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<Mesa> obterMesasDisponiveis() {
        return mesaRepository.findByStatus(true);
    }
}
