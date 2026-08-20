package br.com.halotec.hungospring.service;

import br.com.halotec.hungospring.dto.ItemPedidoDTO;
import br.com.halotec.hungospring.dto.PedidoDTO;
import br.com.halotec.hungospring.entity.Cliente;
import br.com.halotec.hungospring.entity.ItemPedido;
import br.com.halotec.hungospring.entity.Pedido;
import br.com.halotec.hungospring.entity.Produto;
import br.com.halotec.hungospring.entity.Venda;
import br.com.halotec.hungospring.repository.ClienteRepository;
import br.com.halotec.hungospring.repository.ItemPedidoRepository;
import br.com.halotec.hungospring.repository.PedidoRepository;
import br.com.halotec.hungospring.repository.ProdutoRepository;
import br.com.halotec.hungospring.repository.VendaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ClienteRepository clienteRepository;
    private final VendaRepository vendaRepository;
    private final ProdutoRepository produtoRepository;
    private final ItemPedidoRepository itemPedidoRepository;

    public PedidoService(
            PedidoRepository pedidoRepository,
            ClienteRepository clienteRepository,
            VendaRepository vendaRepository,
            ProdutoRepository produtoRepository,
            ItemPedidoRepository itemPedidoRepository
    ) {
        this.pedidoRepository = pedidoRepository;
        this.clienteRepository = clienteRepository;
        this.vendaRepository = vendaRepository;
        this.produtoRepository = produtoRepository;
        this.itemPedidoRepository = itemPedidoRepository;
    }

    @Transactional(readOnly = true)
    public List<Pedido> listarTodos() {
        return pedidoRepository.findAll();
    }

    @Transactional
    public PedidoDTO salvar(Long vendaId, PedidoDTO pedidoDTO) {
        if (pedidoDTO.getVendaId() == null) {
            pedidoDTO.setVendaId(vendaId);
        }

        Pedido pedido = montarPedido(pedidoDTO);
        pedido = pedidoRepository.save(pedido);

        salvarItensPedido(pedidoDTO, pedido);
        if (pedido.getVenda() != null && pedido.getVenda().getId() != null) {
            atualizarTotalVenda(pedido.getVenda().getId());
        }

        pedidoDTO.setId(pedido.getId());
        pedidoDTO.setDataInicioPreparo(pedido.getDataInicioPreparo());
        pedidoDTO.setDataFimPreparo(pedido.getDataFimPreparo());
        return pedidoDTO;
    }

    private Pedido montarPedido(PedidoDTO pedidoDTO) {
        Pedido pedido;
        Long targetVendaId = Objects.requireNonNull(pedidoDTO.getVendaId(), "ID da Venda é obrigatório");

        Long pedidoId = pedidoDTO.getId();
        if (pedidoId != null) {
            pedido = pedidoRepository.findById(pedidoId)
                    .orElseThrow(() -> new EntityNotFoundException("Pedido não encontrado com o ID " + pedidoId));
        } else {
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
        Long cliId = pedidoDTO.getClienteId();
        if (cliId != null) {
            cliente = clienteRepository.findById(cliId).orElse(null);
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
                Long produtoId = Objects.requireNonNull(itemDTO.getProdutoId(), "ID do Produto é obrigatório");
                Produto produto = produtoRepository.findById(produtoId)
                        .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado com o ID " + produtoId));

                ItemPedido itemToSave = null;
                Long itemDtoId = itemDTO.getId();

                if (itemDtoId != null) {
                    itemToSave = itemPedidoRepository.findById(itemDtoId).orElse(null);
                } else if (itensExistentes != null && !itensExistentes.isEmpty()) {
                    itemToSave = itensExistentes.stream()
                            .filter(i -> i.getProduto() != null && Objects.equals(i.getProduto().getId(), produto.getId()))
                            .filter(i -> i.getStatusItem() == null || !"CANCELADO".equalsIgnoreCase(i.getStatusItem()))
                            .findFirst()
                            .orElse(null);
                }

                if (itemToSave != null) {
                    if (itemDtoId != null) {
                        itemToSave.setQuantidade(itemDTO.getQuantidade() > 0 ? itemDTO.getQuantidade() : 1);
                    } else {
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

            List<ItemPedido> itensSalvosList = itemPedidoRepository.saveAll(itensParaSalvar);

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
    public PedidoDTO atualizar(Long id, PedidoDTO pedidoDTO) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pedido não encontrado com o ID " + id));

        Cliente cliente = null;
        Long cliId = pedidoDTO.getClienteId();
        if (cliId != null) {
            cliente = clienteRepository.findById(cliId).orElse(null);
        }

        Long targetVendaId = Objects.requireNonNull(pedidoDTO.getVendaId(), "ID da Venda é obrigatório");
        Venda venda = vendaRepository.findById(targetVendaId)
                .orElseThrow(() -> new EntityNotFoundException("Venda não encontrada com o ID " + targetVendaId));

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

        salvarItensPedido(pedidoDTO, pedido);
        if (pedido.getVenda() != null && pedido.getVenda().getId() != null) {
            atualizarTotalVenda(pedido.getVenda().getId());
        }

        pedidoDTO.setId(pedido.getId());
        pedidoDTO.setDataInicioPreparo(pedido.getDataInicioPreparo());
        pedidoDTO.setDataFimPreparo(pedido.getDataFimPreparo());
        return pedidoDTO;
    }

    @Transactional(readOnly = true)
    public Pedido buscarPorId(Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pedido não encontrado com o ID " + id));
    }

    @Transactional
    public void deletar(Long id) {
        cancelarPedidoDaComanda(id, "Cancelado via exclusão de pedido");
    }

    @Transactional
    public void cancelarPedidoDaComanda(Long id, @Nullable String motivo) {
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
    }

    @Transactional(readOnly = true)
    public List<Pedido> buscarPedidosPorVenda(Long vendaId) {
        return pedidoRepository.findByVendaId(vendaId);
    }

    @Transactional(readOnly = true)
    public List<ItemPedido> buscarItensPorVenda(Long vendaId) {
        return itemPedidoRepository.findByPedidoVendaId(vendaId);
    }

    @Transactional(readOnly = true)
    public List<ItemPedido> buscarTodosItensVendasEmAberto() {
        return itemPedidoRepository.findItensVendasEmAberto();
    }

    @Transactional(readOnly = true)
    public PedidoDTO buscarPedidoComItens(Long pedidoId) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new EntityNotFoundException("Pedido não encontrado com ID: " + pedidoId));

        List<ItemPedidoDTO> itens = itemPedidoRepository.findByPedidoId(pedidoId).stream()
                .map(item -> new ItemPedidoDTO(
                        item.getId(),
                        item.getProduto() != null ? item.getProduto().getId() : null,
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
                pedido.getVenda() != null ? pedido.getVenda().getId() : null,
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
