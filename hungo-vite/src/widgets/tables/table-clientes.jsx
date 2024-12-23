import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid'; // Importando os ícones do Heroicons
import api from '../../services/axiosConfig';

const ClienteList = () => {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [clienteSelecionado, setClienteSelecionado] = useState(null);

    const navigate = useNavigate();

    // Função para buscar todos os clientes
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

    // Carregar lista de clientes quando o componente é montado
    useEffect(() => {
        fetchClientes();
    }, []);

    const handleEdit = (id) => {
        navigate(`/dashboard/cliente/${id}`);  // Redireciona para a página de edição com o id
    };


    // Função para confirmar a exclusão
    const handleConfirmDelete = (cliente) => {
        setClienteSelecionado(cliente);
        setModalVisible(true);
    };

    // Função para excluir o cliente
    const handleDelete = async () => {
        if (clienteSelecionado) {
            try {
                await api.delete(`/cliente/${clienteSelecionado.id}`);
                setModalVisible(false);
                setClienteSelecionado(null);
                fetchClientes(); // Recarregar a lista após exclusão
            } catch (error) {
                console.error('Erro ao remover cliente:', error);
            }
        }
    };

    // Exibir mensagem de "Carregando..." enquanto os dados não são carregados
    if (loading) {
        return <div>Carregando...</div>;
    }

    return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Clientes</h2>
            <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                <table className="min-w-full table-auto">
                    <thead>
                    <tr>
                        <th className="px-4 py-2 border-b text-left">ID</th>
                        <th className="px-4 py-2 border-b text-left">Nome</th>
                        <th className="px-4 py-2 border-b text-left">CPF</th>
                        <th className="px-4 py-2 border-b text-left">Email</th>
                        <th className="px-4 py-2 border-b text-left">Telefone</th>
                        <th className="px-4 py-2 border-b text-left">Ações</th>
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
                            <td className="px-4 py-2 border-b">
                                {/* Botão de edição */}
                                <button
                                    onClick={() => handleEdit(cliente.id)}
                                    className="text-yellow-500 hover:text-yellow-700 mr-2"
                                >
                                    <PencilIcon className="w-5 h-5" />
                                </button>

                                {/* Botão de exclusão */}
                                <button
                                    onClick={() => handleConfirmDelete(cliente)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <TrashIcon className="w-5 h-5" />
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
                        <h3 className="text-xl font-semibold mb-4">Confirmar Exclusão</h3>
                        <p>
                            Tem certeza de que deseja remover o cliente "<strong>{clienteSelecionado?.nome}</strong>"?
                        </p>
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => setModalVisible(false)}
                                className="mr-4 bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClienteList;
