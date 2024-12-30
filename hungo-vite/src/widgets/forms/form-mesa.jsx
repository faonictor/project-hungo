import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/axiosConfig';
import InputField from '../forms/input-field';
import { Alert, Button, Card, CardBody, CardHeader, Typography } from "@material-tailwind/react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import AlertMessage from "@/widgets/alert-message.jsx";

const MesaForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [nome, setNome] = useState('');
    const [status, setStatus] = useState('');
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertColor, setAlertColor] = useState('green');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (id) {
            const fetchMesa = async () => {
                try {
                    const response = await api.get(`/mesa/${id}`);
                    const { nome, status } = response.data;
                    setNome(nome);
                    setStatus(status);
                } catch (error) {
                    setAlertMessage('Erro ao carregar os dados da mesa');
                    setAlertColor('red');
                    console.error('Erro ao buscar mesa:', error);
                }
            };
            fetchMesa();
        }
    }, [id]);

    const isFormValid = () => {
        return nome.trim() !== '' && status.trim() !== '';
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
            const mesaDTO = { nome, status };

            if (id) {
                await api.put(`/mesa/${id}`, mesaDTO);
                setAlertMessage('Mesa editada com sucesso!');
            } else {
                await api.post('/mesa', mesaDTO);
                setAlertMessage('Mesa cadastrada com sucesso!');
            }

            setAlertColor('green');
            setTimeout(() => {
                navigate('/dashboard/mesas');
            }, 1000);
        } catch (error) {
            setAlertMessage('Erro ao cadastrar/editar mesa. Tente novamente.');
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
                    {id ? 'Editar Mesa' : 'Cadastrar Mesa'}
                </Typography>
            </CardHeader>
            <CardBody className="px-4 pt-0 pb-6">
                <form onSubmit={handleSubmit} className="mt-8 max-w-screen-lg lg:w-full mx-auto">
                    <InputField label="Nome" placeholder="ex.: Mesa 1" value={nome} onChange={setNome} />
                    <InputField label="Status" placeholder="ex.: Disponível" value={status} onChange={setStatus} />

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

export default MesaForm;
