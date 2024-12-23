import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CheckBadgeIcon,
    ExclamationCircleIcon,
    MapPinIcon,
    PencilIcon,
    TrashIcon,
    XMarkIcon,
    ArrowPathIcon, ExclamationTriangleIcon
} from '@heroicons/react/24/solid';
import api from '../../services/axiosConfig';
import {Card, CardBody, CardHeader, Typography, Alert, Spinner} from "@material-tailwind/react";
import Loading from "@/widgets/loading.jsx";
import {CircleStackIcon, InformationCircleIcon} from "@heroicons/react/24/outline";
import AlertMessage from "@/widgets/alert-message.jsx";

const ClientesTable = () => {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [clienteSelecionado, setClienteSelecionado] = useState(null);
    const [enderecos, setEnderecos] = useState([]);  // Novo estado para armazenar os endereços
    const [modalEnderecosVisible, setModalEnderecosVisible] = useState(false);  // Controlar visibilidade do modal de endereços
    const [alertMessage, setAlertMessage] = useState(null); // Estado para controlar a mensagem de alerta
    const [alertColor, setAlertColor] = useState('green'); // Cor do alerta

    const navigate = useNavigate();

    {/* Função para buscar todos os clientes */}
    const fetchClientes = async () => {
        try {
            const response = await api.get('/cliente');
            const data = Array.isArray(response.data) ? response.data : [];
            setClientes(data);
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
            setClientes([]);
        } finally {
            setLoading(false);
        }
    };

    {/* Recarregar lista de clientes quando o componente é montado */}
    useEffect(() => {
        fetchClientes();
    }, []);

    {/* Função para buscar os endereços de um cliente */}
    const fetchEnderecos = async (clienteId) => {
        try {
            const response = await api.get(`/endereco/cliente/${clienteId}`);
            const data = Array.isArray(response.data) ? response.data : [];
            setEnderecos(data);
        } catch (error) {
            console.error('Erro ao buscar endereços:', error);
            setEnderecos([]);
        } finally {
            setLoadingEnderecos(false);
        }
    };

    {/* Função para exibir os endereços de um cliente */}
    const handleShowEnderecos = (clienteId, nomeCliente) => {
        setClienteSelecionado({ ...clienteSelecionado, nome: nomeCliente });
        fetchEnderecos(clienteId);
        setModalEnderecosVisible(true);
    };

    {/* Função para editar na tela de cliente */}
    const handleEdit = (id) => {
        navigate(`/dashboard/cliente/${id}`);
    };

    {/* Função modal confirmar exclusão */}
    const handleConfirmDelete = (cliente) => {
        setClienteSelecionado(cliente);
        setModalVisible(true);
    };

    {/* Função deletar cliente e endereços */}
    const handleDelete = async () => {
        if (clienteSelecionado) {
            try {
                await api.delete(`/cliente/${clienteSelecionado.id}`);
                setModalVisible(false);
                setClienteSelecionado(null);
                fetchClientes();
                setAlertMessage(`Cliente "${clienteSelecionado.nome}" excluído com sucesso.`);
                setAlertColor('green');
            } catch (error) {
                console.error('Erro ao remover cliente:', error);
                setAlertMessage(`Ocorreu um erro ao excluir o cliente "${clienteSelecionado.nome}".`);
                setAlertColor('red');
            }
        }
    };

    {/* carregamento */}
    if (loading) {
        return <Loading text="Carregando Clientes" />;
    }

    return (
        <>
            <Card
                className="overflow-x-auto bg-white w-full h-full flex-1 min-h-0 rounded-xl border border-blue-gray-100 lg:flex">
                <CardHeader variant="gradient" color="gray" className="my-4 p-4">
                    <Typography variant="h6" color="white">
                        Lista de Clientes
                    </Typography>
                </CardHeader>
                <CardBody className="px-4 pt-0 pb-6">

                    {/* Notificação */}
                    <AlertMessage
                        alertMessage={alertMessage}
                        alertColor={alertColor}
                        onClose={() => setAlertMessage(null)}
                    />

                    <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                        <table className="min-w-full table-auto">
                            <thead>
                            <tr>
                                <th className="px-4 py-2 border-b text-left">ID</th>
                                <th className="px-4 py-2 border-b text-left">Nome</th>
                                <th className="px-4 py-2 border-b text-left">CPF</th>
                                <th className="px-4 py-2 border-b text-left">Email</th>
                                <th className="px-4 py-2 border-b text-left">Telefone</th>
                                <th className="pr-4 py-2 border-b text-left">Ações</th>
                            </tr>
                            </thead>
                            <tbody>
                            {clientes.map((cliente) => (
                                <tr key={cliente.id}>
                                    <td className="px-4 py-2 border-b">{cliente.id}</td>
                                    <td className="px-4 py-2 border-b">{cliente.nome}</td>
                                    <td className="px-4 py-2 border-b">{cliente.cpf}</td>
                                    <td className="px-4 py-2 border-b">{cliente.email}</td>
                                    <td className="px-4 py-2 border-b">{cliente.telefone}</td>
                                    <td className="pr-4 py-2 border-b space-x-2">
                                        <button onClick={() => handleEdit(cliente.id)}>
                                            <div className="p-1 rounded-md text-blue-gray-500 hover:bg-blue-100 active:text-blue-500">
                                                <PencilIcon className="w-5 h-5" />
                                            </div>
                                        </button>

                                        <button onClick={() => handleConfirmDelete(cliente)}>
                                            <div className="p-1 rounded-md text-blue-gray-500 hover:bg-red-100 active:text-red-600">
                                                <TrashIcon className="w-5 h-5" />
                                            </div>
                                        </button>

                                        <button onClick={() => handleShowEnderecos(cliente.id, cliente.nome)}>
                                            <div className="p-1 rounded-md text-blue-gray-500 hover:bg-gray-200 active:text-green-500">
                                                <MapPinIcon className="w-5 h-5" />
                                            </div>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Modal de Confirmação de Exclusão */}
                    {modalVisible && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                            <div className="bg-white p-6 rounded-lg shadow-xl w-1/3">
                                <Typography variant="h4" color="gray" className="mb-4 flex items-center gap-x-2">
                                    <ExclamationTriangleIcon className="text-gray-400 w-7 h-7"/><span>Confirmar Exclusão</span>
                                </Typography>
                                <h3 className="text-xl font-semibold mb-4"> </h3>
                                <p>
                                    Tem certeza de que deseja remover o cliente "<strong>{clienteSelecionado?.nome}</strong>"?
                                </p>
                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={() => setModalVisible(false)}
                                        className="mr-4 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 active:bg-gray-500"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700 active:bg-red-300"
                                    >
                                        Confirmar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Modal de Endereços */}
                    {modalEnderecosVisible && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" onClick={() => setModalEnderecosVisible(false)}>
                            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg md:w-1/2">
                                <Typography variant="h4" color="gray" className="mb-4">
                                    Endereços de {clienteSelecionado?.nome}
                                </Typography>

                                {enderecos.length === 0 ? (
                                    <p>Não há endereços registrados para este cliente.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {enderecos.map((endereco, index) => (
                                            <Card key={index} className="mb-4 border border-blue-gray-50">
                                                <CardBody>
                                                    <Typography variant="h6" color="blue-gray">
                                                        {endereco.rua}, {endereco.numero} {endereco.complemento && `- ${endereco.complemento}`}
                                                    </Typography>
                                                    <div className="flex flex-wrap gap-x-4">
                                                        <Typography className="mt-2" color="gray">
                                                            <strong>Bairro:</strong> {endereco.bairro}
                                                        </Typography>
                                                        <Typography className="mt-2" color="gray">
                                                            <strong>Cidade:</strong> {endereco.cidade}
                                                        </Typography>
                                                        <Typography className="mt-2" color="gray">
                                                            <strong>CEP:</strong> {endereco.cep}
                                                        </Typography>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                                <div className="mt-4 flex justify-center">
                                    <button
                                        onClick={() => setModalEnderecosVisible(false)}
                                        className="mr-4 bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400"
                                    >
                                        Fechar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </CardBody>
            </Card>
        </>
    );
};

export default ClientesTable;
