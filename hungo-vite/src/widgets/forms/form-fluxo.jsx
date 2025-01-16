import React, { useState } from "react";
import api from "../../services/axiosConfig";
import {Card, CardBody, Button, Typography} from "@material-tailwind/react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import InputField from "../forms/input-field";
import AlertMessage from "@/widgets/alert-message.jsx";

const FluxoForm = ({ onAddFluxo }) => {
    const [nome, setNome] = useState("");
    const [descricao, setDescricao] = useState("");
    const [transacao, setTransacao] = useState("entrada"); // entrada ou saída
    const [fluxo, setFluxo] = useState(""); // valor da transação
    const [dataTransacao, setDataTransacao] = useState(getLocalDateTime()); // Hora local ajustada
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertColor, setAlertColor] = useState("green");
    const [isLoading, setIsLoading] = useState(false);

    // Função para obter a data no formato local
    function getLocalDateTime() {
        const date = new Date();
        const offset = date.getTimezoneOffset() * 60000; // Obter o offset em milissegundos
        const localDate = new Date(date.getTime() - offset); // Ajusta a hora para o horário local
        return localDate.toISOString().slice(0, 16); // Retorna no formato 'yyyy-MM-ddTHH:mm'
    }

    // Validação do formulário
    const isFormValid = () => {
        return nome && descricao && fluxo && parseFloat(fluxo) > 0 && dataTransacao;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isFormValid()) {
            setAlertMessage("Por favor, preencha todos os campos obrigatórios.");
            setAlertColor("red");
            return;
        }

        setIsLoading(true);
        try {
            const fluxoFinanceiro = {
                nome,
                descricao,
                transacao,
                fluxo: parseFloat(fluxo),
                dataTransacao,
            };

            const response = await api.post("/fluxo", fluxoFinanceiro);
            onAddFluxo(response.data); // Atualiza a tabela ao adicionar
            setAlertMessage("Fluxo financeiro adicionado com sucesso!");
            setAlertColor("green");

            // Reseta os campos do formulário
            setNome("");
            setDescricao("");
            setTransacao("entrada");
            setFluxo("");
            setDataTransacao(getLocalDateTime()); // Recalcula a data com a hora local ajustada
        } catch (error) {
            setAlertMessage("Erro ao salvar o fluxo financeiro. Tente novamente.");
            setAlertColor("red");
            console.error("Erro ao salvar o fluxo financeiro:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <CardBody className="mt-8 px-4 pt-0 pb-6">
                <form onSubmit={handleSubmit} className="mt-8 max-w-screen-lg lg:w-full mx-auto">
                    <div className="mb-1 grid grid-cols-1 sm:grid-cols-12 gap-6">
                        <div className="col-span-1 sm:col-span-3">
                            <InputField
                                label="Nome"
                                placeholder="Ex.: Salário ou Pagamento"
                                value={nome}
                                onChange={setNome}
                            />
                        </div>
                        <div className="col-span-1 sm:col-span-4">
                            <InputField
                                label="Descrição"
                                placeholder="Ex.: Receita de trabalho"
                                value={descricao}
                                onChange={setDescricao}
                            />
                        </div>
                        <div className="col-span-1 sm:col-span-2">
                            <InputField
                                label="Valor"
                                placeholder="Ex.: 1500.00"
                                value={fluxo}
                                onChange={setFluxo}
                                type="number"
                            />
                        </div>
                        <div className="col-span-1 sm:col-span-3">
                            <Typography variant="small" color="blue-gray" className="mb-3 font-medium">
                                Tipo de Transação:
                            </Typography>
                            <div className="flex items-center gap-4">
                                <label>
                                    <input
                                        type="radio"
                                        value="entrada"
                                        checked={transacao === "entrada"}
                                        onChange={(e) => setTransacao(e.target.value)}
                                        className="mr-2"
                                    />
                                    Entrada
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        value="saida"
                                        checked={transacao === "saida"}
                                        onChange={(e) => setTransacao(e.target.value)}
                                        className="mr-2"
                                    />
                                    Saída
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex w-full justify-center">
                        <Button
                            type="submit"
                            className="mt-6 w-32 flex items-center justify-center"
                            disabled={!isFormValid() || isLoading}
                        >
                            {isLoading ? (
                                <ArrowPathIcon className="h-4 w-4 text-white animate-spin"/>
                            ) : (
                                "Cadastrar"
                            )}
                        </Button>
                    </div>

                    {/* Notificação */}
                    <div className="mt-4">
                        <AlertMessage
                            alertMessage={alertMessage}
                            alertColor={alertColor}
                            onClose={() => setAlertMessage(null)}
                        />
                    </div>
                </form>
            </CardBody>
        </>
    );
};

export default FluxoForm;
