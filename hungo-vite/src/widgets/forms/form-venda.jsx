import React, {useState, useEffect} from "react";
import api from "../../services/axiosConfig";
import {Button, Card, CardBody, CardHeader, Typography} from "@material-tailwind/react";
import {ArrowPathIcon, TrashIcon, CheckCircleIcon} from "@heroicons/react/24/outline";
import SelectField from "@/widgets/forms/select-field.jsx";
import AlertMessage from "@/widgets/alert-message.jsx";
import {format} from "date-fns";
import {ptBR} from "date-fns/locale";
import {
    PlusSmallIcon,
    PlusCircleIcon,
    SquaresPlusIcon,
    ShoppingBagIcon,
    ShoppingCartIcon, LockOpenIcon
} from "@heroicons/react/24/solid";
import {useNavigate} from "react-router-dom";
import InputField from "@/widgets/forms/input-field.jsx";

const VendaForm = () => {
    const [vendas, setVendas] = useState([]);
    const [pedidos, setPedidos] = useState([]);
    const [selectedVenda, setSelectedVenda] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mesas, setMesas] = useState([]);
    const [mesaId, setMesaId] = useState("");
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertColor, setAlertColor] = useState("green");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEndModal, setShowEndModal] = useState(false);
    const [vendaToDelete, setVendaToDelete] = useState(null);
    const [vendaToEnd, setVendaToEnd] = useState(null);
    const [showMesaModal, setShowMesaModal] = useState(false);
    const [newMesaNome, setNewMesaNome] = useState("");
    const [vendaFinalizada, setVendaFinalizada] = useState(null);
    const [showVendaFinalizadaModal, setShowVendaFinalizadaModal] = useState(false);
    const navigate = useNavigate();

    // useEffect(() => {
    //     const fetchMesas = async () => {
    //         try {
    //             const response = await api.get("/mesa");
    //             // Filtra as mesas que não estão ocupadas (status = false)
    //             const mesasDisponiveis = response.data.filter(mesa => mesa.status === true);
    //             setMesas(mesasDisponiveis);
    //         } catch (error) {
    //             setAlertMessage("Erro ao carregar mesas");
    //             setAlertColor("red");
    //         }
    //     };
    //     fetchMesas();
    // }, []);

    // Fetch mesas (centralizado)
    // Fetch mesas (centralizado)
    const fetchMesas = async () => {
        try {
            const response = await api.get("/mesa");
            const mesasDisponiveis = response.data.filter((mesa) => mesa.status === true);
            setMesas(mesasDisponiveis);
        } catch (error) {
            setAlertMessage("Erro ao carregar mesas");
            setAlertColor("red");
        }
    };

    useEffect(() => {
        fetchMesas();
        fetchVendas();
    }, []);


    const fetchVendas = async () => {
        try {
            setLoading(true);
            const response = await api.get("/venda/emAberto");
            setVendas(response.data);
        } catch (error) {
            setAlertMessage("Erro ao carregar vendas em aberto");
            setAlertColor("red");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVendas();
    }, []);

    const fetchPedidosByVenda = async (vendaId) => {
        try {
            setLoading(true);
            const response = await api.get(`/pedido/venda/${vendaId}`);
            setPedidos(response.data);
        } catch (error) {
            setAlertMessage("Erro ao carregar pedidos");
            setAlertColor("red");
        } finally {
            setLoading(false);
        }
    };

    const handleVendaClick = (vendaId) => {
        if (selectedVenda === vendaId) {
            return;
        } else {
            setSelectedVenda(vendaId);
            fetchPedidosByVenda(vendaId);
        }
    };

    const handleAddPedido = (vendaId) => {
        if (!vendaId) {
            setAlertMessage("Por favor, selecione uma venda!");
            setAlertColor("red");
            return;
        }
        navigate(`dashboard/pedido/novo/${vendaId}`);
    };

    const handleCreateMesa = async () => {
        if (!newMesaNome.trim()) {
            setAlertMessage("Por favor, insira um nome para a mesa!");
            setAlertColor("red");
            return;
        }

        try {
            setLoading(true);
            const response = await api.post("/mesa", {nome: newMesaNome, status: true}); // Status 'true' para mesa livre
            setMesas([...mesas, response.data]);
            setAlertMessage("Mesa criada com sucesso!");
            setAlertColor("green");
            setNewMesaNome("");
            setShowMesaModal(false);
        } catch (error) {
            setAlertMessage("Erro ao criar mesa");
            setAlertColor("red");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateVenda = async () => {
        if (!mesaId) {
            setAlertMessage("Por favor, selecione uma mesa!");
            setAlertColor("red");
            return;
        }

        try {
            setLoading(true);
            const mesaSelecionada = mesas.find((mesa) => mesa.id === parseInt(mesaId));
            const dataAtual = new Date().toISOString();

            // Atualizar o status da mesa
            await api.put(`/mesa/${mesaId}`, {
                status: false,
                nome: mesaSelecionada.nome,
            });

            // Criar nova venda
            const vendaData = {
                mesa: { id: parseInt(mesaId), nome: mesaSelecionada.nome },
                dataInicioVenda: dataAtual,
                dataFimVenda: null,
                total: 0.0,
            };

            await api.post("/venda", vendaData);
            await fetchVendas();
            await fetchMesas(); // Atualizar mesas
            setMesaId("");
            setAlertMessage("Venda criada com sucesso!");
            setAlertColor("green");
        } catch (error) {
            setAlertMessage("Erro ao criar venda");
            setAlertColor("red");
        } finally {
            setLoading(false);
        }
    };

    // const handleCreateVenda = async () => {
    //     if (!mesaId) {
    //         setAlertMessage("Por favor, selecione uma mesa!");
    //         setAlertColor("red");
    //         return;
    //     }
    //
    //     try {
    //         setLoading(true);
    //         const mesaSelecionada = mesas.find((mesa) => mesa.id === parseInt(mesaId));
    //         const dataAtual = new Date().toISOString();
    //
    //         // Atualizando o status da mesa para 'false' (ocupada), preservando o nome da mesa
    //         await api.put(`/mesa/${mesaId}`, {
    //             status: false,
    //             nome: mesaSelecionada.nome, // Garantindo que o nome não seja perdido
    //         });
    //
    //         const vendaData = {
    //             mesa: {id: parseInt(mesaId), nome: mesaSelecionada.nome},
    //             dataInicioVenda: dataAtual,
    //             dataFimVenda: null,
    //             total: 0.0,
    //         };
    //
    //         await api.post("/venda", vendaData);
    //         fetchVendas();
    //         setMesaId("");
    //         setAlertMessage("Venda criada com sucesso!");
    //         setAlertColor("green");
    //     } catch (error) {
    //         setAlertMessage("Erro ao criar venda");
    //         setAlertColor("red");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const handleDeleteVenda = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/venda/${vendaToDelete}`);
            const venda = response.data;

            await api.delete(`/venda/${vendaToDelete}`);

            // Liberar a mesa
            await api.put(`/mesa/${venda.mesa.id}`, {
                status: true,
                nome: venda.mesa.nome,
            });

            await fetchMesas(); // Atualizar mesas
            await fetchVendas(); // Atualizar vendas

            if (selectedVenda === vendaToDelete) {
                setSelectedVenda(null);
                setPedidos([]);
            }

            setAlertMessage("Venda excluída com sucesso!");
            setAlertColor("green");
        } catch (error) {
            setAlertMessage("Não é possível excluir vendas com pedidos");
            setAlertColor("red");
        } finally {
            setLoading(false);
            setShowDeleteModal(false);
            setVendaToDelete(null);
        }
    };

    // const handleDeleteVenda = async () => {
    //     try {
    //         setLoading(true);
    //
    //         // Buscar os dados da venda que será deletada
    //         const response = await api.get(`/venda/${vendaToDelete}`);
    //         const venda = response.data;
    //
    //         // Deletar a venda
    //         await api.delete(`/venda/${vendaToDelete}`);
    //
    //         // Atualizar o status da mesa para 'livre'
    //         const mesaId = venda.mesa.id;
    //         const mesaNome = venda.mesa.nome;
    //         const mesaResponse = await api.put(`/mesa/${mesaId}`, { status: true, nome: mesaNome });
    //
    //         if (mesaResponse.status !== 200) {
    //             throw new Error("Erro ao atualizar o status da mesa");
    //         }
    //
    //         // Recarregar as mesas disponíveis
    //         const responseMesas = await api.get("/mesa");
    //         const mesasDisponiveis = responseMesas.data.filter((mesa) => mesa.status === true);
    //         setMesas(mesasDisponiveis);
    //
    //         // Atualizar as vendas no front-end
    //         fetchVendas();
    //
    //         // Resetar seleção de venda e pedidos se necessário
    //         if (selectedVenda === vendaToDelete) {
    //             setSelectedVenda(null);
    //             setPedidos([]);
    //         }
    //
    //         // Exibir mensagem de sucesso
    //         setAlertMessage("Venda excluída com sucesso!");
    //         setAlertColor("green");
    //     } catch (error) {
    //         setAlertMessage("Não é possível excluir vendas com pedidos");
    //         setAlertColor("red");
    //     } finally {
    //         setLoading(false);
    //         setShowDeleteModal(false);
    //         setVendaToDelete(null);
    //     }
    // };

    const handleEndVenda = async () => {
        try {
            setLoading(true);
            const dataAtual = new Date().toISOString();

            await api.put(`/venda/${vendaToEnd}/fechar`, { dataFimVenda: dataAtual });

            const response = await api.get(`/venda/${vendaToEnd}`);
            const vendaFechada = response.data;

            await api.put(`/mesa/${vendaFechada.mesa.id}`, {
                status: true,
                nome: vendaFechada.mesa.nome,
            });

            await fetchMesas(); // Atualizar mesas
            await fetchVendas(); // Atualizar vendas
            setPedidos([]);

            setVendaFinalizada({
                valor: vendaFechada.total,
                data: vendaFechada.dataFimVenda,
                mesa: vendaFechada.mesa.nome,
            });

            setAlertMessage("Venda encerrada com sucesso!");
            setAlertColor("green");
            setShowEndModal(false);
            setShowVendaFinalizadaModal(true);
        } catch (error) {
            setAlertMessage(error.message || "Erro ao encerrar venda");
            setAlertColor("red");
        } finally {
            setLoading(false);
            setVendaToEnd(null);
        }
    };


    // const handleEndVenda = async () => {
    //     try {
    //         setLoading(true);
    //         const dataAtual = new Date().toISOString();
    //
    //         // Fechar a venda
    //         await api.put(`/venda/${vendaToEnd}/fechar`, {
    //             dataFimVenda: dataAtual,
    //         });
    //
    //         // Buscar os dados da venda finalizada
    //         const response = await api.get(`/venda/${vendaToEnd}`);
    //         const vendaFechada = response.data;
    //
    //         // Atualizar o estado com as informações da venda finalizada
    //         setVendaFinalizada({
    //             valor: vendaFechada.total,
    //             data: vendaFechada.dataFimVenda,
    //             mesa: vendaFechada.mesa.nome,
    //         });
    //
    //         // Atualizar o status da mesa para 'livre'
    //         const mesaId = vendaFechada.mesa.id;
    //         const mesaNome = vendaFechada.mesa.nome;
    //         const mesaResponse = await api.put(`/mesa/${mesaId}`, { status: true, nome: mesaNome });
    //
    //         if (mesaResponse.status !== 200) {
    //             throw new Error("Erro ao atualizar o status da mesa");
    //         }
    //
    //         // Recarregar as mesas disponíveis (status: true)
    //         const responseMesas = await api.get("/mesa");
    //         const mesasDisponiveis = responseMesas.data.filter((mesa) => mesa.status === true);
    //         setMesas(mesasDisponiveis);
    //
    //         // Atualizar as vendas no front-end
    //         await fetchVendas();
    //
    //         // Resetar os pedidos (como lista vazia)
    //         setPedidos([]);
    //
    //         // Exibir mensagem de sucesso
    //         setAlertMessage("Venda encerrada com sucesso!");
    //         setAlertColor("green");
    //
    //         // Fechar o modal de cancelamento e abrir o modal com os dados da venda
    //         setShowEndModal(false); // Fechar o modal de cancelamento
    //         setShowVendaFinalizadaModal(true); // Exibir o modal com os dados da venda
    //
    //     } catch (error) {
    //         setAlertMessage(error.message || "Erro ao encerrar venda");
    //         setAlertColor("red");
    //     } finally {
    //         setLoading(false);
    //         setVendaToEnd(null); // Limpar a venda que foi encerrada
    //     }
    // };

    const openDeleteModal = (vendaId, event) => {
        event.stopPropagation();
        setVendaToDelete(vendaId);
        setShowDeleteModal(true);
    };

    const openEndModal = (vendaId, event) => {
        event.stopPropagation();

        if (pedidos.length === 0) {
            setAlertMessage("Não é possível encerrar a venda sem pedidos!");
            setAlertColor("red");
            return;
        }

        const pedidosNaoPagos = pedidos.filter(pedido => pedido.statusPedido !== "Pago");

        if (pedidosNaoPagos.length > 0) {
            setAlertMessage("Não é possível encerrar a venda enquanto houver pedidos não pagos!");
            setAlertColor("red");
            return;
        }

        setVendaToEnd(vendaId);
        setShowEndModal(true);
    };

    return (
        <>
            <Card className="bg-white w-full h-full flex-1 min-h-0 rounded-xl border border-blue-gray-100 lg:flex">
                <CardHeader variant="gradient" color="gray" className="my-4 p-4">
                    <Typography variant="h6" color="white">
                        Vendas em Aberto
                    </Typography>
                </CardHeader>
                <CardBody className="px-4 pt-0 pb-6 h-full flex flex-col flex-1">
                    <AlertMessage alertMessage={alertMessage} alertColor={alertColor}
                                  onClose={() => setAlertMessage(null)}/>
                    <div className="lg:w-full mx-auto item">
                        <div className="flex flex-col justify-center items-center">
                            <div className="mb-2 grid grid-cols-1 sm:grid-cols-8 gap-4">
                                <div className="col-span-1 sm:col-span-7">
                                    <SelectField
                                        label="Selecione a Mesa"
                                        value={mesaId}
                                        onChange={setMesaId}
                                        options={mesas.map((mesa) => ({
                                            value: mesa.id,
                                            label: mesa.nome,
                                        }))}
                                        placeholder="Mesas Disponíveis"
                                    />
                                </div>
                                <div className="flex col-span-1 items-end">
                                    <Button
                                        onClick={() => setShowMesaModal(true)}
                                        className="p-4"
                                        color="blue"
                                    >
                                        <PlusCircleIcon className="h-5 w-5"/>
                                    </Button>
                                </div>
                            </div>
                        </div>


                        <div className="flex w-full justify-center mb-4">
                            <Button
                                onClick={handleCreateVenda}
                                className="mt-6 w-32 flex items-center justify-center mb-4"
                                disabled={loading}
                            >
                                {loading ? (
                                    <ArrowPathIcon className="h-4 w-4 text-white animate-spin"/>
                                ) : (
                                    "Nova Venda"
                                )}
                            </Button>
                        </div>

                        <div className="mb-1 grid grid-cols-1 sm:grid-cols-12 gap-4">
                            {vendas.map((venda) => {
                                const dataInicio = venda.dataInicioVenda
                                    ? new Date(venda.dataInicioVenda).toLocaleString()
                                    : "Data não disponível";
                                return (
                                    <div
                                        key={venda.id}
                                        onClick={() => handleVendaClick(venda.id)}
                                        className="flex col-span-1 lg:col-span-3 justify-center items-center p-4 space-x-4 border rounded-lg cursor-pointer hover:bg-blue-100 transition"
                                    >
                                        <div className="flex flex-col h-full justify-between items-center space-y-4">
                                            <Button
                                                className="p-2 bg-blue-400"
                                                onClick={() => navigate(`/dashboard/pedido/novo/${venda.id}`)}
                                            >
                                                <PlusSmallIcon className="h-5 w-5"/>
                                            </Button>
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="font-medium">Venda {venda.id}</div>
                                            <div>Mesa: {venda.mesa?.nome || "Indefinido"}</div>
                                            <div>Data Início: {dataInicio}</div>
                                        </div>
                                        <div className="flex flex-col h-full justify-between items-center space-y-4">
                                            <Button
                                                color="red"
                                                className="p-2"
                                                onClick={(e) => openDeleteModal(venda.id, e)}
                                            >
                                                <TrashIcon className="h-5 w-5"/>
                                            </Button>
                                            <Button
                                                color="green"
                                                className="p-2"
                                                onClick={(e) => openEndModal(venda.id, e)}
                                            >
                                                <LockOpenIcon className="h-5 w-5"/>
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-6">
                            <Typography variant="h6">Pedidos da Venda:
                                <span className="ml-2 text-green-400">
                                    {selectedVenda || "Selecione uma venda"}
                                </span>
                            </Typography>
                            <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                                <table className="min-w-full table-auto">
                                    <thead>
                                    <tr>
                                        <th className="px-4 py-2 border-b text-left">ID</th>
                                        <th className="px-4 py-2 border-b text-left">Tipo</th>
                                        <th className="px-4 py-2 border-b text-left">Status</th>
                                        <th className="px-4 py-2 border-b text-left">Cliente</th>
                                        <th className="px-4 py-2 border-b text-left">Data</th>
                                        <th className="px-4 py-2 border-b text-left"></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {pedidos.length > 0 ? (
                                        pedidos.map((pedido) => (
                                            <tr key={pedido.id}>
                                                <td className="px-4 py-2 border-b">{pedido.id}</td>
                                                <td className="px-4 py-2 border-b">{pedido.tipoPedido}</td>
                                                <td className="px-4 py-2 border-b">
                                                    <span
                                                            className={`inline-flex cursor-pointer items-center px-2 text-sm rounded-full 
                                                            ${pedido.statusPedido === 'Pago' ? 'bg-green-500 hover:bg-green-700 text-white' :
                                                                pedido.statusPedido === 'Em Andamento' ? 'bg-blue-500 hover:bg-blue-700 text-white' :
                                                                    pedido.statusPedido === 'Aberto' ? 'bg-indigo-500 hover:bg-indigo-700 text-white' :
                                                                        pedido.statusPedido === 'Finalizado' ? 'bg-green-300 hover:bg-green-500 text-white' :
                                                                            pedido.statusPedido === 'Rota de Entrega' ? 'bg-orange-500 hover:bg-orange-700 text-white' :
                                                                                'bg-gray-300 text-white'}`}
                                                        >
                                                        {pedido.statusPedido}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 border-b">{pedido.cliente?.nome || "Não informado"}</td>
                                                <td className="px-4 py-2 border-b">
                                                    {new Date(pedido.dataHora).toLocaleString()}
                                                </td>
                                                <td className="px-2 py-2 border-b">
                                                    <Button
                                                        onClick={() => navigate(`/dashboard/pedido/${pedido.id}`)}
                                                        className="p-2 bg-green-500 text-white"
                                                        disabled={pedido.statusPedido === "Pago"}
                                                    >
                                                        <ShoppingCartIcon className="h-5 w-5"/>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td className="px-4 py-2 border-b text-center" colSpan="6">
                                                {loading ? (
                                                    "Carregando..."
                                                ) : !selectedVenda ? (
                                                    "Selecione uma venda para exibir os pedidos"
                                                ) : pedidos.length === 0 ? (
                                                    "Esta venda não tem pedidos"
                                                ) : null}
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {showVendaFinalizadaModal && vendaFinalizada && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-1/3">
                        <Typography variant="h4" color="gray" className="mb-4 flex items-center gap-x-2">
                            <span>Venda Finalizada</span>
                        </Typography>
                        <p>
                            <strong>Valor:</strong> R$ {vendaFinalizada.valor.toFixed(2)}
                        </p>
                        <p>
                            <strong>Data:</strong> {new Date(vendaFinalizada.data).toLocaleString()}
                        </p>
                        <p>
                            <strong>Mesa:</strong> {vendaFinalizada.mesa}
                        </p>
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => setShowVendaFinalizadaModal(false)} // Fechar o modal
                                className="mr-4 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 active:bg-gray-500"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Exclusão */}
            {showDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-1/3">
                        <Typography
                            variant="h4"
                            color="gray"
                            className="mb-4 flex items-center gap-x-2"
                        >
                            <span>Confirmar Exclusão</span>
                        </Typography>
                        <p>
                            Tem certeza de que deseja excluir a venda{" "}
                            <strong>#{vendaToDelete}</strong>?
                        </p>
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="mr-4 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 active:bg-gray-500"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteVenda}
                                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700 active:bg-red-600"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Encerramento */}
            {showEndModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-1/3">
                        <Typography
                            variant="h4"
                            color="gray"
                            className="mb-4 flex items-center gap-x-2"
                        >
                            <span>Confirmar Encerramento</span>
                        </Typography>
                        <p>
                            Tem certeza de que deseja encerrar a venda{" "}
                            <strong>#{vendaToEnd}</strong>?
                        </p>
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => setShowEndModal(false)}
                                className="mr-4 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 active:bg-gray-500"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleEndVenda}
                                className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700 active:bg-green-600"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Nova Mesa */}
            {showMesaModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-1/3">
                        <Typography
                            variant="h4"
                            color="gray"
                            className="mb-4 flex items-center gap-x-2"
                        >
                            <span>Nova Mesa</span>
                        </Typography>
                        <div className="mb-4">
                            <InputField
                                label="Nome da Mesa"
                                placeholder="Digite o nome da mesa"
                                value={newMesaNome}
                                onChange={setNewMesaNome}
                                type="text"
                            />
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => {
                                    setShowMesaModal(false);
                                    setNewMesaNome("");
                                }}
                                className="mr-4 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 active:bg-gray-500"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateMesa}
                                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 active:bg-blue-600"
                                disabled={loading}
                            >
                                {loading ? "Criando..." : "Criar Mesa"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default VendaForm;