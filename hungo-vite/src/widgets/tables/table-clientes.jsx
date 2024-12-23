import React, {useState, useEffect} from 'react';
import api from '../../services/axiosConfig'; // Importe a instância do axios configurada
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
} from "@material-tailwind/react";
import {ArrowPathIcon} from "@heroicons/react/24/outline";

const TableClientes = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchClientes = async () => {
            try {
                // Requisição GET para buscar clientes
                const response = await api.get('/cliente');
                setData(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        fetchClientes();
    }, []);

    // Exibir loading ou erro, caso haja
    if (loading) {
        return (
            <div className="flex w-full justify-center items-center">
                <ArrowPathIcon className="h-4 w-4 text-gray-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return <div>Erro: {error}</div>;
    }

    return (
        <>
            <Card className="bg-white w-full h-full flex-1 min-h-0 rounded-xl border border-blue-gray-100 lg:flex">
                <CardHeader variant="gradient" color="green" className="my-4 p-4">
                    <Typography variant="h6" color="white">
                        Cadastrar Cliente
                    </Typography>
                </CardHeader>
                <CardBody className=" overflow-x-scroll px-4 pt-0 pb-6">
                    <table className="w-full min-w-[640px] table-auto">
                        <thead>
                        <tr>
                            {["ID", "Nome", "Email", "Telefone", "Data de Cadastro", ""].map((el) => (
                                <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                                    <Typography variant="small"
                                                className="text-[11px] font-bold uppercase text-blue-gray-400">
                                        {el}
                                    </Typography>
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {data && data.map((cliente, key) => {
                            const className = `py-3 px-5 ${key === data.length - 1 ? "" : "border-b border-blue-gray-50"}`;

                            return (
                                <tr key={cliente.id}>
                                    <td className={className}>{cliente.id}</td>
                                    <td className={className}>
                                        <Typography variant="small" color="blue-gray" className="font-semibold">
                                            {cliente.nome}
                                        </Typography>
                                    </td>
                                    <td className={className}>
                                        <Typography className="text-xs font-normal text-blue-gray-500">
                                            {cliente.email}
                                        </Typography>
                                    </td>
                                    <td className={className}>
                                        <Typography className="text-xs font-normal text-blue-gray-500">
                                            {cliente.telefone}
                                        </Typography>
                                    </td>
                                    <td className={className}>
                                        <Typography className="text-xs font-semibold text-blue-gray-600">
                                            {new Date(cliente.dataCadastro).toLocaleDateString()} {/* Formata a data */}
                                        </Typography>
                                    </td>
                                    <td className={className}>
                                        <Typography as="a" href="#"
                                                    className="text-xs font-semibold text-blue-gray-600">
                                            Editar
                                        </Typography>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </CardBody>
            </Card>
        </>
    );
};

export default TableClientes;
