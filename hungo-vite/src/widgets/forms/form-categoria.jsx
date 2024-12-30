import React, {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import api from '../../services/axiosConfig';
import InputField from '../forms/input-field';
import {Button, Card, CardBody, CardHeader, Typography} from "@material-tailwind/react";
import {ArrowPathIcon, PencilIcon, TrashIcon} from '@heroicons/react/24/solid';

import AlertMessage from "@/widgets/alert-message.jsx";
import CategoriaTables from "@/widgets/tables/table-categorias.jsx";

const CategoriaForm = () => {
    const {id} = useParams();
    const navigate = useNavigate();

    const [nome, setNome] = useState('');
    const [categorias, setCategorias] = useState([]);
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertColor, setAlertColor] = useState('green');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const response = await api.get('/categoria');
                setCategorias(response.data);
            } catch (error) {
                setAlertMessage('Erro ao carregar as categorias');
                setAlertColor('red');
                console.error('Erro ao buscar categorias:', error);
            }
        };

        const fetchCategoria = async () => {
            try {
                const response = await api.get(`/categoria/${id}`);
                const {nome} = response.data;
                setNome(nome);
            } catch (error) {
                setAlertMessage('Erro ao carregar os dados da categoria');
                setAlertColor('red');
                console.error('Erro ao buscar categoria:', error);
            }
        };

        fetchCategorias();

        if (id) {
            fetchCategoria();
        }
    }, [id]);

    const isFormValid = () => {
        return nome !== '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isFormValid()) {
            setAlertMessage('Por favor, preencha todos os campos obrigatórios.');
            setAlertColor('red');
            return;
        }

        setIsLoading(true);
        try {
            const categoriaDTO = { nome };

            if (id) {
                await api.put(`/categoria/${id}`, categoriaDTO);
                setAlertMessage('Categoria editada com sucesso!');
                setCategorias(categorias.map(categoria => categoria.id === id ? { ...categoria, nome } : categoria));
                navigate('/dashboard/categoria'); // Redireciona para a tela de categorias
            } else {
                const response = await api.post('/categoria', categoriaDTO);
                setAlertMessage('Categoria cadastrada com sucesso!');
                setCategorias([...categorias, response.data]);
            }
            setAlertColor('green');
            setNome('');
        } catch (error) {
            setAlertMessage('Erro ao cadastrar/editar categoria. Tente novamente.');
            setAlertColor('red');
            console.error('Erro na requisição:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (categoriaId) => {
        const categoria = categorias.find(categoria => categoria.id === categoriaId);
        if (categoria) {
            setNome(categoria.nome);
            navigate(`/dashboard/categoria/${categoriaId}`);

        }
    };

    const handleDelete = async (categoriaId) => {
        try {
            await api.delete(`/categoria/${categoriaId}`);
            setCategorias(categorias.filter(categoria => categoria.id !== categoriaId));
            setAlertMessage('Categoria excluída com sucesso!');
            setAlertColor('green');
        } catch (error) {
            setAlertMessage('Erro ao excluir categoria. Tente novamente.');
            setAlertColor('red');
            console.error('Erro ao excluir categoria:', error);
        }
    };

    return (
        <>
            <Card className="bg-white w-full h-full flex-1 min-h-0 rounded-xl border  border-blue-gray-100 lg:flex">
                <CardHeader variant="gradient" color="gray" className="my-4 p-4">
                    <Typography variant="h6" color="white">
                        {id ? 'Editar Categoria' : 'Cadastrar Categoria'}
                    </Typography>
                </CardHeader>
                <CardBody className="px-4 pt-0 pb-6 flex flex-col justify-center items-center">
                    <form onSubmit={handleSubmit} className="mt-8 max-w-screen-lg lg:w-full mx-auto">
                        <div className="mb-1 grid grid-cols-1 sm:grid-cols-8 gap-6">
                            <div className="col-span-1 sm:col-span-8">
                                <InputField label="Nome" placeholder="ex.: Categoria A" value={nome} onChange={setNome}/>
                            </div>

                            <div className="flex col-span-1 sm:col-span-8 w-full justify-center items-center">
                                <Button
                                    type="submit"
                                    className={`mt-6 w-32 mb-4 flex items-center justify-center ${id ? 'bg-green-500 hover:bg-green-600' : ''}`}
                                    disabled={!isFormValid() || isLoading}
                                >
                                    {isLoading ? (
                                        <ArrowPathIcon className="h-4 w-4 text-white animate-spin"/>
                                    ) : (
                                        id ? 'Editar' : 'Cadastrar'
                                    )}
                                </Button>
                            </div>
                        </div>
                        <AlertMessage
                            alertMessage={alertMessage}
                            alertColor={alertColor}
                            onClose={() => setAlertMessage(null)}
                        />
                    </form>

                    <div className="overflow-x-auto w-full md:w-1/2 bg-white shadow-md rounded-lg mt-8">
                        <table className="min-w-full table-auto">
                            <thead>
                            <tr>
                                <th className="px-4 py-2 border-b text-left">ID</th>
                                <th className="px-4 py-2 border-b text-left">Nome</th>
                                <th className="pr-4 py-2 border-b text-left">Ações</th>
                            </tr>
                            </thead>
                            <tbody>
                            {categorias.map((categoria) => (
                                <tr key={categoria.id}>
                                    <td className="px-4 py-2 border-b">{categoria.id}</td>
                                    <td className="px-4 py-2 border-b">{categoria.nome}</td>
                                    <td className="pr-4 py-2 border-b space-x-2 flex flex-nowrap">
                                        <button onClick={() => handleEdit(categoria.id)}>
                                            <div
                                                className="p-1 rounded-md text-blue-gray-500 hover:bg-blue-100 active:text-blue-500">
                                                <PencilIcon className="w-5 h-5"/>
                                            </div>
                                        </button>

                                        <button onClick={() => handleDelete(categoria.id)}>
                                            <div
                                                className="p-1 rounded-md text-blue-gray-500 hover:bg-red-100 active:text-red-600">
                                                <TrashIcon className="w-5 h-5"/>
                                            </div>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </CardBody>
            </Card>
        </>
    );
};

export default CategoriaForm;

