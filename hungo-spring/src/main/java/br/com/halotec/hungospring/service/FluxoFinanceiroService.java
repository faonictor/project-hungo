package br.com.halotec.hungospring.service;

import br.com.halotec.hungospring.entity.FluxoFinanceiro;
import br.com.halotec.hungospring.repository.FluxoFinanceiroRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FluxoFinanceiroService {

    private final FluxoFinanceiroRepository fluxoFinanceiroRepository;

    public FluxoFinanceiroService(FluxoFinanceiroRepository fluxoFinanceiroRepository) {
        this.fluxoFinanceiroRepository = fluxoFinanceiroRepository;
    }

    @Transactional(readOnly = true)
    public List<FluxoFinanceiro> listarTodos() {
        return fluxoFinanceiroRepository.findAll();
    }

    @Transactional
    public FluxoFinanceiro salvar(FluxoFinanceiro fluxoFinanceiro) {
        if (fluxoFinanceiro.getDataTransacao() == null) {
            fluxoFinanceiro.setDataTransacao(LocalDateTime.now());
        }
        return fluxoFinanceiroRepository.save(fluxoFinanceiro);
    }

    @Transactional(readOnly = true)
    public FluxoFinanceiro buscarPorId(Long id) {
        return fluxoFinanceiroRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Fluxo Financeiro não encontrado com o ID: " + id));
    }

    @Transactional
    public void deletar(Long id) {
        if (!fluxoFinanceiroRepository.existsById(id)) {
            throw new EntityNotFoundException("Fluxo Financeiro não encontrado com o ID: " + id);
        }
        fluxoFinanceiroRepository.deleteById(id);
    }
}
