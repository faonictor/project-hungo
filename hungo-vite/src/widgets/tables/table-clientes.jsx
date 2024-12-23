// import React, {useEffect, useState} from 'react';
// import {useNavigate} from 'react-router-dom';
// import {PencilIcon, TrashIcon} from '@heroicons/react/24/solid'; // Importando os ícones do Heroicons
// import api from '../../services/axiosConfig';
// import {InformationCircleIcon} from "@heroicons/react/24/outline";
// import {Card, CardBody, CardHeader, Typography} from "@material-tailwind/react";
//
// const ClientesTable = () => {
//     const [clientes, setClientes] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [modalVisible, setModalVisible] = useState(false);
//     const [clienteSelecionado, setClienteSelecionado] = useState(null);
//
//     const navigate = useNavigate();
//
//     // Função para buscar todos os clientes
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
//     // Carregar lista de clientes quando o componente é montado
//     useEffect(() => {
//         fetchClientes();
//     }, []);
//
//     const handleEdit = (id) => {
//         navigate(`/dashboard/cliente/${id}`);
//     };
//
//     const handleConfirmDelete = (cliente) => {
//         setClienteSelecionado(cliente);
//         setModalVisible(true);
//     };
//
//     const handleDelete = async () => {
//         if (clienteSelecionado) {
//             try {
//                 await api.delete(`/cliente/${clienteSelecionado.id}`);
//                 setModalVisible(false);
//                 setClienteSelecionado(null);
//                 fetchClientes(); // Recarregar a lista após exclusão
//             } catch (error) {
//                 console.error('Erro ao remover cliente:', error);
//             }
//         }
//     };
//
//     // Exibir mensagem de "Carregando..." enquanto os dados não são carregados
//     if (loading) {
//         return <div>Carregando...</div>;
//     }
//
//     return (
//         <>
//             <Card className="bg-white w-full h-full flex-1 min-h-0 rounded-xl border border-blue-gray-100 lg:flex">
//                 <CardHeader variant="gradient" color="gray" className="my-4 p-4">
//                     <Typography variant="h6" color="white">
//                         Lista de Clientes
//                     </Typography>
//                 </CardHeader>
//                 <CardBody className="px-4 pt-0 pb-6">
//                     <div className="overflow-x-auto bg-white shadow-md rounded-lg">
//                         <table className="min-w-full table-auto">
//                             <thead>
//                             <tr>
//                                 <th className="px-4 py-2 border-b text-left">ID</th>
//                                 <th className="px-4 py-2 border-b text-left">Nome</th>
//                                 <th className="px-4 py-2 border-b text-left">CPF</th>
//                                 <th className="px-4 py-2 border-b text-left">Email</th>
//                                 <th className="px-4 py-2 border-b text-left">Telefone</th>
//                                 <th className="px-4 py-2 border-b text-left">Ações</th>
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
//                                     <td className="px-4 py-2 border-b space-x-1">
//                                         <button onClick={() => handleEdit(cliente.id)}>
//                                             <div className="p-1 rounded-md text-blue-700 hover:bg-blue-100">
//                                                 <PencilIcon className="w-5 h-5"/>
//                                             </div>
//                                         </button>
//
//                                         <button onClick={() => handleConfirmDelete(cliente)}>
//                                             <div className="p-1 rounded-md text-red-700 hover:bg-red-100 ">
//                                                 <TrashIcon className="w-5 h-5"/>
//                                             </div>
//                                         </button>
//
//                                         <button>
//                                             <div className="p-1 rounded-md text-gray-800 hover:bg-gray-200 ">
//                                                 <InformationCircleIcon className="w-5 h-5"/>
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
//                                 <h3 className="text-xl font-semibold mb-4">Confirmar Exclusão</h3>
//                                 <p>
//                                     Tem certeza de que deseja remover o cliente "<strong>{clienteSelecionado?.nome}</strong>"?
//                                 </p>
//                                 <div className="mt-4 flex justify-end">
//                                     <button
//                                         onClick={() => setModalVisible(false)}
//                                         className="mr-4 bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400"
//                                     >
//                                         Cancelar
//                                     </button>
//                                     <button
//                                         onClick={handleDelete}
//                                         className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
//                                     >
//                                         Confirmar
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     )}
//             </CardBody>
//             </Card>
//         </>
//     );
// };
//
// export default ClientesTable;
import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {MapPinIcon, PencilIcon, TrashIcon} from '@heroicons/react/24/solid'; // Importando os ícones do Heroicons
import api from '../../services/axiosConfig';
import {Card, CardBody, CardHeader, Typography} from "@material-tailwind/react";

const ClientesTable = () => {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [clienteSelecionado, setClienteSelecionado] = useState(null);
    const [enderecos, setEnderecos] = useState([]);  // Novo estado para armazenar os endereços
    const [modalEnderecosVisible, setModalEnderecosVisible] = useState(false);  // Controlar visibilidade do modal de endereços

    const navigate = useNavigate();

    // Função para buscar todos os clientes
    const fetchClientes = async () => {
        try {
            const response = await api.get('/cliente');
            const data = Array.isArray(response.data) ? response.data : [];
            setClientes(data);
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
            setClientes([]);
        } finally {
            setLoading(false);
        }
    };

    // Carregar lista de clientes quando o componente é montado
    useEffect(() => {
        fetchClientes();
    }, []);

    // Função para buscar os endereços de um cliente
    const fetchEnderecos = async (clienteId) => {
        try {
            const response = await api.get(`/endereco/cliente/${clienteId}`);
            const data = Array.isArray(response.data) ? response.data : [];
            setEnderecos(data);
        } catch (error) {
            console.error('Erro ao buscar endereços:', error);
            setEnderecos([]);
        } finally {
            setLoadingEnderecos(false);
        }
    };

    const handleShowEnderecos = (clienteId, nomeCliente) => {
        setClienteSelecionado({ ...clienteSelecionado, nome: nomeCliente });  // Atualizando o nome do cliente
        fetchEnderecos(clienteId);
        setModalEnderecosVisible(true);  // Exibe o modal de endereços
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
                fetchClientes(); // Recarregar a lista após exclusão
            } catch (error) {
                console.error('Erro ao remover cliente:', error);
            }
        }
    };

    // Exibir mensagem de "Carregando..." enquanto os dados não são carregados
    if (loading) {
        return <div>Carregando...</div>;
    }

    return (
        <>
            <Card className="bg-white w-full h-full flex-1 min-h-0 rounded-xl border border-blue-gray-100 lg:flex">
                <CardHeader variant="gradient" color="gray" className="my-4 p-4">
                    <Typography variant="h6" color="white">
                        Lista de Clientes
                    </Typography>
                </CardHeader>
                <CardBody className="px-4 pt-0 pb-6">
                    <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                        <table className="min-w-full table-auto">
                            <thead>
                            <tr>
                                <th className="px-4 py-2 border-b text-left">ID</th>
                                <th className="px-4 py-2 border-b text-left">Nome</th>
                                <th className="px-4 py-2 border-b text-left">CPF</th>
                                <th className="px-4 py-2 border-b text-left">Email</th>
                                <th className="px-4 py-2 border-b text-left">Telefone</th>
                                <th className="pr-4 py-2 border-b text-left">Ações</th>
                            </tr>
                            </thead>
                            <tbody>
                            {clientes.map((cliente) => (
                                <tr key={cliente.id}>
                                    <td className="px-4 py-2 border-b">{cliente.id}</td>
                                    <td className="px-4 py-2 border-b">{cliente.nome}</td>
                                    <td className="px-4 py-2 border-b">{cliente.cpf}</td>
                                    <td className="px-4 py-2 border-b">{cliente.email}</td>
                                    <td className="px-4 py-2 border-b">{cliente.telefone}</td>
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

                    {/* Modal de Confirmação de Exclusão */}
                    {modalVisible && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                            <div className="bg-white p-6 rounded-lg shadow-xl w-1/3">
                                <h3 className="text-xl font-semibold mb-4">Confirmar Exclusão</h3>
                                <p>
                                    Tem certeza de que deseja remover o cliente "<strong>{clienteSelecionado?.nome}</strong>"?
                                </p>
                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={() => setModalVisible(false)}
                                        className="mr-4 bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                                    >
                                        Confirmar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {modalEnderecosVisible && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" onClick={() => setModalEnderecosVisible(false)}>
                            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg md:w-1/2">
                                <Typography variant="h4" color="gray" className="mb-4">
                                    Endereços de {clienteSelecionado?.nome}
                                </Typography>

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
