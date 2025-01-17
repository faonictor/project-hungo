import React from 'react';
import { Alert } from '@material-tailwind/react';
import { CheckBadgeIcon, ExclamationCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';

const AlertMessage = ({ alertMessage, alertColor, onClose }) => {
    return (
        alertMessage && (
            <div className="mb-4 w-full">
                <Alert
                    open
                    color={alertColor}
                    className="relative flex items-center justify-between px-4 py-3 rounded-lg"
                >
                    <div className="flex gap-x-2">
                        {/* Condicional para ícones */}
                        {alertColor === 'green' ? (
                            <CheckBadgeIcon className="h-6 w-6 text-white" />
                        ) : alertColor === 'red' ? (
                            <ExclamationCircleIcon className="h-6 w-6 text-white" />
                        ) : null}

                        <span>{alertMessage}</span>
                    </div>

                    {/* Botão para fechar o alerta */}
                    <button
                        onClick={onClose}
                        className="absolute top-1/2 right-4 transform -translate-y-1/2"
                    >
                        <XMarkIcon className="h-6 w-6 text-white hover:bg-white hover:bg-opacity-20 rounded-md" />
                    </button>
                </Alert>
            </div>
        )
    );
};

export default AlertMessage;