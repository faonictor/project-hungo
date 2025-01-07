// // import React, {useState, useEffect} from "react";
// // import {useParams, useNavigate} from "react-router-dom";
// // import api from "../../services/axiosConfig";
// // import {Button, Card, CardBody, CardHeader, Typography} from "@material-tailwind/react";
// // import {ArrowPathIcon} from "@heroicons/react/24/outline";
// // import {PlusSmallIcon} from "@heroicons/react/24/solid";
// // import SelectField from "@/widgets/forms/select-field.jsx";
// // import AlertMessage from "@/widgets/alert-message.jsx";
// // import {TrashIcon} from "@heroicons/react/24/outline/index.js";
// //
// // const PedidoForm = () => {
// //     const {vendaId} = useParams(); // Captura o ID da venda
// //     const navigate = useNavigate();
// //
// //     const [clientes, setClientes] = useState([]);
// //     const [produtos, setProdutos] = useState([]);
// //     const [selectedCliente, setSelectedCliente] = useState(null);
// //     const [selectedTipoPedido, setSelectedTipoPedido] = useState("Local"); // Default to "Local" as string
// //     const [selectedStatusPedido, setSelectedStatusPedido] = useState("Aberto"); // Default to "Aberto" as string
// //     const [carrinho, setCarrinho] = useState([]);
// //     const [alertMessage, setAlertMessage] = useState(null);
// //     const [alertColor, setAlertColor] = useState("green");
// //     const [loading, setLoading] = useState(false);
// //
// //     // Carregar clientes
// //     useEffect(() => {
// //         const fetchClientes = async () => {
// //             try {
// //                 const response = await api.get("/cliente");
// //                 setClientes(response.data);
// //             } catch (error) {
// //                 setAlertMessage("Erro ao carregar clientes");
// //                 setAlertColor("red");
// //             }
// //         };
// //
// //         fetchClientes();
// //     }, []);
// //
// //     // Carregar produtos
// //     useEffect(() => {
// //         const fetchProdutos = async () => {
// //             try {
// //                 const response = await api.get("/produtos");
// //                 setProdutos(response.data);
// //             } catch (error) {
// //                 setAlertMessage("Erro ao carregar produtos");
// //                 setAlertColor("red");
// //             }
// //         };
// //
// //         fetchProdutos();
// //     }, []);
// //
// //     // Função para adicionar um item ao carrinho
// //     const handleAddToCarrinho = (produto) => {
// //         const produtoExistente = carrinho.find((item) => item.produto.id === produto.id);
// //         if (produtoExistente) {
// //             produtoExistente.quantidade += 1;
// //             setCarrinho([...carrinho]);
// //         } else {
// //             setCarrinho([...carrinho, {produto, quantidade: 1}]);
// //         }
// //     };
// //
// //     // Função para remover um item do carrinho
// //     const handleRemoveFromCarrinho = (produtoId) => {
// //         setCarrinho(carrinho.filter((item) => item.produto.id !== produtoId));
// //     };
// //
// //     // Função para enviar o pedido para a API
// //     const handleSubmitPedido = async () => {
// //         if (!selectedCliente) {
// //             setAlertMessage("Por favor, selecione um cliente!");
// //             setAlertColor("red");
// //             return;
// //         }
// //
// //         if (carrinho.length === 0) {
// //             setAlertMessage("Carrinho vazio! Adicione produtos.");
// //             setAlertColor("red");
// //             return;
// //         }
// //
// //         const pedidoData = {
// //             clienteId: selectedCliente, // ID do cliente
// //             vendaId: vendaId,           // ID da venda
// //             tipoPedido: selectedTipoPedido,  // Tipo de pedido (string)
// //             statusPedido: selectedStatusPedido,  // Status do pedido (string)
// //             dataHora: new Date().toISOString(),  // Data e hora do pedido
// //             itens: carrinho.map(item => ({
// //                 produtoId: item.produto.id,    // ID do produto
// //                 quantidade: item.quantidade   // Quantidade
// //             }))
// //         };
// //
// //         try {
// //             setLoading(true);
// //             // Enviar pedido via POST
// //             const response = await api.post(`/pedido/novo/${vendaId}`, pedidoData);
// //             setAlertMessage("Pedido criado com sucesso!");
// //             setAlertColor("green");
// //             setCarrinho([]); // Limpar carrinho após sucesso
// //             navigate("/dashboard/vendas");
// //         } catch (error) {
// //             console.error("Erro ao criar pedido:", error);
// //             setAlertMessage("Erro ao criar pedido");
// //             setAlertColor("red");
// //         } finally {
// //             setLoading(false);
// //         }
// //     };
// //
// //     return (
// //         <Card className="bg-white w-full h-full flex-1 min-h-0 rounded-xl border border-blue-gray-100 lg:flex">
// //             <CardHeader variant="gradient" color="gray" className="my-4 p-4">
// //                 <Typography variant="h6" color="white">
// //                     Adicionar Pedido - Venda #{vendaId}
// //                 </Typography>
// //             </CardHeader>
// //
// //             <CardBody className="px-4 pt-0 pb-6">
// //                 {/* Alert Message */}
// //                 <AlertMessage alertMessage={alertMessage} alertColor={alertColor}
// //                               onClose={() => setAlertMessage(null)}/>
// //                 <div className="flex flex-col space-y-4">
// //                     <div className="mb-2 grid grid-cols-1 sm:grid-cols-8 gap-4">
// //
// //                         <div className="col-span-4">
// //                             <SelectField
// //                                 label="Selecione o Cliente"
// //                                 value={selectedCliente}
// //                                 onChange={setSelectedCliente}
// //                                 options={clientes.map(cliente => ({
// //                                     value: cliente.id,
// //                                     label: cliente.nome
// //                                 }))}
// //                                 placeholder="Clientes Disponíveis"
// //                             />
// //                         </div>
// //
// //
// //                         <div className="col-span-2">
// //                             <SelectField
// //                                 label="Tipo de Pedido"
// //                                 value={selectedTipoPedido}
// //                                 onChange={setSelectedTipoPedido}
// //                                 options={[
// //                                     {value: "Local", label: "Local"},
// //                                     {value: "Delivery", label: "Delivery"}
// //                                 ]}
// //                             />
// //                         </div>
// //
// //                         <div className="col-span-2">
// //                             <SelectField
// //                                 label="Status do Pedido"
// //                                 value={selectedStatusPedido}
// //                                 onChange={setSelectedStatusPedido}
// //                                 options={[
// //                                     {value: "Aberto", label: "Aberto"},
// //                                     {value: "Em Andamento", label: "Em Andamento"},
// //                                     {value: "Finalizado", label: "Finalizado"},
// //                                     {value: "Rota de Entrega", label: "Rota de Entrega"},
// //                                     {value: "Pago", label: "Pago"}
// //                                 ]}
// //                             />
// //                         </div>
// //                     </div>
// //
// //                     {/* Exibição de Produtos */}
// //                     <div className="overflow-x-auto flex space-x-4 bg-gray-100 rounded-lg p-4">
// //                         {produtos.map(produto => (
// //                             <div key={produto.id} className="flex bg-white justify-center items-center space-x-4 p-4 rounded-lg">
// //                                     <Typography variant="h6">{produto.nome}</Typography>
// //                                     <Typography>{`R$ ${produto.preco.toFixed(2)}`}</Typography>
// //                                     <Button onClick={() => handleAddToCarrinho(produto)} className="p-2">
// //                                         <PlusSmallIcon className="h-5 w-5"/>
// //                                     </Button>
// //                             </div>
// //                         ))}
// //                     </div>
// //
// //                     {/* Carrinho */}
// //                     <div className="mt-6">
// //                         <Typography variant="h6">Carrinho</Typography>
// //                         <div className="overflow-x-auto bg-white shadow-md rounded-lg p-4">
// //                             <table className="min-w-full table-auto">
// //                                 <thead>
// //                                 <tr>
// //                                     <th className="px-4 py-2 border-b text-left">Produto</th>
// //                                     <th className="px-4 py-2 border-b text-left">Quantidade</th>
// //                                     <th className="px-4 py-2 border-b text-left">Total por Item</th>
// //                                     <th className="px-4 py-2 border-b text-left">Ações</th>
// //                                 </tr>
// //                                 </thead>
// //                                 <tbody>
// //                                 {carrinho.map(item => (
// //                                     <tr key={item.produto.id}>
// //                                         <td className="px-4 py-2 border-b">{item.produto.nome}</td>
// //                                         <td className="px-4 py-2 border-b">{item.quantidade}</td>
// //                                         <td className="px-4 py-2 border-b">
// //                                             R$ {(item.produto.preco * item.quantidade).toFixed(2)}
// //                                         </td>
// //                                         <td className="px-4 py-2 border-b">
// //                                             <Button onClick={() => handleRemoveFromCarrinho(item.produto.id)}
// //                                                     color="red" className="p-2">
// //                                                 <TrashIcon className="h-5 w-5"/>
// //                                             </Button>
// //                                         </td>
// //                                     </tr>
// //                                 ))}
// //                                 </tbody>
// //                             </table>
// //
// //                             {/* Exibição do total geral */}
// //                             <div className="mt-4 p-4 rounded-lg flex justify-between items-center bg-gray-100">
// //                                 <Typography variant="h4">Total:</Typography>
// //                                 <Typography variant="h5"
// //                                             color="blue-gray">{`R$ ${carrinho.reduce((total, item) => total + (item.produto.preco * item.quantidade), 0).toFixed(2)}`}</Typography>
// //                             </div>
// //                         </div>
// //                     </div>
// //                 </div>
// //
// //                 {/* Botão de Submissão */}
// //                 <Button
// //                     onClick={handleSubmitPedido}
// //                     className="mt-4 w-full"
// //                     disabled={loading}>
// //                     {loading ? (
// //                         <ArrowPathIcon className="h-5 w-5 animate-spin"/>
// //                     ) : (
// //                         "Criar Pedido"
// //                     )}
// //                 </Button>
// //             </CardBody>
// //         </Card>
// //     );
// // };
// //
// //
// // export default PedidoForm;
// //
//
//
// import React, {useState, useEffect} from "react";
// import {useParams, useNavigate} from "react-router-dom";
// import api from "../../services/axiosConfig";
// import {Button, Card, CardBody, CardHeader, Typography} from "@material-tailwind/react";
// import {ArrowPathIcon} from "@heroicons/react/24/outline";
// import {MinusIcon, PlusIcon, PlusSmallIcon} from "@heroicons/react/24/solid";
// import SelectField from "@/widgets/forms/select-field.jsx";
// import AlertMessage from "@/widgets/alert-message.jsx";
// import {TrashIcon} from "@heroicons/react/24/solid/index.js";
//
// const PedidoForm = () => {
//     const {pedidoId} = useParams(); // Captura o ID do pedido
//     const navigate = useNavigate();
//
//     const [clientes, setClientes] = useState([]);
//     const [produtos, setProdutos] = useState([]);
//     const [pedido, setPedido] = useState(null); // Estado para o pedido carregado
//     const [selectedCliente, setSelectedCliente] = useState(null);
//     const [selectedTipoPedido, setSelectedTipoPedido] = useState("Local");
//     const [selectedStatusPedido, setSelectedStatusPedido] = useState("Aberto");
//     const [carrinho, setCarrinho] = useState([]);
//     const [alertMessage, setAlertMessage] = useState(null);
//     const [alertColor, setAlertColor] = useState("green");
//     const [loading, setLoading] = useState(false);
//     const [selectedVendaId, setSelectedVendaId] = useState(null); // Novo estado para vendaId
//
//     // Carregar clientes
//     useEffect(() => {
//         const fetchClientes = async () => {
//             try {
//                 const response = await api.get("/cliente");
//                 setClientes(response.data);
//             } catch (error) {
//                 setAlertMessage("Erro ao carregar clientes");
//                 setAlertColor("red");
//             }
//         };
//
//         fetchClientes();
//     }, []);
//
//     // Carregar produtos
//     useEffect(() => {
//         const fetchProdutos = async () => {
//             try {
//                 const response = await api.get("/produtos");
//                 setProdutos(response.data);
//             } catch (error) {
//                 setAlertMessage("Erro ao carregar produtos");
//                 setAlertColor("red");
//             }
//         };
//
//         fetchProdutos();
//     }, []);
//
//     // Carregar os dados do pedido
//     useEffect(() => {
//         const fetchPedido = async () => {
//             try {
//                 const response = await api.get(`/pedido/${pedidoId}`);
//                 setPedido(response.data);
//                 setSelectedCliente(response.data.clienteId);
//                 setSelectedVendaId(response.data.vendaId); // Carrega o vendaId
//                 setSelectedTipoPedido(response.data.tipoPedido);
//                 setSelectedStatusPedido(response.data.statusPedido);
//                 setCarrinho(
//                     response.data.itens.map(item => ({
//                         id: item.id, // Incluindo o id do item
//                         produto: produtos.find(p => p.id === item.produtoId),
//                         quantidade: item.quantidade,
//                     }))
//                 );
//             } catch (error) {
//                 setAlertMessage("Erro ao carregar pedido");
//                 setAlertColor("red");
//             }
//         };
//
//         if (pedidoId && produtos.length > 0) {
//             fetchPedido();
//         }
//     }, [pedidoId, produtos]);
//
//     // Função para adicionar um item ao carrinho
//     const handleAddToCarrinho = (produto) => {
//         const produtoExistente = carrinho.find((item) => item.produto.id === produto.id);
//         if (produtoExistente) {
//             produtoExistente.quantidade += 1;
//             setCarrinho([...carrinho]);
//         } else {
//             setCarrinho([...carrinho, {produto, quantidade: 1}]);
//         }
//     };
//
//     // Função para remover um item do carrinho
//     const handleRemoveFromCarrinho = (produtoId) => {
//         setCarrinho(carrinho.filter((item) => item.produto.id !== produtoId));
//     };
//
//     // Função para atualizar o pedido
//     const handleUpdatePedido = async () => {
//         if (!selectedCliente) {
//             setAlertMessage("Por favor, selecione um cliente!");
//             setAlertColor("red");
//             return;
//         }
//
//         if (!selectedVendaId) {
//             setAlertMessage("Venda ID é obrigatório!");
//             setAlertColor("red");
//             return;
//         }
//
//         if (carrinho.length === 0) {
//             setAlertMessage("Carrinho vazio! Adicione produtos.");
//             setAlertColor("red");
//             return;
//         }
//
//         const pedidoData = {
//             clienteId: selectedCliente,
//             vendaId: selectedVendaId,
//             tipoPedido: selectedTipoPedido,
//             statusPedido: selectedStatusPedido,
//             dataHora: new Date().toISOString(),
//             itens: carrinho.map(item => ({
//                 // id: item.id, // ID do item
//                 produtoId: item.produto.id,    // ID do produto
//                 quantidade: item.quantidade   // Quantidade
//             }))
//         };
//
//         try {
//             setLoading(true);
//             // Atualizar pedido via PUT
//             const response = await api.put(`/pedido/${pedidoId}`, pedidoData);
//             setAlertMessage('Pedido atualizado com sucesso!');
//             setAlertColor('green');
//
//             setTimeout(() => {
//                 navigate("/dashboard/vendas");
//             }, 1000);
//         } catch (error) {
//             console.error("Erro ao atualizar pedido:", error);
//             setAlertMessage("Erro ao atualizar pedido");
//             setAlertColor("red");
//         } finally {
//             setLoading(false);
//         }
//     };
//
//     if (!pedido) {
//         return <div>Carregando pedido...</div>;
//     }
//
//     const handleIncrement = (produtoId) => {
//         setCarrinho((prevCarrinho) =>
//             prevCarrinho.map((item) =>
//                 item.produto.id === produtoId
//                     ? {...item, quantidade: item.quantidade + 1}
//                     : item
//             )
//         );
//     };
//
//     const handleDecrement = (produtoId) => {
//         setCarrinho((prevCarrinho) =>
//             prevCarrinho.map((item) =>
//                 item.produto.id === produtoId && item.quantidade > 1
//                     ? {...item, quantidade: item.quantidade - 1}
//                     : item
//             )
//         );
//     };
//
//     return (
//         <Card className="bg-white w-full h-full flex-1 min-h-0 rounded-xl border border-blue-gray-100 lg:flex">
//             <CardHeader variant="gradient" color="gray" className="my-4 p-4">
//                 <Typography variant="h6" color="white">
//                     Editar Pedido - ID #{pedidoId}
//                 </Typography>
//             </CardHeader>
//
//             <CardBody className="px-4 pt-0 pb-6">
//                 {/* Alert Message */}
//                 <AlertMessage alertMessage={alertMessage} alertColor={alertColor}
//                               onClose={() => setAlertMessage(null)}/>
//                 <div className="flex flex-col space-y-4">
//                     <div className="mb-2 grid grid-cols-1 sm:grid-cols-8 gap-4">
//                         <div className="col-span-4">
//                             <SelectField
//                                 label="Selecione o Cliente"
//                                 value={selectedCliente}
//                                 onChange={setSelectedCliente}
//                                 options={clientes.map(cliente => ({
//                                     value: cliente.id,
//                                     label: cliente.nome
//                                 }))}
//                                 placeholder="Clientes Disponíveis"
//                             />
//                         </div>
//
//                         <div className="col-span-2">
//                             <SelectField
//                                 label="Tipo de Pedido"
//                                 value={selectedTipoPedido}
//                                 onChange={setSelectedTipoPedido}
//                                 options={[
//                                     {value: "Local", label: "Local"},
//                                     {value: "Delivery", label: "Delivery"}
//                                 ]}
//                             />
//                         </div>
//
//                         <div className="col-span-2">
//                             <SelectField
//                                 label="Status do Pedido"
//                                 value={selectedStatusPedido}
//                                 onChange={setSelectedStatusPedido}
//                                 options={[
//                                     {value: "Aberto", label: "Aberto"},
//                                     {value: "Em Andamento", label: "Em Andamento"},
//                                     {value: "Finalizado", label: "Finalizado"},
//                                     {value: "Rota de Entrega", label: "Rota de Entrega"},
//                                     {value: "Pago", label: "Pago"}
//                                 ]}
//                             />
//                         </div>
//                     </div>
//
//                     {/* Exibição de Produtos */}
//                     <div className="overflow-x-auto flex space-x-4 bg-gray-100 rounded-lg p-4">
//                         {produtos.map(produto => (
//                             <div key={produto.id}
//                                  className="flex bg-white justify-center items-center space-x-4 p-4 rounded-lg">
//                                 <Typography variant="h6">{produto.nome}</Typography>
//                                 <Typography>{`R$ ${produto.preco.toFixed(2)}`}</Typography>
//                                 <Button onClick={() => handleAddToCarrinho(produto)} className="p-2">
//                                     <PlusSmallIcon className="h-5 w-5"/>
//                                 </Button>
//                             </div>
//                         ))}
//                     </div>
//
//                     <div className="overflow-x-auto bg-white shadow-md rounded-lg">
//                         <table className="min-w-full table-auto">
//                             <thead>
//                             <tr>
//                                 {/*<th className="px-4 py-2 border-b text-left">ID</th>*/}
//                                 <th className="px-4 py-2 border-b text-left">Produto</th>
//                                 <th className="px-4 py-2 border-b text-left">Quantidade</th>
//                                 <th className="px-4 py-2 border-b text-left">Total</th>
//                                 <th className="px-4 py-2 border-b text-left">Remover</th>
//                             </tr>
//                             </thead>
//                             <tbody>
//                             {carrinho.length > 0 ? (
//                                 carrinho.map((item) => (
//                                     <tr key={`${item.produto.id}-${item.id}`}>
//                                         {/*<td className="px-4 py-2 border-b">{item.id}</td>*/}
//                                         <td className="px-4 py-2 border-b">{item.produto.nome}</td>
//                                         <td className="px-4 py-2 border-b">
//                                             <div className="flex items-center space-x-2">
//                                                 <button
//                                                     className="p-2 rounded-md text-blue-gray-500 hover:bg-gray-100"
//                                                     onClick={() => handleDecrement(item.produto.id)}
//                                                 >
//                                                     <MinusIcon className="w-5 h-5"/>
//                                                 </button>
//                                                 <span>{item.quantidade}</span>
//                                                 <button
//                                                     className="p-2 rounded-md text-blue-gray-500 hover:bg-gray-100"
//                                                     onClick={() => handleIncrement(item.produto.id)}
//                                                 >
//                                                     <PlusIcon className="w-5 h-5"/>
//                                                 </button>
//                                             </div>
//                                         </td>
//                                         <td className="px-4 py-2 border-b">R$ {(item.produto.preco * item.quantidade).toFixed(2)}</td>
//                                         <td className="px-2 py-2 border-b">
//                                             <button onClick={() => handleConfirmDelete(item.produto.id)}>
//                                                 <div
//                                                     className="p-1 rounded-md text-blue-gray-500 hover:bg-red-100 active:text-red-600">
//                                                     <TrashIcon className="w-5 h-5"/>
//                                                 </div>
//                                             </button>
//                                         </td>
//                                     </tr>
//                                 ))
//                             ) : (
//                                 <tr>
//                                     <td className="px-4 py-2 border-b text-center" colSpan="5">
//                                         {loading ? (
//                                             "Carregando..."
//                                         ) : (
//                                             "O carrinho está vazio"
//                                         )}
//                                     </td>
//                                 </tr>
//                             )}
//                             </tbody>
//                         </table>
//                     </div>
//
//                     {/* Exibição do total geral */}
//                     <div className="mt-4 p-4 rounded-lg flex justify-between items-center bg-gray-100">
//                         <Typography variant="h4">Total:</Typography>
//                         <Typography variant="h5"
//                                     color="blue-gray">{`R$ ${carrinho.reduce((total, item) => total + (item.produto.preco * item.quantidade), 0).toFixed(2)}`}</Typography>
//                     </div>
//
//
//                     <div className="mt-6">
//                         <Button onClick={handleUpdatePedido} className="w-full" disabled={loading}>
//                             {loading ? <ArrowPathIcon className="animate-spin h-5 w-5"/> : "Atualizar Pedido"}
//                         </Button>
//                     </div>
//                 </div>
//             </CardBody>
//         </Card>
//     );
// };
//
// export default PedidoForm;
//

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/axiosConfig";
import { Button, Card, CardBody, CardHeader, Typography } from "@material-tailwind/react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { MinusIcon, PlusIcon, PlusSmallIcon } from "@heroicons/react/24/solid";
import SelectField from "@/widgets/forms/select-field.jsx";
import AlertMessage from "@/widgets/alert-message.jsx";
import { TrashIcon } from "@heroicons/react/24/solid/index.js";

const PedidoForm = () => {
    const { pedidoId, vendaId } = useParams(); // Captura o ID do pedido ou venda
    const navigate = useNavigate();

    const [clientes, setClientes] = useState([]);
    const [produtos, setProdutos] = useState([]);
    const [pedido, setPedido] = useState(null); // Estado para o pedido carregado (caso de edição)
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [selectedTipoPedido, setSelectedTipoPedido] = useState("Local");
    const [selectedStatusPedido, setSelectedStatusPedido] = useState("Aberto");
    const [carrinho, setCarrinho] = useState([]);
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertColor, setAlertColor] = useState("green");
    const [loading, setLoading] = useState(false);
    const [selectedVendaId, setSelectedVendaId] = useState(vendaId || null);

    // Carregar clientes
    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const response = await api.get("/cliente");
                setClientes(response.data);
            } catch (error) {
                setAlertMessage("Erro ao carregar clientes");
                setAlertColor("red");
            }
        };

        fetchClientes();
    }, []);

    // Carregar produtos
    useEffect(() => {
        const fetchProdutos = async () => {
            try {
                const response = await api.get("/produtos");
                setProdutos(response.data);
            } catch (error) {
                setAlertMessage("Erro ao carregar produtos");
                setAlertColor("red");
            }
        };

        fetchProdutos();
    }, []);

    // Carregar os dados do pedido (somente para edição)
    useEffect(() => {
        if (pedidoId && produtos.length > 0) {
            const fetchPedido = async () => {
                try {
                    const response = await api.get(`/pedido/${pedidoId}`);
                    setPedido(response.data);
                    setSelectedCliente(response.data.clienteId);
                    setSelectedVendaId(response.data.vendaId);
                    setSelectedTipoPedido(response.data.tipoPedido);
                    setSelectedStatusPedido(response.data.statusPedido);

                    // Agora que produtos estão carregados, associamos corretamente os itens
                    setCarrinho(
                        response.data.itens.map(item => {
                            const produto = produtos.find(p => p.id === item.produtoId);
                            if (produto) {
                                return {
                                    id: item.id,
                                    produto,
                                    quantidade: item.quantidade,
                                };
                            }
                            return null; // Retorna null se o produto não for encontrado
                        }).filter(item => item !== null) // Filtra os nulls
                    );
                } catch (error) {
                    setAlertMessage("Erro ao carregar pedido");
                    setAlertColor("red");
                }
            };

            fetchPedido();
        }
    }, [pedidoId, produtos]);

    // Função para adicionar um item ao carrinho
    const handleAddToCarrinho = (produto) => {
        const produtoExistente = carrinho.find((item) => item.produto.id === produto.id);
        if (produtoExistente) {
            produtoExistente.quantidade += 1;
            setCarrinho([...carrinho]);
        } else {
            setCarrinho([...carrinho, { produto, quantidade: 1 }]);
        }
    };

    // Função para remover um item do carrinho
    const handleRemoveFromCarrinho = (produtoId) => {
        setCarrinho(carrinho.filter((item) => item.produto.id !== produtoId));
    };

    const handleSavePedido = async () => {
        if (!selectedCliente) {
            setAlertMessage("Por favor, selecione um cliente!");
            setAlertColor("red");
            return;
        }

        if (!selectedVendaId) {
            setAlertMessage("Venda ID é obrigatório!");
            setAlertColor("red");
            return;
        }

        if (carrinho.length === 0) {
            setAlertMessage("Carrinho vazio! Adicione produtos.");
            setAlertColor("red");
            return;
        }

        const pedidoData = {
            clienteId: selectedCliente,
            vendaId: selectedVendaId,
            tipoPedido: selectedTipoPedido,
            statusPedido: selectedStatusPedido,
            dataHora: new Date().toISOString(),
            itens: carrinho.map(item => ({
                produtoId: item.produto.id,
                quantidade: item.quantidade,
            })),
        };

        console.log("Dados do pedido:", pedidoData);  // Verifique os dados aqui!

        try {
            setLoading(true);
            let response;
            if (pedidoId) {
                // Atualiza pedido
                response = await api.put(`/pedido/${pedidoId}`, pedidoData);
                setAlertMessage("Pedido atualizado com sucesso!");
            } else {
                // Cria novo pedido
                response = await api.post(`/pedido/novo/${vendaId}`, pedidoData);
                setAlertMessage("Pedido criado com sucesso!");
            }
            setAlertColor("green");

            setTimeout(() => {
                navigate("/dashboard/vendas");
            }, 1000);
        } catch (error) {
            console.error("Erro ao salvar pedido:", error);

            if (error.response) {
                // A resposta do servidor contém o erro
                console.error("Erro da resposta:", error.response);
                setAlertMessage(`Erro: ${error.response.data.message || error.response.statusText}`);
            } else if (error.request) {
                // Caso não tenha resposta, erro na requisição
                console.error("Erro na requisição:", error.request);
                setAlertMessage("Erro na requisição! Não houve resposta do servidor.");
            } else {
                // Qualquer outro erro de configuração
                console.error("Erro na configuração:", error.message);
                setAlertMessage(`Erro: ${error.message}`);
            }

            setAlertColor("red");
        } finally {
            setLoading(false);
        }
    };



    // Função para criar ou atualizar o pedido
    // const handleSavePedido = async () => {
    //     if (!selectedCliente) {
    //         setAlertMessage("Por favor, selecione um cliente!");
    //         setAlertColor("red");
    //         return;
    //     }
    //
    //     if (!selectedVendaId) {
    //         setAlertMessage("Venda ID é obrigatório!");
    //         setAlertColor("red");
    //         return;
    //     }
    //
    //     if (carrinho.length === 0) {
    //         setAlertMessage("Carrinho vazio! Adicione produtos.");
    //         setAlertColor("red");
    //         return;
    //     }
    //
    //     const pedidoData = {
    //         clienteId: selectedCliente,
    //         vendaId: selectedVendaId,
    //         tipoPedido: selectedTipoPedido,
    //         statusPedido: selectedStatusPedido,
    //         dataHora: new Date().toISOString(),
    //         itens: carrinho.map(item => ({
    //             produtoId: item.produto.id,
    //             quantidade: item.quantidade,
    //         })),
    //     };
    //
    //     try {
    //         setLoading(true);
    //         let response;
    //         if (pedidoId) {
    //             // Atualiza pedido
    //             response = await api.put(`/pedido/${pedidoId}`, pedidoData);
    //             setAlertMessage("Pedido atualizado com sucesso!");
    //         } else {
    //             // Cria novo pedido
    //             response = await api.post("/pedido", pedidoData);
    //             setAlertMessage("Pedido criado com sucesso!");
    //         }
    //         setAlertColor("green");
    //
    //         setTimeout(() => {
    //             navigate("/dashboard/vendas");
    //         }, 1000);
    //     } catch (error) {
    //         console.error("Erro ao salvar pedido:", error);
    //         setAlertMessage("Erro ao salvar pedido");
    //         setAlertColor("red");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    if (!pedido && pedidoId) {
        return <div>Carregando pedido...</div>;
    }

    const handleIncrement = (produtoId) => {
        setCarrinho((prevCarrinho) =>
            prevCarrinho.map((item) =>
                item.produto.id === produtoId
                    ? { ...item, quantidade: item.quantidade + 1 }
                    : item
            )
        );
    };

    const handleDecrement = (produtoId) => {
        setCarrinho((prevCarrinho) =>
            prevCarrinho.map((item) =>
                item.produto.id === produtoId && item.quantidade > 1
                    ? { ...item, quantidade: item.quantidade - 1 }
                    : item
            )
        );
    };

    return (
        <Card className="bg-white w-full h-full flex-1 min-h-0 rounded-xl border border-blue-gray-100 lg:flex">
            <CardHeader variant="gradient" color="gray" className="my-4 p-4">
                <Typography variant="h6" color="white">
                    {pedidoId ? `Editar Pedido - ID #${pedidoId}` : (vendaId ? `Criar Pedido - Venda ID #${vendaId}` : "Criar Novo Pedido")}
                </Typography>
            </CardHeader>

            <CardBody className="px-4 pt-0 pb-6">
                {/* Alert Message */}
                <AlertMessage alertMessage={alertMessage} alertColor={alertColor}
                              onClose={() => setAlertMessage(null)} />
                <div className="flex flex-col space-y-4">
                    <div className="mb-2 grid grid-cols-1 sm:grid-cols-8 gap-4">
                        <div className="col-span-4">
                            <SelectField
                                label="Selecione o Cliente"
                                value={selectedCliente}
                                onChange={setSelectedCliente}
                                options={clientes.map(cliente => ({
                                    value: cliente.id,
                                    label: cliente.nome
                                }))}
                                placeholder="Clientes Disponíveis"
                            />
                        </div>

                        <div className="col-span-2">
                            <SelectField
                                label="Tipo de Pedido"
                                value={selectedTipoPedido}
                                onChange={setSelectedTipoPedido}
                                options={[
                                    { value: "Local", label: "Local" },
                                    { value: "Delivery", label: "Delivery" }
                                ]}
                            />
                        </div>

                        <div className="col-span-2">
                            <SelectField
                                label="Status do Pedido"
                                value={selectedStatusPedido}
                                onChange={setSelectedStatusPedido}
                                options={[
                                    { value: "Aberto", label: "Aberto" },
                                    { value: "Em Andamento", label: "Em Andamento" },
                                    { value: "Finalizado", label: "Finalizado" },
                                    { value: "Rota de Entrega", label: "Rota de Entrega" },
                                    { value: "Pago", label: "Pago" }
                                ]}
                            />
                        </div>
                    </div>

                    {/* Exibição de Produtos */}
                    <div className="overflow-x-auto flex space-x-4 bg-gray-100 rounded-lg p-4">
                        {produtos.map(produto => (
                            <div key={produto.id} className="flex bg-white justify-center items-center space-x-4 p-4 rounded-lg">
                                <Typography variant="h6">{produto.nome}</Typography>
                                <Typography>{`R$ ${produto.preco.toFixed(2)}`}</Typography>
                                <Button onClick={() => handleAddToCarrinho(produto)} className="p-2">
                                    <PlusSmallIcon className="h-5 w-5" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                        <table className="min-w-full table-auto">
                            <thead>
                            <tr>
                                <th className="px-4 py-2 border-b text-left">Produto</th>
                                <th className="px-4 py-2 border-b text-left">Quantidade</th>
                                <th className="px-4 py-2 border-b text-left">Total</th>
                                <th className="px-4 py-2 border-b text-left">Remover</th>
                            </tr>
                            </thead>
                            <tbody>
                            {carrinho.length > 0 ? (
                                carrinho.map((item) => (
                                    <tr key={`${item.produto.id}-${item.id}`}>
                                        <td className="px-4 py-2 border-b">{item.produto.nome}</td>
                                        <td className="px-4 py-2 border-b">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    className="p-2 rounded-md text-blue-gray-500 hover:bg-gray-100"
                                                    onClick={() => handleDecrement(item.produto.id)}
                                                >
                                                    <MinusIcon className="w-5 h-5" />
                                                </button>
                                                <span>{item.quantidade}</span>
                                                <button
                                                    className="p-2 rounded-md text-blue-gray-500 hover:bg-gray-100"
                                                    onClick={() => handleIncrement(item.produto.id)}
                                                >
                                                    <PlusIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 border-b">R$ {(item.produto.preco * item.quantidade).toFixed(2)}</td>
                                        <td className="px-2 py-2 border-b">
                                            <button onClick={() => handleRemoveFromCarrinho(item.produto.id)}>
                                                <div className="p-1 rounded-md text-blue-gray-500 hover:bg-red-100 active:text-red-600">
                                                    <TrashIcon className="w-5 h-5" />
                                                </div>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className="px-4 py-2 border-b text-center" colSpan="4">
                                        {loading ? "Carregando..." : "O carrinho está vazio"}
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Exibição do total geral */}
                    <div className="mt-4 p-4 rounded-lg flex justify-between items-center bg-gray-100">
                        <Typography variant="h4">Total:</Typography>
                        <Typography variant="h5" color="blue-gray">
                            {`R$ ${carrinho.reduce((total, item) => total + (item.produto.preco * item.quantidade), 0).toFixed(2)}`}
                        </Typography>
                    </div>

                    <div className="mt-6">
                        <Button onClick={handleSavePedido} className="w-full" disabled={loading}>
                            {loading ? <ArrowPathIcon className="animate-spin h-5 w-5" /> : (pedidoId ? "Atualizar Pedido" : "Criar Pedido")}
                        </Button>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

export default PedidoForm;
