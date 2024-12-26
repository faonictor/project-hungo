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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ProdutoDTOService {

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private InsumoRepository insumoRepository;

    @Autowired
    private ProdutoInsumoRepository produtoInsumoRepository;

    public Produto cadastrarProduto(ProdutoDTO produtoDTO) {
        // Buscar a categoria
        Categoria categoria = categoriaRepository.findById(produtoDTO.getCategoriaId())
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));

        // Criar o produto
        Produto produto = new Produto();
        produto.setNome(produtoDTO.getNome());
        produto.setPreco(produtoDTO.getPreco());
        produto.setCategoria(categoria);
        produto.setTipo(true);  // Tipo sempre "ativo"

        // Salvar o produto
        produto = produtoRepository.save(produto);

        // Associar os insumos ao produto
        for (ProdutoInsumoDTO produtoInsumoDTO : produtoDTO.getInsumos()) {
            Insumo insumo = insumoRepository.findById(produtoInsumoDTO.getInsumoId())
                    .orElseThrow(() -> new RuntimeException("Insumo não encontrado"));
            ProdutoInsumo produtoInsumo = new ProdutoInsumo();
            produtoInsumo.setProduto(produto);
            produtoInsumo.setInsumo(insumo);
            produtoInsumo.setQuantidade(produtoInsumoDTO.getQuantidade());
            produtoInsumoRepository.save(produtoInsumo);
        }

        return produto;
    }
}

