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

import java.util.ArrayList;
import java.util.HashMap;
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

    //CleanCode
    // estuda nas férias sobre SOLID
    @Transactional
    public ResponseEntity<PedidoDTO> salvar(Long vendaId, PedidoDTO pedidoDTO) {
        Pedido pedido=montarPedido(pedidoDTO);

        // Salvar o pedido no banco
        pedido = pedidoRepository.save(pedido);

        // Salvar os itens do pedido
        salvarItensPedido(pedidoDTO, pedido);

        // Setar o ID do pedido no DTO e retornar a resposta
        return ResponseEntity.status(HttpStatus.CREATED).body(pedidoDTO);
    }

    private Pedido montarPedido(PedidoDTO pedidoDTO){
        Pedido pedido;
        // Se o pedido já existe, busca no banco; se não, cria um novo
        if (pedidoDTO.getId() != null) {
            pedido = pedidoRepository.findById(pedidoDTO.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Pedido não encontrado com o ID " + pedidoDTO.getId()));
        } else {
            pedido = new Pedido();
        }

        // Buscar as entidades associadas (Cliente, Venda)
        Cliente cliente = clienteRepository.findById(pedidoDTO.getClienteId())
                .orElseThrow(() -> new EntityNotFoundException("Cliente não encontrado com o ID " + pedidoDTO.getClienteId()));

        Venda venda = vendaRepository.findById(pedidoDTO.getVendaId())
                .orElseThrow(() -> new EntityNotFoundException("Venda não encontrada com o ID " + pedidoDTO.getVendaId()));

        // Setar dados no pedido
        pedido.setCliente(cliente);
        pedido.setVenda(venda);
        pedido.setTipoPedido(pedidoDTO.getTipoPedido());
        pedido.setStatusPedido(pedidoDTO.getStatusPedido());
        pedido.setDataHora(pedidoDTO.getDataHora());
        return pedido;
    }

    private void salvarItensPedido(PedidoDTO pedidoDTO, Pedido pedido){
        if (pedidoDTO.getItens() != null && !pedidoDTO.getItens().isEmpty()) {
            Pedido finalPedido = pedido;
            List<ItemPedido> itens = pedidoDTO.getItens().stream().map(itemDTO -> {
                ItemPedido item;

                // Se o item já existe (tem ID), faz uma atualização
                if (itemDTO.getId() != null) {
                    item = itemPedidoRepository.findById(itemDTO.getId())
                            .orElseThrow(() -> new EntityNotFoundException("Item de Pedido não encontrado com o ID " + itemDTO.getId()));
                } else {
                    item = new ItemPedido();
                }

                // Relacionar o item com o pedido
                item.setPedido(finalPedido);

                // Buscar o produto relacionado
                Produto produto = produtoRepository.findById(itemDTO.getProdutoId())
                        .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado com o ID " + itemDTO.getProdutoId()));
                item.setProduto(produto);
                item.setQuantidade(itemDTO.getQuantidade());

                // Calcular o total do item
                item.setTotal(item.getQuantidade() * produto.getPreco());

                return item;
            }).collect(Collectors.toList());

            // Salvar os itens no banco
            Iterable<ItemPedido> itensSalvos = itemPedidoRepository.saveAll(itens);

            // Atualizar os IDs dos itens no PedidoDTO
            List<ItemPedido> itensSalvosList = StreamSupport.stream(itensSalvos.spliterator(), false)
                    .collect(Collectors.toList());

            for (int i = 0; i < itensSalvosList.size(); i++) {
                pedidoDTO.getItens().get(i).setId(itensSalvosList.get(i).getId());
            }
        }
    }


    @Transactional
    public ResponseEntity<PedidoDTO> atualizar(Long id, PedidoDTO pedidoDTO) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pedido não encontrado com o ID " + id));

        // Atualiza os dados básicos do pedido
        Cliente cliente = clienteRepository.findById(pedidoDTO.getClienteId())
                .orElseThrow(() -> new EntityNotFoundException("Cliente não encontrado com o ID " + pedidoDTO.getClienteId()));

        Venda venda = vendaRepository.findById(pedidoDTO.getVendaId())
                .orElseThrow(() -> new EntityNotFoundException("Venda não encontrada com o ID " + pedidoDTO.getVendaId()));

        // Setar dados no pedido
        pedido.setCliente(cliente);
        pedido.setVenda(venda);
        pedido.setTipoPedido(pedidoDTO.getTipoPedido());
        pedido.setStatusPedido(pedidoDTO.getStatusPedido());
        pedido.setDataHora(pedidoDTO.getDataHora());

        // Salvar o pedido no banco
        pedido = pedidoRepository.save(pedido);

        // Remover todos os itens antigos relacionados ao pedido
        itemPedidoRepository.deleteByPedidoId(id);

        // Adicionar novos itens, se existirem
        if (pedidoDTO.getItens() != null && !pedidoDTO.getItens().isEmpty()) {
            // Iterar sobre os itens do pedido e adicionar os novos
            List<ItemPedido> itensParaSalvar = new ArrayList<>();
            for (ItemPedidoDTO itemDTO : pedidoDTO.getItens()) {
                ItemPedido item = new ItemPedido();
                item.setQuantidade(itemDTO.getQuantidade());

                // Relacionar o item com o pedido
                item.setPedido(pedido);

                // Buscar o produto relacionado
                Produto produto = produtoRepository.findById(itemDTO.getProdutoId())
                        .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado com o ID " + itemDTO.getProdutoId()));
                item.setProduto(produto);
                item.setTotal(item.getQuantidade() * produto.getPreco());

                itensParaSalvar.add(item);
            }

            // Salvar os novos itens no banco
            Iterable<ItemPedido> itensSalvos = itemPedidoRepository.saveAll(itensParaSalvar);

            // Atualizar os IDs dos itens no PedidoDTO
            List<ItemPedido> itensSalvosList = StreamSupport.stream(itensSalvos.spliterator(), false)
                    .collect(Collectors.toList());

            for (int i = 0; i < itensSalvosList.size(); i++) {
                pedidoDTO.getItens().get(i).setId(itensSalvosList.get(i).getId());
            }
        }

        // Setar o ID do pedido no DTO e retornar a resposta
        pedidoDTO.setId(pedido.getId());
        return ResponseEntity.ok(pedidoDTO);  // 200 OK com o pedido atualizado
    }


    // Buscar um pedido pelo ID
    public ResponseEntity<Pedido> buscarPorId(Long id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pedido não encontrado com o ID " + id));
        return new ResponseEntity<>(pedido, HttpStatus.OK);
    }

    // Deletar um pedido
    @Transactional
    public ResponseEntity<Void> deletar(Long id) {
        // Verifica se o pedido existe
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pedido não encontrado com o ID " + id));

        // Deleta todos os itens do pedido
        itemPedidoRepository.deleteByPedidoId(id);

        // Deleta o pedido
        pedidoRepository.delete(pedido);

        // Retorna uma resposta HTTP 204 (sem conteúdo) após a exclusão
        return ResponseEntity.noContent().build();
    }
//    public ResponseEntity<Void> deletar(Long id) {
//        pedidoRepository.deleteById(id);
//        return ResponseEntity.noContent().build();
//    }

    // Buscar pedidos por vendaId
    public List<Pedido> buscarPedidosPorVenda(Long vendaId) {
        return pedidoRepository.findByVendaId(vendaId);
    }

    @Transactional
    public PedidoDTO buscarPedidoComItens(Long pedidoId) {
        // Buscar o Pedido pelo ID
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        // Buscar os itens do Pedido
        List<ItemPedidoDTO> itens = itemPedidoRepository.findByPedidoId(pedidoId).stream()
                .map(item -> new ItemPedidoDTO(
                        item.getId(),
                        item.getProduto().getId(),
                        item.getQuantidade(),
                        item.getTotal()
                ))
                .collect(Collectors.toList());

        // Criar e retornar o PedidoDTO com os dados do Pedido e os itens
        return new PedidoDTO(
                pedido.getId(),
                pedido.getCliente().getId(),
                pedido.getEndereco() != null ? pedido.getEndereco().getId() : null,
                pedido.getVenda().getId(),
                pedido.getTipoPedido(),
                pedido.getStatusPedido(),
                pedido.getDataHora(),
                itens
        );
    }
}
