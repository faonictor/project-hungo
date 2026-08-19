package br.com.halotec.hungospring.service;

import br.com.halotec.hungospring.dto.ProdutoDTO;
import br.com.halotec.hungospring.dto.ProdutoInsumoDTO;
import br.com.halotec.hungospring.entity.Produto;
import br.com.halotec.hungospring.entity.ProdutoInsumo;
import br.com.halotec.hungospring.entity.Categoria;
import br.com.halotec.hungospring.entity.Insumo;
import br.com.halotec.hungospring.repository.ProdutoRepository;
import br.com.halotec.hungospring.repository.ProdutoInsumoRepository;
import br.com.halotec.hungospring.repository.CategoriaRepository;
import br.com.halotec.hungospring.repository.InsumoRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProdutoService {

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private ProdutoInsumoRepository produtoInsumoRepository;

    @Autowired
    private InsumoRepository insumoRepository;

    // Listar todos os produtos
    public Iterable<Produto> listarTodos() {
        return produtoRepository.findAll();
    }

    // Salvar um produto
    public ResponseEntity<Produto> salvar(Produto produto) {
        return new ResponseEntity<>(produtoRepository.save(produto), HttpStatus.OK);
    }

    // Buscar produto por ID
    public ResponseEntity<Produto> buscarPorId(Long id) {
        return new ResponseEntity<>(produtoRepository.findById(id).orElseThrow(), HttpStatus.OK);
    }

    // Deletar um produto
    @Transactional
    public ResponseEntity deletar(Long id) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado com o ID " + id));
        produtoInsumoRepository.deleteByProduto(produto);
        produtoRepository.delete(produto);
        return new ResponseEntity("{\"mensagem\":\"Produto e registros relacionados removidos com sucesso\"}", HttpStatus.OK);
    }

    @Transactional
    public ResponseEntity<Produto> salvarOuAtualizarProduto(ProdutoDTO produtoDTO) {
        Produto produto;

        // Verificar se o produto já existe (atualização) ou criar um novo
        if (produtoDTO.getId() != null) {
            produto = produtoRepository.findById(produtoDTO.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado com o ID " + produtoDTO.getId()));
        } else {
            produto = new Produto();
        }

        produto.setNome(produtoDTO.getNome());
        produto.setPreco(produtoDTO.getPreco());
        produto.setTipo(produtoDTO.getTipo() != null ? produtoDTO.getTipo() : true);
        produto.setFavorito(produtoDTO.getFavorito() != null ? produtoDTO.getFavorito() : false);

        // Se uma categoria foi informada, usa ela; caso contrario, atribui/cria a categoria "Geral"
        if (produtoDTO.getCategoriaId() != null) {
            Categoria categoria = categoriaRepository.findById(produtoDTO.getCategoriaId()).orElse(null);
            if (categoria == null) {
                categoria = obterOuCriarCategoriaGeral();
            }
            produto.setCategoria(categoria);
        } else {
            produto.setCategoria(obterOuCriarCategoriaGeral());
        }

        produto = produtoRepository.save(produto);

        // Gerenciar os insumos associados
        if (produtoDTO.getInsumos() == null || produtoDTO.getInsumos().isEmpty()) {
            produtoInsumoRepository.deleteByProduto(produto);
        } else {
            produtoInsumoRepository.deleteByProduto(produto);

            for (ProdutoInsumoDTO insumoDTO : produtoDTO.getInsumos()) {
                ProdutoInsumo produtoInsumo = new ProdutoInsumo();
                Insumo insumo = insumoRepository.findById(insumoDTO.getInsumoId())
                        .orElseThrow(() -> new EntityNotFoundException("Insumo não encontrado"));

                produtoInsumo.setProduto(produto);
                produtoInsumo.setInsumo(insumo);
                produtoInsumo.setQuantidade(insumoDTO.getQuantidade());

                produtoInsumoRepository.save(produtoInsumo);
            }
        }

        return new ResponseEntity<>(produto, HttpStatus.OK);
    }

    private Categoria obterOuCriarCategoriaGeral() {
        return categoriaRepository.findByNomeIgnoreCase("Geral")
                .orElseGet(() -> {
                    Categoria novaGeral = new Categoria();
                    novaGeral.setNome("Geral");
                    return categoriaRepository.save(novaGeral);
                });
    }

    public ResponseEntity<ProdutoDTO> buscarProdutoPorId(Long id) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado com o ID " + id));

        ProdutoDTO produtoDTO = new ProdutoDTO();
        produtoDTO.setId(produto.getId());
        produtoDTO.setNome(produto.getNome());
        produtoDTO.setPreco(produto.getPreco());
        produtoDTO.setTipo(produto.getTipo());
        produtoDTO.setFavorito(produto.getFavorito() != null ? produto.getFavorito() : false);

        if (produto.getCategoria() != null) {
            produtoDTO.setCategoriaId(produto.getCategoria().getId());
        }

        List<ProdutoInsumoDTO> insumosDTO = new ArrayList<>();
        List<ProdutoInsumo> produtoInsumos = produtoInsumoRepository.findByProduto(produto);

        for (ProdutoInsumo produtoInsumo : produtoInsumos) {
            ProdutoInsumoDTO insumoDTO = new ProdutoInsumoDTO();
            insumoDTO.setInsumoId(produtoInsumo.getInsumo().getId());
            insumoDTO.setQuantidade(produtoInsumo.getQuantidade());
            insumosDTO.add(insumoDTO);
        }
        produtoDTO.setInsumos(insumosDTO);

        return new ResponseEntity<>(produtoDTO, HttpStatus.OK);
    }
}