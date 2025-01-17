import React, {useState, useEffect} from "react";
import api from "../../services/axiosConfig";
import {Card, CardBody, CardHeader, Typography} from "@material-tailwind/react";
import {PlusIcon} from "@heroicons/react/24/solid/index.js";
import {useNavigate} from "react-router-dom";

const VendaTable = () => {
    const [vendas, setVendas] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchVendas = async () => {
            try {
                setLoading(true);
                const response = await api.get("/venda/fechadas");
                setVendas(response.data);
            } catch (error) {
                console.error("Erro ao carregar vendas fechadas", error);
            } finally {
                setLoading(false);
            }
        };
        fetchVendas();
    }, []);

    return (
        <>
            <Card className="bg-white w-full h-full flex-1 min-h-0 rounded-xl border border-blue-gray-100 lg:flex">
                <CardHeader variant="gradient" color="gray" className="my-4 p-4 flex space-x-6 items-center justify-between">
                    <Typography variant="h6" color="white">
                        Vendas Fechadas
                    </Typography>
                    <button
                        onClick={() => navigate(`/dashboard/vendas`)}
                        className="flex items-center bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
                    >
                        <span className="flex p-1 justify-center items-center">
                            <PlusIcon className="w-5 h-5 text-sm"/>
                            <span className="text-sm">Novo Pedido</span>
                        </span>
                    </button>
                </CardHeader>
                <CardBody className="px-4 pt-0 pb-6">
                    <div className="mt-6">
                        <Typography variant="h6">Vendas Fechadas</Typography>
                        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                            <table className="min-w-full table-auto">
                                <thead>
                                <tr>
                                    <th className="px-4 py-2 border-b text-left">ID</th>
                                    <th className="px-4 py-2 border-b text-left">Mesa</th>
                                    <th className="px-4 py-2 border-b text-left">Data de Início</th>
                                    <th className="px-4 py-2 border-b text-left">Data de Fim</th>
                                    <th className="px-4 py-2 border-b text-left">Total</th>
                                </tr>
                                </thead>
                                <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-2 text-center">
                                            Carregando...
                                        </td>
                                    </tr>
                                ) : vendas.length > 0 ? (
                                    vendas.map((venda) => {
                                        const dataInicio = venda.dataInicioVenda
                                            ? new Date(venda.dataInicioVenda).toLocaleString()
                                            : "Data não disponível";
                                        const dataFim = venda.dataFimVenda
                                            ? new Date(venda.dataFimVenda).toLocaleString()
                                            : "Ainda em andamento";

                                        return (
                                            <tr key={venda.id}>
                                                <td className="px-4 py-2 border-b">{venda.id}</td>
                                                <td className="px-4 py-2 border-b">{venda.mesa?.nome || "Indefinido"}</td>
                                                <td className="px-4 py-2 border-b">{dataInicio}</td>
                                                <td className="px-4 py-2 border-b">{dataFim}</td>
                                                <td className="px-4 py-2 border-b">
                                                    {venda.total ? `R$ ${venda.total.toFixed(2)}` : "R$ 0,00"}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-2 text-center">
                                            Não há vendas fechadas.
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </>
    );
};

export default VendaTable;
