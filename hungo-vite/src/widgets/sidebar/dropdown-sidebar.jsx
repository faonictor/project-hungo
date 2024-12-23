import React from "react";
import { Button, Typography } from "@material-tailwind/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import {NavLink} from "react-router-dom";

const Dropdown = ({ title, items, isOpen, onToggle, sidenavColor, sidenavType }) => {
    return (
        <div className="mb-4">
            {/* Botão de Dropdown */}
            <Button
                variant="text"
                color="blue-gray"
                className="flex items-center gap-4 w-full"
                onClick={onToggle}
            >
                <Typography className="font-medium normal-case">{title}</Typography>
                <ChevronDownIcon
                    className={`h-5 w-5 ml-auto transform ${isOpen ? "rotate-180" : ""} transition-transform duration-200`}
                />
            </Button>

            {/* Conteúdo do Dropdown */}
            {isOpen && (
                <ul className="mt-2 pl-6">
                    {items.map(({ icon, name, path }, index) => (
                        <li key={index} className="mb-2">
                            <NavLink to={path}>
                                {({ isActive }) => (
                                    <Button
                                        variant={isActive ? "gradient" : "text"}
                                        color={isActive ? sidenavColor : sidenavType === "dark" ? "white" : "blue-gray"}
                                        className="flex items-center gap-4 w-full"
                                    >
                                        {icon}
                                        <Typography className="font-medium normal-case">{name}</Typography>
                                    </Button>
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Dropdown;
