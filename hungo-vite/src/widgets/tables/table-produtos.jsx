import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    PencilIcon,
    TrashIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/solid';
import api from '../../services/axiosConfig';
import { Card, CardBody, CardHeader, Typography, Alert } from "@material-tailwind/react";
import Loading from "@/widgets/loading.jsx";
import AlertMessage from "@/widgets/alert-message.jsx";

const ProdutosTable = () => {
    const [produtos, setProdutos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertColor, setAlertColor] = useState('green');
    const [modalVisible, setModalVisible] = useState(false);
    const [produtoSelecionado, setProdutoSelecionado] = useState(null);

    const navigate = useNavigate();

    // Função para buscar todos os produtos
    const fetchProdutos = async () => {
        try {
            const response = await api.get('/produtos');
            setProdutos(response.data);
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            setProdutos([]);
        } finally {
            setLoading(false);
        }
    };

    // Recarregar lista de produtos quando o componente é montado
    useEffect(() => {
        fetchProdutos();
    }, []);

    // Função para editar produto
    const handleEdit = (id) => {
        navigate(`/dashboard/produto/${id}`);
    };

    // Função modal confirmar exclusão
    const handleConfirmDelete = (produto) => {
        setProdutoSelecionado(produto);
        setModalVisible(true);
    };

    // Função deletar produto
    const handleDelete = async () => {
        if (produtoSelecionado) {
            try {
                await api.delete(`/produto/${produtoSelecionado.id}`);  // Corrigido para o endpoint correto
                setModalVisible(false);
                setProdutoSelecionado(null);
                fetchProdutos();
                setAlertMessage(`Produto "${produtoSelecionado.nome}" excluído com sucesso.`);
                setAlertColor('green');
            } catch (error) {
                console.error('Erro ao remover produto:', error);
                setAlertMessage(`Ocorreu um erro ao excluir o produto "${produtoSelecionado.nome}".`);
                setAlertColor('red');
            }
        }
    };

    // Carregamento
    if (loading) {
        return <Loading text="Carregando Produtos" />;
    }

    return (
        <>
            <Card className="overflow-x-auto bg-white w-full h-full flex-1 min-h-0 rounded-xl border border-blue-gray-100 lg:flex">
                <CardHeader variant="gradient" color="gray" className="my-4 p-4">
                    <Typography variant="h6" color="white">
                        Lista de Produtos
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
                                <th className="px-4 py-2 border-b text-left">Preço</th>
                                <th className="px-4 py-2 border-b text-left">Descrição</th>
                                <th className="pr-4 py-2 border-b text-left">Ações</th>
                            </tr>
                            </thead>
                            <tbody>
                            {produtos.map((produto) => (
                                <tr key={produto.id}>
                                    <td className="px-4 py-2 border-b">{produto.id}</td>
                                    <td className="px-4 py-2 border-b">{produto.nome}</td>
                                    <td className="px-4 py-2 border-b">{produto.preco}</td>
                                    <td className="px-4 py-2 border-b">{produto.descricao}</td>
                                    <td className="pr-4 py-2 border-b space-x-2">
                                        <button onClick={() => handleEdit(produto.id)}>
                                            <div className="p-1 rounded-md text-blue-gray-500 hover:bg-blue-100 active:text-blue-500">
                                                <PencilIcon className="w-5 h-5" />
                                            </div>
                                        </button>

                                        <button onClick={() => handleConfirmDelete(produto)}>
                                            <div className="p-1 rounded-md text-blue-gray-500 hover:bg-red-100 active:text-red-600">
                                                <TrashIcon className="w-5 h-5" />
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
                                    <ExclamationTriangleIcon className="text-gray-400 w-7 h-7" /><span>Confirmar Exclusão</span>
                                </Typography>
                                <p>
                                    Tem certeza de que deseja remover o produto "<strong>{produtoSelecionado?.nome}</strong>"?
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
                </CardBody>
            </Card>
        </>
    );
};

export default ProdutosTable;
