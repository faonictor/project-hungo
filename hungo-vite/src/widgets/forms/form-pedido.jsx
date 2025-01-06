import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/axiosConfig";
import { Button, Card, CardBody, CardHeader, Typography } from "@material-tailwind/react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { PlusSmallIcon } from "@heroicons/react/24/solid";
import SelectField from "@/widgets/forms/select-field.jsx";
import AlertMessage from "@/widgets/alert-message.jsx";
import { TrashIcon } from "@heroicons/react/24/outline/index.js";

const PedidoForm = () => {
    const { vendaId } = useParams(); // Captura o ID da venda
    const navigate = useNavigate();

    const [clientes, setClientes] = useState([]);
    const [produtos, setProdutos] = useState([]);
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [selectedTipoPedido, setSelectedTipoPedido] = useState("Local"); // Default to "Local" as string
    const [selectedStatusPedido, setSelectedStatusPedido] = useState("Aberto"); // Default to "Aberto" as string
    const [carrinho, setCarrinho] = useState([]);
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertColor, setAlertColor] = useState("green");
    const [loading, setLoading] = useState(false);

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

    // Função para enviar o pedido para a API
    const handleSubmitPedido = async () => {
        if (!selectedCliente) {
            setAlertMessage("Por favor, selecione um cliente!");
            setAlertColor("red");
            return;
        }

        if (carrinho.length === 0) {
            setAlertMessage("Carrinho vazio! Adicione produtos.");
            setAlertColor("red");
            return;
        }

        const pedidoData = {
            clienteId: selectedCliente, // ID do cliente
            vendaId: vendaId,           // ID da venda
            tipoPedido: selectedTipoPedido,  // Tipo de pedido (string)
            statusPedido: selectedStatusPedido,  // Status do pedido (string)
            dataHora: new Date().toISOString(),  // Data e hora do pedido
            itens: carrinho.map(item => ({
                produtoId: item.produto.id,    // ID do produto
                quantidade: item.quantidade   // Quantidade
            }))
        };

        try {
            setLoading(true);
            // Enviar pedido via POST
            const response = await api.post(`/pedido/novo/${vendaId}`, pedidoData);
            setAlertMessage("Pedido criado com sucesso!");
            setAlertColor("green");
            setCarrinho([]); // Limpar carrinho após sucesso
            navigate("/dashboard/vendas");
        } catch (error) {
            console.error("Erro ao criar pedido:", error);
            setAlertMessage("Erro ao criar pedido");
            setAlertColor("red");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="bg-white w-full h-full flex-1 min-h-0 rounded-xl border border-blue-gray-100 lg:flex">
            <CardHeader variant="gradient" color="gray" className="my-4 p-4">
                <Typography variant="h6" color="white">
                    Adicionar Pedido - Venda #{vendaId}
                </Typography>
            </CardHeader>

            <CardBody className="px-4 pt-0 pb-6">
                {/* Alert Message */}
                <AlertMessage alertMessage={alertMessage} alertColor={alertColor} onClose={() => setAlertMessage(null)} />
                <div className="flex flex-col space-y-4">
                    {/* Seleção de Cliente */}
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

                    {/* Selecione o Tipo de Pedido */}
                    <SelectField
                        label="Tipo de Pedido"
                        value={selectedTipoPedido}
                        onChange={setSelectedTipoPedido}
                        options={[
                            { value: "Local", label: "Local" },
                            { value: "Delivery", label: "Delivery" }
                        ]}
                    />

                    {/* Selecione o Status do Pedido */}
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

                    {/* Exibição de Produtos */}
                    <div className="overflow-x-auto flex space-x-4 bg-gray-100 rounded-lg p-4">
                        {produtos.map(produto => (
                            <div key={produto.id} className="w-52 flex-shrink-0">
                                <div className="bg-white p-4 rounded-lg">
                                    <Typography variant="h6">{produto.nome}</Typography>
                                    <Typography>{`R$ ${produto.preco.toFixed(2)}`}</Typography>
                                    <Button onClick={() => handleAddToCarrinho(produto)} className="p-2">
                                        <PlusSmallIcon className="h-5 w-5"/>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Carrinho */}
                    <div className="mt-6">
                        <Typography variant="h6">Carrinho</Typography>
                        <div className="overflow-x-auto bg-white shadow-md rounded-lg p-4">
                            <table className="min-w-full table-auto">
                                <thead>
                                <tr>
                                    <th className="px-4 py-2 border-b text-left">Produto</th>
                                    <th className="px-4 py-2 border-b text-left">Quantidade</th>
                                    <th className="px-4 py-2 border-b text-left">Total por Item</th>
                                    <th className="px-4 py-2 border-b text-left">Ações</th>
                                </tr>
                                </thead>
                                <tbody>
                                {carrinho.map(item => (
                                    <tr key={item.produto.id}>
                                        <td className="px-4 py-2 border-b">{item.produto.nome}</td>
                                        <td className="px-4 py-2 border-b">{item.quantidade}</td>
                                        <td className="px-4 py-2 border-b">
                                            R$ {(item.produto.preco * item.quantidade).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-2 border-b">
                                            <Button onClick={() => handleRemoveFromCarrinho(item.produto.id)} color="red" className="p-2">
                                                <TrashIcon className="h-5 w-5"/>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>

                            {/* Exibição do total geral */}
                            <div className="mt-4 p-4 rounded-lg flex justify-between items-center bg-gray-100">
                                <Typography variant="h4">Total:</Typography>
                                <Typography variant="h5" color="blue-gray">{`R$ ${carrinho.reduce((total, item) => total + (item.produto.preco * item.quantidade), 0).toFixed(2)}`}</Typography>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botão de Submissão */}
                <Button
                    onClick={handleSubmitPedido}
                    className="mt-4 w-full"
                    disabled={loading}>
                    {loading ? (
                        <ArrowPathIcon className="h-5 w-5 animate-spin" />
                    ) : (
                        "Criar Pedido"
                    )}
                </Button>
            </CardBody>
        </Card>
    );
};



export default PedidoForm;


