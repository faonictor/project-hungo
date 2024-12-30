import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/axiosConfig';
import InputField from '../forms/input-field';
import { Button, Card, CardBody, CardHeader, Typography } from "@material-tailwind/react";
import { ArrowPathIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';

import AlertMessage from "@/widgets/alert-message.jsx";

const formatPreco = (preco) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(preco);
};

const InsumoForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [nome, setNome] = useState('');
    const [preco, setPreco] = useState('');
    const [quantidade, setQuantidade] = useState('');
    const [unidadeMedida, setUnidadeMedida] = useState('');
    const [insumos, setInsumos] = useState([]);
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertColor, setAlertColor] = useState('green');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchInsumos = async () => {
            try {
                const response = await api.get('/insumo');
                setInsumos(response.data);
            } catch (error) {
                setAlertMessage('Erro ao carregar os insumos');
                setAlertColor('red');
                console.error('Erro ao buscar insumos:', error);
            }
        };

        const fetchInsumo = async () => {
            try {
                const response = await api.get(`/insumo/${id}`);
                const { nome, preco, quantidade, unidadeMedida } = response.data;
                setNome(nome);
                setPreco(preco);
                setQuantidade(quantidade);
                setUnidadeMedida(unidadeMedida);
            } catch (error) {
                setAlertMessage('Erro ao carregar os dados do insumo');
                setAlertColor('red');
                console.error('Erro ao buscar insumo:', error);
            }
        };

        fetchInsumos();

        if (id) {
            fetchInsumo();
        }
    }, [id]);

    const isFormValid = () => {
        return nome !== '' && preco !== '' && quantidade !== '' && unidadeMedida !== '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isFormValid()) {
            setAlertMessage('Por favor, preencha todos os campos obrigatórios.');
            setAlertColor('red');
            return;
        }

        setIsLoading(true);
        try {
            const insumoDTO = { nome, preco, quantidade, unidadeMedida };

            if (id) {
                await api.put(`/insumo/${id}`, insumoDTO);
                setAlertMessage('Insumo editado com sucesso!');
                setInsumos(insumos.map(insumo => insumo.id === id ? { ...insumo, nome, preco, quantidade, unidadeMedida } : insumo));
                navigate('/dashboard/insumo'); // Redireciona para a tela de insumos
            } else {
                const response = await api.post('/insumo', insumoDTO);
                setAlertMessage('Insumo cadastrado com sucesso!');
                setInsumos([...insumos, response.data]);
            }

            setAlertColor('green');
            setNome('');
            setPreco('');
            setQuantidade('');
            setUnidadeMedida('');
        } catch (error) {
            setAlertMessage('Erro ao cadastrar/editar insumo. Tente novamente.');
            setAlertColor('red');
            console.error('Erro na requisição:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (insumoId) => {
        const insumo = insumos.find(insumo => insumo.id === insumoId);
        if (insumo) {
            setNome(insumo.nome);
            setPreco(insumo.preco);
            setQuantidade(insumo.quantidade);
            setUnidadeMedida(insumo.unidadeMedida);
            navigate(`/dashboard/insumo/${insumoId}`);
        }
    };

    const handleDelete = async (insumoId) => {
        try {
            await api.delete(`/insumo/${insumoId}`);
            setInsumos(insumos.filter(insumo => insumo.id !== insumoId));
            setAlertMessage('Insumo excluído com sucesso!');
            setAlertColor('green');
        } catch (error) {
            setAlertMessage('Erro ao excluir insumo. Tente novamente.');
            setAlertColor('red');
            console.error('Erro ao excluir insumo:', error);
        }
    };

    const handlePrecoChange = (e) => {
        const value = e.target.value.replace(/[^\d,\.]/g, '').replace(',', '.'); // Limpar qualquer caractere não numérico
        setPreco(value);
    };

    return (
        <>
            <Card className="bg-white w-full h-full flex-1 min-h-0 rounded-xl border  border-blue-gray-100 lg:flex">
                <CardHeader variant="gradient" color="gray" className="my-4 p-4">
                    <Typography variant="h6" color="white">
                        {id ? 'Editar Insumo' : 'Cadastrar Insumo'}
                    </Typography>
                </CardHeader>
                <CardBody className="px-4 pt-0 pb-6 flex flex-col justify-center items-center">
                    <form onSubmit={handleSubmit} className="mt-8 max-w-screen-lg lg:w-full mx-auto">
                        <div className="mb-1 grid grid-cols-1 sm:grid-cols-10 gap-6">
                            <div className="col-span-1 sm:col-span-4">
                                <InputField label="Nome" placeholder="ex.: Insumo A" value={nome} onChange={setNome} />
                            </div>
                            <div className="col-span-1 sm:col-span-2">
                                <InputField
                                    label="Preço"
                                    type="text"
                                    placeholder="ex.: R$ 0,99"
                                    value={preco ? formatPreco(preco) : ''}
                                    onChange={handlePrecoChange}
                                />
                            </div>
                            <div className="col-span-1 sm:col-span-2">
                                <InputField label="Quantidade" type="number" placeholder="ex.: 10" value={quantidade} onChange={setQuantidade} />
                            </div>
                            <div className="col-span-1 sm:col-span-2">
                                <InputField label="Unidade de Medida" placeholder="ex.: kg, unidade" value={unidadeMedida} onChange={setUnidadeMedida} />
                            </div>
                            <div className="flex col-span-1 sm:col-span-10 w-full justify-center items-center">
                                <Button
                                    type="submit"
                                    className={`mt-6 w-32 mb-4 flex items-center justify-center ${id ? 'bg-green-500 hover:bg-green-600' : ''}`}
                                    disabled={!isFormValid() || isLoading}
                                >
                                    {isLoading ? (
                                        <ArrowPathIcon className="h-4 w-4 text-white animate-spin" />
                                    ) : (
                                        id ? 'Editar' : 'Cadastrar'
                                    )}
                                </Button>
                            </div>
                        </div>
                        <AlertMessage
                            alertMessage={alertMessage}
                            alertColor={alertColor}
                            onClose={() => setAlertMessage(null)}
                        />
                    </form>

                    <div className="overflow-x-auto w-full md:w-1/2 bg-white shadow-md rounded-lg mt-8">
                        <table className="min-w-full table-auto">
                            <thead>
                            <tr>
                                <th className="px-4 py-2 border-b text-left">ID</th>
                                <th className="px-4 py-2 border-b text-left">Nome</th>
                                <th className="px-4 py-2 border-b text-left">Preço</th>
                                <th className="px-4 py-2 border-b text-left">Quantidade</th>
                                <th className="px-4 py-2 border-b text-left">Unidade de Medida</th>
                                <th className="pr-4 py-2 border-b text-left">Ações</th>
                            </tr>
                            </thead>
                            <tbody>
                            {insumos.map((insumo) => (
                                <tr key={insumo.id}>
                                    <td className="px-4 py-2 border-b">{insumo.id}</td>
                                    <td className="px-4 py-2 border-b">{insumo.nome}</td>
                                    <td className="px-4 py-2 border-b">{formatPreco(insumo.preco)}</td>
                                    <td className="px-4 py-2 border-b">{insumo.quantidade}</td>
                                    <td className="px-4 py-2 border-b">{insumo.unidadeMedida}</td>
                                    <td className="pr-4 py-2 border-b space-x-2">
                                        <button onClick={() => handleEdit(insumo.id)}>
                                            <div className="p-1 rounded-md text-blue-gray-500 hover:bg-blue-100 active:text-blue-500">
                                                <PencilIcon className="w-5 h-5" />
                                            </div>
                                        </button>
                                        <button onClick={() => handleDelete(insumo.id)}>
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
                </CardBody>
            </Card>
        </>
    );
};

export default InsumoForm;
