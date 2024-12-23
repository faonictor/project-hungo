// src/components/Loading.js
import React from 'react';
import { ArrowPathIcon, CircleStackIcon } from '@heroicons/react/24/outline';

const Loading = ({ text = "Carregando...", color = "blue-500", type = "spin" }) => {
    // Seleciona o ícone com base no tipo
    const Icon = type === "spin" ? ArrowPathIcon : CircleStackIcon;
    return (
        <div className="flex items-center justify-center gap-x-2">
            <Icon className={`h-6 w-6 text-${color} animate-spin`} />
            <span>{text}</span>
        </div>
    );
};

export default Loading;