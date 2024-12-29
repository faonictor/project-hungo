import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/axiosConfig';
import InputField from '../forms/input-field';
import { Alert, Button, Card, CardBody, CardHeader, Typography } from "@material-tailwind/react";
import { ArrowPathIcon, XMarkIcon } from "@heroicons/react/24/outline"; // Ícone de "X"
import AlertMessage from "@/widgets/alert-message.jsx";
import SelectField from "@/widgets/forms/select-field.jsx";
import {PlusIcon} from "@heroicons/react/24/solid";

const ProdutoForm = () => {
    const navigate = useNavigate();
    const { id } = useParams(); {/* Pega o ID da URL, caso seja para editar um produto */}

    {/* Estados para armazenar os dados */}
    const [nome, setNome] = useState('');
    const [preco, setPreco] = useState('');
    const [categoriaId, setCategoriaId] = useState('');
    const [insumos, setInsumos] = useState([]);
    const [selectedInsumos, setSelectedInsumos] = useState([{ insumoId: '', quantidade: '' }]);
    const [categorias, setCategorias] = useState([]);
    const [tipo, setTipo] = useState(true); {/* Tipo: true para ativo, false para inativo */}
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
                    const response = await api.get(`/produto/${id}`); {/* Alterado para /produto/{id} */}
                    const produto = response.data;

                    {/* Preenche os estados com os dados do produto */}
                    setNome(produto.nome);
                    setPreco(produto.preco);
                    setCategoriaId(produto.categoriaId);
                    setTipo(produto.tipo); {/* Definindo o tipo conforme o produto */}
                    setSelectedInsumos(produto.insumos || []); {/* Certificando que é um array */}
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

    {/* Função para validar o formulário */}
    const isFormValid = () => {
        return nome && preco && categoriaId && (selectedInsumos.length === 0 || selectedInsumos.every(insumo => insumo.insumoId));
    };

    {/* Função para adicionar um novo insumo */}
    const handleAddInsumo = () => {
        setSelectedInsumos([...selectedInsumos, { insumoId: '', quantidade: '' }]);
    };

    {/* Função para remover um insumo */}
    const handleRemoveInsumo = (index) => {
        const updatedInsumos = selectedInsumos.filter((_, i) => i !== index);
        setSelectedInsumos(updatedInsumos);
    };

    {/* Função para atualizar os valores dos insumos selecionados */}
    const handleInsumoChange = (index, field, value) => {
        const updatedInsumos = [...selectedInsumos];
        updatedInsumos[index][field] = value;
        setSelectedInsumos(updatedInsumos);
    };

    {/* Função de envio de dados */}
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
                tipo,
                insumos: selectedInsumos.length > 0 ? selectedInsumos : []
            };
            if (id) {
                await api.put(`/produto/${id}`, produtoDTO);
                setAlertMessage('Produto atualizado com sucesso!');
            } else {
                await api.post('/produto', produtoDTO);
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
                    <div className="mb-1 grid grid-cols-1 sm:grid-cols-12 gap-4">
                        <div className="col-span-1 sm:col-span-5">
                            <InputField
                                label="Nome do Produto"
                                placeholder="ex.: X-Tudo"
                                value={nome}
                                onChange={setNome}
                                className="border border-red-400"
                            />
                        </div>

                        <div className="col-span-1 sm:col-span-2">
                            <InputField
                                label="Preço"
                                placeholder="ex.: 9.99"
                                value={preco}
                                onChange={setPreco}
                                type="number"
                                step="0.5"
                            />
                        </div>

                        <div className="col-span-1 sm:col-span-3">
                            <SelectField
                                label="Categoria"
                                value={categoriaId}
                                onChange={(value) => setCategoriaId(value)}
                                options={categorias.map((categoria) => ({
                                    value: categoria.id,
                                    label: categoria.nome,
                                }))}
                                placeholder="Selecione uma categoria"
                            />
                        </div>

                        <div className="col-span-1 sm:col-span-2">
                            <SelectField
                                label="Status"
                                value={tipo}
                                onChange={(value) => setTipo(value === 'true')}
                                options={[
                                    {value: 'true', label: 'Ativo'},
                                    {value: 'false', label: 'Inativo'},
                                ]}
                                placeholder="Selecione o tipo"
                            />
                        </div>

                        <div className="col-span-1 sm:col-span-12 border-t border-blue-gray-200 my-4 pt-4">
                            <div className="space-y-2">
                                {selectedInsumos.map((insumo, index) => (
                                    <div key={index} className="grid grid-cols-8 sm:grid-cols-12 gap-4 items-center">
                                        {/* SelectField para o campo insumo */}
                                        <div className="col-span-4 sm:col-span-10">
                                            <SelectField
                                                label="Item"
                                                value={insumo.insumoId}
                                                onChange={(value) => handleInsumoChange(index, 'insumoId', value)}
                                                options={insumos.map(ins => ({value: ins.id, label: ins.nome}))}
                                                placeholder="Adicione um item"
                                            />
                                        </div>

                                        <InputField
                                            label="Quantidade"
                                            type="number"
                                            value={insumo.quantidade}
                                            onChange={(e) => handleInsumoChange(index, 'quantidade', e)}
                                            min="0"
                                            step="1"
                                            placeholder="0"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => handleRemoveInsumo(index)}
                                            className="flex text-red-400 rounded-md justify-center items-center hover:bg-red-100 h-8 w-8 -ml-3 mt-6"
                                        >
                                            <XMarkIcon className="h-6 w-6"/>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Botão para adicionar insumo */}
                            <div className="mt-4 col-span-8">
                                <button
                                    type="button"
                                    onClick={handleAddInsumo}
                                    className="justify-center items-center  py-1 px-2 text-blue-500 rounded-full flex gap-1 hover:bg-blue-50"
                                >
                                    <PlusIcon className="h-5 w-5"/>
                                    Adicionar Insumo
                                </button>
                            </div>
                        </div>
                    </div>


                    <div className="flex w-full justify-center">
                        <Button
                            type="submit"
                            className={`mt-6 w-32 flex items-center justify-center mb-4`}
                            disabled={!isFormValid() || isLoading}
                        >
                            {isLoading ? (
                                <ArrowPathIcon className="h-4 w-4 text-white animate-spin"/>
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
