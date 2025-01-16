import React, { useState, useEffect } from "react";
import api from "../../services/axiosConfig";
import {Card, CardBody, CardHeader, Typography} from "@material-tailwind/react";
import FluxoForm from "../forms/form-fluxo.jsx";
import Loading from "@/widgets/loading.jsx";

const FluxoTable = () => {
    const [vendas, setVendas] = useState([]);
    const [fluxos, setFluxos] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [vendasResponse, fluxosResponse] = await Promise.all([
                    api.get("/venda/fechadas"),
                    api.get("/fluxo"),
                ]);
                setVendas(vendasResponse.data);
                setFluxos(fluxosResponse.data);
            } catch (error) {
                console.error("Erro ao carregar dados", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleAddFluxo = (novoFluxo) => {
        setFluxos((prev) => [...prev, novoFluxo]);
    };

    return (
        <>
            <Card className="bg-white w-full h-full flex-1 min-h-0 rounded-xl border border-blue-gray-100 lg:flex">
                <CardHeader variant="gradient" color="gray" className="my-4 p-4">
                    <Typography variant="h6" color="white">
                        Cadastrar Fluxo Financeiro
                    </Typography>
                </CardHeader>
                <CardBody className="px-4 pt-0 pb-6">
                <FluxoForm onAddFluxo={handleAddFluxo} />

                    <CardBody>
                        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                            <table className="min-w-full table-auto">
                                <thead>
                                <tr>
                                    <th className="px-4 py-2 border-b text-left">Nome</th>
                                    <th className="px-4 py-2 border-b text-left">Descrição</th>
                                    <th className="px-4 py-2 border-b text-left">Transação</th>
                                    <th className="px-4 py-2 border-b text-left">Valor</th>
                                    <th className="px-4 py-2 border-b text-left">Data</th>
                                </tr>
                                </thead>
                                <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-2 text-center">
                                           <Loading /> Carregando...
                                        </td>
                                    </tr>
                                ) : (
                                    <>
                                        {/* Renderizando Fluxos Financeiros */}
                                        {fluxos.map((fluxo) => (
                                            <tr key={`fluxo-${fluxo.id}`}>
                                                <td className="px-4 py-2 border-b">{fluxo.nome}</td>
                                                <td className="px-4 py-2 border-b">{fluxo.descricao}</td>
                                                <td className="px-4 py-2 border-b">
                                                <span
                                                    className={`inline-flex items-center px-2 text-sm rounded-full 
                                                        ${fluxo.transacao === "entrada" ? "bg-blue-400 text-white" : "bg-red-500 text-white"}`}
                                                >
                                                    {fluxo.transacao === "entrada" ? "Entrada" : "Saída"}
                                                </span>
                                                </td>
                                                <td className="px-4 py-2 border-b">
                                                    {`R$ ${fluxo.fluxo.toFixed(2)}`}
                                                </td>
                                                <td className="px-4 py-2 border-b">
                                                    {fluxo.dataTransacao
                                                        ? new Date(fluxo.dataTransacao).toLocaleString("pt-BR")
                                                        : "-"}
                                                </td>
                                            </tr>
                                        ))}

                                        {/* Renderizando Vendas */}
                                        {vendas.map((venda) => (
                                            <tr key={`venda-${venda.id}`}>

                                                <td className="px-4 py-2 border-b">{venda.mesa.nome}</td>
                                                <td className="px-4 py-2 border-b">Venda realizada</td>
                                                <td className="px-4 py-2 border-b">
                                                <span
                                                    className="inline-flex items-center px-2 text-sm rounded-full bg-green-500 text-white">
                                                    Venda
                                                </span>
                                                </td>
                                                <td className="px-4 py-2 border-b">
                                                    {`R$ ${venda.total.toFixed(2)}`}
                                                </td>
                                                <td className="px-4 py-2 border-b">
                                                    {new Date(venda.dataFimVenda).toLocaleString("pt-BR")}
                                                </td>
                                            </tr>
                                        ))}

                                    </>
                                )}

                                {/* Caso não existam registros */}
                                {!loading && fluxos.length === 0 && vendas.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-2 text-center">
                                            Não há fluxos financeiros ou vendas registradas.
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </CardBody>
                </CardBody>
            </Card>
        </>
    );
};

export default FluxoTable;

