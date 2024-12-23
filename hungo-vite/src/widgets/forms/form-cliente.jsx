import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/axiosConfig';
import InputField from '../forms/input-field';
import { Alert, Button, Card, CardBody, CardHeader, Typography } from "@material-tailwind/react";
import { ArrowPathIcon, XMarkIcon } from "@heroicons/react/24/outline";

const ClienteForm = () => {
    const { id } = useParams();  // Pega o id da URL
    const navigate = useNavigate(); // Para navegar após a ação

    const [nome, setNome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');  // Novo estado para a confirmação de senha
    const [cpf, setCpf] = useState('');
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertColor, setAlertColor] = useState('green');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (id) {
            // Se o id for passado na URL, busque os dados do cliente
            const fetchCliente = async () => {
                try {
                    const response = await api.get(`/cliente/${id}`);
                    const { nome, telefone, email, cpf, senha } = response.data;
                    setNome(nome);
                    setTelefone(telefone);
                    setEmail(email);
                    setCpf(cpf);
                    setSenha(senha);
                } catch (error) {
                    setAlertMessage('Erro ao carregar os dados do cliente');
                    setAlertColor('red');
                    console.error('Erro ao buscar cliente:', error);
                }
            };
            fetchCliente();
        }
    }, [id]);  // Executa a busca apenas quando o id mudar

    // Verifica se o formulário é válido, incluindo a comparação das senhas
    const isFormValid = () => {
        const emailRegex = /\S+@\S+\.\S+/;
        return (
            nome && telefone && emailRegex.test(email) && senha && cpf && senha === confirmarSenha
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isFormValid()) {
            setAlertMessage('Por favor, preencha todos os campos obrigatórios corretamente e certifique-se de que as senhas são iguais.');
            setAlertColor('red');
            return;
        }

        setIsLoading(true);
        try {
            const clienteDTO = { nome, telefone, email, senha, cpf };

            if (id) {
                // Se tiver o id, realiza o PUT (edição)
                await api.put(`/cliente/${id}`, clienteDTO);
                setAlertMessage('Cliente editado com sucesso!');
            } else {
                // Caso contrário, realiza o POST (criação)
                await api.post('/cliente', clienteDTO);
                setAlertMessage('Cliente cadastrado com sucesso!');
            }

            setAlertColor('green');

            // Exibe a notificação por 2 segundos e depois redireciona
            setTimeout(() => {
                navigate('/dashboard/clientes');  // Navega para a lista de clientes após o sucesso
            }, 2000);
        } catch (error) {
            setAlertMessage('Erro ao cadastrar/editar cliente. Tente novamente.');
            setAlertColor('red');
            console.error('Erro na requisição:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Card className="bg-white w-full h-full flex-1 min-h-0 rounded-xl border border-blue-gray-100 lg:flex">
                <CardHeader variant="gradient" color="gray" className="my-4 p-4">
                    <Typography variant="h6" color="white">
                        {id ? 'Editar Cliente' : 'Cadastrar Cliente'}
                    </Typography>
                </CardHeader>
                <CardBody className="px-4 pt-0 pb-6">
                    <form onSubmit={handleSubmit} className="mt-8 max-w-screen-lg lg:w-full mx-auto">
                        <div className="mb-1 grid grid-cols-1 sm:grid-cols-8 gap-6">
                            <div className="col-span-1 sm:col-span-5">
                                <InputField label="Nome completo" placeholder="ex.: João Victor" value={nome}
                                            onChange={setNome} className="border border-red-400"/>
                            </div>
                            <div className="col-span-1 sm:col-span-3">
                                <InputField label="Telefone" placeholder="ex.: (99) 99999-9999" value={telefone}
                                            onChange={setTelefone} mask="(99) 99999-9999"/>
                            </div>
                            <div className="col-span-1 sm:col-span-5">
                                <InputField label="E-mail" placeholder="ex.: name@mail.com" value={email}
                                            onChange={setEmail} type="email"/>
                            </div>
                            <div className="col-span-1 sm:col-span-3">
                                <InputField label="CPF" placeholder="ex.: 000.000.000-00" value={cpf}
                                            onChange={setCpf} mask="999.999.999-99"/>
                            </div>

                            <div className="mt-4 border-b border-blue-gray-100 col-span-1 sm:col-span-8"/>

                            <div className="col-span-1 sm:col-span-4">
                                <InputField label="Senha" placeholder="Digite sua senha" type="password" value={senha}
                                            onChange={setSenha} />
                            </div>

                            <div className="col-span-1 sm:col-span-4">
                                <InputField label="Confirmar Senha" placeholder="Confirme sua senha" type="password"
                                            value={confirmarSenha} onChange={setConfirmarSenha} />
                            </div>
                        </div>

                        {senha && confirmarSenha && senha !== confirmarSenha && (
                            <div className="mt-4 w-full">
                                <Alert open color="red" className="relative flex items-center justify-between px-4 py-3 rounded-lg">
                                    <span>As senhas precisam ser iguais. Digite de novo.</span>
                                    <button
                                        onClick={() => setAlertMessage(null)}
                                        className="absolute top-1/2 right-4 transform -translate-y-1/2"
                                    >
                                        <XMarkIcon className="h-6 w-6 text-white hover:bg-white hover:bg-opacity-20 rounded-md" />
                                    </button>
                                </Alert>
                            </div>
                        )}

                        <div className="flex w-full justify-center">
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
                        </div>


                        {alertMessage && (
                            <div className="mt-8 w-full">
                                <Alert open color={alertColor}
                                       className="relative flex items-center justify-between px-4 py-3 rounded-lg">
                                    <span>{alertMessage}</span>
                                    <button onClick={() => setAlertMessage(null)}
                                            className="absolute top-1/2 right-4 transform -translate-y-1/2">
                                        <XMarkIcon
                                            className="h-6 w-6 text-white hover:bg-white hover:bg-opacity-20 rounded-md"/>
                                    </button>
                                </Alert>
                            </div>
                        )}
                    </form>
                </CardBody>
            </Card>
        </>
    );
};

export default ClienteForm;
