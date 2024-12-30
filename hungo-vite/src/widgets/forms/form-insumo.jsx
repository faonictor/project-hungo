import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/axiosConfig';
import InputField from '../forms/input-field';
import { Alert, Button, Card, CardBody, CardHeader, Typography } from "@material-tailwind/react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import AlertMessage from "@/widgets/alert-message.jsx";

const InsumoForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [nome, setNome] = useState('');
    const [preco, setPreco] = useState('');
    const [quantidade, setQuantidade] = useState('');
    const [unidadeMedida, setUnidadeMedida] = useState('');
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertColor, setAlertColor] = useState('green');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (id) {
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
            fetchInsumo();
        }
    }, [id]);

    const isFormValid = () => {
        return nome.trim() !== '' && preco > 0 && quantidade > 0 && unidadeMedida.trim() !== '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isFormValid()) {
            setAlertMessage('Por favor, preencha todos os campos obrigatórios com valores válidos.');
            setAlertColor('red');
            return;
        }

        setIsLoading(true);
        try {
            const insumoDTO = { nome, preco, quantidade, unidadeMedida };

            if (id) {
                await api.put(`/insumo/${id}`, insumoDTO);
                setAlertMessage('Insumo editado com sucesso!');
            } else {
                await api.post('/insumo', insumoDTO);
                setAlertMessage('Insumo cadastrado com sucesso!');
            }

            setAlertColor('green');
            setTimeout(() => {
                navigate('/dashboard/insumos');
            }, 1000);
        } catch (error) {
            setAlertMessage('Erro ao cadastrar/editar insumo. Tente novamente.');
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
                    {id ? 'Editar Insumo' : 'Cadastrar Insumo'}
                </Typography>
            </CardHeader>
            <CardBody className="px-4 pt-0 pb-6">
                <form onSubmit={handleSubmit} className="mt-8 max-w-screen-lg lg:w-full mx-auto">
                    <InputField label="Nome" placeholder="ex.: Farinha de Trigo" value={nome} onChange={setNome} />
                    <InputField label="Preço" placeholder="ex.: 15.50" value={preco} onChange={setPreco} type="number" />
                    <InputField label="Quantidade" placeholder="ex.: 10" value={quantidade} onChange={setQuantidade} type="number" />
                    <InputField label="Unidade de Medida" placeholder="ex.: kg" value={unidadeMedida} onChange={setUnidadeMedida} />

                    <Button
                        type="submit"
                        className={`mt-6 w-32 flex items-center justify-center ${id ? 'bg-green-500 hover:bg-green-600' : ''}`}
                        disabled={!isFormValid() || isLoading}
                    >
                        {isLoading ? (
                            <ArrowPathIcon className="h-4 w-4 text-white animate-spin"/>
                        ) : (
                            id ? 'Editar' : 'Cadastrar'
                        )}
                    </Button>

                    <AlertMessage alertMessage={alertMessage} alertColor={alertColor} onClose={() => setAlertMessage(null)} />
                </form>
            </CardBody>
        </Card>
    );
};

export default InsumoForm;
