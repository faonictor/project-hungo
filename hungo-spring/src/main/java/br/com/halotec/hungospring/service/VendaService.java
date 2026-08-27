package br.com.halotec.hungospring.service;

import br.com.halotec.hungospring.entity.Cliente;
import br.com.halotec.hungospring.entity.ComandaExcluida;
import br.com.halotec.hungospring.entity.Endereco;
import br.com.halotec.hungospring.entity.FluxoFinanceiro;
import br.com.halotec.hungospring.entity.ItemPedido;
import br.com.halotec.hungospring.entity.Mesa;
import br.com.halotec.hungospring.entity.PagamentoComanda;
import br.com.halotec.hungospring.entity.Pedido;
import br.com.halotec.hungospring.entity.Venda;
import br.com.halotec.hungospring.repository.ClienteRepository;
import br.com.halotec.hungospring.repository.ComandaExcluidaRepository;
import br.com.halotec.hungospring.repository.EnderecoRepository;
import br.com.halotec.hungospring.repository.FluxoFinanceiroRepository;
import br.com.halotec.hungospring.repository.ItemPedidoRepository;
import br.com.halotec.hungospring.repository.MesaRepository;
import br.com.halotec.hungospring.repository.PagamentoComandaRepository;
import br.com.halotec.hungospring.repository.PedidoRepository;
import br.com.halotec.hungospring.repository.VendaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.jspecify.annotations.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class VendaService {

    private final VendaRepository vendaRepository;
    private final ItemPedidoRepository itemPedidoRepository;
    private final PedidoRepository pedidoRepository;
    private final MesaRepository mesaRepository;
    private final ComandaExcluidaRepository comandaExcluidaRepository;
    private final ClienteRepository clienteRepository;
    private final EnderecoRepository enderecoRepository;
    private final PagamentoComandaRepository pagamentoComandaRepository;
    private final FluxoFinanceiroRepository fluxoFinanceiroRepository;

    public VendaService(
            VendaRepository vendaRepository,
            ItemPedidoRepository itemPedidoRepository,
            PedidoRepository pedidoRepository,
            MesaRepository mesaRepository,
            ComandaExcluidaRepository comandaExcluidaRepository,
            ClienteRepository clienteRepository,
            EnderecoRepository enderecoRepository,
            PagamentoComandaRepository pagamentoComandaRepository,
            FluxoFinanceiroRepository fluxoFinanceiroRepository
    ) {
        this.vendaRepository = vendaRepository;
        this.itemPedidoRepository = itemPedidoRepository;
        this.pedidoRepository = pedidoRepository;
        this.mesaRepository = mesaRepository;
        this.comandaExcluidaRepository = comandaExcluidaRepository;
        this.clienteRepository = clienteRepository;
        this.enderecoRepository = enderecoRepository;
        this.pagamentoComandaRepository = pagamentoComandaRepository;
        this.fluxoFinanceiroRepository = fluxoFinanceiroRepository;
    }

    @Transactional(readOnly = true)
    public List<Venda> listarTodos() {
        return vendaRepository.findAll();
    }

    @Transactional
    public Venda salvar(Venda venda) {
        if (venda.getId() == null) {
            if (venda.getDataInicioVenda() == null) {
                venda.setDataInicioVenda(LocalDateTime.now());
            }
            if (venda.getNumeroComanda() == null) {
                LocalDate dataRef = venda.getDataInicioVenda().toLocalDate();
                LocalDateTime inicioDia = dataRef.atStartOfDay();
                LocalDateTime fimDia = dataRef.atTime(23, 59, 59, 999999999);
                Integer maxHoje = vendaRepository.findMaxNumeroComandaBetween(inicioDia, fimDia);
                venda.setNumeroComanda((maxHoje != null ? maxHoje : 0) + 1);
            }
        } else if (venda.getDataInicioVenda() == null) {
            venda.setDataInicioVenda(LocalDateTime.now());
        }

        if (venda.getCliente() != null && venda.getCliente().getId() != null) {
            Long clienteId = venda.getCliente().getId();
            Cliente cli = clienteId != null ? clienteRepository.findById(clienteId).orElse(null) : null;
            venda.setCliente(cli);
        } else {
            if (venda.getCliente() != null && venda.getCliente().getNome() != null && !venda.getCliente().getNome().trim().isEmpty()) {
                venda.setNomeCliente(venda.getCliente().getNome().trim());
            }
            venda.setCliente(null);
        }

        boolean isDelivery = "DELIVERY".equalsIgnoreCase(venda.getTipoAtendimento());
        if (isDelivery) {
            if (venda.getEndereco() != null && venda.getEndereco().getId() != null) {
                Long endId = venda.getEndereco().getId();
                Endereco end = endId != null ? enderecoRepository.findById(endId).orElse(null) : null;
                venda.setEndereco(end);
            }
            if (venda.getTaxaEntrega() == null) {
                venda.setTaxaEntrega(BigDecimal.ZERO);
            }
        } else {
            venda.setTaxaEntrega(BigDecimal.ZERO);
            venda.setEndereco(null);
        }

        Venda salva = vendaRepository.save(venda);

        if (salva.getMesa() != null && salva.getMesa().getId() != null) {
            Mesa mesa = salva.getMesa();
            mesa.setStatus(false);
            mesaRepository.save(mesa);
        }

        return salva;
    }

    @Transactional(readOnly = true)
    public Venda buscarPorId(Long id) {
        return vendaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Venda não encontrada com o ID: " + id));
    }

    @Transactional
    public Venda atualizar(Long id, Venda dadosNovos) {
        Venda existente = vendaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Venda não encontrada com o ID: " + id));

        Long mesaAntigaId = existente.getMesa() != null ? existente.getMesa().getId() : null;

        if (dadosNovos.getTipoAtendimento() != null) {
            existente.setTipoAtendimento(dadosNovos.getTipoAtendimento());

            if ("LOCAL".equalsIgnoreCase(dadosNovos.getTipoAtendimento())) {
                if (dadosNovos.getMesa() != null && dadosNovos.getMesa().getId() != null) {
                    Long novaMesaId = dadosNovos.getMesa().getId();
                    Mesa novaMesa = novaMesaId != null ? mesaRepository.findById(novaMesaId).orElse(null) : null;
                    existente.setMesa(novaMesa);
                    if (novaMesa != null) {
                        novaMesa.setStatus(false);
                        mesaRepository.save(novaMesa);
                    }
                }
            } else {
                existente.setMesa(null);
            }
        } else if (dadosNovos.getMesa() != null && dadosNovos.getMesa().getId() != null) {
            Long novaMesaId = dadosNovos.getMesa().getId();
            Mesa novaMesa = novaMesaId != null ? mesaRepository.findById(novaMesaId).orElse(null) : null;
            existente.setMesa(novaMesa);
            if (novaMesa != null) {
                novaMesa.setStatus(false);
                mesaRepository.save(novaMesa);
            }
        }

        String tipoFinal = existente.getTipoAtendimento();
        boolean isDelivery = "DELIVERY".equalsIgnoreCase(tipoFinal);

        if (isDelivery) {
            if (dadosNovos.getTaxaEntrega() != null) {
                existente.setTaxaEntrega(dadosNovos.getTaxaEntrega());
            }
            if (dadosNovos.getEndereco() != null && dadosNovos.getEndereco().getId() != null) {
                Long endId = dadosNovos.getEndereco().getId();
                Endereco end = endId != null ? enderecoRepository.findById(endId).orElse(null) : null;
                existente.setEndereco(end);
            } else if (dadosNovos.getEndereco() == null && dadosNovos.getTipoAtendimento() != null) {
                existente.setEndereco(null);
            }
        } else {
            existente.setTaxaEntrega(BigDecimal.ZERO);
            existente.setEndereco(null);
        }

        if (dadosNovos.getFormaPagamento() != null) {
            existente.setFormaPagamento(dadosNovos.getFormaPagamento());
        }
        if (dadosNovos.getDataVencimento() != null) {
            existente.setDataVencimento(dadosNovos.getDataVencimento());
        }
        if (dadosNovos.getStatusPagamento() != null) {
            existente.setStatusPagamento(dadosNovos.getStatusPagamento());
        }

        if (dadosNovos.getCliente() != null && dadosNovos.getCliente().getId() != null) {
            Long cliId = dadosNovos.getCliente().getId();
            Cliente cliCadastrado = cliId != null ? clienteRepository.findById(cliId).orElse(null) : null;
            existente.setCliente(cliCadastrado);
            existente.setNomeCliente(null);
        } else if (dadosNovos.getCliente() != null && dadosNovos.getCliente().getNome() != null && !dadosNovos.getCliente().getNome().trim().isEmpty()) {
            String nomeCli = dadosNovos.getCliente().getNome().trim();
            String telCli = dadosNovos.getCliente().getTelefone() != null ? dadosNovos.getCliente().getTelefone().trim() : null;
            Cliente novoCli = new Cliente();
            novoCli.setNome(nomeCli);
            novoCli.setTelefone(telCli);
            novoCli.setDataCadastro(LocalDateTime.now());
            novoCli.setStatus(true);
            Cliente salvoCli = clienteRepository.save(novoCli);
            existente.setCliente(salvoCli);
            existente.setNomeCliente(null);
        } else if (dadosNovos.getNomeCliente() != null && !dadosNovos.getNomeCliente().trim().isEmpty()) {
            existente.setCliente(null);
            existente.setNomeCliente(dadosNovos.getNomeCliente().trim());
        }

        if (dadosNovos.getValorPago() != null) {
            existente.setValorPago(dadosNovos.getValorPago());
        }
        if (dadosNovos.getDesconto() != null) {
            existente.setDesconto(dadosNovos.getDesconto());
        }

        BigDecimal totalItens = itemPedidoRepository.somarTotalPorVendaId(id);
        if (totalItens == null) totalItens = BigDecimal.ZERO;
        BigDecimal taxa = existente.getTaxaEntrega() != null ? existente.getTaxaEntrega() : BigDecimal.ZERO;
        BigDecimal valorPagoAtual = existente.getValorPago() != null ? existente.getValorPago() : BigDecimal.ZERO;
        BigDecimal descAtual = existente.getDesconto() != null ? existente.getDesconto() : BigDecimal.ZERO;
        BigDecimal totalConsumido = totalItens.add(taxa);
        BigDecimal saldo = totalConsumido.subtract(valorPagoAtual).subtract(descAtual);
        existente.setTotal(saldo.compareTo(BigDecimal.ZERO) > 0 ? saldo : BigDecimal.ZERO);

        if (existente.getNumeroComanda() == null) {
            LocalDate dataRef = (existente.getDataInicioVenda() != null ? existente.getDataInicioVenda() : LocalDateTime.now()).toLocalDate();
            LocalDateTime inicioDia = dataRef.atStartOfDay();
            LocalDateTime fimDia = dataRef.atTime(23, 59, 59, 999999999);
            Integer maxHoje = vendaRepository.findMaxNumeroComandaBetween(inicioDia, fimDia);
            existente.setNumeroComanda((maxHoje != null ? maxHoje : 0) + 1);
        }

        Venda salva = vendaRepository.save(existente);

        if (mesaAntigaId != null && (salva.getMesa() == null || !mesaAntigaId.equals(salva.getMesa().getId()))) {
            List<Venda> restantes = vendaRepository.findByMesaIdAndDataFimVendaIsNull(mesaAntigaId);
            if (restantes == null || restantes.isEmpty()) {
                Mesa mesaAntiga = mesaRepository.findById(mesaAntigaId).orElse(null);
                if (mesaAntiga != null) {
                    mesaAntiga.setStatus(true);
                    mesaRepository.save(mesaAntiga);
                }
            }
        }

        return salva;
    }

    @Transactional
    public void deletar(Long id, @Nullable String motivo) {
        Venda venda = vendaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Venda não encontrada com o ID: " + id));

        BigDecimal valorItens = itemPedidoRepository.somarTotalPorVendaId(id);
        if (valorItens == null) valorItens = BigDecimal.ZERO;
        BigDecimal taxa = venda.getTaxaEntrega() != null ? venda.getTaxaEntrega() : BigDecimal.ZERO;
        BigDecimal valorTotalMomento = valorItens.add(taxa);

        String nomeCliente = venda.getMesa() != null
                ? venda.getMesa().getNome()
                : (venda.getCliente() != null ? venda.getCliente().getNome() : (venda.getNomeCliente() != null ? venda.getNomeCliente() : "Cliente Retirada"));

        String motivoFinal = (motivo != null && !motivo.trim().isEmpty())
                ? motivo.trim()
                : "Exclusão de comanda solicitada pelo operador";

        ComandaExcluida log = new ComandaExcluida(
                id,
                LocalDateTime.now(),
                nomeCliente,
                valorTotalMomento,
                motivoFinal
        );
        comandaExcluidaRepository.save(log);

        Long mesaId = (venda.getMesa() != null) ? venda.getMesa().getId() : null;

        List<Pedido> pedidos = pedidoRepository.findByVendaId(id);
        if (pedidos != null && !pedidos.isEmpty()) {
            for (Pedido p : pedidos) {
                p.setStatusPedido("Cancelado");
                pedidoRepository.save(p);

                List<ItemPedido> itens = itemPedidoRepository.findByPedidoId(p.getId());
                if (itens != null && !itens.isEmpty()) {
                    for (ItemPedido item : itens) {
                        item.setStatusItem("Cancelado");
                        itemPedidoRepository.save(item);
                    }
                }
            }
        }

        venda.setStatus("CANCELADA");
        venda.setMotivoCancelamento(motivoFinal);
        venda.setDataFimVenda(LocalDateTime.now());
        vendaRepository.save(venda);

        if (mesaId != null) {
            List<Venda> restantes = vendaRepository.findByMesaIdAndDataFimVendaIsNull(mesaId);
            if (restantes == null || restantes.isEmpty()) {
                Mesa mesa = mesaRepository.findById(mesaId).orElse(null);
                if (mesa != null) {
                    mesa.setStatus(true);
                    mesaRepository.save(mesa);
                }
            }
        }
    }

    @Transactional(readOnly = true)
    public List<Venda> buscarVendasEmAberto() {
        return vendaRepository.findByDataFimVendaIsNull();
    }

    @Transactional(readOnly = true)
    public List<Venda> buscarVendasFechadas() {
        List<Venda> fechadas = new ArrayList<>(vendaRepository.findByDataFimVendaIsNotNull());
        List<Venda> parciais = vendaRepository.findByValorPagoGreaterThanAndDataFimVendaIsNull(BigDecimal.ZERO);
        if (parciais != null) {
            fechadas.addAll(parciais);
        }
        return fechadas;
    }

    @Transactional
    public Venda fecharVenda(Long id) {
        Venda venda = vendaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Venda não encontrada com o ID: " + id));

        List<Pedido> pedidosDaVenda = pedidoRepository.findByVendaId(id);
        if (pedidosDaVenda != null && !pedidosDaVenda.isEmpty()) {
            for (Pedido p : pedidosDaVenda) {
                if (!"Cancelado".equalsIgnoreCase(p.getStatusPedido())) {
                    p.setStatusPedido("Concluído");
                    if (p.getDataInicioPreparo() == null) {
                        p.setDataInicioPreparo(p.getDataHora() != null ? p.getDataHora() : LocalDateTime.now());
                    }
                    if (p.getDataFimPreparo() == null) {
                        p.setDataFimPreparo(LocalDateTime.now());
                    }
                    pedidoRepository.save(p);
                }
            }
        }

        BigDecimal valorItens = itemPedidoRepository.somarTotalPorVendaId(id);
        if (valorItens == null) valorItens = BigDecimal.ZERO;
        BigDecimal taxa = venda.getTaxaEntrega() != null ? venda.getTaxaEntrega() : BigDecimal.ZERO;
        BigDecimal valorTotal = valorItens.add(taxa);
        BigDecimal desconto = venda.getDesconto() != null ? venda.getDesconto() : BigDecimal.ZERO;

        boolean isAPrazo = "A_PRAZO".equalsIgnoreCase(venda.getFormaPagamento());

        venda.setStatus("ENCERRADA");
        venda.setDataFimVenda(LocalDateTime.now());

        if (isAPrazo) {
            BigDecimal valorPago = venda.getValorPago() != null ? venda.getValorPago() : BigDecimal.ZERO;
            BigDecimal saldoRestante = valorTotal.subtract(valorPago).subtract(desconto);
            if (saldoRestante.compareTo(BigDecimal.ZERO) < 0) saldoRestante = BigDecimal.ZERO;
            venda.setTotal(saldoRestante);
            venda.setStatusPagamento(saldoRestante.compareTo(BigDecimal.ZERO) == 0 ? "PAGO" : (valorPago.compareTo(BigDecimal.ZERO) > 0 ? "PARCIAL" : "PENDENTE"));
        } else {
            venda.setTotal(BigDecimal.ZERO);
            if (venda.getValorPago() == null || venda.getValorPago().compareTo(BigDecimal.ZERO) <= 0) {
                BigDecimal valorFinal = valorTotal.subtract(desconto);
                venda.setValorPago(valorFinal.compareTo(BigDecimal.ZERO) > 0 ? valorFinal : BigDecimal.ZERO);
            }
            venda.setStatusPagamento("PAGO");
        }

        Venda salva = vendaRepository.save(venda);

        if (salva.getMesa() != null && salva.getMesa().getId() != null) {
            Long mesaId = salva.getMesa().getId();
            List<Venda> comandasRestantes = vendaRepository.findByMesaIdAndDataFimVendaIsNull(mesaId);
            if (comandasRestantes.isEmpty()) {
                Mesa mesa = salva.getMesa();
                mesa.setStatus(true);
                mesaRepository.save(mesa);
            }
        }

        return salva;
    }

    @Transactional
    public Venda receberPagamentoAPrazo(Long vendaId, BigDecimal valorRecebido, String formaPagamentoReal, BigDecimal desconto) {
        Venda venda = vendaRepository.findById(vendaId)
                .orElseThrow(() -> new EntityNotFoundException("Venda não encontrada com o ID: " + vendaId));

        if (valorRecebido == null || valorRecebido.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Valor recebido deve ser maior que zero.");
        }

        BigDecimal desc = desconto != null && desconto.compareTo(BigDecimal.ZERO) > 0 ? desconto : BigDecimal.ZERO;
        BigDecimal valorItens = itemPedidoRepository.somarTotalPorVendaId(vendaId);
        if (valorItens == null) valorItens = BigDecimal.ZERO;
        BigDecimal taxa = venda.getTaxaEntrega() != null ? venda.getTaxaEntrega() : BigDecimal.ZERO;
        BigDecimal totalBruto = valorItens.add(taxa);

        BigDecimal valorPagoAnterior = venda.getValorPago() != null ? venda.getValorPago() : BigDecimal.ZERO;
        BigDecimal descontoAnterior = venda.getDesconto() != null ? venda.getDesconto() : BigDecimal.ZERO;
        BigDecimal saldoAnterior = (venda.getTotal() != null && venda.getTotal().compareTo(BigDecimal.ZERO) > 0)
                ? venda.getTotal()
                : totalBruto.subtract(valorPagoAnterior).subtract(descontoAnterior);
        if (saldoAnterior.compareTo(BigDecimal.ZERO) < 0) saldoAnterior = BigDecimal.ZERO;

        BigDecimal novoValorPago = valorPagoAnterior.add(valorRecebido);
        BigDecimal novoDescontoTotal = descontoAnterior.add(desc);
        venda.setValorPago(novoValorPago);
        venda.setDesconto(novoDescontoTotal);

        BigDecimal novoSaldo = saldoAnterior.subtract(valorRecebido).subtract(desc);
        if (novoSaldo.compareTo(BigDecimal.ZERO) <= 0) {
            novoSaldo = BigDecimal.ZERO;
            venda.setStatusPagamento("PAGO");
            venda.setTotal(BigDecimal.ZERO);
        } else {
            venda.setStatusPagamento("PARCIAL");
            venda.setTotal(novoSaldo);
        }

        Venda salva = vendaRepository.save(venda);

        // Registrar histórico em PagamentoComanda
        PagamentoComanda pc = new PagamentoComanda();
        pc.setVenda(salva);
        pc.setValorPago(valorRecebido);
        pc.setFormaPagamento(formaPagamentoReal != null ? formaPagamentoReal : "Dinheiro");
        pc.setTipo(novoSaldo.compareTo(BigDecimal.ZERO) == 0 ? "QUITACAO_A_PRAZO" : "DEBITO_PARCIAL");
        pc.setTotalAntes(saldoAnterior);
        pc.setSaldoRestante(novoSaldo);
        pc.setDesconto(desc);
        pc.setDataPagamento(LocalDateTime.now());
        pagamentoComandaRepository.save(pc);

        // Registrar entrada de Caixa em FluxoFinanceiro
        String clienteNome = salva.getCliente() != null ? salva.getCliente().getNome() : (salva.getNomeCliente() != null ? salva.getNomeCliente() : "Cliente");
        FluxoFinanceiro ff = new FluxoFinanceiro();
        ff.setNome("Recebimento A Prazo - " + clienteNome + " (" + (formaPagamentoReal != null ? formaPagamentoReal : "Dinheiro") + ")");
        ff.setDescricao("Quitação de Comanda #" + salva.getId() + " (" + (novoSaldo.compareTo(BigDecimal.ZERO) == 0 ? "Total" : "Parcial") + ")");
        ff.setTransacao("Entrada");
        ff.setFluxo(valorRecebido);
        ff.setVenda(salva);
        ff.setDataTransacao(LocalDateTime.now());
        fluxoFinanceiroRepository.save(ff);

        return salva;
    }

    @Transactional(readOnly = true)
    public List<Venda> buscarVendasAPrazoPendentes() {
        List<Venda> vendas = vendaRepository.findByStatusPagamentoIn(List.of("PENDENTE", "PARCIAL"));
        return vendas != null ? vendas : new ArrayList<>();
    }

    @Transactional(readOnly = true)
    public List<Venda> buscarVendasAPrazoPorCliente(Long clienteId) {
        List<Venda> vendas = vendaRepository.findByClienteIdAndStatusPagamentoIn(clienteId, List.of("PENDENTE", "PARCIAL"));
        return vendas != null ? vendas : new ArrayList<>();
    }

    @Transactional(readOnly = true)
    public List<Mesa> obterMesasDisponiveis() {
        return mesaRepository.findByStatus(true);
    }
}