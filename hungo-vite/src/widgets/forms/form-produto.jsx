import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/axiosConfig';
import InputField from '../forms/input-field';
import { Alert, Button, Card, CardBody, CardHeader, Typography } from "@material-tailwind/react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import AlertMessage from "@/widgets/alert-message.jsx";

const ProdutoForm = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Pega o ID da URL, caso seja para editar um produto

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

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const response = await api.get('/categoria');
                setCategorias(response.data);
            } catch (error) {
                console.error('Erro ao carregar categorias', error);
                setAlertMessage('Erro ao carregar categorias.');
                setAlertColor('red');
            }
        };

        const fetchInsumos = async () => {
            try {
                const response = await api.get('/insumo');
                setInsumos(response.data);
            } catch (error) {
                console.error('Erro ao carregar insumos', error);
                setAlertMessage('Erro ao carregar insumos.');
                setAlertColor('red');
            }
        };

        const fetchProduto = async () => {
            if (id) {
                try {
                    const response = await api.get(`/produto/${id}`); // Alterado para /produto/{id}
                    const produto = response.data;

                    // Preenche os estados com os dados do produto
                    setNome(produto.nome);
                    setPreco(produto.preco);
                    setCategoriaId(produto.categoriaId);
                    setSelectedInsumos(produto.insumos || []); // Certificando que é um array
                } catch (error) {
                    console.error('Erro ao carregar produto:', error);
                    setAlertMessage('Erro ao carregar os dados do produto.');
                    setAlertColor('red');
                }
            }
        };

        fetchCategorias();
        fetchInsumos();

        if (id) {
            fetchProduto();
        }
    }, [id]);

    // Função para validar o formulário
    const isFormValid = () => {
        return nome && preco && categoriaId && (selectedInsumos.length === 0 || selectedInsumos.every(insumo => insumo.insumoId && insumo.quantidade));
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

    // Função de envio de dados
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isFormValid()) {
            setAlertMessage('Por favor, preencha todos os campos obrigatórios.');
            setAlertColor('red');
            return;
        }

        setIsLoading(true);

        try {
            const produtoDTO = {
                nome,
                preco,
                categoriaId,
                insumos: selectedInsumos.length > 0 ? selectedInsumos : [] // Envia insumos como array vazio se não houver insumos
            };

            if (id) {
                // Atualizar produto existente
                await api.put(`/produto/${id}`, produtoDTO); // Alterado para /produto/{id}
                setAlertMessage('Produto atualizado com sucesso!');
            } else {
                // Criar novo produto
                await api.post('/produto', produtoDTO); // Alterado para /produto
                setAlertMessage('Produto cadastrado com sucesso!');
            }

            setAlertColor('green');
            setTimeout(() => {
                navigate('/dashboard/produtos');
            }, 1000);
        } catch (error) {
            console.error('Erro na requisição:', error);
            setAlertMessage('Erro ao salvar produto. Tente novamente.');
            setAlertColor('red');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="bg-white w-full h-full flex-1 min-h-0 rounded-xl border border-blue-gray-100 lg:flex">
            <CardHeader variant="gradient" color="gray" className="my-4 p-4">
                <Typography variant="h6" color="white">
                    {id ? "Editar Produto" : "Cadastrar Produto"}
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
                                    {categoria.nome}
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
                                            {ins.nome}
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
                                id ? 'Atualizar' : 'Cadastrar'
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