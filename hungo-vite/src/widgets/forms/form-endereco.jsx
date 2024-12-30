import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/axiosConfig';
import InputField from '../forms/input-field';
import { Button, Card, CardBody, CardHeader, Typography } from "@material-tailwind/react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import AlertMessage from "@/widgets/alert-message.jsx";

const EnderecoAddEdit = () => {
    const { id, clienteId } = useParams();
    const navigate = useNavigate();

    const [rua, setRua] = useState('');
    const [numero, setNumero] = useState('');
    const [complemento, setComplemento] = useState('');
    const [bairro, setBairro] = useState('');
    const [cidade, setCidade] = useState('');
    const [cep, setCep] = useState('');
    const [clienteNome, setClienteNome] = useState('');
    const [clientes, setClientes] = useState([]);
    const [clienteIdState, setClienteIdState] = useState('');
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertColor, setAlertColor] = useState('green');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const response = await api.get('/cliente');
                setClientes(response.data);
            } catch (error) {
                setAlertMessage('Erro ao carregar os clientes');
                setAlertColor('red');
                console.error('Erro ao carregar clientes:', error);
            }
        };

        const fetchEndereco = async () => {
            try {
                const response = await api.get(`/endereco/${id}`);
                const { rua, numero, complemento, bairro, cidade, cep, cliente } = response.data;
                setRua(rua);
                setNumero(numero ? String(numero) : '');
                setComplemento(complemento);
                setBairro(bairro);
                setCidade(cidade);
                setCep(cep);
                setClienteIdState(cliente.id);
                setClienteNome(cliente.nome);
            } catch (error) {
                setAlertMessage('Erro ao carregar os dados do endereço');
                setAlertColor('red');
                console.error('Erro ao buscar endereço:', error);
            }
        };

        const fetchClienteById = async (clienteId) => {
            try {
                const response = await api.get(`/cliente/${clienteId}`);
                setClienteIdState(response.data.id);
                setClienteNome(response.data.nome);
            } catch (error) {
                setAlertMessage('Erro ao carregar o cliente');
                setAlertColor('red');
                console.error('Erro ao buscar cliente:', error);
            }
        };

        fetchClientes();

        if (id) {
            fetchEndereco();
        } else if (clienteId) {
            fetchClienteById(clienteId);
        }
    }, [id, clienteId]);

    const isFormValid = () => {
        return (
            rua !== '' &&
            numero !== '' &&
            bairro !== '' &&
            cidade !== '' &&
            cep !== '' &&
            clienteIdState !== ''
        );
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
            const enderecoDTO = { rua, numero, complemento, bairro, cidade, cep, cliente: { id: clienteIdState } };

            if (id) {
                await api.put(`/endereco/${id}`, enderecoDTO);
                setAlertMessage('Endereço editado com sucesso!');
            } else {
                await api.post('/endereco', enderecoDTO);
                setAlertMessage('Endereço cadastrado com sucesso!');
            }

            setAlertColor('green');
            setTimeout(() => {
                navigate('/dashboard/clientes');
            }, 500);
        } catch (error) {
            setAlertMessage('Erro ao cadastrar/editar endereço. Tente novamente.');
            setAlertColor('red');
            console.error('Erro na requisição:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (clientes.length === 0) {
        return <div>Carregando clientes...</div>;
    }

    return (
        <Card className="bg-white w-full h-full flex-1 min-h-0 rounded-xl border border-blue-gray-100 lg:flex">
            <CardHeader variant="gradient" color="gray" className="my-4 p-4">
                <Typography variant="h6" color="white">
                    {id ? 'Editar Endereço' : 'Cadastrar Endereço'}
                </Typography>
            </CardHeader>
            <CardBody className="px-4 pt-0 pb-6">
                <form onSubmit={handleSubmit} className="mt-8 max-w-screen-lg lg:w-full mx-auto">
                    <InputField label="Rua" placeholder="ex.: Rua das Flores" value={rua} onChange={setRua} />
                    <InputField label="Número" placeholder="ex.: 123" value={numero} onChange={setNumero} />
                    <InputField label="Complemento" placeholder="ex.: Apto 101" value={complemento} onChange={setComplemento} />
                    <InputField label="Bairro" placeholder="ex.: Centro" value={bairro} onChange={setBairro} />
                    <InputField label="Cidade" placeholder="ex.: São Paulo" value={cidade} onChange={setCidade} />
                    <InputField label="CEP" placeholder="ex.: 12345-678" value={cep} onChange={setCep} />

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Cliente</label>
                        <select
                            value={clienteIdState}
                            onChange={(e) => setClienteIdState(e.target.value)}
                            className="mt-2 block w-full px-4 py-2 text-base border border-gray-300 rounded-lg"
                            disabled={id || clienteId} // Desabilitar se for edição ou clienteId passado
                        >
                            <option value="">Selecione um cliente</option>
                            {clientes.map(cliente => (
                                <option key={cliente.id} value={cliente.id}>
                                    {cliente.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Button
                        type="submit"
                        className={`mt-6 w-32 flex items-center justify-center ${id ? 'bg-green-500 hover:bg-green-600' : ''}`}
                        disabled={!isFormValid() || isLoading}
                    >
                        {isLoading ? (
                            <ArrowPathIcon className="h-4 w-4 text-white animate-spin" />
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

export default EnderecoAddEdit;
