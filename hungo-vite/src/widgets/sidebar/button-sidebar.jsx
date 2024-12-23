import React from "react";
import { Button, Typography } from "@material-tailwind/react";
import { NavLink } from "react-router-dom";  // Para navegação
import PropTypes from "prop-types";  // Para validação das propriedades

const SidebarButton = ({ icon, text, route, isActive, sidenavColor, sidenavType }) => {
    return (
        <NavLink to={route}>
            {({ isActive }) => (
                <Button
                    variant={isActive ? "gradient" : "text"}
                    color={isActive ? sidenavColor : sidenavType === "dark" ? "white" : "blue-gray"}
                    className="flex items-center gap-4 w-full px-4"
                >
                    {icon} {/* Ícone */}
                    <Typography className="font-medium normal-case">{text}</Typography> {/* Texto */}
                </Button>
            )}
        </NavLink>
    );
};

// Definir tipos das propriedades para garantir a tipagem
SidebarButton.propTypes = {
    icon: PropTypes.element.isRequired, // O ícone deve ser um elemento React
    text: PropTypes.string.isRequired,  // O texto deve ser uma string
    route: PropTypes.string.isRequired, // A rota deve ser uma string
    isActive: PropTypes.bool,           // Indica se o botão está ativo
    sidenavColor: PropTypes.string,     // Cor do sidenav
    sidenavType: PropTypes.string,      // Tipo do sidenav
};

SidebarButton.defaultProps = {
    isActive: false,
    sidenavColor: "blue",
    sidenavType: "dark", // Padrão do sidebar é dark
};

export default SidebarButton;
