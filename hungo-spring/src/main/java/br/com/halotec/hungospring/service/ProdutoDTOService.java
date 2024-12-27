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
import jakarta.transaction.Transactional;
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

    public Produto editarProduto(Long id, ProdutoDTO produtoDTO) {

        Produto produtoExistente = produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        // Atualizar os campos do produto
        Categoria categoria = categoriaRepository.findById(produtoDTO.getCategoriaId())
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));

        produtoExistente.setNome(produtoDTO.getNome());
        produtoExistente.setPreco(produtoDTO.getPreco());
        produtoExistente.setCategoria(categoria);

        // Atualizar o produto no banco de dados
        produtoExistente = produtoRepository.save(produtoExistente);

        // Remover os insumos antigos (caso necessário)
        produtoInsumoRepository.deleteByProduto(produtoExistente);

        // Associar os novos insumos ao produto
        for (ProdutoInsumoDTO produtoInsumoDTO : produtoDTO.getInsumos()) {
            Insumo insumo = insumoRepository.findById(produtoInsumoDTO.getInsumoId())
                    .orElseThrow(() -> new RuntimeException("Insumo não encontrado"));
            ProdutoInsumo produtoInsumo = new ProdutoInsumo();
            produtoInsumo.setProduto(produtoExistente);
            produtoInsumo.setInsumo(insumo);
            produtoInsumo.setQuantidade(produtoInsumoDTO.getQuantidade());
            produtoInsumoRepository.save(produtoInsumo);
        }

        return produtoExistente;
    }

    @Transactional
    public void excluirProduto(Long id) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        // Excluir dependências (associados na tabela ProdutoInsumo)
        produtoInsumoRepository.deleteByProduto(produto);

        // Excluir o produto
        produtoRepository.delete(produto);
    }

    // Metodo para listar todos os produtos
    public Iterable<Produto> listarTodos() {
        return produtoRepository.findAll();
    }
}

