import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/axiosConfig';
import InputField from '../forms/input-field';
import { Alert, Button, Card, CardBody, CardHeader, Typography } from "@material-tailwind/react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import AlertMessage from "@/widgets/alert-message.jsx";

const ProdutoForm = () => {
    const navigate = useNavigate();

    // Estados para armazenar os dados
    const [nome, setNome] = useState('');
    const [preco, setPreco] = useState('');
    const [categoriaId, setCategoriaId] = useState('');
    const [insumos, setInsumos] = useState([]);
    const [selectedInsumos, setSelectedInsumos] = useState([{ insumoId: '', quantidade: '' }]);
    const [categorias, setCategorias] = useState([]);
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertColor, setAlertColor] = useState('green');
    const [isLoading, setIsLoading] = useState(false);

    // Carregar categorias e insumos do banco de dados
    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const response = await api.get('/categoria');
                setCategorias(response.data); // Supondo que a resposta seja um array de categorias
            } catch (error) {
                console.error('Erro ao carregar categorias', error);
                setAlertMessage('Erro ao carregar categorias.');
                setAlertColor('red');
            }
        };

        const fetchInsumos = async () => {
            try {
                const response = await api.get('/insumo');
                setInsumos(response.data); // Supondo que a resposta seja um array de insumos
            } catch (error) {
                console.error('Erro ao carregar insumos', error);
                setAlertMessage('Erro ao carregar insumos.');
                setAlertColor('red');
            }
        };

        fetchCategorias();
        fetchInsumos();
    }, []);

    // Função para validar o formulário
    const isFormValid = () => {
        return nome && preco && categoriaId && selectedInsumos.every(insumo => insumo.insumoId && insumo.quantidade);
    };

    // Função para adicionar um novo insumo
    const handleAddInsumo = () => {
        setSelectedInsumos([...selectedInsumos, { insumoId: '', quantidade: '' }]);
    };

    // Função para atualizar os valores dos insumos selecionados
    const handleInsumoChange = (index, field, value) => {
        const updatedInsumos = [...selectedInsumos];
        updatedInsumos[index][field] = value;
        setSelectedInsumos(updatedInsumos);
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
            // Certifique-se de que todos os dados estão corretamente estruturados
            const produtoDTO = { nome, preco, categoriaId, insumos: selectedInsumos };

            console.log('Dados para salvar:', produtoDTO); // Adicione esse console.log para verificar os dados

            // Enviar dados para cadastro
            await api.post('/produtodto', produtoDTO);  // Certifique-se de que o endpoint está correto no backend
            setAlertMessage('Produto cadastrado com sucesso!');
            setAlertColor('green');

            // Redirecionar após o cadastro
            setTimeout(() => {
                navigate('/dashboard/produtos');
            }, 1000);
        } catch (error) {
            setAlertMessage('Erro ao cadastrar produto. Tente novamente.');
            setAlertColor('red');
            console.error('Erro na requisição:', error);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <Card className="bg-white w-full h-full flex-1 min-h-0 rounded-xl border border-blue-gray-100 lg:flex">
            <CardHeader variant="gradient" color="gray" className="my-4 p-4">
                <Typography variant="h6" color="white">
                    Cadastrar Produto
                </Typography>
            </CardHeader>
            <CardBody className="px-4 pt-0 pb-6">
                <form onSubmit={handleSubmit} className="mt-8 max-w-screen-lg lg:w-full mx-auto">
                    <div className="mb-1 grid grid-cols-1 sm:grid-cols-8 gap-6">
                        <div className="col-span-1 sm:col-span-5">
                            <InputField
                                label="Nome do Produto"
                                placeholder="ex.: Produto A"
                                value={nome}
                                onChange={setNome}
                                className="border border-red-400"
                            />
                        </div>

                        <div className="col-span-1 sm:col-span-3">
                            <InputField
                                label="Preço"
                                placeholder="ex.: 99.99"
                                value={preco}
                                onChange={setPreco}
                                type="number"
                                step="0.01"
                            />
                        </div>
                    </div>

                    {/* Campo Categoria */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700">Categoria</label>
                        <select
                            value={categoriaId}
                            onChange={(e) => setCategoriaId(e.target.value)}
                            className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md"
                        >
                            <option value="">Selecione uma categoria</option>
                            {categorias.map(categoria => (
                                <option key={categoria.id} value={categoria.id}>
                                    {categoria.nome} {/* Supondo que a categoria tenha campos id e nome */}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Campo Insumos */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700">Insumos</label>
                        {selectedInsumos.map((insumo, index) => (
                            <div key={index} className="flex space-x-4 mb-2">
                                <select
                                    value={insumo.insumoId}
                                    onChange={(e) => handleInsumoChange(index, 'insumoId', e.target.value)}
                                    className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md"
                                >
                                    <option value="">Selecione um insumo</option>
                                    {insumos.map(ins => (
                                        <option key={ins.id} value={ins.id}>
                                            {ins.nome} {/* Supondo que o insumo tenha campos id e nome */}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    className="w-24 px-4 py-2 mt-2 border border-gray-300 rounded-md"
                                    value={insumo.quantidade}
                                    onChange={(e) => handleInsumoChange(index, 'quantidade', e.target.value)}
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={handleAddInsumo}
                            className="mt-2 text-blue-500"
                        >
                            Adicionar Insumo
                        </button>
                    </div>

                    <div className="flex w-full justify-center">
                        <Button
                            type="submit"
                            className={`mt-6 w-32 flex items-center justify-center`}
                            disabled={!isFormValid() || isLoading}
                        >
                            {isLoading ? (
                                <ArrowPathIcon className="h-4 w-4 text-white animate-spin" />
                            ) : (
                                'Cadastrar'
                            )}
                        </Button>
                    </div>

                    {/* Notificação */}
                    <AlertMessage
                        alertMessage={alertMessage}
                        alertColor={alertColor}
                        onClose={() => setAlertMessage(null)}
                    />
                </form>
            </CardBody>
        </Card>
    );
};

export default ProdutoForm;
