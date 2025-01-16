import React, { useState, useEffect } from "react";
import api from "../../services/axiosConfig";
import { Card, CardBody, CardHeader, Typography } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { ShoppingCartIcon } from "@heroicons/react/24/solid/index.js";
import { TrashIcon } from "@heroicons/react/24/solid";
import Loading from "@/widgets/loading.jsx";

const PedidoList = () => {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPedidos = async () => {
            try {
                // Busca todos os pedidos
                const response = await api.get("/pedido");

                // Para cada pedido, vamos buscar os itens e calcular o total
                const pedidosComTotal = await Promise.all(
                    response.data.map(async (pedido) => {
                        const pedidoDetalhado = await api.get(`/pedido/${pedido.id}`);
                        const itens = pedidoDetalhado.data.itens || [];
                        // Somar o total dos itens do pedido
                        const totalItens = itens.reduce((acc, item) => acc + (item.total || 0), 0);

                        // Retornar o pedido com o total calculado
                        return { ...pedido, totalItens };
                    })
                );

                setPedidos(pedidosComTotal || []);
            } catch (error) {
                setError("Erro ao carregar pedidos");
            } finally {
                setLoading(false);
            }
        };

        fetchPedidos();
    }, []);

    const handleDeletePedido = async () => {
        if (pedidoSelecionado.statusPedido === "Pago") {
            setError("Não é possível excluir um pedido com status 'Pago'");
            setModalVisible(false); // Fecha o modal em caso de erro
            return;
        }

        try {
            await api.delete(`/pedido/${pedidoSelecionado.id}`);
            setPedidos(pedidos.filter((pedido) => pedido.id !== pedidoSelecionado.id));
            setError(null);
        } catch (error) {
            setError("Erro ao tentar deletar o pedido");
        } finally {
            setModalVisible(false);
        }
    };

    const openDeleteModal = (pedido) => {
        setPedidoSelecionado(pedido);
        setModalVisible(true);
    };

    /* carregamento */
    if (loading) {
        return <Loading text="Carregando Pedidos" />;
    }

    if (pedidos.length === 0) {
        return <Loading text="Pedidos Não Encontrados" />;
    }

    return (
        <Card className="bg-white w-full h-full flex-1 min-h-0 rounded-xl border border-blue-gray-100">
            <CardHeader variant="gradient" color="gray" className="my-4 p-4">
                <Typography variant="h6" color="white">
                    Lista de Pedidos
                </Typography>
            </CardHeader>

            <CardBody className="px-4 pt-0 pb-6">
                {error && (
                    <div className="text-red-500 mb-4">
                        <Typography>{error}</Typography>
                    </div>
                )}

                {loading ? (
                    <Typography>Carregando...</Typography>
                ) : (
                    <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                        <table className="min-w-full bg-white">
                            <thead>
                            <tr>
                                <th className="py-2 px-4 border-b text-left">ID</th>
                                <th className="py-2 px-4 border-b text-left">Cliente</th>
                                <th className="py-2 px-4 border-b text-left">Mesa</th>
                                <th className="py-2 px-4 border-b text-left">Data e Hora</th>
                                <th className="py-2 px-4 border-b text-left">Tipo de Pedido</th>
                                <th className="py-2 px-4 border-b text-left">Status</th>
                                <th className="py-2 px-4 border-b text-left">Total</th>
                                <th className="py-2 px-4 border-b text-left">Ações</th>
                            </tr>
                            </thead>
                            <tbody>
                            {pedidos.map((pedido) => (
                                <tr key={pedido.id}>
                                    <td className="py-2 px-4 border-b">{pedido.id}</td>
                                    <td className="py-2 px-4 border-b">{pedido.cliente?.nome || "N/A"}</td>
                                    <td className="py-2 px-4 border-b">{pedido.venda?.mesa?.nome || "N/A"}</td>
                                    <td className="py-2 px-4 border-b">{new Date(pedido.dataHora).toLocaleString()}</td>
                                    <td className="py-3 px-6 border-b">
                                            <span
                                                className={`inline-flex items-center px-2 text-sm rounded-full 
                                                    ${pedido.tipoPedido === 'Local' ? 'bg-blue-gray-400 text-white' : 'bg-blue-gray-900 text-white'}`}
                                            >
                                                {pedido.tipoPedido === 'Local' ? 'Local' : 'Delivery'}
                                            </span>
                                    </td>
                                    <td className="py-3 px-6 border-b">
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

                                    {/* Exibir o total dos itens somados */}
                                    <td className="py-2 px-4 border-b">R$ {pedido.totalItens?.toFixed(2) || 0.0}</td>

                                    <td className="px-2 py-2 border-b space-x-2">
                                        <button
                                            onClick={() => navigate(`/dashboard/pedido/${pedido.id}`)}
                                            className="p-1.5 hover:bg-green-100 hover:text-green-800 text-blue-gray-500 rounded-lg"
                                        >
                                            <ShoppingCartIcon className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => openDeleteModal(pedido)}
                                            className="p-1.5 hover:bg-red-100 text-blue-gray-500 rounded-lg"
                                            disabled={pedido.statusPedido === "Pago"} // Desabilita o botão de delete se o status for "Pago"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardBody>

            {/* Modal de confirmação de exclusão */}
            {modalVisible && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-1/3">
                        <Typography variant="h4" color="gray" className="mb-4 flex items-center gap-x-2">
                            Confirmar Exclusão
                        </Typography>
                        <p>
                            Tem certeza de que deseja excluir o pedido <strong>{pedidoSelecionado?.id}</strong>?
                        </p>
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => setModalVisible(false)}
                                className="mr-4 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 active:bg-gray-500"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeletePedido}
                                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700 active:bg-red-300"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default PedidoList;
