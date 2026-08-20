package br.com.halotec.hungospring.service;

import br.com.halotec.hungospring.dto.ProdutoDTO;
import br.com.halotec.hungospring.dto.ProdutoInsumoDTO;
import br.com.halotec.hungospring.entity.Categoria;
import br.com.halotec.hungospring.entity.Insumo;
import br.com.halotec.hungospring.entity.Produto;
import br.com.halotec.hungospring.entity.ProdutoInsumo;
import br.com.halotec.hungospring.repository.CategoriaRepository;
import br.com.halotec.hungospring.repository.InsumoRepository;
import br.com.halotec.hungospring.repository.ProdutoInsumoRepository;
import br.com.halotec.hungospring.repository.ProdutoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final CategoriaRepository categoriaRepository;
    private final ProdutoInsumoRepository produtoInsumoRepository;
    private final InsumoRepository insumoRepository;

    public ProdutoService(
            ProdutoRepository produtoRepository,
            CategoriaRepository categoriaRepository,
            ProdutoInsumoRepository produtoInsumoRepository,
            InsumoRepository insumoRepository
    ) {
        this.produtoRepository = produtoRepository;
        this.categoriaRepository = categoriaRepository;
        this.produtoInsumoRepository = produtoInsumoRepository;
        this.insumoRepository = insumoRepository;
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
        produtoInsumoRepository.deleteByProduto(produto);
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
        produto.setFavorito(produtoDTO.getFavorito() != null ? produtoDTO.getFavorito() : false);

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

        produto = produtoRepository.save(produto);

        // Gerenciar os insumos associados
        if (produtoDTO.getInsumos() == null || produtoDTO.getInsumos().isEmpty()) {
            produtoInsumoRepository.deleteByProduto(produto);
        } else {
            produtoInsumoRepository.deleteByProduto(produto);

            List<ProdutoInsumo> novosInsumos = new ArrayList<>();
            for (ProdutoInsumoDTO insumoDTO : produtoDTO.getInsumos()) {
                Long insumoId = Objects.requireNonNull(insumoDTO.getInsumoId(), "ID do Insumo é obrigatório");
                Insumo insumo = insumoRepository.findById(insumoId)
                        .orElseThrow(() -> new EntityNotFoundException("Insumo não encontrado com o ID: " + insumoId));

                ProdutoInsumo produtoInsumo = new ProdutoInsumo();
                produtoInsumo.setProduto(produto);
                produtoInsumo.setInsumo(insumo);
                produtoInsumo.setQuantidade(insumoDTO.getQuantidade());
                novosInsumos.add(produtoInsumo);
            }
            produtoInsumoRepository.saveAll(novosInsumos);
        }

        return produto;
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

        List<ProdutoInsumoDTO> insumosDTO = new ArrayList<>();
        List<ProdutoInsumo> produtoInsumos = produtoInsumoRepository.findByProduto(produto);

        for (ProdutoInsumo produtoInsumo : produtoInsumos) {
            ProdutoInsumoDTO insumoDTO = new ProdutoInsumoDTO();
            insumoDTO.setInsumoId(produtoInsumo.getInsumo() != null ? produtoInsumo.getInsumo().getId() : null);
            insumoDTO.setQuantidade(produtoInsumo.getQuantidade());
            insumosDTO.add(insumoDTO);
        }
        produtoDTO.setInsumos(insumosDTO);

        return produtoDTO;
    }
}