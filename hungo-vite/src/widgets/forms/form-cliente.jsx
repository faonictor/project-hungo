// import React, {useState, useEffect} from 'react';
// import {useParams, useNavigate} from 'react-router-dom';
// import api from '../../services/axiosConfig';
// import InputField from '../forms/input-field';
// import {Alert, Button, Card, CardBody, CardHeader, Typography} from "@material-tailwind/react";
// import {ArrowPathIcon, XMarkIcon} from "@heroicons/react/24/outline";
// import AlertMessage from "@/widgets/alert-message.jsx";
//
// const ClienteForm = () => {
//     const {id} = useParams();
//     const navigate = useNavigate();
//
//     const [nome, setNome] = useState('');
//     const [telefone, setTelefone] = useState('');
//     const [email, setEmail] = useState('');
//     const [senha, setSenha] = useState('');
//     const [confirmarSenha, setConfirmarSenha] = useState('');
//     const [cpf, setCpf] = useState('');
//     const [alertMessage, setAlertMessage] = useState(null);
//     const [alertColor, setAlertColor] = useState('green');
//     const [isLoading, setIsLoading] = useState(false);
//
//     {/* Função para buscar cliente pelo id */
//     }
//     useEffect(() => {
//         if (id) {
//             const fetchCliente = async () => {
//                 try {
//                     const response = await api.get(`/cliente/${id}`);
//                     const {nome, telefone, email, cpf, senha} = response.data;
//                     setNome(nome);
//                     setTelefone(telefone);
//                     setEmail(email);
//                     setCpf(cpf);
//                     setSenha(senha);
//                 } catch (error) {
//                     setAlertMessage('Erro ao carregar os dados do cliente');
//                     setAlertColor('red');
//                     console.error('Erro ao buscar cliente:', error);
//                 }
//             };
//             fetchCliente();
//         }
//     }, [id]);
//
//     {/* Função Validação de Formulário */
//     }
//     const isFormValid = () => {
//         const emailRegex = /\S+@\S+\.\S+/;
//         return (
//             nome && telefone && emailRegex.test(email) && cpf
//         );
//         //recolocar quando a tela for pedir a senha
//         // return (
//         //     nome && telefone && emailRegex.test(email) && senha && cpf && senha === confirmarSenha
//         // );
//     };
//
//     {/* Função Cadastro ou Edição */
//     }
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//
//         if (!isFormValid()) {
//             setAlertMessage('Por favor, preencha todos os campos obrigatórios e valide com senhas iguais.');
//             setAlertColor('red');
//             return;
//         }
//
//         setIsLoading(true);
//         try {
//             const clienteDTO = {nome, telefone, email, senha, cpf};
//
//             if (id) {
//                 await api.put(`/cliente/${id}`, clienteDTO);
//                 setAlertMessage('Cliente editado com sucesso!');
//             } else {
//                 await api.post('/cliente', clienteDTO);
//                 setAlertMessage('Cliente cadastrado com sucesso!');
//             }
//
//             setAlertColor('green');
//
//             setTimeout(() => {
//                 navigate('/dashboard/clientes');
//             }, 1000);
//         } catch (error) {
//             setAlertMessage('Erro ao cadastrar/editar cliente. Tente novamente.');
//             setAlertColor('red');
//             console.error('Erro na requisição:', error);
//         } finally {
//             setIsLoading(false);
//         }
//     };
//
//     return (
//         <>
//             <Card className="bg-white w-full h-full flex-1 min-h-0 rounded-xl border border-blue-gray-100 lg:flex">
//                 <CardHeader variant="gradient" color="gray" className="my-4 p-4">
//                     <Typography variant="h6" color="white">
//                         {id ? 'Editar Cliente' : 'Cadastrar Cliente Usuário'}
//                     </Typography>
//                 </CardHeader>
//                 <CardBody className="px-4 pt-0 pb-6">
//                     <form onSubmit={handleSubmit} className="mt-8 max-w-screen-lg lg:w-full mx-auto">
//                         <div className="mb-1 grid grid-cols-1 sm:grid-cols-8 gap-6">
//                             <div className="col-span-1 sm:col-span-5">
//                                 <InputField label="Nome completo" placeholder="ex.: João Victor" value={nome}
//                                             onChange={setNome} className="border border-red-400"/>
//                             </div>
//                             <div className="col-span-1 sm:col-span-3">
//                                 <InputField label="Telefone" placeholder="ex.: (99) 99999-9999" value={telefone}
//                                             onChange={setTelefone} mask="(99) 99999-9999"/>
//                             </div>
//                             <div className="col-span-1 sm:col-span-5">
//                                 <InputField label="E-mail" placeholder="ex.: name@mail.com" value={email}
//                                             onChange={setEmail} type="email"/>
//                             </div>
//                             <div className="col-span-1 sm:col-span-3">
//                                 <InputField label="CPF" placeholder="ex.: 000.000.000-00" value={cpf}
//                                             onChange={setCpf} mask="999.999.999-99"/>
//                             </div>
//
//                             <div className="mt-4 border-b border-blue-gray-100 col-span-1 sm:col-span-8"/>
//
//                             {/*recolocar quando a tela for pedir a senha*/}
//                             {/*<div className="col-span-1 sm:col-span-4">*/}
//                             {/*    <InputField label="Senha" placeholder="Digite sua senha" type="password" value={senha}*/}
//                             {/*                onChange={setSenha}/>*/}
//                             {/*</div>*/}
//
//                             {/*<div className="col-span-1 sm:col-span-4">*/}
//                             {/*    <InputField label="Confirmar Senha" placeholder="Confirme sua senha" type="password"*/}
//                             {/*                value={confirmarSenha} onChange={setConfirmarSenha}/>*/}
//                             {/*</div>*/}
//                         </div>
//
//                         {/*recolocar quando a tela for pedir a senha*/}
//                         {/*/!* Validação de Senha *!/*/}
//                         {/*{senha && confirmarSenha && senha !== confirmarSenha && (*/}
//                         {/*    <div className="mt-4 w-full">*/}
//                         {/*        <Alert open color="red"*/}
//                         {/*               className="relative flex items-center justify-between px-4 py-3 rounded-lg">*/}
//                         {/*            <span>As senhas precisam ser iguais. Digite de novo.</span>*/}
//                         {/*            <button*/}
//                         {/*                onClick={() => setAlertMessage(null)}*/}
//                         {/*                className="absolute top-1/2 right-4 transform -translate-y-1/2"*/}
//                         {/*            >*/}
//                         {/*                <XMarkIcon*/}
//                         {/*                    className="h-6 w-6 text-white hover:bg-white hover:bg-opacity-20 rounded-md"/>*/}
//                         {/*            </button>*/}
//                         {/*        </Alert>*/}
//                         {/*    </div>*/}
//                         {/*)}*/}
//
//                         <div className="flex w-full justify-center">
//                             <Button
//                                 type="submit"
//                                 className={`mt-6 w-32 flex items-center justify-center ${id ? 'bg-green-500 hover:bg-green-600' : ''}`}
//                                 disabled={!isFormValid() || isLoading}
//                             >
//                                 {isLoading ? (
//                                     <ArrowPathIcon className="h-4 w-4 text-white animate-spin"/>
//                                 ) : (
//                                     id ? 'Editar' : 'Cadastrar'
//                                 )}
//                             </Button>
//                         </div>
//
//                         {/* Notificação */}
//                         <div className="mt-4">
//                             <AlertMessage
//                                 alertMessage={alertMessage}
//                                 alertColor={alertColor}
//                                 onClose={() => setAlertMessage(null)}
//                             />
//                         </div>
//                     </form>
//                 </CardBody>
//             </Card>
//         </>
//     );
// };
//
// export default ClienteForm;
// import React, {useState, useEffect} from 'react';
// import {useParams, useNavigate} from 'react-router-dom';
// import api from '../../services/axiosConfig';
// import InputField from '../forms/input-field';
// import {Alert, Button, Card, CardBody, CardHeader, Typography} from "@material-tailwind/react";
// import {ArrowPathIcon, XMarkIcon} from "@heroicons/react/24/outline";
// import AlertMessage from "@/widgets/alert-message.jsx";
//
// const ClienteForm = () => {
//     const {id} = useParams();
//     const navigate = useNavigate();
//
//     const [nome, setNome] = useState('');
//     const [telefone, setTelefone] = useState('');
//     const [email, setEmail] = useState('');
//     const [senha, setSenha] = useState('');
//     const [confirmarSenha, setConfirmarSenha] = useState('');
//     const [cpf, setCpf] = useState('');
//     const [alertMessage, setAlertMessage] = useState(null);
//     const [alertColor, setAlertColor] = useState('green');
//     const [isLoading, setIsLoading] = useState(false);
//
//     {/* Função para buscar cliente pelo id */
//     }
//     useEffect(() => {
//         if (id) {
//             const fetchCliente = async () => {
//                 try {
//                     const response = await api.get(`/cliente/${id}`);
//                     const {nome, telefone, email, cpf, senha} = response.data;
//                     setNome(nome);
//                     setTelefone(telefone);
//                     setEmail(email);
//                     setCpf(cpf);
//                     setSenha(senha);
//                 } catch (error) {
//                     setAlertMessage('Erro ao carregar os dados do cliente');
//                     setAlertColor('red');
//                     console.error('Erro ao buscar cliente:', error);
//                 }
//             };
//             fetchCliente();
//         }
//     }, [id]);
//
//     {/* Função Validação de Formulário */
//     }
//     const isFormValid = () => {
//         const emailRegex = /\S+@\S+\.\S+/;
//         return (
//             nome && telefone && emailRegex.test(email) && cpf
//         );
//
//     };
//
//     {/* Função Cadastro ou Edição */
//     }
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//
//         if (!isFormValid()) {
//             setAlertMessage('Por favor, preencha todos os campos obrigatórios e valide com senhas iguais.');
//             setAlertColor('red');
//             return;
//         }
//
//         setIsLoading(true);
//         try {
//             const clienteDTO = {nome, telefone, email, senha, cpf};
//
//             if (id) {
//                 await api.put(`/cliente/${id}`, clienteDTO);
//                 setAlertMessage('Cliente editado com sucesso!');
//             } else {
//                 await api.post('/cliente', clienteDTO);
//                 setAlertMessage('Cliente cadastrado com sucesso!');
//             }
//
//             setAlertColor('green');
//
//             setTimeout(() => {
//                 navigate('/dashboard/clientes');
//             }, 1000);
//         } catch (error) {
//             setAlertMessage('Erro ao cadastrar/editar cliente. Tente novamente.');
//             setAlertColor('red');
//             console.error('Erro na requisição:', error);
//         } finally {
//             setIsLoading(false);
//         }
//     };
//
//     return (
//         <>
//             <Card className="bg-white w-full h-full flex-1 min-h-0 rounded-xl border border-blue-gray-100 lg:flex">
//                 <CardHeader variant="gradient" color="gray" className="my-4 p-4">
//                     <Typography variant="h6" color="white">
//                         {id ? 'Editar Cliente' : 'Cadastrar Cliente Usuário'}
//                     </Typography>
//                 </CardHeader>
//                 <CardBody className="px-4 pt-0 pb-6">
//                     <form onSubmit={handleSubmit} className="mt-8 max-w-screen-lg lg:w-full mx-auto">
//                         <div className="mb-1 grid grid-cols-1 sm:grid-cols-8 gap-6">
//                             <div className="col-span-1 sm:col-span-5">
//                                 <InputField label="Nome completo" placeholder="ex.: João Victor" value={nome}
//                                             onChange={setNome} className="border border-red-400"/>
//                             </div>
//                             <div className="col-span-1 sm:col-span-3">
//                                 <InputField label="Telefone" placeholder="ex.: (99) 99999-9999" value={telefone}
//                                             onChange={setTelefone} mask="(99) 99999-9999"/>
//                             </div>
//                             <div className="col-span-1 sm:col-span-5">
//                                 <InputField label="E-mail" placeholder="ex.: name@mail.com" value={email}
//                                             onChange={setEmail} type="email"/>
//                             </div>
//                             <div className="col-span-1 sm:col-span-3">
//                                 <InputField label="CPF" placeholder="ex.: 000.000.000-00" value={cpf}
//                                             onChange={setCpf} mask="999.999.999-99"/>
//                             </div>
//
//                             <div className="mt-4 border-b border-blue-gray-100 col-span-1 sm:col-span-8"/>
//
//
//                         </div>
//
//
//
//                         <div className="flex w-full justify-center">
//                             <Button
//                                 type="submit"
//                                 className={`mt-6 w-32 flex items-center justify-center ${id ? 'bg-green-500 hover:bg-green-600' : ''}`}
//                                 disabled={!isFormValid() || isLoading}
//                             >
//                                 {isLoading ? (
//                                     <ArrowPathIcon className="h-4 w-4 text-white animate-spin"/>
//                                 ) : (
//                                     id ? 'Editar' : 'Cadastrar'
//                                 )}
//                             </Button>
//                         </div>
//
//                         {/* Notificação */}
//                         <div className="mt-4">
//                             <AlertMessage
//                                 alertMessage={alertMessage}
//                                 alertColor={alertColor}
//                                 onClose={() => setAlertMessage(null)}
//                             />
//                         </div>
//                     </form>
//                 </CardBody>
//             </Card>
//         </>
//     );
// };
//
// export default ClienteForm;
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/axiosConfig";
import InputField from "../forms/input-field";
import SelectField from "../forms/select-field";
import { Alert, Button, Card, CardBody, CardHeader, Typography } from "@material-tailwind/react";
import { ArrowPathIcon, XMarkIcon } from "@heroicons/react/24/outline";
import AlertMessage from "@/widgets/alert-message.jsx";

const ClienteForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [nome, setNome] = useState("");
    const [telefone, setTelefone] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [cpf, setCpf] = useState("");
    const [status, setStatus] = useState("true");
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertColor, setAlertColor] = useState("green");
    const [isLoading, setIsLoading] = useState(false);

    // Função para buscar cliente pelo id
    useEffect(() => {
        if (id) {
            const fetchCliente = async () => {
                try {
                    const response = await api.get(`/cliente/${id}`);
                    const { nome, telefone, email, cpf, senha, status } = response.data;
                    setNome(nome);
                    setTelefone(telefone);
                    setEmail(email);
                    setCpf(cpf);
                    setSenha(senha);
                    setStatus(status ? "true" : "false");
                } catch (error) {
                    setAlertMessage("Erro ao carregar os dados do cliente");
                    setAlertColor("red");
                    console.error("Erro ao buscar cliente:", error);
                }
            };
            fetchCliente();
        }
    }, [id]);

    // Função Validação de Formulário
    const isFormValid = () => {
        const emailRegex = /\S+@\S+\.\S+/;
        return nome && telefone && emailRegex.test(email) && cpf;
    };

    // Função Cadastro ou Edição
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isFormValid()) {
            setAlertMessage("Por favor, preencha todos os campos obrigatórios.");
            setAlertColor("red");
            return;
        }

        setIsLoading(true);
        try {
            const clienteDTO = {
                nome,
                telefone,
                email,
                senha,
                cpf,
                status: status === "true",
            };

            if (id) {
                await api.put(`/cliente/${id}`, clienteDTO);
                setAlertMessage("Cliente editado com sucesso!");
            } else {
                await api.post("/cliente", clienteDTO);
                setAlertMessage("Cliente cadastrado com sucesso!");
            }

            setAlertColor("green");

            setTimeout(() => {
                navigate("/dashboard/clientes");
            }, 1000);
        } catch (error) {
            setAlertMessage("Erro ao cadastrar/editar cliente. Tente novamente.");
            setAlertColor("red");
            console.error("Erro na requisição:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Card className="bg-white w-full h-full flex-1 min-h-0 rounded-xl border border-blue-gray-100 lg:flex">
                <CardHeader variant="gradient" color="gray" className="my-4 p-4">
                    <Typography variant="h6" color="white">
                        {id ? "Editar Cliente" : "Cadastrar Cliente Usuário"}
                    </Typography>
                </CardHeader>
                <CardBody className="px-4 pt-0 pb-6">
                    <form onSubmit={handleSubmit} className="mt-8 max-w-screen-lg lg:w-full mx-auto">
                        <div className="mb-1 grid grid-cols-1 sm:grid-cols-8 gap-6">
                            <div className="col-span-1 sm:col-span-5">
                                <InputField label="Nome completo" placeholder="ex.: João Victor" value={nome} onChange={setNome} />
                            </div>
                            <div className="col-span-1 sm:col-span-3">
                                <InputField label="Telefone" placeholder="ex.: (99) 99999-9999" value={telefone} onChange={setTelefone} mask="(99) 99999-9999" />
                            </div>
                            <div className="col-span-1 sm:col-span-5">
                                <InputField label="E-mail" placeholder="ex.: name@mail.com" value={email} onChange={setEmail} type="email" />
                            </div>
                            <div className="col-span-1 sm:col-span-3">
                                <InputField label="CPF" placeholder="ex.: 000.000.000-00" value={cpf} onChange={setCpf} mask="999.999.999-99" />
                            </div>
                            <div className="col-span-1 sm:col-span-2">
                                <SelectField
                                    label="Status"
                                    value={status}
                                    onChange={(value) => setStatus(value)}
                                    options={[
                                        { value: "true", label: "Ativo" },
                                        { value: "false", label: "Inativo" },
                                    ]}
                                    placeholder="Selecione o status"
                                />
                            </div>
                        </div>

                        <div className="flex w-full justify-center">
                            <Button
                                type="submit"
                                className={`mt-6 w-32 flex items-center justify-center ${id ? "bg-green-500 hover:bg-green-600" : ""}`}
                                disabled={!isFormValid() || isLoading}
                            >
                                {isLoading ? <ArrowPathIcon className="h-4 w-4 text-white animate-spin" /> : id ? "Editar" : "Cadastrar"}
                            </Button>
                        </div>

                        {/* Notificação */}
                        <div className="mt-4">
                            <AlertMessage alertMessage={alertMessage} alertColor={alertColor} onClose={() => setAlertMessage(null)} />
                        </div>
                    </form>
                </CardBody>
            </Card>
        </>
    );
};

export default ClienteForm;
