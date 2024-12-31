import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/axiosConfig";
import InputField from "../forms/input-field";
import SelectField from "../forms/select-field";
import { Alert, Button, Card, CardBody, CardHeader, Typography } from "@material-tailwind/react";
import { PlusIcon, XMarkIcon, ArrowPathIcon } from "@heroicons/react/24/solid";

const PedidoForm = () => {
    const navigate = useNavigate();

    // Estados para gerenciar o formulário
    const [mesaId, setMesaId] = useState("");
    const [clienteId, setClienteId] = useState("");
    const [produtos, setProdutos] = useState([]);
    const [carrinho, setCarrinho] = useState([]);
    const [mesas, setMesas] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [buscaProduto, setBuscaProduto] = useState("");
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertColor, setAlertColor] = useState("green");
    const [isLoading, setIsLoading] = useState(false);

    // Carregar mesas, clientes e produtos
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [mesasRes, clientesRes, produtosRes] = await Promise.all([
                    api.get("/mesas"),
                    api.get("/clientes"),
                    api.get("/produtos")
                ]);

                setMesas(mesasRes.data);
                setClientes(clientesRes.data);
                setProdutos(produtosRes.data);
            } catch (error) {
                console.error("Erro ao carregar dados:", error);
                setAlertMessage("Erro ao carregar dados. Tente novamente.");
                setAlertColor("red");
            }
        };

        fetchData();
    }, []);

    // Função para adicionar produto ao carrinho
    const handleAddToCarrinho = (produto) => {
        setCarrinho((prevCarrinho) => {
            const produtoExistente = prevCarrinho.find((item) => item.id === produto.id);

            if (produtoExistente) {
                return prevCarrinho.map((item) =>
                    item.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item
                );
            }

            return [...prevCarrinho, { ...produto, quantidade: 1 }];
        });
    };

    // Função para remover produto do carrinho
    const handleRemoveFromCarrinho = (produtoId) => {
        setCarrinho((prevCarrinho) => prevCarrinho.filter((item) => item.id !== produtoId));
    };

    // Função para alterar quantidade de um produto no carrinho
    const handleQuantidadeChange = (produtoId, quantidade) => {
        setCarrinho((prevCarrinho) =>
            prevCarrinho.map((item) =>
                item.id === produtoId ? { ...item, quantidade: parseInt(quantidade, 10) || 0 } : item
            )
        );
    };

    // Função para salvar o pedido
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!mesaId || !clienteId || carrinho.length === 0) {
            setAlertMessage("Por favor, preencha todos os campos obrigatórios.");
            setAlertColor("red");
            return;
        }

        setIsLoading(true);

        try {
            const pedidoDTO = {
                mesaId,
                clienteId,
                itens: carrinho.map((item) => ({
                    produtoId: item.id,
                    quantidade: item.quantidade,
                    total: item.preco * item.quantidade,
                })),
            };

            await api.post("/pedidos", pedidoDTO);
            setAlertMessage("Pedido cadastrado com sucesso!");
            setAlertColor("green");
            setTimeout(() => navigate("/dashboard/pedidos"), 1000);
        } catch (error) {
            console.error("Erro ao salvar pedido:", error);
            setAlertMessage("Erro ao salvar pedido. Tente novamente.");
            setAlertColor("red");
        } finally {
            setIsLoading(false);
        }
    };

    // Produtos filtrados pela busca
    const produtosFiltrados = produtos.filter((produto) =>
        produto.nome.toLowerCase().includes(buscaProduto.toLowerCase())
    );

    return (
        <Card className="bg-white w-full h-full flex-1 rounded-xl border border-blue-gray-100">
            <CardHeader variant="gradient" color="gray" className="p-4">
                <Typography variant="h6" color="white">
                    Cadastrar Pedido
                </Typography>
            </CardHeader>

            <CardBody className="p-6">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <SelectField
                            label="Mesa"
                            value={mesaId}
                            onChange={setMesaId}
                            options={mesas.map((mesa) => ({ value: mesa.id, label: mesa.nome }))}
                            placeholder="Selecione a Mesa"
                        />

                        <SelectField
                            label="Cliente"
                            value={clienteId}
                            onChange={setClienteId}
                            options={clientes.map((cliente) => ({ value: cliente.id, label: cliente.nome }))}
                            placeholder="Selecione o Cliente"
                        />
                    </div>

                    <div className="mb-6">
                        <InputField
                            label="Buscar Produto"
                            placeholder="Digite o nome do produto"
                            value={buscaProduto}
                            onChange={setBuscaProduto}
                        />

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            {produtosFiltrados.map((produto) => (
                                <div
                                    key={produto.id}
                                    className="border p-4 rounded-md flex flex-col items-center"
                                >
                                    <Typography variant="small">{produto.nome}</Typography>
                                    <Typography variant="small" className="text-gray-500">
                                        R$ {produto.preco.toFixed(2)}
                                    </Typography>
                                    <Button
                                        size="sm"
                                        className="mt-2"
                                        onClick={() => handleAddToCarrinho(produto)}
                                    >
                                        Adicionar
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <Typography variant="h6" className="mb-2">
                            Carrinho
                        </Typography>
                        {carrinho.map((item) => (
                            <div key={item.id} className="flex items-center justify-between mb-2">
                                <div>
                                    <Typography variant="small">{item.nome}</Typography>
                                    <Typography variant="small" className="text-gray-500">
                                        R$ {item.preco.toFixed(2)}
                                    </Typography>
                                </div>
                                <div className="flex items-center gap-2">
                                    <InputField
                                        type="number"
                                        min="1"
                                        value={item.quantidade}
                                        onChange={(e) =>
                                            handleQuantidadeChange(item.id, e.target.value)
                                        }
                                        className="w-16 text-center"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveFromCarrinho(item.id)}
                                        className="text-red-500"
                                    >
                                        <XMarkIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center">
                        <Button
                            type="submit"
                            disabled={isLoading || carrinho.length === 0 || !mesaId || !clienteId}
                        >
                            {isLoading ? (
                                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                            ) : (
                                "Salvar Pedido"
                            )}
                        </Button>
                    </div>

                    {alertMessage && (
                        <Alert
                            color={alertColor}
                            className="mt-4"
                            onClose={() => setAlertMessage(null)}
                        >
                            {alertMessage}
                        </Alert>
                    )}
                </form>
            </CardBody>
        </Card>
    );
};

export default PedidoForm;
