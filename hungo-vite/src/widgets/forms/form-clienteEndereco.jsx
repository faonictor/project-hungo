import React, { useState } from 'react';
import {Button, Typography, Alert, CardHeader, Card, CardBody} from "@material-tailwind/react";
import { XMarkIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import api from '../../services/axiosConfig';
import InputField from '../forms/input-field';

const ClienteDeliveryForm = () => {
    const [nome, setNome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [email, setEmail] = useState('');
    const [cpf, setCpf] = useState('');
    const [rua, setRua] = useState('');
    const [numero, setNumero] = useState('');
    const [complemento, setComplemento] = useState('');
    const [bairro, setBairro] = useState('');
    const [cidade, setCidade] = useState('');

    const [alertMessage, setAlertMessage] = useState(null);
    const [alertColor, setAlertColor] = useState('green');
    const [isLoading, setIsLoading] = useState(false);

    const isFormValid = () => {
        const emailRegex = /\S+@\S+\.\S+/;
        return (
            nome && telefone && emailRegex.test(email) && rua && numero && bairro && cidade
        );
    };

    const resetFields = () => {
        setNome(''); setTelefone(''); setEmail(''); setCpf('');
        setRua(''); setNumero(''); setComplemento('');
        setBairro(''); setCidade('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isFormValid()) {
            setAlertMessage('Por favor, preencha todos os campos obrigatórios corretamente.');
            setAlertColor('red');
            return;
        }

        setIsLoading(true);
        try {
            const clienteEnderecoDTO = { nome, telefone, email, cpf, rua, numero, complemento, bairro, cidade };
            const response = await api.post('/cliente-endereco', clienteEnderecoDTO);

            setAlertMessage('Cliente cadastrado com sucesso!');
            setAlertColor('green');
            resetFields();
            console.log('Resposta do servidor:', response.data);
        } catch (error) {
            setAlertMessage('Erro ao cadastrar cliente. Tente novamente.');
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
                        Cadastro Cliente Delivery
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

                            <div className="col-span-1 sm:col-span-6">
                                <InputField label="Rua" placeholder="ex.: Av. Quadrada" value={rua}
                                            onChange={setRua}/>
                            </div>
                            <div className="col-span-1 sm:col-span-2">
                                <InputField label="Número" placeholder="ex.: 333" type="number" value={numero}
                                            onChange={setNumero}/>
                            </div>
                            <div className="col-span-1 sm:col-span-3">
                                <InputField label="Complemento" placeholder="ex.: Apto 101" value={complemento}
                                            onChange={setComplemento}/>
                            </div>
                            <div className="col-span-1 sm:col-span-3">
                                <InputField label="Bairro" placeholder="ex.: Centro" value={bairro}
                                            onChange={setBairro}/>
                            </div>
                            <div className="col-span-1 sm:col-span-2">
                                <InputField label="Cidade" placeholder="ex.: Afogados" value={cidade}
                                            onChange={setCidade}/>
                            </div>
                        </div>

                        <div className="flex w-full justify-center">
                            <Button type="submit" className="mt-6 w-32 flex items-center justify-center"
                                    disabled={!isFormValid() || isLoading}>
                                {isLoading ?
                                    <ArrowPathIcon className="h-4 w-4 text-white animate-spin"/> : 'Cadastrar'}
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
}

export default ClienteDeliveryForm;
