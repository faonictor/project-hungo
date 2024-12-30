import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/axiosConfig';
import InputField from '../forms/input-field';
import { Alert, Button, Card, CardBody, CardHeader, Typography } from "@material-tailwind/react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import AlertMessage from "@/widgets/alert-message.jsx";

const FuncionarioForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nome: '',
        telefone: '',
        email: '',
        senha: '',
        funcao: '',
        permissao: '',
        cpf: ''
    });
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertColor, setAlertColor] = useState('green');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (id) {
            const fetchFuncionario = async () => {
                try {
                    const response = await api.get(`/funcionario/${id}`);
                    setFormData(response.data);
                } catch (error) {
                    setAlertMessage('Erro ao carregar os dados do funcionário');
                    setAlertColor('red');
                    console.error('Erro ao buscar funcionário:', error);
                }
            };
            fetchFuncionario();
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const isFormValid = () => {
        return formData.nome.trim() !== '' && formData.email.trim() !== '' && formData.senha.trim() !== '' && formData.cpf.trim() !== '';
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
            if (id) {
                await api.put(`/funcionario/${id}`, formData);
                setAlertMessage('Funcionário editado com sucesso!');
            } else {
                await api.post('/funcionario', formData);
                setAlertMessage('Funcionário cadastrado com sucesso!');
            }

            setAlertColor('green');
            setTimeout(() => {
                navigate('/dashboard/funcionarios');
            }, 1000);
        } catch (error) {
            setAlertMessage('Erro ao cadastrar/editar funcionário. Tente novamente.');
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
                    {id ? 'Editar Funcionário' : 'Cadastrar Funcionário'}
                </Typography>
            </CardHeader>
            <CardBody className="px-4 pt-0 pb-6">
                <form onSubmit={handleSubmit} className="mt-8 max-w-screen-lg lg:w-full mx-auto">
                    <InputField label="Nome" name="nome" placeholder="ex.: João Silva" value={formData.nome} onChange={handleChange} />
                    <InputField label="Telefone" name="telefone" placeholder="ex.: (99) 99999-9999" value={formData.telefone} onChange={handleChange} />
                    <InputField label="E-mail" name="email" placeholder="ex.: email@mail.com" value={formData.email} onChange={handleChange} />
                    <InputField label="CPF" name="cpf" placeholder="ex.: 000.000.000-00" value={formData.cpf} onChange={handleChange} />
                    <InputField label="Senha" name="senha" type="password" value={formData.senha} onChange={handleChange} />
                    <InputField label="Função" name="funcao" placeholder="ex.: Gerente" value={formData.funcao} onChange={handleChange} />
                    <InputField label="Permissão" name="permissao" placeholder="ex.: ADMIN" value={formData.permissao} onChange={handleChange} />

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

export default FuncionarioForm;
