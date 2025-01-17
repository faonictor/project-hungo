import React, { useState, useEffect } from "react";
import api from "../../services/axiosConfig";
import { Card, CardBody, CardHeader, Typography } from "@material-tailwind/react";
import FluxoForm from "../forms/form-fluxo.jsx";
import Loading from "@/widgets/loading.jsx";
import {ArrowDownIcon, ArrowUpTrayIcon} from "@heroicons/react/20/solid/index.js";
import {ArrowUpIcon} from "@heroicons/react/24/outline";
import {BanknotesIcon} from "@heroicons/react/24/solid";
import {StatisticsCard} from "@/widgets/cards/index.js";
import {statisticsCardsData} from "@/data/index.js";
import {CheckCircleIcon} from "@heroicons/react/24/solid/index.js";

const FluxoTable = () => {
    const [vendas, setVendas] = useState([]);
    const [fluxos, setFluxos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totais, setTotais] = useState({
        totalVendas: 0,
        totalEntradas: 0,
        totalSaidas: 0,
        saldo: 0, // Saldo calculado
    });

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

                // Calcular totais
                calculateTotals(vendasResponse.data, fluxosResponse.data);

            } catch (error) {
                console.error("Erro ao carregar dados", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const calculateTotals = (vendasData, fluxosData) => {
        const totalVendas = vendasData.reduce((acc, venda) => acc + venda.total, 0);
        const totalEntradas = fluxosData
            .filter(fluxo => fluxo.transacao === "entrada")
            .reduce((acc, fluxo) => acc + fluxo.fluxo, 0);
        const totalSaidas = fluxosData
            .filter(fluxo => fluxo.transacao === "saida")
            .reduce((acc, fluxo) => acc + fluxo.fluxo, 0);

        const saldo = totalVendas + totalEntradas - totalSaidas;

        setTotais({
            totalVendas,
            totalEntradas,
            totalSaidas,
            saldo, // Armazenando o saldo calculado
        });
    };

    const handleAddFluxo = (novoFluxo) => {
        const novosFluxos = [...fluxos, novoFluxo];
        setFluxos(novosFluxos);

        calculateTotals(vendas, novosFluxos);
    };

    // Criar os dados dinâmicos para os Statistic Cards com ícones
    const statisticsCardsData = [
        {
            title: "Total de Vendas",
            icon: <BanknotesIcon className="w-6 h-6 text-white" />,
            value: `R$ ${totais.totalVendas.toFixed(2)}`,
            footer: { value: totais.totalVendas.toFixed(2), label: "Vendas realizadas", color: "text-green-600" },
            color: "green", // Cor do card
        },
        {
            title: "Total de Entradas",
            icon: <ArrowUpIcon className="w-6 h-6 text-white" />,
            value: `R$ ${totais.totalEntradas.toFixed(2)}`,
            footer: { value: totais.totalEntradas.toFixed(2), label: "Entradas registradas", color: "text-blue-600" },
            color: "blue", // Cor do card
        },
        {
            title: "Total de Saídas",
            icon: <ArrowDownIcon className="w-6 h-6 text-white" />,
            value: `R$ ${totais.totalSaidas.toFixed(2)}`,
            footer: { value: totais.totalSaidas.toFixed(2), label: "Saídas registradas", color: "text-red-600" },
            color: "red", // Cor do card
        },
        {
            title: "Saldo",
            icon: <CheckCircleIcon className="w-6 h-6 text-white" />,
            value: `R$ ${totais.saldo.toFixed(2)}`,
            footer: { value: totais.saldo.toFixed(2), label: "Saldo total", color: totais.saldo >= 0 ? "text-green-600" : "text-red-600" },
            color: totais.saldo >= 0 ? "green" : "red", // Cor do card baseado no saldo
        },
    ];

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

                    {/* Exibindo Totais */}
                    <CardBody>
                        <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
                            {statisticsCardsData.map(({icon, title, footer, color, value}, index) => (
                                <StatisticsCard
                                    key={title}
                                    title={title}
                                    icon={icon} // Passando o ícone
                                    value={value}
                                    footer={
                                        <Typography className={`font-normal ${footer.color}`}>
                                            <strong>{footer.value}</strong>&nbsp;{footer.label}
                                        </Typography>
                                    }
                                    color={color} // Cor do card
                                />
                            ))}
                        </div>
                    </CardBody>


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
                                                <td className="px-6 py-3 border-b">{fluxo.nome}</td>
                                                <td className="px-6 py-3 border-b">{fluxo.descricao}</td>
                                                <td className="px-6 py-3 border-b">
                                                        <span
                                                            className={`inline-flex items-center px-2 text-sm rounded-full 
                                                                ${fluxo.transacao === "entrada" ? "bg-blue-400 text-white" : "bg-red-500 text-white"}`}
                                                        >
                                                            {fluxo.transacao === "entrada" ? "Entrada" : "Saída"}
                                                        </span>
                                                </td>
                                                <td className="px-6 py-3 border-b">
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
                                                <td className="px-6 py-3 border-b">{venda.mesa.nome}</td>
                                                <td className="px-6 py-3 border-b">Venda realizada</td>
                                                <td className="px-6 py-3 border-b">
                                                        <span className="inline-flex items-center px-2 text-sm rounded-full bg-green-500 text-white">
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
