import React, { useState, useEffect } from "react";
import api from "../../services/axiosConfig";
import { Card, CardBody, CardHeader, Typography, Button } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import {ShoppingCartIcon} from "@heroicons/react/24/solid/index.js";
import {TrashIcon} from "@heroicons/react/24/solid";

const PedidoList = () => {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPedidos = async () => {
            try {
                const response = await api.get("/pedido");
                setPedidos(response.data || []); // Garanta que seja uma lista
            } catch (error) {
                setAlertMessage("Erro ao carregar pedidos");
                setAlertColor("red");
            } finally {
                setLoading(false);
            }
        };

        fetchPedidos();
    }, []);

    if (loading) {
        return <div>Carregando...</div>;
    }

    if (pedidos.length === 0) {
        return <div>Nenhum pedido encontrado.</div>;
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
                                    {/*<td className="py-2 px-4 border-b">{pedido.tipoPedido}</td>*/}
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
                                    {/*<td className="py-2 px-4 border-b">{pedido.statusPedido}</td>*/}
                                    <td className="py-2 px-4 border-b">R$ {pedido.venda?.total?.toFixed(2) || "0.00"}</td>
                                    <td className="px-2 py-2 border-b space-x-2">
                                        <button
                                            onClick={() => navigate(`/dashboard/pedido/${pedido.id}`)}
                                            className="p-1.5 hover:bg-green-100 hover:text-green-800 text-blue-gray-500 rounded-lg"
                                        >
                                            <ShoppingCartIcon className="h-5 w-5"/>
                                        </button>
                                        <button
                                            onClick={() => navigate(`/dashboard/pedido/${pedido.id}`)}
                                            className="p-1.5 hover:bg-red-100  text-blue-gray-500 rounded-lg"
                                        >
                                            <TrashIcon className="h-5 w-5"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardBody>
        </Card>
    );
};

export default PedidoList;
