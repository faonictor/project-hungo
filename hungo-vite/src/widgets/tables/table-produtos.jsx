import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExclamationTriangleIcon, PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/solid';
import api from '../../services/axiosConfig';
import { Card, CardBody, CardHeader, Typography, Alert } from "@material-tailwind/react";
import Loading from "@/widgets/loading.jsx";
import AlertMessage from "@/widgets/alert-message.jsx";

const ProdutosTable = () => {
    const [produtos, setProdutos] = useState([]);
    const [insumosProduto, setInsumosProduto] = useState({});  {/* Mapeando insumos por ID de produto */}
    const [loading, setLoading] = useState(true);
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertColor, setAlertColor] = useState('green');
    const [modalVisible, setModalVisible] = useState(false);
    const [produtoSelecionado, setProdutoSelecionado] = useState(null);

    const navigate = useNavigate();

    {/* Função para buscar todos os produtos */}
    const fetchProdutos = async () => {
        try {
            const response = await api.get('/produtos');
            setProdutos(response.data);
            {/* Buscar os insumos para cada produto ao mesmo tempo */}
            response.data.forEach(produto => {
                fetchInsumosPorProduto(produto.id);  {/* Buscar insumos para cada produto */}
            });
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            setProdutos([]);
        } finally {
            setLoading(false);
        }
    };

    {/* Função para buscar os insumos de um produto específico */}
    const fetchInsumosPorProduto = async (produtoId) => {
        try {
            const response = await api.get(`/produto-insumo?produtoId=${produtoId}`);
            setInsumosProduto(prevState => ({
                ...prevState,
                [produtoId]: response.data
        }));
        } catch (error) {
            console.error('Erro ao buscar insumos para o produto:', error);
        }
    };

    {/* Recarregar lista de produtos quando o componente é montado */}
    useEffect(() => {
        fetchProdutos();
    }, []);

    {/* Função para editar produto */}
    const handleEdit = (id) => {
        navigate(`/dashboard/produto/${id}`);
    };

    {/* Função para abrir o modal de confirmação de exclusão */}
    const handleConfirmDelete = (produto) => {
        setProdutoSelecionado(produto);
        setModalVisible(true); {/* Exibe o modal */}
    };

    {/* Função para excluir o produto */}
    const handleDelete = async () => {
        if (produtoSelecionado) {
            try {
                {/* Fechar o modal após confirmação */}
                setModalVisible(false);
                await api.delete(`/produto/${produtoSelecionado.id}`);
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

    {/* Função para formatar o preço para o formato de moeda brasileira */}
    const formatPreco = (preco) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(preco);
    };

    {/* Função para redirecionar para a página de criar produto */}
    const handleCreateProduto = () => {
        navigate('/dashboard/produto');
    };

    {/* Carregamento */}
    if (loading) {
        return <Loading text="Carregando Produtos" />;
    }

    return (
        <>
            <Card className="overflow-x-auto bg-white w-full h-full flex-1 min-h-0 rounded-xl border border-blue-gray-100 lg:flex">
                <CardHeader variant="gradient" color="gray" className="my-4 p-4 flex space-x-6 items-center justify-between">
                    <Typography variant="h6" color="white">
                        Lista de Produtos
                    </Typography>
                    <button
                        onClick={handleCreateProduto}
                        className="flex items-center bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
                    >
                        <span className="flex p-1 justify-center items-center">
                            <PlusIcon className="w-5 h-5 text-sm" />
                            <span className="text-sm">Novo Produto </span>
                        </span>
                    </button>
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
                                <th className="px-4 py-2 border-b text-left">Categoria</th>
                                <th className="px-4 py-2 border-b text-left">Preço</th>
                                <th className="px-4 py-2 border-b text-left">Situação</th>
                                <th className="pr-4 py-2 border-b text-left">Ações</th>
                            </tr>
                            </thead>
                            <tbody>
                            {produtos.map((produto) => (
                                <tr key={produto.id}>
                                    <td className="px-4 py-2 border-b">{produto.id}</td>
                                    <td className="px-4 py-2 border-b">
                                        {produto.nome}
                                        {/* Exibindo os insumos diretamente abaixo do nome do produto */}
                                        {insumosProduto[produto.id] && insumosProduto[produto.id].length > 0 && (
                                            <div className="text-sm text-blue-500 mt-2">
                                                {insumosProduto[produto.id].map((insumo, index) => {
                                                    const { insumo: insumoDetails, quantidade } = insumo;
                                                    return (
                                                        <span key={index}>
                                                                {quantidade > 0 ? `${quantidade} ` : ''}{insumoDetails.nome}
                                                            {index < insumosProduto[produto.id].length - 1 ? ', ' : '.'}
                                                            </span>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-2 border-b">{produto.categoria?.nome || 'Sem Categoria'}</td>
                                    <td className="px-4 py-2 border-b">{formatPreco(produto.preco)}</td>
                                    <td className="px-4 py-2 border-b">
                                            <span
                                                className={`inline-flex items-center px-2 text-sm rounded-full 
                                                ${produto.tipo ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}
                                            >
                                                {produto.tipo ? 'Ativo' : 'Inativo'}
                                            </span>
                                    </td>
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
