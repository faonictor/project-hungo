// import React, {useEffect, useState} from 'react';
// import {useNavigate} from 'react-router-dom';
// import {
//     CheckBadgeIcon,
//     ExclamationCircleIcon,
//     MapPinIcon,
//     PencilIcon,
//     TrashIcon,
//     XMarkIcon,
//     ArrowPathIcon, ExclamationTriangleIcon
// } from '@heroicons/react/24/solid';
// import api from '../../services/axiosConfig';
// import {Card, CardBody, CardHeader, Typography, Alert, Spinner} from "@material-tailwind/react";
// import Loading from "@/widgets/loading.jsx";
// import {CircleStackIcon, InformationCircleIcon} from "@heroicons/react/24/outline";
// import AlertMessage from "@/widgets/alert-message.jsx";
// import {PlusIcon} from "@heroicons/react/24/solid/index.js";
//
// const ClientesTable = () => {
//     const [clientes, setClientes] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [modalVisible, setModalVisible] = useState(false);
//     const [clienteSelecionado, setClienteSelecionado] = useState(null);
//     const [enderecos, setEnderecos] = useState([]);  // Novo estado para armazenar os endereços
//     const [modalEnderecosVisible, setModalEnderecosVisible] = useState(false);  // Controlar visibilidade do modal de endereços
//     const [alertMessage, setAlertMessage] = useState(null); // Estado para controlar a mensagem de alerta
//     const [alertColor, setAlertColor] = useState('green'); // Cor do alerta
//
//     const navigate = useNavigate();
//
//     /* Função para buscar todos os clientes */
//     const fetchClientes = async () => {
//         try {
//             const response = await api.get('/cliente');
//             const data = Array.isArray(response.data) ? response.data : [];
//             setClientes(data);
//         } catch (error) {
//             console.error('Erro ao buscar clientes:', error);
//             setClientes([]);
//         } finally {
//             setLoading(false);
//         }
//     };
//
//     {/* Função para redirecionar para a página de criar produto */
//     }
//     const handleCreateCliente = () => {
//         navigate('/dashboard/cliente');
//     };
//
//     /* Recarregar lista de clientes quando o componente é montado */
//     useEffect(() => {
//         fetchClientes();
//     }, []);
//
//     /* Função para buscar os endereços de um cliente */
//     const fetchEnderecos = async (clienteId) => {
//         try {
//             const response = await api.get(`/endereco/cliente/${clienteId}`);
//             const data = Array.isArray(response.data) ? response.data : [];
//             setEnderecos(data);
//         } catch (error) {
//             console.error('Erro ao buscar endereços:', error);
//             setEnderecos([]);
//         } finally {
//             setLoadingEnderecos(false);
//         }
//     };
//
//     /* Função para exibir os endereços de um cliente */
//     const handleShowEnderecos = (clienteId, nomeCliente) => {
//         setClienteSelecionado({id: clienteId, nome: nomeCliente});
//         fetchEnderecos(clienteId);
//         setModalEnderecosVisible(true);
//     };
//
//
//     /* Função para editar na tela de cliente */
//     const handleEdit = (id) => {
//         navigate(`/dashboard/cliente/${id}`);
//     };
//
//     /* Função modal confirmar exclusão */
//     const handleConfirmDelete = (cliente) => {
//         setClienteSelecionado(cliente);
//         setModalVisible(true);
//     };
//
//     /* Função deletar cliente e endereços */
//     const handleDelete = async () => {
//         if (clienteSelecionado) {
//             try {
//                 await api.delete(`/cliente/${clienteSelecionado.id}`);
//                 setModalVisible(false);
//                 setClienteSelecionado(null);
//                 fetchClientes();
//                 setAlertMessage(`Cliente "${clienteSelecionado.nome}" excluído com sucesso.`);
//                 setAlertColor('green');
//             } catch (error) {
//                 console.error('Erro ao remover cliente:', error);
//                 setAlertMessage(`Ocorreu um erro ao excluir o cliente "${clienteSelecionado.nome}".`);
//                 setAlertColor('red');
//             }
//         }
//     };
//
//     /* Função para excluir um endereço */
//     const handleDeleteEndereco = async (enderecoId) => {
//         try {
//             await api.delete(`/endereco/${enderecoId}`);
//             setAlertMessage("Endereço removido com sucesso.");
//             setAlertColor("green");
//             fetchEnderecos(clienteSelecionado.id); // Atualiza a lista de endereços
//         } catch (error) {
//             console.error("Erro ao excluir endereço:", error);
//             setAlertMessage("Ocorreu um erro ao remover o endereço.");
//             setAlertColor("red");
//         }
//     };
//
//     /* carregamento */
//     if (loading) {
//         return <Loading text="Carregando Clientes"/>;
//     }
//
//     return (
//         <>
//             <Card
//                 className="overflow-x-auto bg-white w-full h-full flex-1 min-h-0 rounded-xl border border-blue-gray-100 lg:flex">
//                 <CardHeader variant="gradient" color="gray"
//                             className="my-4 p-4 flex space-x-6 items-center justify-between">
//                     <Typography variant="h6" color="white">
//                         Lista de Clientes
//                     </Typography>
//                     <button
//                         onClick={handleCreateCliente}
//                         className="flex items-center bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
//                     >
//                         <span className="flex p-1 justify-center items-center">
//                             <PlusIcon className="w-5 h-5 text-sm"/>
//                             <span className="text-sm">Novo Cliente</span>
//                         </span>
//                     </button>
//                 </CardHeader>
//                 <CardBody className="px-4 pt-0 pb-6">
//
//                     {/* Notificação */}
//                     <AlertMessage
//                         alertMessage={alertMessage}
//                         alertColor={alertColor}
//                         onClose={() => setAlertMessage(null)}
//                     />
//
//                     <div className="overflow-x-auto bg-white shadow-md rounded-lg">
//                         <table className="min-w-full table-auto">
//                             <thead>
//                             <tr>
//                                 <th className="px-4 py-2 border-b text-left">ID</th>
//                                 <th className="px-4 py-2 border-b text-left">Nome</th>
//                                 <th className="px-4 py-2 border-b text-left">CPF</th>
//                                 <th className="px-4 py-2 border-b text-left">Email</th>
//                                 <th className="px-4 py-2 border-b text-left">Telefone</th>
//                                 <th className="pr-4 py-2 border-b text-left">Ações</th>
//                             </tr>
//                             </thead>
//                             <tbody>
//                             {clientes.map((cliente) => (
//                                 <tr key={cliente.id}>
//                                     <td className="px-4 py-2 border-b">{cliente.id}</td>
//                                     <td className="px-4 py-2 border-b">{cliente.nome}</td>
//                                     <td className="px-4 py-2 border-b">{cliente.cpf}</td>
//                                     <td className="px-4 py-2 border-b">{cliente.email}</td>
//                                     <td className="px-4 py-2 border-b">{cliente.telefone}</td>
//                                     {/* Coluna Status */}
//                                     <td className="px-4 py-2 border-b">
//                                         <span
//                                             className={`inline-flex items-center px-2 text-sm rounded-full
//                                             ${cliente.status ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}
//                                         >
//                                             {cliente.status ? 'Ativo' : 'Inativo'}
//                                         </span>
//                                     </td>
//                                     <td className="pr-4 py-2 border-b space-x-2">
//                                         <button onClick={() => handleEdit(cliente.id)}>
//                                             <div
//                                                 className="p-1 rounded-md text-blue-gray-500 hover:bg-blue-100 active:text-blue-500">
//                                                 <PencilIcon className="w-5 h-5"/>
//                                             </div>
//                                         </button>
//
//                                         <button onClick={() => handleConfirmDelete(cliente)}>
//                                             <div
//                                                 className="p-1 rounded-md text-blue-gray-500 hover:bg-red-100 active:text-red-600">
//                                                 <TrashIcon className="w-5 h-5"/>
//                                             </div>
//                                         </button>
//
//                                         <button onClick={() => handleShowEnderecos(cliente.id, cliente.nome)}>
//                                             <div
//                                                 className="p-1 rounded-md text-blue-gray-500 hover:bg-gray-200 active:text-green-500">
//                                                 <MapPinIcon className="w-5 h-5"/>
//                                             </div>
//                                         </button>
//                                     </td>
//                                 </tr>
//                             ))}
//                             </tbody>
//                         </table>
//                     </div>
//
//                     {/* Modal de Confirmação de Exclusão */}
//                     {modalVisible && (
//                         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//                             <div className="bg-white p-6 rounded-lg shadow-xl w-1/3">
//                                 <Typography variant="h4" color="gray" className="mb-4 flex items-center gap-x-2">
//                                     <ExclamationTriangleIcon
//                                         className="text-gray-400 w-7 h-7"/><span>Confirmar Exclusão</span>
//                                 </Typography>
//                                 <h3 className="text-xl font-semibold mb-4"></h3>
//                                 <p>
//                                     Tem certeza de que deseja remover o cliente
//                                     "<strong>{clienteSelecionado?.nome}</strong>"?
//                                 </p>
//                                 <div className="mt-4 flex justify-end">
//                                     <button
//                                         onClick={() => setModalVisible(false)}
//                                         className="mr-4 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 active:bg-gray-500"
//                                     >
//                                         Cancelar
//                                     </button>
//                                     <button
//                                         onClick={handleDelete}
//                                         className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700 active:bg-red-300"
//                                     >
//                                         Confirmar
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     )}
//
//                     {/* Modal de Endereços */}
//                     {modalEnderecosVisible && (
//                         <div
//                             className="fixed inset-0 py-16 flex items-center justify-center bg-black bg-opacity-50 z-50"
//                             onClick={() => setModalEnderecosVisible(false)}>
//                             <div
//                                 className="bg-white overflow-y-scroll max-h-full p-8 rounded-lg shadow-xl w-full max-w-lg md:w-1/2">
//                                 <div className="flex justify-between items-center mb-4">
//                                     <Typography variant="h5" color="gray">
//                                         <Typography variant="h7" color="gray">
//                                             <span>Endereços de: </span>
//                                         </Typography>
//                                         <div>
//                                             {clienteSelecionado?.nome}
//                                         </div>
//                                     </Typography>
//
//                                     <button
//                                         onClick={() => navigate(`/dashboard/endereco/cadastro/${clienteSelecionado?.id}`)}
//                                         className="flex items-center ml-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
//                                     >
//                                        <span className="flex p-1 justify-center items-center">
//                                         <PlusIcon className="w-5 h-5 text-sm"/>
//                                         <span className="text-sm whitespace-nowrap">Novo Endereco</span>
//                                        </span>
//                                     </button>
//                                 </div>
//
//                                 {enderecos.length === 0 ? (
//                                     <p>Não há endereços registrados para este cliente.</p>
//                                 ) : (
//                                     <div className="space-y-4">
//                                         {enderecos.map((endereco, index) => (
//                                             <Card key={index} className="mb-4 border border-blue-gray-50">
//                                                 <CardBody>
//                                                     <Typography variant="h6" color="blue-gray">
//                                                         {endereco.rua}, {endereco.numero} {endereco.complemento && `- ${endereco.complemento}`}
//                                                     </Typography>
//                                                     <div className="flex flex-wrap gap-x-4">
//                                                         <Typography className="mt-2" color="gray">
//                                                             <strong>Bairro:</strong> {endereco.bairro}
//                                                         </Typography>
//                                                         <Typography className="mt-2" color="gray">
//                                                             <strong>Cidade:</strong> {endereco.cidade}
//                                                         </Typography>
//                                                         <Typography className="mt-2" color="gray">
//                                                             <strong>CEP:</strong> {endereco.cep}
//                                                         </Typography>
//                                                     </div>
//
//                                                     <div className="mt-2 flex justify-end space-x-2">
//                                                         <button
//                                                             onClick={() => navigate(`/dashboard/endereco/editar/${endereco.id}`)}
//                                                             className="justify-center items-center py-1 px-2 text-blue-500 rounded-full flex gap-1 hover:bg-blue-50"
//                                                         >
//                                                             Editar
//                                                         </button>
//
//                                                         {/* Botão Remover Endereço */}
//                                                         <button
//                                                             onClick={() => handleDeleteEndereco(endereco.id)}
//                                                             className="justify-center items-center py-1 px-2 text-red-500 rounded-full flex gap-1 hover:bg-red-50"
//                                                         >
//                                                             Remover
//                                                         </button>
//                                                     </div>
//                                                 </CardBody>
//                                             </Card>
//                                         ))}
//                                     </div>
//                                 )}
//
//                                 <div className="mt-4 flex justify-center">
//                                     <button
//                                         onClick={() => setModalEnderecosVisible(false)}
//                                         className="mr-4 bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400"
//                                     >
//                                         Fechar
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     )}
//                 </CardBody>
//             </Card>
//         </>
//     );
// };
//
// export default ClientesTable;

import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    CheckBadgeIcon,
    ExclamationCircleIcon,
    MapPinIcon,
    PencilIcon,
    TrashIcon,
    XMarkIcon,
    ArrowPathIcon, ExclamationTriangleIcon
} from '@heroicons/react/24/solid';
import api from '../../services/axiosConfig';
import {Card, CardBody, CardHeader, Typography, Alert, Spinner} from "@material-tailwind/react";
import Loading from "@/widgets/loading.jsx";
import {CircleStackIcon, InformationCircleIcon} from "@heroicons/react/24/outline";
import AlertMessage from "@/widgets/alert-message.jsx";
import {PlusIcon} from "@heroicons/react/24/solid/index.js";

const ClientesTable = () => {
    const [clientes, setClientes] = useState([]);
    const [filteredClientes, setFilteredClientes] = useState([]);
    const [statusFiltro, setStatusFiltro] = useState('ativos');
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [clienteSelecionado, setClienteSelecionado] = useState(null);
    const [enderecos, setEnderecos] = useState([]);
    const [modalEnderecosVisible, setModalEnderecosVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertColor, setAlertColor] = useState('green');

    const navigate = useNavigate();

    const filtrarClientes = (status, listaClientes) => {
        switch (status) {
            case 'ativos':
                return listaClientes.filter(cliente => cliente.status === true);
            case 'inativos':
                return listaClientes.filter(cliente => cliente.status === false);
            default:
                return listaClientes;
        }
    };

    const fetchClientes = async () => {
        try {
            const response = await api.get('/cliente');
            const data = Array.isArray(response.data) ? response.data : [];
            setClientes(data);
            setFilteredClientes(filtrarClientes(statusFiltro, data));
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
            setClientes([]);
            setFilteredClientes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCliente = () => {
        navigate('/dashboard/cliente-rapido');
    };

    useEffect(() => {
        setFilteredClientes(filtrarClientes(statusFiltro, clientes));
    }, [statusFiltro, clientes]);

    useEffect(() => {
        fetchClientes();
    }, []);

    const fetchEnderecos = async (clienteId) => {
        try {
            const response = await api.get(`/endereco/cliente/${clienteId}`);
            const data = Array.isArray(response.data) ? response.data : [];
            setEnderecos(data);
        } catch (error) {
            console.error('Erro ao buscar endereços:', error);
            setEnderecos([]);
        }
    };

    const handleShowEnderecos = (clienteId, nomeCliente) => {
        setClienteSelecionado({id: clienteId, nome: nomeCliente});
        fetchEnderecos(clienteId);
        setModalEnderecosVisible(true);
    };

    const handleEdit = (id) => {
        navigate(`/dashboard/cliente/${id}`);
    };

    const handleConfirmDelete = (cliente) => {
        setClienteSelecionado(cliente);
        setModalVisible(true);
    };

    const handleDelete = async () => {
        if (clienteSelecionado) {
            try {
                await api.delete(`/cliente/${clienteSelecionado.id}`);
                setModalVisible(false);
                setClienteSelecionado(null);
                fetchClientes();
                setAlertMessage(`Cliente "${clienteSelecionado.nome}" excluído com sucesso.`);
                setAlertColor('green');
            } catch (error) {
                console.error('Erro ao remover cliente:', error);
                // setAlertMessage(`Ocorreu um erro ao excluir o cliente "${clienteSelecionado.nome}".`);
                setAlertMessage(`Não é possível excluir clientes com pedidos finalizados`);
                setAlertColor('red');
                setModalVisible(false);
            }
        }
    };

    const handleDeleteEndereco = async (enderecoId) => {
        try {
            await api.delete(`/endereco/${enderecoId}`);
            setAlertMessage("Endereço removido com sucesso.");
            setAlertColor("green");
            fetchEnderecos(clienteSelecionado.id);
        } catch (error) {
            console.error("Erro ao excluir endereço:", error);
            setAlertMessage("Ocorreu um erro ao remover o endereço.");
            setAlertColor("red");
        }
    };

    if (loading) {
        return <Loading text="Carregando Clientes"/>;
    }

    return (
        <>
            <Card className="overflow-x-auto bg-white w-full h-full flex-1 min-h-0 rounded-xl border border-blue-gray-100 lg:flex">
                <CardHeader variant="gradient" color="gray"
                            className="my-4 p-4 flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">

                    <Typography variant="h6" color="white">
                        Lista de Clientes
                    </Typography>
                    <div className="flex bg-gray-900 px-4 py-1 rounded-lg space-x-8">
                        <label className={`flex items-center space-x-2 cursor-pointer`}>
                            <input
                                type="radio"
                                className="mr-2"
                                checked={statusFiltro === 'todos'}
                                onChange={() => setStatusFiltro('todos')}
                                name="status"
                            />
                            <span>Todos</span>
                        </label>

                        <label className={`flex items-center space-x-2 cursor-pointer`}>
                            <input
                                type="radio"
                                className="mr-2"
                                checked={statusFiltro === 'ativos'}
                                onChange={() => setStatusFiltro('ativos')}
                                name="status"
                            />
                            <span>Ativos</span>
                        </label>

                        <label className={`flex items-center space-x-2 cursor-pointer`}>
                            <input
                                type="radio"
                                className="mr-2"
                                checked={statusFiltro === 'inativos'}
                                onChange={() => setStatusFiltro('inativos')}
                                name="status"
                            />
                            <span>Inativos</span>
                        </label>
                    </div>


                    <button
                        onClick={handleCreateCliente}
                        className="flex items-center bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
                    >
                        <span className="flex p-1 justify-center items-center">
                            <PlusIcon className="w-5 h-5 text-sm"/>
                            <span className="text-sm">Novo Cliente</span>
                        </span>
                    </button>
                </CardHeader>

                <CardBody className="px-4 pt-0 pb-6">
                    <AlertMessage
                        alertMessage={alertMessage}
                        alertColor={alertColor}
                        onClose={() => setAlertMessage(null)}
                    />

                    <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                        <table className="min-w-full table-auto">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 border-b text-left">ID</th>
                                <th className="px-4 py-2 border-b text-left">Nome</th>
                                <th className="px-4 py-2 border-b text-left">CPF</th>
                                <th className="px-4 py-2 border-b text-left">Email</th>
                                <th className="px-4 py-2 border-b text-left">Telefone</th>
                                <th className="px-4 py-2 border-b text-left">Status</th>
                                <th className="pr-4 py-2 border-b text-left">Ações</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredClientes.map((cliente) => (
                                <tr key={cliente.id}>
                                    <td className="px-4 py-2 border-b">{cliente.id}</td>
                                    <td className="px-4 py-2 border-b">{cliente.nome}</td>
                                    <td className="px-4 py-2 border-b">{cliente.cpf}</td>
                                    <td className="px-4 py-2 border-b">{cliente.email}</td>
                                    <td className="px-4 py-2 border-b">{cliente.telefone}</td>
                                    <td className="px-4 py-2 border-b">
                                        <span
                                            className={`inline-flex items-center px-2 text-sm rounded-full
                                            ${cliente.status ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}
                                        >
                                            {cliente.status ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td className="pr-4 py-2 border-b space-x-2">
                                        <button onClick={() => handleEdit(cliente.id)}>
                                            <div className="p-1 rounded-md text-blue-gray-500 hover:bg-blue-100 active:text-blue-500">
                                                <PencilIcon className="w-5 h-5"/>
                                            </div>
                                        </button>

                                        <button onClick={() => handleConfirmDelete(cliente)}>
                                            <div className="p-1 rounded-md text-blue-gray-500 hover:bg-red-100 active:text-red-600">
                                                <TrashIcon className="w-5 h-5"/>
                                            </div>
                                        </button>

                                        <button onClick={() => handleShowEnderecos(cliente.id, cliente.nome)}>
                                            <div className="p-1 rounded-md text-blue-gray-500 hover:bg-gray-200 active:text-green-500">
                                                <MapPinIcon className="w-5 h-5"/>
                                            </div>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {modalVisible && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                            <div className="bg-white p-6 rounded-lg shadow-xl w-1/3">
                                <Typography variant="h4" color="gray" className="mb-4 flex items-center gap-x-2">
                                    <ExclamationTriangleIcon
                                        className="text-gray-400 w-7 h-7"/><span>Confirmar Exclusão</span>
                                </Typography>
                                <h3 className="text-xl font-semibold mb-4"></h3>
                                <p>
                                    Tem certeza de que deseja remover o cliente
                                    "<strong>{clienteSelecionado?.nome}</strong>"?
                                </p>
                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={() => setModalVisible(false)}
                                        className="mr-4 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 active:bg-gray-500"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700 active:bg-red-300"
                                    >
                                        Confirmar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Modal de Endereços */}
                    {modalEnderecosVisible && (
                        <div
                            className="fixed inset-0 py-16 flex items-center justify-center bg-black bg-opacity-50 z-50"
                            onClick={() => setModalEnderecosVisible(false)}>
                            <div
                                className="bg-white overflow-y-scroll max-h-full p-8 rounded-lg shadow-xl w-full max-w-lg md:w-1/2">
                                <div className="flex justify-between items-center mb-4">
                                    <Typography variant="h5" color="gray">
                                        <Typography variant="h7" color="gray">
                                            <span>Endereços de: </span>
                                        </Typography>
                                        <div>
                                            {clienteSelecionado?.nome}
                                        </div>
                                    </Typography>

                                    <button
                                        onClick={() => navigate(`/dashboard/endereco/cadastro/${clienteSelecionado?.id}`)}
                                        className="flex items-center ml-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
                                    >
                                       <span className="flex p-1 justify-center items-center">
                                        <PlusIcon className="w-5 h-5 text-sm"/>
                                        <span className="text-sm whitespace-nowrap">Novo Endereco</span>
                                       </span>
                                    </button>
                                </div>

                                {enderecos.length === 0 ? (
                                    <p>Não há endereços registrados para este cliente.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {enderecos.map((endereco, index) => (
                                            <Card key={index} className="mb-4 border border-blue-gray-50">
                                                <CardBody>
                                                    <Typography variant="h6" color="blue-gray">
                                                        {endereco.rua}, {endereco.numero} {endereco.complemento && `- ${endereco.complemento}`}
                                                    </Typography>
                                                    <div className="flex flex-wrap gap-x-4">
                                                        <Typography className="mt-2" color="gray">
                                                            <strong>Bairro:</strong> {endereco.bairro}
                                                        </Typography>
                                                        <Typography className="mt-2" color="gray">
                                                            <strong>Cidade:</strong> {endereco.cidade}
                                                        </Typography>
                                                        <Typography className="mt-2" color="gray">
                                                            <strong>CEP:</strong> {endereco.cep}
                                                        </Typography>
                                                    </div>

                                                    <div className="mt-2 flex justify-end space-x-2">
                                                        <button
                                                            onClick={() => navigate(`/dashboard/endereco/editar/${endereco.id}`)}
                                                            className="justify-center items-center py-1 px-2 text-blue-500 rounded-full flex gap-1 hover:bg-blue-50"
                                                        >
                                                            Editar
                                                        </button>

                                                        {/* Botão Remover Endereço */}
                                                        <button
                                                            onClick={() => handleDeleteEndereco(endereco.id)}
                                                            className="justify-center items-center py-1 px-2 text-red-500 rounded-full flex gap-1 hover:bg-red-50"
                                                        >
                                                            Remover
                                                        </button>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-4 flex justify-center">
                                    <button
                                        onClick={() => setModalEnderecosVisible(false)}
                                        className="mr-4 bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400"
                                    >
                                        Fechar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </CardBody>
            </Card>
        </>
    );
};

export default ClientesTable;