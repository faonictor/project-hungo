import React, {useState, useEffect} from "react";
import api from "../../services/axiosConfig";
import {Button, Card, CardBody, CardHeader, Typography} from "@material-tailwind/react";

const VendaTable = () => {
    const [vendas, setVendas] = useState([]);
    const [loading, setLoading] = useState(false);

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
                <CardHeader variant="gradient" color="gray" className="my-4 p-4">
                    <Typography variant="h6" color="white">
                        Vendas Fechadas
                    </Typography>
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
