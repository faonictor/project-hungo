package br.com.halotec.hungospring.service;

import br.com.halotec.hungospring.dto.ItemPedidoDTO;
import br.com.halotec.hungospring.dto.PedidoDTO;
import br.com.halotec.hungospring.entity.*;
import br.com.halotec.hungospring.repository.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private VendaRepository vendaRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private ItemPedidoRepository itemPedidoRepository;

    public Iterable<Pedido> listarTodos() {
        return pedidoRepository.findAll();
    }

    @Transactional
    public ResponseEntity<PedidoDTO> salvar(Long vendaId, PedidoDTO pedidoDTO) {
        if (pedidoDTO.getVendaId() == null) {
            pedidoDTO.setVendaId(vendaId);
        }

        Pedido pedido = montarPedido(pedidoDTO);

        // Salvar o pedido no banco
        pedido = pedidoRepository.save(pedido);

        // Salvar os itens do pedido
        salvarItensPedido(pedidoDTO, pedido);

        // Recalcula e atualiza o total da Venda no banco de dados
        atualizarTotalVenda(pedido.getVenda().getId());

        // Setar o ID gerado do pedido no DTO e retornar a resposta
        pedidoDTO.setId(pedido.getId());
        pedidoDTO.setDataInicioPreparo(pedido.getDataInicioPreparo());
        pedidoDTO.setDataFimPreparo(pedido.getDataFimPreparo());
        return ResponseEntity.status(HttpStatus.CREATED).body(pedidoDTO);
    }

    private Pedido montarPedido(PedidoDTO pedidoDTO) {
        Pedido pedido;
        Long targetVendaId = pedidoDTO.getVendaId();

        if (pedidoDTO.getId() != null) {
            pedido = pedidoRepository.findById(pedidoDTO.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Pedido não encontrado com o ID " + pedidoDTO.getId()));
        } else {
            // Se já existe um pedido em aberto (não enviado/impresso para preparo) para esta comanda, reaproveita o mesmo registro
            List<Pedido> pedidosDaVenda = pedidoRepository.findByVendaId(targetVendaId);
            Pedido pedidoAbertoExistente = (pedidosDaVenda != null) ? pedidosDaVenda.stream()
                    .filter(p -> p.getStatusPedido() != null && "Aberto".equalsIgnoreCase(p.getStatusPedido()))
                    .findFirst()
                    .orElse(null) : null;

            if (pedidoAbertoExistente != null) {
                pedido = pedidoAbertoExistente;
                pedidoDTO.setId(pedidoAbertoExistente.getId());
            } else {
                pedido = new Pedido();
            }
        }

        Cliente cliente = null;
        if (pedidoDTO.getClienteId() != null) {
            cliente = clienteRepository.findById(pedidoDTO.getClienteId()).orElse(null);
        }

        Venda venda = vendaRepository.findById(targetVendaId)
                .orElseThrow(() -> new EntityNotFoundException("Venda não encontrada com o ID " + targetVendaId));

        pedido.setCliente(cliente);
        pedido.setVenda(venda);
        pedido.setTipoPedido(pedidoDTO.getTipoPedido() != null ? pedidoDTO.getTipoPedido() : "Mesa");
        
        String newStatus = pedidoDTO.getStatusPedido() != null ? pedidoDTO.getStatusPedido() : "Aberto";
        pedido.setStatusPedido(newStatus);
        if ("Em preparo".equalsIgnoreCase(newStatus) && pedido.getDataInicioPreparo() == null) {
            pedido.setDataInicioPreparo(LocalDateTime.now());
        } else if (("Concluído".equalsIgnoreCase(newStatus) || "Concluido".equalsIgnoreCase(newStatus)) && pedido.getDataFimPreparo() == null) {
            if (pedido.getDataInicioPreparo() == null) {
                pedido.setDataInicioPreparo(pedido.getDataHora() != null ? pedido.getDataHora() : LocalDateTime.now());
            }
            pedido.setDataFimPreparo(LocalDateTime.now());
        }

        if (pedido.getId() == null || pedido.getDataHora() == null) {
            pedido.setDataHora(LocalDateTime.now());
        }

        return pedido;
    }

    private void salvarItensPedido(PedidoDTO pedidoDTO, Pedido pedido) {
        if (pedidoDTO.getItens() != null && !pedidoDTO.getItens().isEmpty()) {
            List<ItemPedido> itensExistentes = (pedido.getId() != null) ? itemPedidoRepository.findByPedidoId(pedido.getId()) : null;

            List<ItemPedido> itensParaSalvar = new ArrayList<>();

            for (ItemPedidoDTO itemDTO : pedidoDTO.getItens()) {
                Produto produto = produtoRepository.findById(itemDTO.getProdutoId())
                        .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado com o ID " + itemDTO.getProdutoId()));

                ItemPedido itemToSave = null;

                if (itemDTO.getId() != null) {
                    itemToSave = itemPedidoRepository.findById(itemDTO.getId()).orElse(null);
                } else if (itensExistentes != null && !itensExistentes.isEmpty()) {
                    // Verifica se o mesmo produto já existe ativo no pedido em aberto
                    itemToSave = itensExistentes.stream()
                            .filter(i -> i.getProduto() != null && i.getProduto().getId().equals(produto.getId()))
                            .filter(i -> i.getStatusItem() == null || !"CANCELADO".equalsIgnoreCase(i.getStatusItem()))
                            .findFirst()
                            .orElse(null);
                }

                if (itemToSave != null) {
                    if (itemDTO.getId() != null) {
                        itemToSave.setQuantidade(itemDTO.getQuantidade() > 0 ? itemDTO.getQuantidade() : 1);
                    } else {
                        // Incrementa a quantidade no item já existente no pedido aberto
                        itemToSave.setQuantidade(itemToSave.getQuantidade() + (itemDTO.getQuantidade() > 0 ? itemDTO.getQuantidade() : 1));
                    }
                    itemToSave.setTotal(itemToSave.getQuantidade() * produto.getPreco());
                } else {
                    itemToSave = new ItemPedido();
                    itemToSave.setPedido(pedido);
                    itemToSave.setProduto(produto);
                    itemToSave.setQuantidade(itemDTO.getQuantidade() > 0 ? itemDTO.getQuantidade() : 1);
                    itemToSave.setTotal(itemToSave.getQuantidade() * produto.getPreco());
                    itemToSave.setStatusItem(itemDTO.getStatusItem() != null ? itemDTO.getStatusItem() : "ATIVO");
                }

                if (itemDTO.getMotivoCancelamento() != null) {
                    itemToSave.setMotivoCancelamento(itemDTO.getMotivoCancelamento());
                }

                itensParaSalvar.add(itemToSave);
            }

            Iterable<ItemPedido> itensSalvos = itemPedidoRepository.saveAll(itensParaSalvar);

            List<ItemPedido> itensSalvosList = StreamSupport.stream(itensSalvos.spliterator(), false)
                    .collect(Collectors.toList());

            for (int i = 0; i < itensSalvosList.size(); i++) {
                ItemPedidoDTO dto = pedidoDTO.getItens().get(i);
                ItemPedido saved = itensSalvosList.get(i);
                dto.setId(saved.getId());
                dto.setTotal(saved.getTotal());
                dto.setStatusItem(saved.getStatusItem());
                dto.setMotivoCancelamento(saved.getMotivoCancelamento());
            }
        }
    }

    @Transactional
    public ResponseEntity<PedidoDTO> atualizar(Long id, PedidoDTO pedidoDTO) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pedido não encontrado com o ID " + id));

        Cliente cliente = null;
        if (pedidoDTO.getClienteId() != null) {
            cliente = clienteRepository.findById(pedidoDTO.getClienteId()).orElse(null);
        }

        Venda venda = vendaRepository.findById(pedidoDTO.getVendaId())
                .orElseThrow(() -> new EntityNotFoundException("Venda não encontrada com o ID " + pedidoDTO.getVendaId()));

        pedido.setCliente(cliente);
        pedido.setVenda(venda);
        if (pedidoDTO.getTipoPedido() != null) pedido.setTipoPedido(pedidoDTO.getTipoPedido());
        if (pedidoDTO.getStatusPedido() != null) {
            String newStatus = pedidoDTO.getStatusPedido();
            pedido.setStatusPedido(newStatus);
            if ("Em preparo".equalsIgnoreCase(newStatus) && pedido.getDataInicioPreparo() == null) {
                pedido.setDataInicioPreparo(LocalDateTime.now());
            } else if (("Concluído".equalsIgnoreCase(newStatus) || "Concluido".equalsIgnoreCase(newStatus)) && pedido.getDataFimPreparo() == null) {
                if (pedido.getDataInicioPreparo() == null) {
                    pedido.setDataInicioPreparo(pedido.getDataHora() != null ? pedido.getDataHora() : LocalDateTime.now());
                }
                pedido.setDataFimPreparo(LocalDateTime.now());
            }
        }

        pedido = pedidoRepository.save(pedido);

        // Atualiza e preserva os itens existentes (statusItem e motivoCancelamento)
        salvarItensPedido(pedidoDTO, pedido);

        // Recalcula o total da Venda no banco de dados
        atualizarTotalVenda(pedido.getVenda().getId());

        pedidoDTO.setId(pedido.getId());
        pedidoDTO.setDataInicioPreparo(pedido.getDataInicioPreparo());
        pedidoDTO.setDataFimPreparo(pedido.getDataFimPreparo());
        return ResponseEntity.ok(pedidoDTO);
    }

    public ResponseEntity<Pedido> buscarPorId(Long id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pedido não encontrado com o ID " + id));
        return new ResponseEntity<>(pedido, HttpStatus.OK);
    }

    @Transactional
    public ResponseEntity<Void> deletar(Long id) {
        return cancelarPedidoDaComanda(id, "Cancelado via exclusão de pedido");
    }

    @Transactional
    public ResponseEntity<Void> cancelarPedidoDaComanda(Long id, String motivo) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pedido não encontrado com o ID " + id));

        if ("Concluído".equalsIgnoreCase(pedido.getStatusPedido()) || "Concluido".equalsIgnoreCase(pedido.getStatusPedido())) {
            throw new IllegalStateException("Pedidos concluídos não podem ser removidos da comanda.");
        }

        Long vendaId = pedido.getVenda() != null ? pedido.getVenda().getId() : null;

        pedido.setStatusPedido("Cancelado");
        if (motivo != null && !motivo.trim().isEmpty()) {
            pedido.setMotivoCancelamento(motivo.trim());
        }
        pedidoRepository.save(pedido);

        // Marca todos os itens do pedido como Cancelado e armazena a justificativa
        List<ItemPedido> itensDoPedido = itemPedidoRepository.findByPedidoId(id);
        for (ItemPedido item : itensDoPedido) {
            item.setStatusItem("Cancelado");
            if (motivo != null && !motivo.trim().isEmpty()) {
                item.setMotivoCancelamento(motivo.trim());
            }
        }
        itemPedidoRepository.saveAll(itensDoPedido);

        if (vendaId != null) {
            atualizarTotalVenda(vendaId);
        }

        return ResponseEntity.ok().build();
    }

    public List<Pedido> buscarPedidosPorVenda(Long vendaId) {
        return pedidoRepository.findByVendaId(vendaId);
    }

    public List<ItemPedido> buscarItensPorVenda(Long vendaId) {
        return itemPedidoRepository.findByPedidoVendaId(vendaId);
    }

    public List<ItemPedido> buscarTodosItensVendasEmAberto() {
        return itemPedidoRepository.findItensVendasEmAberto();
    }

    @Transactional
    public PedidoDTO buscarPedidoComItens(Long pedidoId) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        List<ItemPedidoDTO> itens = itemPedidoRepository.findByPedidoId(pedidoId).stream()
                .map(item -> new ItemPedidoDTO(
                        item.getId(),
                        item.getProduto().getId(),
                        item.getQuantidade(),
                        item.getTotal(),
                        item.getStatusItem(),
                        item.getMotivoCancelamento()
                ))
                .collect(Collectors.toList());

        return new PedidoDTO(
                pedido.getId(),
                pedido.getCliente() != null ? pedido.getCliente().getId() : null,
                pedido.getEndereco() != null ? pedido.getEndereco().getId() : null,
                pedido.getVenda().getId(),
                pedido.getTipoPedido(),
                pedido.getStatusPedido(),
                pedido.getDataHora(),
                pedido.getDataInicioPreparo(),
                pedido.getDataFimPreparo(),
                pedido.getMotivoCancelamento(),
                itens
        );
    }

    private void atualizarTotalVenda(Long vendaId) {
        if (vendaId == null) return;
        Venda venda = vendaRepository.findById(vendaId).orElse(null);
        if (venda != null) {
            Float totalItens = itemPedidoRepository.somarTotalPorVendaId(vendaId);
            float taxa = venda.getTaxaEntrega() != null ? venda.getTaxaEntrega() : 0.0f;
            float valorPago = venda.getValorPago() != null ? venda.getValorPago() : 0.0f;
            float totalConsumido = (totalItens != null ? totalItens : 0.0f) + taxa;
            venda.setTotal(Math.max(0.0f, totalConsumido - valorPago));
            vendaRepository.save(venda);
        }
    }
}
