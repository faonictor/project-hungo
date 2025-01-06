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
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMesas = async () => {
            try {
                const response = await api.get("/mesa");
                setMesas(response.data);
            } catch (error) {
                setAlertMessage("Erro ao carregar mesas");
                setAlertColor("red");
            }
        };
        fetchMesas();
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
            const response = await api.post("/mesa", {nome: newMesaNome});
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

            const vendaData = {
                mesa: {id: parseInt(mesaId), nome: mesaSelecionada.nome},
                dataInicioVenda: dataAtual,
                dataFimVenda: null,
                total: 0.0,
            };

            await api.post("/venda", vendaData);
            fetchVendas();
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

    const handleDeleteVenda = async () => {
        try {
            setLoading(true);
            await api.delete(`/venda/${vendaToDelete}`);
            fetchVendas();
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

    const handleEndVenda = async () => {
        try {
            setLoading(true);
            const dataAtual = new Date().toISOString();

            await api.put(`/venda/${vendaToEnd}`, {dataFimVenda: dataAtual});

            fetchVendas();

            if (selectedVenda === vendaToEnd) {
                setSelectedVenda(null);
                setPedidos([]);
            }
            setAlertMessage("Venda encerrada com sucesso!");
            setAlertColor("green");
        } catch (error) {
            setAlertMessage("Erro ao encerrar venda");
            setAlertColor("red");
        } finally {
            setLoading(false);
            setShowEndModal(false);
            setVendaToEnd(null);
        }
    };

    const openDeleteModal = (vendaId, event) => {
        event.stopPropagation();
        setVendaToDelete(vendaId);
        setShowDeleteModal(true);
    };

    const openEndModal = (vendaId, event) => {
        event.stopPropagation();
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
                                                <td className="px-4 py-2 border-b">{pedido.statusPedido}</td>
                                                <td className="px-4 py-2 border-b">{pedido.cliente?.nome || "Não informado"}</td>
                                                <td className="px-4 py-2 border-b">
                                                    {new Date(pedido.dataHora).toLocaleString()}
                                                </td>
                                                <td className="px-2 py-2 border-b">
                                                    <Button
                                                        onClick={() => navigate(`/dashboard/pedido/${pedido.id}`)}
                                                        className="p-2 bg-green-500 text-white"
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