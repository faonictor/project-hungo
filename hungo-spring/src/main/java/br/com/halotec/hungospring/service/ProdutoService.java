package br.com.halotec.hungospring.service;

import br.com.halotec.hungospring.dto.ProdutoDTO;
import br.com.halotec.hungospring.entity.Categoria;
import br.com.halotec.hungospring.entity.Produto;
import br.com.halotec.hungospring.repository.CategoriaRepository;
import br.com.halotec.hungospring.repository.ProdutoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final CategoriaRepository categoriaRepository;

    public ProdutoService(
            ProdutoRepository produtoRepository,
            CategoriaRepository categoriaRepository
    ) {
        this.produtoRepository = produtoRepository;
        this.categoriaRepository = categoriaRepository;
    }

    @Transactional(readOnly = true)
    public List<Produto> listarTodos() {
        return produtoRepository.findAll();
    }

    @Transactional
    public Produto salvar(Produto produto) {
        return produtoRepository.save(produto);
    }

    @Transactional(readOnly = true)
    public Produto buscarEntidadePorId(Long id) {
        return produtoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado com o ID: " + id));
    }

    @Transactional
    public void deletar(Long id) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado com o ID: " + id));
        produtoRepository.delete(produto);
    }

    @Transactional
    public Produto salvarOuAtualizarProduto(ProdutoDTO produtoDTO) {
        Produto produto;

        Long prodId = produtoDTO.getId();
        if (prodId != null) {
            produto = produtoRepository.findById(prodId)
                    .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado com o ID " + prodId));
        } else {
            produto = new Produto();
        }

        produto.setNome(produtoDTO.getNome());
        produto.setPreco(produtoDTO.getPreco());
        produto.setTipo(produtoDTO.getTipo() != null ? produtoDTO.getTipo() : true);

        boolean querFavorito = Boolean.TRUE.equals(produtoDTO.getFavorito());
        if (querFavorito) {
            boolean jaEraFavorito = prodId != null && Boolean.TRUE.equals(produto.getFavorito());
            if (!jaEraFavorito) {
                long totalFavs = produtoRepository.countByFavoritoTrue();
                if (totalFavs >= 12) {
                    throw new IllegalStateException("Limite máximo de 12 produtos favoritos atingido. Desmarque outro produto antes de destacar este.");
                }
            }
            produto.setFavorito(true);
        } else {
            produto.setFavorito(false);
        }

        Long catId = produtoDTO.getCategoriaId();
        if (catId != null) {
            Categoria categoria = categoriaRepository.findById(catId).orElse(null);
            if (categoria == null) {
                categoria = obterOuCriarCategoriaGeral();
            }
            produto.setCategoria(categoria);
        } else {
            produto.setCategoria(obterOuCriarCategoriaGeral());
        }

        return produtoRepository.save(produto);
    }

    private Categoria obterOuCriarCategoriaGeral() {
        return categoriaRepository.findByNomeIgnoreCase("Geral")
                .orElseGet(() -> {
                    Categoria novaGeral = new Categoria();
                    novaGeral.setNome("Geral");
                    return categoriaRepository.save(novaGeral);
                });
    }

    @Transactional(readOnly = true)
    public ProdutoDTO buscarProdutoPorId(Long id) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado com o ID: " + id));

        ProdutoDTO produtoDTO = new ProdutoDTO();
        produtoDTO.setId(produto.getId());
        produtoDTO.setNome(produto.getNome());
        produtoDTO.setPreco(produto.getPreco());
        produtoDTO.setTipo(produto.getTipo());
        produtoDTO.setFavorito(produto.getFavorito() != null ? produto.getFavorito() : false);

        if (produto.getCategoria() != null) {
            produtoDTO.setCategoriaId(produto.getCategoria().getId());
        }

        return produtoDTO;
    }
}