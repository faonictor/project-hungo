import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import React from "react";

const CategoriaTables = ({ categorias, handleEdit, handleDelete }) => {
    return (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg mt-8">
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
                        <td className="pr-4 py-2 border-b space-x-2">
                            <button onClick={() => handleEdit(categoria.id)}>
                                <div className="p-1 rounded-md text-blue-gray-500 hover:bg-blue-100 active:text-blue-500">
                                    <PencilIcon className="w-5 h-5" />
                                </div>
                            </button>

                            <button onClick={() => handleDelete(categoria.id)}>
                                <div className="p-1 rounded-md text-blue-gray-500 hover:bg-red-100 active:text-red-600">
                                    <TrashIcon className="w-5 h-5" />
                                </div>
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default CategoriaTables;
