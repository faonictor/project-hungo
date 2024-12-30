// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import api from '../../services/axiosConfig';
// import InputField from '../forms/input-field';
// import { Button, Card, CardBody, CardHeader, Typography } from "@material-tailwind/react";
// import AlertMessage from "@/widgets/alert-message.jsx";
//
// const EnderecoEditForm = () => {
//     const { id } = useParams(); // Pegando o ID do endereço via parâmetro da URL
//     const navigate = useNavigate();
//
//     const [rua, setRua] = useState('');
//     const [numero, setNumero] = useState('');
//     const [complemento, setComplemento] = useState('');
//     const [bairro, setBairro] = useState('');
//     const [cidade, setCidade] = useState('');
//     const [cep, setCep] = useState('');
//     const [clienteIdState, setClienteIdState] = useState('');
//     const [clientes, setClientes] = useState([]);
//     const [alertMessage, setAlertMessage] = useState(null);
//     const [alertColor, setAlertColor] = useState('green');
//     const [isLoading, setIsLoading] = useState(false);
//
//     // Carregar a lista de clientes (para o select)
//     useEffect(() => {
//         const fetchClientes = async () => {
//             try {
//                 const response = await api.get('/cliente');
//                 setClientes(response.data);
//             } catch (error) {
//                 setAlertMessage('Erro ao carregar os clientes');
//                 setAlertColor('red');
//                 console.error('Erro ao carregar clientes:', error);
//             }
//         };
//
//         fetchClientes();
//     }, []);
//
//     // Carregar os dados do endereço para edição
//     useEffect(() => {
//         if (id) {
//             const fetchEndereco = async () => {
//                 try {
//                     const response = await api.get(`/endereco/${id}`);
//                     const { rua, numero, complemento, bairro, cidade, cep, cliente } = response.data;
//
//                     setRua(rua);
//                     setNumero(numero);
//                     setComplemento(complemento);
//                     setBairro(bairro);
//                     setCidade(cidade);
//                     setCep(cep);
//                     setClienteIdState(cliente.id); // Setar o clienteId no select
//                 } catch (error) {
//                     setAlertMessage('Erro ao carregar os dados do endereço');
//                     setAlertColor('red');
//                     console.error('Erro ao buscar endereço:', error);
//                 }
//             };
//             fetchEndereco();
//         }
//     }, [id]);
//
//     const isFormValid = () => {
//         return rua.trim() !== '' && numero.trim() !== '' && bairro.trim() !== '' && cidade.trim() !== '' && cep.trim() !== '' && clienteIdState !== '';
//     };
//
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//
//         if (!isFormValid()) {
//             setAlertMessage('Por favor, preencha todos os campos obrigatórios.');
//             setAlertColor('red');
//             return;
//         }
//
//         setIsLoading(true);
//         try {
//             const enderecoDTO = { rua, numero, complemento, bairro, cidade, cep, cliente: { id: clienteIdState } };
//
//             // Editando endereço
//             await api.put(`/endereco/${id}`, enderecoDTO);
//             setAlertMessage('Endereço editado com sucesso!');
//             setAlertColor('green');
//             setTimeout(() => {
//                 navigate('/dashboard/endereco'); // Redireciona após sucesso
//             }, 1000);
//         } catch (error) {
//             setAlertMessage('Erro ao editar o endereço. Tente novamente.');
//             setAlertColor('red');
//             console.error('Erro na requisição:', error);
//         } finally {
//             setIsLoading(false);
//         }
//     };
//
//     return (
//         <Card className="bg-white w-full h-full flex-1 min-h-0 rounded-xl border border-blue-gray-100 lg:flex">
//             <CardHeader variant="gradient" color="gray" className="my-4 p-4">
//                 <Typography variant="h6" color="white">
//                     Editar Endereço
//                 </Typography>
//             </CardHeader>
//             <CardBody className="px-4 pt-0 pb-6">
//                 <form onSubmit={handleSubmit} className="mt-8 max-w-screen-lg lg:w-full mx-auto">
//                     <InputField label="Rua" placeholder="ex.: Rua das Flores" value={rua} onChange={setRua} />
//                     <InputField label="Número" placeholder="ex.: 123" value={numero} onChange={setNumero} />
//                     <InputField label="Complemento" placeholder="ex.: Apto 101" value={complemento} onChange={setComplemento} />
//                     <InputField label="Bairro" placeholder="ex.: Centro" value={bairro} onChange={setBairro} />
//                     <InputField label="Cidade" placeholder="ex.: São Paulo" value={cidade} onChange={setCidade} />
//                     <InputField label="CEP" placeholder="ex.: 12345-678" value={cep} onChange={setCep} />
//
//                     {/* Seleção de Cliente */}
//                     <div className="mb-4">
//                         <label className="block text-sm font-medium text-gray-700">Cliente</label>
//                         <select
//                             value={clienteIdState}
//                             onChange={(e) => setClienteIdState(e.target.value)}
//                             className="mt-2 block w-full px-4 py-2 text-base border border-gray-300 rounded-lg"
//                         >
//                             <option value="">Selecione um cliente</option>
//                             {clientes.length > 0 && clientes.map(cliente => (
//                                 <option key={cliente.id} value={cliente.id}>
//                                     {cliente.nome}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>
//
//                     <Button
//                         type="submit"
//                         className="mt-6 w-32 flex items-center justify-center bg-green-500 hover:bg-green-600"
//                         disabled={!isFormValid() || isLoading}
//                     >
//                         {isLoading ? 'Carregando...' : 'Salvar'}
//                     </Button>
//
//                     <AlertMessage alertMessage={alertMessage} alertColor={alertColor} onClose={() => setAlertMessage(null)} />
//                 </form>
//             </CardBody>
//         </Card>
//     );
// };
//
// export default EnderecoEditForm;
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/axiosConfig'; // Supondo que você tem uma configuração de API para pegar os dados
import InputField from '../forms/input-field'; // Supondo que você tem um componente de input reutilizável

const EnderecoEdit = () => {
    const { id } = useParams();  // Pega o ID da URL
    const [rua, setRua] = useState('');
    const [numero, setNumero] = useState('');
    const [complemento, setComplemento] = useState('');
    const [bairro, setBairro] = useState('');
    const [cidade, setCidade] = useState('');
    const [cep, setCep] = useState('');
    const [clienteId, setClienteId] = useState('');
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Carregar dados do endereço e clientes
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Carregar clientes
                const clientesResponse = await api.get('/cliente');
                setClientes(clientesResponse.data);

                if (id) {
                    // Carregar o endereço se o ID existir
                    const enderecoResponse = await api.get(`/endereco/${id}`);
                    const { rua, numero, complemento, bairro, cidade, cep, cliente } = enderecoResponse.data;

                    setRua(rua);
                    setNumero(numero);
                    setComplemento(complemento);
                    setBairro(bairro);
                    setCidade(cidade);
                    setCep(cep);
                    setClienteId(cliente.id);
                }
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!rua || !numero || !bairro || !cidade || !cep || !clienteId) {
            alert('Preencha todos os campos');
            return;
        }

        const enderecoDTO = { rua, numero, complemento, bairro, cidade, cep, cliente: { id: clienteId } };

        try {
            if (id) {
                // Atualizar endereço
                await api.put(`/endereco/${id}`, enderecoDTO);
                alert('Endereço editado com sucesso!');
            } else {
                // Cadastrar novo endereço
                await api.post('/endereco', enderecoDTO);
                alert('Endereço cadastrado com sucesso!');
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            alert('Erro ao salvar os dados');
        }
    };

    if (loading) {
        return <div>Carregando...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-semibold mb-4">
                {id ? 'Editar Endereço' : 'Cadastrar Endereço'}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Rua</label>
                    <input
                        type="text"
                        value={rua}
                        onChange={(e) => setRua(e.target.value)}
                        className="mt-2 p-2 w-full border border-gray-300 rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Número</label>
                    <input
                        type="text"
                        value={numero}
                        onChange={(e) => setNumero(e.target.value)}
                        className="mt-2 p-2 w-full border border-gray-300 rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Complemento</label>
                    <input
                        type="text"
                        value={complemento}
                        onChange={(e) => setComplemento(e.target.value)}
                        className="mt-2 p-2 w-full border border-gray-300 rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Bairro</label>
                    <input
                        type="text"
                        value={bairro}
                        onChange={(e) => setBairro(e.target.value)}
                        className="mt-2 p-2 w-full border border-gray-300 rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Cidade</label>
                    <input
                        type="text"
                        value={cidade}
                        onChange={(e) => setCidade(e.target.value)}
                        className="mt-2 p-2 w-full border border-gray-300 rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">CEP</label>
                    <input
                        type="text"
                        value={cep}
                        onChange={(e) => setCep(e.target.value)}
                        className="mt-2 p-2 w-full border border-gray-300 rounded"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Cliente</label>
                    <select
                        value={clienteId}
                        onChange={(e) => setClienteId(e.target.value)}
                        className="mt-2 p-2 w-full border border-gray-300 rounded"
                    >
                        <option value="">Selecione um cliente</option>
                        {clientes.map((cliente) => (
                            <option key={cliente.id} value={cliente.id}>
                                {cliente.nome}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    className="mt-4 p-2 w-full bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    {id ? 'Atualizar' : 'Cadastrar'}
                </button>
            </form>
        </div>
    );
};

export default EnderecoEdit;
