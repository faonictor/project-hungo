import React, { useState, useEffect } from "react";
import api from "../../services/axiosConfig";
import {Button, Card, CardBody, CardHeader, Typography} from "@material-tailwind/react";
import { ArrowPathIcon, TrashIcon } from "@heroicons/react/24/outline";
import SelectField from "@/widgets/forms/select-field.jsx";

const PedidoForm = () => {
    const [vendas, setVendas] = useState([]);
    const [pedidos, setPedidos] = useState([]);
    const [selectedVenda, setSelectedVenda] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mesas, setMesas] = useState([]);
    const [mesaId, setMesaId] = useState("");

    useEffect(() => {
        const fetchMesas = async () => {
            try {
                const response = await api.get("/mesa");
                setMesas(response.data);
            } catch (error) {
                console.error("Erro ao carregar mesas", error);
            }
        };

        fetchMesas();
    }, []);

    const fetchVendas = async () => {
        try {
            setLoading(true);
            const response = await api.get("/venda/emAberto");
            setVendas(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Erro ao carregar vendas em aberto", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVendas();
    }, []);

    const handleVendaClick = (vendaId) => {
        if (selectedVenda === vendaId) {
            setSelectedVenda(null);
            setPedidos([]);
        } else {
            setSelectedVenda(vendaId);
            fetchPedidosByVenda(vendaId);
        }
    };

    const fetchPedidosByVenda = async (vendaId) => {
        try {
            setLoading(true);
            const response = await api.get(`/pedido/venda/${vendaId}`);
            setPedidos(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Erro ao carregar pedidos", error);
            setLoading(false);
        }
    };

    const handleCreateVenda = async () => {
        if (!mesaId) {
            alert("Selecione uma mesa!");
            return;
        }

        try {
            setLoading(true);

            // Encontrar a mesa selecionada para obter o nome
            const mesaSelecionada = mesas.find(mesa => mesa.id === parseInt(mesaId));

            // Criar a data atual no formato ISO
            const dataAtual = new Date().toISOString();

            const vendaData = {
                mesa: {
                    id: parseInt(mesaId),
                    nome: mesaSelecionada.nome
                },
                dataInicioVenda: dataAtual,
                dataFimVenda: null,
                total: 0.0
            };

            await api.post("/venda", vendaData);
            await fetchVendas();

            setMesaId("");
            setLoading(false);
        } catch (error) {
            console.error("Erro ao criar venda", error);
            setLoading(false);
        }
    };

    const handleDeleteVenda = async (vendaId, event) => {
        // Previne a propagação do clique para não acionar o handleVendaClick
        event.stopPropagation();

        if (window.confirm("Tem certeza que deseja excluir esta venda?")) {
            try {
                setLoading(true);
                await api.delete(`/venda/${vendaId}`);
                await fetchVendas();
                if (selectedVenda === vendaId) {
                    setSelectedVenda(null);
                    setPedidos([]);
                }
                setLoading(false);
            } catch (error) {
                console.error("Erro ao excluir venda", error);
                setLoading(false);
            }
        }
    };

    return (
        <Card className="bg-white w-full h-full flex-1 min-h-0 rounded-xl border border-blue-gray-100 lg:flex">
            <CardHeader variant="gradient" color="gray" className="my-4 p-4">
                <Typography variant="h6" color="white">
                    Vendas em Aberto
                </Typography>
            </CardHeader>
            <CardBody className="px-4 pt-0 pb-6">
                <div className="max-w-screen-lg lg:w-full mx-auto">
                    <div>
                        <div>
                            <SelectField
                                label="Seleciona a Mesa"
                                value={mesaId}
                                onChange={setMesaId}
                                options={mesas.map((mesa) => ({
                                    value: mesa.id,
                                    label: mesa.nome,
                                }))}
                                placeholder="Mesas Disponíveis"
                            />
                        </div>

                        <div className="flex w-full justify-center">
                            <Button
                                onClick={handleCreateVenda}
                                className={`mt-6 w-32 flex items-center justify-center mb-4`}
                                disabled={loading}
                            >
                                {loading ? <ArrowPathIcon className="h-4 w-4 text-white animate-spin"/> : "Nova Venda"}
                            </Button>
                        </div>
                    </div>


                    <div className="mb-1 grid grid-cols-1 sm:grid-cols-12 gap-4">
                        {vendas.map((venda) => {
                            const dataInicio = venda.dataInicioVenda ?
                                new Date(venda.dataInicioVenda).toLocaleString() :
                                "Data não disponível";
                            return (
                                <div
                                    key={venda.id}
                                    onClick={() => handleVendaClick(venda.id)}
                                    className="flex col-span-1 lg:col-span-4 justify-center items-center p-4 space-x-4 border rounded-lg cursor-pointer hover:bg-blue-100 transition"
                                >
                                    <div className="flex flex-col">
                                        <div className="font-medium">Venda {venda.id}</div>
                                        <div>Mesa: {venda.mesa?.nome || "Indefinido"}</div>
                                        <div>Data Início: {dataInicio}</div>
                                    </div>

                                    <Button
                                        color="red"
                                        className="p-2"
                                        onClick={(e) => handleDeleteVenda(venda.id, e)}
                                    >
                                        <TrashIcon className="h-4 w-4"/>
                                    </Button>
                                </div>
                            );
                        })}
                    </div>

                    {selectedVenda && pedidos.length > 0 && (
                        <div className="mt-6">
                            <h2 className="text-lg font-semibold">Pedidos da Venda #{selectedVenda}</h2>
                            <ul className="space-y-2">
                                {pedidos.map((pedido) => {
                                    const dataCriacao = new Date(pedido.dataCriacao).toLocaleString();
                                    return (
                                        <li key={pedido.id} className="p-2 border-b border-gray-200">
                                            <div><strong>Pedido #{pedido.id}</strong></div>
                                            <div>Tipo: {pedido.tipoPedido}</div>
                                            <div>Status: {pedido.statusPedido}</div>
                                            <div>Cliente: {pedido.cliente ? pedido.cliente.nome : "Cliente não informado"}</div>
                                            <div>Data: {dataCriacao}</div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}

                    {selectedVenda && pedidos.length === 0 && !loading && (
                        <div className="mt-4 text-gray-500">Não há pedidos para esta venda.</div>
                    )}

                    {loading && <div className="mt-4">Carregando...</div>}
                </div>
            </CardBody>
        </Card>
    );
};

export default PedidoForm;