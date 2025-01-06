package br.com.halotec.hungospring.service;

import br.com.halotec.hungospring.dto.PedidoDTO;
import br.com.halotec.hungospring.entity.*;
import br.com.halotec.hungospring.repository.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

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

    public ResponseEntity<Pedido> salvar(Pedido pedido) {
        return new ResponseEntity<>(pedidoRepository.save(pedido), HttpStatus.OK);
    }

    public ResponseEntity<Pedido> buscarPorId(Long id) {
        return new ResponseEntity<>(pedidoRepository.findById(id).orElseThrow(), HttpStatus.OK);
    }

    public ResponseEntity deletar(Long id) {
        pedidoRepository.deleteById(id);
        return new ResponseEntity("{\"mensagem\":\"Pedido Removido com Sucesso\"}", HttpStatus.OK);
    }

    @Transactional
    public ResponseEntity<PedidoDTO> salvar(PedidoDTO pedidoDTO) {
        Pedido pedido;

        // Se o pedido já existe (verificando o ID), atualiza, caso contrário, cria um novo
        if (pedidoDTO.getId() != null) {
            pedido = pedidoRepository.findById(pedidoDTO.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Pedido não encontrado com o ID " + pedidoDTO.getId()));
        } else {
            pedido = new Pedido();
        }

        // Buscar as entidades associadas
        Cliente cliente = clienteRepository.findById(pedidoDTO.getClienteId())
                .orElseThrow(() -> new EntityNotFoundException("Cliente não encontrado"));

        Venda venda = vendaRepository.findById(pedidoDTO.getVendaId())
                .orElseThrow(() -> new EntityNotFoundException("Venda não encontrada"));

        pedido.setCliente(cliente);
        pedido.setVenda(venda);
        pedido.setTipoPedido(pedidoDTO.getTipoPedido());
        pedido.setStatusPedido(pedidoDTO.getStatusPedido());
        pedido.setDataHora(pedidoDTO.getDataHora());

        // Salvar ou atualizar o Pedido no banco
        pedido = pedidoRepository.save(pedido);

        // Salvar ou atualizar os Itens do Pedido
        if (pedidoDTO.getItens() != null && !pedidoDTO.getItens().isEmpty()) {
            Pedido finalPedido = pedido;
            List<ItemPedido> itens = pedidoDTO.getItens().stream().map(itemDTO -> {
                ItemPedido item;

                // Caso o ItemPedido já tenha um ID, significa que é uma atualização
                if (itemDTO.getId() != null) {
                    item = itemPedidoRepository.findById(itemDTO.getId())
                            .orElseThrow(() -> new EntityNotFoundException("Item de Pedido não encontrado"));
                } else {
                    item = new ItemPedido();
                }

                item.setPedido(finalPedido);

                Produto produto = produtoRepository.findById(itemDTO.getProdutoId())
                        .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado"));
                item.setProduto(produto);
                item.setQuantidade(itemDTO.getQuantidade());

                // Cálculo do total no backend
                item.setTotal(item.getQuantidade() * produto.getPreco());

                return item;
            }).collect(Collectors.toList());

            // Salvar ou atualizar os itens no banco
            Iterable<ItemPedido> itensSalvos = itemPedidoRepository.saveAll(itens);

            // Atualizar o ID dos itens no PedidoDTO
            List<ItemPedido> itensSalvosList = StreamSupport.stream(itensSalvos.spliterator(), false)
                    .collect(Collectors.toList());

            for (int i = 0; i < itensSalvosList.size(); i++) {
                pedidoDTO.getItens().get(i).setId(itensSalvosList.get(i).getId());
            }
        }

        pedidoDTO.setId(pedido.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(pedidoDTO);
    }


    public List<Pedido> buscarPedidosPorVenda(Long vendaId) {
        return pedidoRepository.findByVendaId(vendaId);
    }
}
