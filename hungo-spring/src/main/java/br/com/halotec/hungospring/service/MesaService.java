package br.com.halotec.hungospring.service;

import br.com.halotec.hungospring.entity.Mesa;
import br.com.halotec.hungospring.repository.MesaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
public class MesaService {
    @Autowired
    private MesaRepository mesaRepository;

    public List<Mesa> listarTodos() {
        List<Mesa> mesas = StreamSupport.stream(mesaRepository.findAll().spliterator(), false)
                .collect(Collectors.toList());

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
