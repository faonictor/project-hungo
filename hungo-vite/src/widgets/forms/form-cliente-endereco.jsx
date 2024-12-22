import React, { useState } from 'react';
import { Input, Button, Typography, Alert } from "@material-tailwind/react";
import { InformationCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import api from '../../services/axiosConfig';  // Importando a configuração do axios

export function ClienteEnderecoForm() {
    // Estado para os campos do formulário
    const [nome, setNome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [email, setEmail] = useState('');
    const [cpf, setCpf] = useState('');
    const [rua, setRua] = useState('');
    const [numero, setNumero] = useState('');
    const [complemento, setComplemento] = useState('');
    const [bairro, setBairro] = useState('');
    const [cidade, setCidade] = useState('');
    const [cep, setCep] = useState('');
    const [alertMessage, setAlertMessage] = useState(null);  // Para exibir as mensagens de sucesso ou erro
    const [alertColor, setAlertColor] = useState('green');  // Definindo a cor do alerta (verde para sucesso, vermelho para erro)
    const [showAlert, setShowAlert] = useState(true); // Controla a visibilidade da notificação

    // Função para enviar o formulário
    const handleSubmit = async (e) => {
        e.preventDefault();  // Impede o comportamento padrão do formulário

        // Construindo o DTO com os dados do formulário
        const clienteEnderecoDTO = {
            nome,
            telefone,
            email,
            cpf,
            rua,
            numero,
            complemento,
            bairro,
            cidade,
            cep,
        };

        try {
            // Enviando a requisição POST para a API
            const response = await api.post('/cliente-endereco', clienteEnderecoDTO);

            // Exibindo mensagem de sucesso
            setAlertMessage('Cliente cadastrado com sucesso!');
            setAlertColor('green');
            console.log('Resposta do servidor:', response.data);

            // Limpar os campos do formulário após o envio
            setNome('');
            setTelefone('');
            setEmail('');
            setCpf('');
            setRua('');
            setNumero('');
            setComplemento('');
            setBairro('');
            setCidade('');
            setCep('');
        } catch (error) {
            // Exibindo mensagem de erro
            setAlertMessage('Erro ao cadastrar cliente. Tente novamente.');
            setAlertColor('red');
            console.error('Erro na requisição:', error);
        }
    };

    // Função para fechar a notificação
    const closeAlert = () => {
        setShowAlert(false);
    };

    return (
        <>
            <section className="bg-white mx-0 mt-0 flex-1 min-h-0 justify-between rounded-lg border border-blue-gray-100 lg:flex">
                <div className="w-full my-8 mx-auto px-8 h-full sm:space-y-16">
                    <div className="text-center">
                        <Typography variant="h2" className="font-bold">Novo Cliente</Typography>
                        <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">Insira seus dados</Typography>
                    </div>
                    <form onSubmit={handleSubmit} className="mt-8 max-w-screen-lg lg:w-full mx-auto">
                        <div className="mb-1 grid grid-cols-1 sm:grid-cols-8 gap-6">

                            {/* Nome */}
                            <div className="flex flex-col gap-3 col-span-1 sm:col-span-5">
                                <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">Seu nome
                                    completo</Typography>
                                <Input
                                    type="text"
                                    size="lg"
                                    placeholder="ex.: João Victor"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                                />
                            </div>

                            {/* Telefone */}
                            <div className="flex flex-col gap-3 col-span-1 sm:col-span-3">
                                <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">Digite seu
                                    telefone</Typography>
                                <Input
                                    type="tel"
                                    size="lg"
                                    placeholder="ex.: (99) 99999-9999"
                                    value={telefone}
                                    onChange={(e) => setTelefone(e.target.value)}
                                    className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                                />
                            </div>

                            {/* Email */}
                            <div className="flex flex-col gap-3 col-span-1 sm:col-span-5">
                                <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">Digite seu
                                    e-mail</Typography>
                                <Input
                                    type="email"
                                    size="lg"
                                    placeholder="ex.: name@mail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                                />
                            </div>

                            {/* CPF */}
                            <div className="flex flex-col gap-3 col-span-1 sm:col-span-3">
                                <Typography variant="small" color="blue-gray"
                                            className="-mb-3 font-medium">CPF</Typography>
                                <Input
                                    type="text"
                                    size="lg"
                                    placeholder="ex.: 000.000.000-00"
                                    value={cpf}
                                    onChange={(e) => setCpf(e.target.value)}
                                    className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                                />
                            </div>

                            <div className="mt-4 border-b border-blue-gray-100 col-span-1 sm:col-span-8"></div>

                            {/* Rua */}
                            <div className="flex flex-col gap-3 col-span-1 sm:col-span-6">
                                <Typography variant="small" color="blue-gray"
                                            className="-mb-3 font-medium">Rua</Typography>
                                <Input
                                    type="text"
                                    size="lg"
                                    placeholder="ex.: Av. Quadrada"
                                    value={rua}
                                    onChange={(e) => setRua(e.target.value)}
                                    className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                                />
                            </div>

                            {/* Número */}
                            <div className="flex flex-col gap-3 col-span-1 sm:col-span-2">
                                <Typography variant="small" color="blue-gray"
                                            className="-mb-3 font-medium">Número</Typography>
                                <Input
                                    type="text"
                                    size="lg"
                                    placeholder="ex.: 333"
                                    value={numero}
                                    onChange={(e) => setNumero(e.target.value)}
                                    className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                                />
                            </div>

                            {/* Complemento */}
                            <div className="flex flex-col gap-3 col-span-1 sm:col-span-4">
                                <Typography variant="small" color="blue-gray"
                                            className="-mb-3 font-medium">Complemento</Typography>
                                <Input
                                    type="text"
                                    size="lg"
                                    placeholder="ex.: Apto 101"
                                    value={complemento}
                                    onChange={(e) => setComplemento(e.target.value)}
                                    className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                                />
                            </div>

                            {/* Bairro */}
                            <div className="flex flex-col gap-3 col-span-1 sm:col-span-4">
                                <Typography variant="small" color="blue-gray"
                                            className="-mb-3 font-medium">Bairro</Typography>
                                <Input
                                    type="text"
                                    size="lg"
                                    placeholder="ex.: Centro"
                                    value={bairro}
                                    onChange={(e) => setBairro(e.target.value)}
                                    className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                                />
                            </div>

                            {/* Cidade */}
                            <div className="flex flex-col gap-3 col-span-1 sm:col-span-5">
                                <Typography variant="small" color="blue-gray"
                                            className="-mb-3 font-medium">Cidade</Typography>
                                <Input
                                    type="text"
                                    size="lg"
                                    placeholder="ex.: São Paulo"
                                    value={cidade}
                                    onChange={(e) => setCidade(e.target.value)}
                                    className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                                />
                            </div>

                            {/* CEP */}
                            <div className="flex flex-col gap-3 col-span-1 sm:col-span-3">
                                <Typography variant="small" color="blue-gray"
                                            className="-mb-3 font-medium">CEP</Typography>
                                <Input
                                    type="text"
                                    size="lg"
                                    placeholder="ex.: 12345-678"
                                    value={cep}
                                    onChange={(e) => setCep(e.target.value)}
                                    className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                                />
                            </div>
                        </div>

                        {/* Botão de Submit */}
                        <div className="flex w-full justify-center">
                            <Button type="submit" className="mt-6 w-32">
                                Cadastrar
                            </Button>
                        </div>

                        {/* Notificação Absoluta */}
                        {alertMessage && showAlert && (
                            <div className="mt-8 w-full">
                                <Alert
                                    open={showAlert}
                                    color={alertColor}
                                    className="relative flex items-center justify-between px-4 py-3 rounded-lg"
                                >
                                    <span>{alertMessage}</span> {/* Mensagem do alerta */}

                                    <button
                                        onClick={closeAlert}
                                        className="absolute top-1/2 right-4 transform -translate-y-1/2"
                                    >
                                        <div className="h-6 w-6 flex items-center justify-between hover:bg-green-600 rounded-md">
                                            <XMarkIcon className="h-6 w-6 text-white" />
                                        </div>
                                    </button>
                                </Alert>
                            </div>
                        )}
                    </form>
                </div>
            </section>
        </>
);
}

export default ClienteEnderecoForm;
