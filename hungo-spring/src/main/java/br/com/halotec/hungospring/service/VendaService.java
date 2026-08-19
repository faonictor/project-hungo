package br.com.halotec.hungospring.service;

import br.com.halotec.hungospring.entity.Cliente;
import br.com.halotec.hungospring.entity.ComandaExcluida;
import br.com.halotec.hungospring.entity.ItemPedido;
import br.com.halotec.hungospring.entity.Mesa;
import br.com.halotec.hungospring.entity.Pedido;
import br.com.halotec.hungospring.entity.Venda;
import br.com.halotec.hungospring.repository.ClienteRepository;
import br.com.halotec.hungospring.repository.ComandaExcluidaRepository;
import br.com.halotec.hungospring.repository.ItemPedidoRepository;
import br.com.halotec.hungospring.repository.MesaRepository;
import br.com.halotec.hungospring.repository.PedidoRepository;
import br.com.halotec.hungospring.repository.VendaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class VendaService {
    @Autowired
    private VendaRepository vendaRepository;

    @Autowired
    private ItemPedidoRepository itemPedidoRepository;

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private MesaRepository mesaRepository;

    @Autowired
    private ComandaExcluidaRepository comandaExcluidaRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    public Iterable<Venda> listarTodos() {
        return vendaRepository.findAll();
    }

    public ResponseEntity<Venda> salvar(Venda venda) {
        if (venda.getId() == null || venda.getDataInicioVenda() == null) {
            venda.setDataInicioVenda(LocalDateTime.now());
        }

        if (venda.getCliente() != null && venda.getCliente().getId() != null) {
            Cliente cli = clienteRepository.findById(venda.getCliente().getId()).orElse(null);
            venda.setCliente(cli);
        } else {
            if (venda.getCliente() != null && venda.getCliente().getNome() != null && !venda.getCliente().getNome().trim().isEmpty()) {
                venda.setNomeCliente(venda.getCliente().getNome().trim());
            }
            venda.setCliente(null);
        }

        Venda salva = vendaRepository.save(venda);

        // Se a venda estiver associada a uma mesa, marca a mesa como ocupada
        if (salva.getMesa() != null && salva.getMesa().getId() != null) {
            Mesa mesa = salva.getMesa();
            mesa.setStatus(false);
            mesaRepository.save(mesa);
        }

        return new ResponseEntity<>(salva, HttpStatus.OK);
    }

    public ResponseEntity<Venda> buscarPorId(Long id) {
        return new ResponseEntity<>(vendaRepository.findById(id).orElseThrow(), HttpStatus.OK);
    }

    @jakarta.transaction.Transactional
    public ResponseEntity<Venda> atualizar(Long id, Venda dadosNovos) {
        Venda existente = vendaRepository.findById(id).orElse(null);
        if (existente == null) {
            return ResponseEntity.notFound().build();
        }

        Long mesaAntigaId = existente.getMesa() != null ? existente.getMesa().getId() : null;

        if (dadosNovos.getTipoAtendimento() != null) {
            existente.setTipoAtendimento(dadosNovos.getTipoAtendimento());

            if ("LOCAL".equalsIgnoreCase(dadosNovos.getTipoAtendimento()) || "SALAO".equalsIgnoreCase(dadosNovos.getTipoAtendimento())) {
                if (dadosNovos.getMesa() != null && dadosNovos.getMesa().getId() != null) {
                    Mesa novaMesa = mesaRepository.findById(dadosNovos.getMesa().getId()).orElse(null);
                    existente.setMesa(novaMesa);
                    if (novaMesa != null) {
                        novaMesa.setStatus(false);
                        mesaRepository.save(novaMesa);
                    }
                }
            } else {
                existente.setMesa(null);
            }
        } else if (dadosNovos.getMesa() != null && dadosNovos.getMesa().getId() != null) {
            Mesa novaMesa = mesaRepository.findById(dadosNovos.getMesa().getId()).orElse(null);
            existente.setMesa(novaMesa);
            if (novaMesa != null) {
                novaMesa.setStatus(false);
                mesaRepository.save(novaMesa);
            }
        }

        // Atualização de cliente (apenas se algum dado de cliente ou nome foi explicitamente fornecido)
        if (dadosNovos.getCliente() != null && dadosNovos.getCliente().getId() != null) {
            // Cliente cadastrado no banco de dados
            Cliente cliCadastrado = clienteRepository.findById(dadosNovos.getCliente().getId()).orElse(null);
            existente.setCliente(cliCadastrado);
            existente.setNomeCliente(null);
        } else if (dadosNovos.getNomeCliente() != null && !dadosNovos.getNomeCliente().trim().isEmpty()) {
            // Nome temporário descartável
            existente.setCliente(null);
            existente.setNomeCliente(dadosNovos.getNomeCliente().trim());
        } else if (dadosNovos.getCliente() != null && dadosNovos.getCliente().getNome() != null && !dadosNovos.getCliente().getNome().trim().isEmpty()) {
            // Se veio objeto de cliente sem ID (nome temporário)
            existente.setCliente(null);
            existente.setNomeCliente(dadosNovos.getCliente().getNome().trim());
        }

        if (dadosNovos.getValorPago() != null) {
            existente.setValorPago(dadosNovos.getValorPago());
        }

        Float totalItens = itemPedidoRepository.somarTotalPorVendaId(id);
        float taxa = existente.getTaxaEntrega() != null ? existente.getTaxaEntrega() : 0.0f;
        float valorPagoAtual = existente.getValorPago() != null ? existente.getValorPago() : 0.0f;
        float totalConsumido = (totalItens != null ? totalItens : 0.0f) + taxa;
        existente.setTotal(Math.max(0.0f, totalConsumido - valorPagoAtual));

        Venda salva = vendaRepository.save(existente);

        // Se a mesa antiga ficou sem comandas abertas, marca como LIVRE
        if (mesaAntigaId != null && (salva.getMesa() == null || !mesaAntigaId.equals(salva.getMesa().getId()))) {
            List<Venda> restantes = vendaRepository.findByMesaIdAndDataFimVendaIsNull(mesaAntigaId);
            if (restantes == null || restantes.isEmpty()) {
                Mesa mesaAntiga = mesaRepository.findById(mesaAntigaId).orElse(null);
                if (mesaAntiga != null) {
                    mesaAntiga.setStatus(true);
                    mesaRepository.save(mesaAntiga);
                }
            }
        }

        return ResponseEntity.ok(salva);
    }

    @jakarta.transaction.Transactional
    public ResponseEntity<Void> deletar(Long id, String motivo) {
        Venda venda = vendaRepository.findById(id).orElse(null);
        if (venda == null) {
            return ResponseEntity.notFound().build();
        }

        Float valorItens = itemPedidoRepository.somarTotalPorVendaId(id);
        float taxa = venda.getTaxaEntrega() != null ? venda.getTaxaEntrega() : 0.0f;
        float valorTotalMomento = (valorItens != null ? valorItens : 0.0f) + taxa;

        String nomeCliente = venda.getMesa() != null
                ? venda.getMesa().getNome()
                : (venda.getCliente() != null ? venda.getCliente().getNome() : (venda.getNomeCliente() != null ? venda.getNomeCliente() : "Cliente Retirada"));

        String motivoFinal = (motivo != null && !motivo.trim().isEmpty())
                ? motivo.trim()
                : "Exclusão de comanda solicitada pelo operador";

        // Salva registro de auditoria da comanda excluída
        ComandaExcluida log = new ComandaExcluida(
                id,
                LocalDateTime.now(),
                nomeCliente,
                valorTotalMomento,
                motivoFinal
        );
        comandaExcluidaRepository.save(log);

        Long mesaId = (venda.getMesa() != null) ? venda.getMesa().getId() : null;

        // Cancela todos os pedidos e itens associados a esta comanda (mesmo em preparo ou abertos)
        List<Pedido> pedidos = pedidoRepository.findByVendaId(id);
        if (pedidos != null && !pedidos.isEmpty()) {
            for (Pedido p : pedidos) {
                p.setStatusPedido("Cancelado");
                pedidoRepository.save(p);

                List<ItemPedido> itens = itemPedidoRepository.findByPedidoId(p.getId());
                if (itens != null && !itens.isEmpty()) {
                    for (ItemPedido item : itens) {
                        item.setStatusItem("Cancelado");
                        itemPedidoRepository.save(item);
                    }
                }
            }
        }

        // Marca a comanda como CANCELADA e grava dataFimVenda e motivoCancelamento
        venda.setStatus("CANCELADA");
        venda.setMotivoCancelamento(motivoFinal);
        venda.setDataFimVenda(LocalDateTime.now());
        vendaRepository.save(venda);

        // Se a mesa não tiver mais nenhuma outra comanda aberta, marca como LIVRE
        if (mesaId != null) {
            List<Venda> restantes = vendaRepository.findByMesaIdAndDataFimVendaIsNull(mesaId);
            if (restantes == null || restantes.isEmpty()) {
                Mesa mesa = mesaRepository.findById(mesaId).orElse(null);
                if (mesa != null) {
                    mesa.setStatus(true);
                    mesaRepository.save(mesa);
                }
            }
        }

        return ResponseEntity.ok().build();
    }

    private void enriquecerTotalBruto(Venda venda) {
        if (venda == null || venda.getId() == null) return;
        Float valorItens = itemPedidoRepository.somarTotalPorVendaId(venda.getId());
        float taxa = venda.getTaxaEntrega() != null ? venda.getTaxaEntrega() : 0.0f;
        float totalBruto = (valorItens != null ? valorItens : 0.0f) + taxa;
        venda.setTotalBruto(totalBruto);
    }

    public List<Venda> buscarVendasEmAberto() {
        List<Venda> abertas = vendaRepository.findByDataFimVendaIsNull();
        if (abertas != null) {
            abertas.forEach(this::enriquecerTotalBruto);
        }
        return abertas;
    }

    public List<Venda> buscarVendasFechadas() {
        List<Venda> fechadas = new java.util.ArrayList<>(vendaRepository.findByDataFimVendaIsNotNull());
        List<Venda> parciais = vendaRepository.findByValorPagoGreaterThanAndDataFimVendaIsNull(0.0f);
        if (parciais != null) {
            fechadas.addAll(parciais);
        }
        fechadas.forEach(this::enriquecerTotalBruto);
        return fechadas;
    }

    public Venda fecharVenda(Long id) {
        Venda venda = vendaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Venda não encontrada com o ID: " + id));

        // Validação de segurança: Verificar se a comanda possui pedidos em aberto ou em preparo na cozinha
        List<Pedido> pedidosDaVenda = pedidoRepository.findByVendaId(id);
        if (pedidosDaVenda != null && !pedidosDaVenda.isEmpty()) {
            boolean temPedidoPendente = pedidosDaVenda.stream().anyMatch(p ->
                    "Aberto".equalsIgnoreCase(p.getStatusPedido()) ||
                    "Em preparo".equalsIgnoreCase(p.getStatusPedido())
            );
            if (temPedidoPendente) {
                throw new IllegalStateException("Comanda #" + id + " com pedidos em aberto/pendentes");
            }

            // Atualiza o status dos pedidos para Concluído ao fechar a comanda
            for (Pedido p : pedidosDaVenda) {
                p.setStatusPedido("Concluído");
                if (p.getDataInicioPreparo() == null) {
                    p.setDataInicioPreparo(p.getDataHora() != null ? p.getDataHora() : LocalDateTime.now());
                }
                if (p.getDataFimPreparo() == null) {
                    p.setDataFimPreparo(LocalDateTime.now());
                }
                pedidoRepository.save(p);
            }
        }

        Float valorItens = itemPedidoRepository.somarTotalPorVendaId(id);
        float taxa = venda.getTaxaEntrega() != null ? venda.getTaxaEntrega() : 0.0f;
        float valorTotal = (valorItens != null ? valorItens : 0.0f) + taxa;

        venda.setStatus("ENCERRADA");
        venda.setDataFimVenda(LocalDateTime.now());
        venda.setTotal(0.0f);
        if (venda.getValorPago() == null || venda.getValorPago() <= 0.0f) {
            venda.setValorPago(valorTotal);
        }
        Venda salva = vendaRepository.save(venda);
        enriquecerTotalBruto(salva);

        // Verifica se a mesa possui outras comandas abertas ainda
        if (salva.getMesa() != null && salva.getMesa().getId() != null) {
            Long mesaId = salva.getMesa().getId();
            List<Venda> comandasRestantes = vendaRepository.findByMesaIdAndDataFimVendaIsNull(mesaId);
            if (comandasRestantes.isEmpty()) {
                Mesa mesa = salva.getMesa();
                mesa.setStatus(true);
                mesaRepository.save(mesa);
            }
        }

        return salva;
    }

    public List<Mesa> obterMesasDisponiveis() {
        return mesaRepository.findByStatus(true);
    }
}