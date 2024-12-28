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

    //salvar um produto DTO
    public ResponseEntity<Produto> salvarProduto(ProdutoDTO produtoDTO) {
        // 1. Verificar ou criar a Categoria
        Categoria categoria = categoriaRepository.findById(produtoDTO.getCategoriaId())
                .orElseThrow(() -> new EntityNotFoundException("Categoria não encontrada"));

        // 2. Criar o Produto e associar a Categoria
        Produto produto = new Produto();
        produto.setNome(produtoDTO.getNome());
        produto.setPreco(produtoDTO.getPreco());
        produto.setCategoria(categoria);
        produto = produtoRepository.save(produto);  // Produto é salvo aqui

        // 3. Criar e associar os Insumos ao Produto
        if (produtoDTO.getInsumos() != null && !produtoDTO.getInsumos().isEmpty()) {
            for (ProdutoInsumoDTO insumoDTO : produtoDTO.getInsumos()) {
                ProdutoInsumo produtoInsumo = new ProdutoInsumo();
                Insumo insumo = insumoRepository.findById(insumoDTO.getInsumoId())
                        .orElseThrow(() -> new EntityNotFoundException("Insumo não encontrado"));

                produtoInsumo.setProduto(produto);  // Associando o produto ao ProdutoInsumo
                produtoInsumo.setInsumo(insumo);    // Associando o insumo ao ProdutoInsumo
                produtoInsumo.setQuantidade(insumoDTO.getQuantidade());

                // Salvando a associação ProdutoInsumo
                produtoInsumoRepository.save(produtoInsumo);
            }
        }

        // Retornar o produto criado com a categoria associada
        return new ResponseEntity<>(produto, HttpStatus.CREATED);
    }

    //retornar um produto DTO
    public ResponseEntity<ProdutoDTO> buscarProdutoPorId(Long id) {
        // 1. Buscar o Produto
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado com o ID " + id));

        // 2. Criar o ProdutoDTO
        ProdutoDTO produtoDTO = new ProdutoDTO();
        produtoDTO.setId(produto.getId());
        produtoDTO.setNome(produto.getNome());
        produtoDTO.setPreco(produto.getPreco());
        produtoDTO.setCategoriaId(produto.getCategoria().getId());

        // 3. Preencher a lista de insumos (ProdutoInsumoDTO)
        List<ProdutoInsumoDTO> insumosDTO = new ArrayList<>();
        List<ProdutoInsumo> produtoInsumos = produtoInsumoRepository.findByProduto(produto);
        for (ProdutoInsumo produtoInsumo : produtoInsumos) {
            ProdutoInsumoDTO insumoDTO = new ProdutoInsumoDTO();
            insumoDTO.setInsumoId(produtoInsumo.getInsumo().getId());
            insumoDTO.setQuantidade(produtoInsumo.getQuantidade());
            insumosDTO.add(insumoDTO);
        }
        produtoDTO.setInsumos(insumosDTO);

        // 4. Retornar a resposta com o ProdutoDTO
        return new ResponseEntity<>(produtoDTO, HttpStatus.OK);
    }
}