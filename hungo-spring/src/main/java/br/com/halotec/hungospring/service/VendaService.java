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
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

    @PostConstruct
    @Transactional
    public void inicializarNumerosComandaLegadas() {
        try {
            List<Venda> semNumero = vendaRepository.findAll().stream()
                    .filter(v -> v.getNumeroComanda() == null)
                    .toList();
            if (semNumero.isEmpty()) return;

            Map<LocalDate, List<Venda>> porDia = semNumero.stream()
                    .collect(Collectors.groupingBy(v -> v.getDataInicioVenda() != null ? v.getDataInicioVenda().toLocalDate() : LocalDate.now()));

            for (Map.Entry<LocalDate, List<Venda>> entry : porDia.entrySet()) {
                LocalDateTime inicioDia = entry.getKey().atStartOfDay();
                LocalDateTime fimDia = entry.getKey().atTime(23, 59, 59, 999999999);
                Integer maxExistente = vendaRepository.findMaxNumeroComandaBetween(inicioDia, fimDia);
                int seq = (maxExistente != null ? maxExistente : 0) + 1;
                List<Venda> lista = new ArrayList<>(entry.getValue());
                lista.sort(Comparator.comparing(v -> v.getId() != null ? v.getId() : 0L));
                for (Venda v : lista) {
                    v.setNumeroComanda(seq++);
                    vendaRepository.save(v);
                }
            }
        } catch (Exception e) {
            // Ignora se tabela estiver vazia na inicialização
        }
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
                venda.setTaxaEntrega(0.0f);
            }
        } else {
            venda.setTaxaEntrega(0.0f);
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

            if ("LOCAL".equalsIgnoreCase(dadosNovos.getTipoAtendimento()) || "SALAO".equalsIgnoreCase(dadosNovos.getTipoAtendimento())) {
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
            existente.setTaxaEntrega(0.0f);
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

        Float totalItens = itemPedidoRepository.somarTotalPorVendaId(id);
        float taxa = existente.getTaxaEntrega() != null ? existente.getTaxaEntrega() : 0.0f;
        float valorPagoAtual = existente.getValorPago() != null ? existente.getValorPago() : 0.0f;
        float descAtual = existente.getDesconto() != null ? existente.getDesconto() : 0.0f;
        float totalConsumido = (totalItens != null ? totalItens : 0.0f) + taxa;
        existente.setTotal(Math.max(0.0f, totalConsumido - valorPagoAtual - descAtual));

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

        Float valorItens = itemPedidoRepository.somarTotalPorVendaId(id);
        float taxa = venda.getTaxaEntrega() != null ? venda.getTaxaEntrega() : 0.0f;
        float valorTotalMomento = (valorItens != null ? valorItens : 0.0f) + taxa;

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

    private void enriquecerTotalBruto(Venda venda) {
        if (venda == null || venda.getId() == null) return;
        Float valorItens = itemPedidoRepository.somarTotalPorVendaId(venda.getId());
        float taxa = venda.getTaxaEntrega() != null ? venda.getTaxaEntrega() : 0.0f;
        float totalBruto = (valorItens != null ? valorItens : 0.0f) + taxa;
        venda.setTotalBruto(totalBruto);
    }

    @Transactional(readOnly = true)
    public List<Venda> buscarVendasEmAberto() {
        List<Venda> abertas = vendaRepository.findByDataFimVendaIsNull();
        if (abertas != null) {
            abertas.forEach(this::enriquecerTotalBruto);
        }
        return abertas;
    }

    @Transactional(readOnly = true)
    public List<Venda> buscarVendasFechadas() {
        List<Venda> fechadas = new ArrayList<>(vendaRepository.findByDataFimVendaIsNotNull());
        List<Venda> parciais = vendaRepository.findByValorPagoGreaterThanAndDataFimVendaIsNull(0.0f);
        if (parciais != null) {
            fechadas.addAll(parciais);
        }
        fechadas.forEach(this::enriquecerTotalBruto);
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

        Float valorItens = itemPedidoRepository.somarTotalPorVendaId(id);
        float taxa = venda.getTaxaEntrega() != null ? venda.getTaxaEntrega() : 0.0f;
        float valorTotal = (valorItens != null ? valorItens : 0.0f) + taxa;
        float desconto = venda.getDesconto() != null ? venda.getDesconto() : 0.0f;

        boolean isAPrazo = "A_PRAZO".equalsIgnoreCase(venda.getFormaPagamento());

        venda.setStatus("ENCERRADA");
        venda.setDataFimVenda(LocalDateTime.now());

        if (isAPrazo) {
            float valorPago = venda.getValorPago() != null ? venda.getValorPago() : 0.0f;
            float saldoRestante = Math.max(0.0f, valorTotal - valorPago - desconto);
            venda.setTotal(saldoRestante);
            venda.setStatusPagamento(saldoRestante <= 0.001f ? "PAGO" : (valorPago > 0.0f ? "PARCIAL" : "PENDENTE"));
        } else {
            venda.setTotal(0.0f);
            if (venda.getValorPago() == null || venda.getValorPago() <= 0.0f) {
                venda.setValorPago(Math.max(0.0f, valorTotal - desconto));
            }
            venda.setStatusPagamento("PAGO");
        }

        Venda salva = vendaRepository.save(venda);
        enriquecerTotalBruto(salva);

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
    public Venda receberPagamentoAPrazo(Long vendaId, Float valorRecebido, String formaPagamentoReal, Float desconto) {
        Venda venda = vendaRepository.findById(vendaId)
                .orElseThrow(() -> new EntityNotFoundException("Venda não encontrada com o ID: " + vendaId));

        if (valorRecebido == null || valorRecebido <= 0.0f) {
            throw new IllegalArgumentException("Valor recebido deve ser maior que zero.");
        }

        float desc = desconto != null ? Math.max(0.0f, desconto) : 0.0f;
        Float valorItens = itemPedidoRepository.somarTotalPorVendaId(vendaId);
        float taxa = venda.getTaxaEntrega() != null ? venda.getTaxaEntrega() : 0.0f;
        float totalBruto = (valorItens != null ? valorItens : 0.0f) + taxa;

        float valorPagoAnterior = venda.getValorPago() != null ? venda.getValorPago() : 0.0f;
        float descontoAnterior = venda.getDesconto() != null ? venda.getDesconto() : 0.0f;
        float saldoAnterior = venda.getTotal() != null && venda.getTotal() > 0 ? venda.getTotal() : Math.max(0.0f, totalBruto - valorPagoAnterior - descontoAnterior);

        float novoValorPago = valorPagoAnterior + valorRecebido;
        float novoDescontoTotal = descontoAnterior + desc;
        venda.setValorPago(novoValorPago);
        venda.setDesconto(novoDescontoTotal);

        float novoSaldo = Math.max(0.0f, saldoAnterior - valorRecebido - desc);
        venda.setTotal(novoSaldo);

        if (novoSaldo <= 0.001f) {
            venda.setStatusPagamento("PAGO");
            venda.setTotal(0.0f);
        } else {
            venda.setStatusPagamento("PARCIAL");
        }

        Venda salva = vendaRepository.save(venda);
        enriquecerTotalBruto(salva);

        // Registrar histórico em PagamentoComanda
        PagamentoComanda pc = new PagamentoComanda();
        pc.setVenda(salva);
        pc.setValorPago(valorRecebido);
        pc.setFormaPagamento(formaPagamentoReal != null ? formaPagamentoReal : "Dinheiro");
        pc.setTipo(novoSaldo <= 0.001f ? "QUITACAO_A_PRAZO" : "DEBITO_PARCIAL");
        pc.setTotalAntes(saldoAnterior);
        pc.setSaldoRestante(novoSaldo);
        pc.setDesconto(desc);
        pc.setDataPagamento(LocalDateTime.now());
        pagamentoComandaRepository.save(pc);

        // Registrar entrada de Caixa em FluxoFinanceiro
        String clienteNome = salva.getCliente() != null ? salva.getCliente().getNome() : (salva.getNomeCliente() != null ? salva.getNomeCliente() : "Cliente");
        FluxoFinanceiro ff = new FluxoFinanceiro();
        ff.setNome("Recebimento A Prazo - " + clienteNome + " (" + (formaPagamentoReal != null ? formaPagamentoReal : "Dinheiro") + ")");
        ff.setDescricao("Quitação de Comanda #" + salva.getId() + " (" + (novoSaldo <= 0.001f ? "Total" : "Parcial") + ")");
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
        if (vendas != null) {
            vendas.forEach(this::enriquecerTotalBruto);
        }
        return vendas != null ? vendas : new ArrayList<>();
    }

    @Transactional(readOnly = true)
    public List<Venda> buscarVendasAPrazoPorCliente(Long clienteId) {
        List<Venda> vendas = vendaRepository.findByClienteIdAndStatusPagamentoIn(clienteId, List.of("PENDENTE", "PARCIAL"));
        if (vendas != null) {
            vendas.forEach(this::enriquecerTotalBruto);
        }
        return vendas != null ? vendas : new ArrayList<>();
    }

    @Transactional(readOnly = true)
    public List<Mesa> obterMesasDisponiveis() {
        return mesaRepository.findByStatus(true);
    }
}