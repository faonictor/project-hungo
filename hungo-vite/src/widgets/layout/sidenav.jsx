// // import PropTypes from "prop-types";
// // import { Link, NavLink } from "react-router-dom";
// // import { XMarkIcon } from "@heroicons/react/24/outline";
// // import {
// //   Avatar,
// //   Button,
// //   IconButton,
// //   Typography,
// // } from "@material-tailwind/react";
// // import { useMaterialTailwindController, setOpenSidenav } from "@/context";
// //
// // export function Sidenav({ brandImg, brandName, routes }) {
// //   const [controller, dispatch] = useMaterialTailwindController();
// //   const { sidenavColor, sidenavType, openSidenav } = controller;
// //   const sidenavTypes = {
// //     dark: "bg-gradient-to-br from-gray-800 to-gray-900",
// //     white: "bg-white shadow-sm",
// //     transparent: "bg-transparent",
// //   };
// //
// //   return (
// //     <aside
// //       className={`${sidenavTypes[sidenavType]} ${
// //         openSidenav ? "translate-x-0" : "-translate-x-80"
// //       } fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300 xl:translate-x-0 border border-blue-gray-100`}
// //     >
// //       <div
// //         className={`relative`}
// //       >
// //         <Link to="/" className="py-6 px-8 text-center">
// //           <Typography
// //             variant="h6"
// //             color={sidenavType === "dark" ? "white" : "blue-gray"}
// //           >
// //             {brandName}
// //           </Typography>
// //         </Link>
// //         <IconButton
// //           variant="text"
// //           color="white"
// //           size="sm"
// //           ripple={false}
// //           className="absolute right-0 top-0 grid rounded-br-none rounded-tl-none xl:hidden"
// //           onClick={() => setOpenSidenav(dispatch, false)}
// //         >
// //           <XMarkIcon strokeWidth={2.5} className="h-5 w-5 text-white" />
// //         </IconButton>
// //       </div>
// //       <div className="m-4">
// //         {routes.map(({ layout, title, pages }, key) => (
// //           <ul key={key} className="mb-4 flex flex-col gap-1">
// //             {title && (
// //               <li className="mx-3.5 mt-4 mb-2">
// //                 <Typography
// //                   variant="small"
// //                   color={sidenavType === "dark" ? "white" : "blue-gray"}
// //                   className="font-black uppercase opacity-75"
// //                 >
// //                   {title}
// //                 </Typography>
// //               </li>
// //             )}
// //             {pages.map(({ icon, name, path }) => (
// //               <li key={name}>
// //                 <NavLink to={`/${layout}${path}`}>
// //                   {({ isActive }) => (
// //                     <Button
// //                       variant={isActive ? "gradient" : "text"}
// //                       color={
// //                         isActive
// //                           ? sidenavColor
// //                           : sidenavType === "dark"
// //                           ? "white"
// //                           : "blue-gray"
// //                       }
// //                       className="flex items-center gap-4 px-4 capitalize"
// //                       fullWidth
// //                     >
// //                       {icon}
// //                       <Typography
// //                         color="inherit"
// //                         className="font-medium capitalize"
// //                       >
// //                         {name}
// //                       </Typography>
// //                     </Button>
// //                   )}
// //                 </NavLink>
// //               </li>
// //             ))}
// //           </ul>
// //         ))}
// //       </div>
// //     </aside>
// //   );
// // }
// //
// // Sidenav.defaultProps = {
// //   brandImg: "/img/logo-ct.png",
// //   brandName: "Hungo Delivery",
// // };
// //
// // Sidenav.propTypes = {
// //   brandImg: PropTypes.string,
// //   brandName: PropTypes.string,
// //   routes: PropTypes.arrayOf(PropTypes.object).isRequired,
// // };
// //
// // Sidenav.displayName = "/src/widgets/layout/sidnave.jsx";
// //
// // export default Sidenav;
//
// import PropTypes from "prop-types";
// import { Link, NavLink } from "react-router-dom";
// import { XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
// import {
//   Avatar,
//   Button,
//   IconButton,
//   Typography,
// } from "@material-tailwind/react";
// import { useMaterialTailwindController, setOpenSidenav } from "@/context";
// import { useState } from "react";
// import Dropdown from "@/widgets/sidebar/dropdown-sidebar.jsx";
// import SidebarButton from "@/widgets/sidebar/button-sidebar.jsx";
//
// export function Sidenav({ brandImg, brandName, routes }) {
//   const [controller, dispatch] = useMaterialTailwindController();
//   const { sidenavColor, sidenavType, openSidenav } = controller;
//   const [openDropdownClientes, setOpenDropdownClientes] = useState(false);
//   const [openDropdownAuth, setOpenDropdownAuth] = useState(false);
//
//   const sidenavTypes = {
//     dark: "bg-gradient-to-br from-gray-800 to-gray-900",
//     white: "bg-white shadow-sm",
//     transparent: "bg-transparent",
//   };
//
//   // Funções para alternar o dropdown
//   const toggleDropdownClientes = () => setOpenDropdownClientes(prev => !prev);
//   const toggleDropdownAuth = () => setOpenDropdownAuth(prev => !prev);
//
//   return (
//       <aside
//           className={`${sidenavTypes[sidenavType]} ${
//               openSidenav ? "translate-x-0" : "-translate-x-80"
//           } fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300 xl:translate-x-0 border border-blue-gray-100`}
//       >
//         <div className="relative">
//           <Link to="/" className="py-6 px-8 text-center">
//             <Typography
//                 variant="h6"
//                 color={sidenavType === "dark" ? "white" : "blue-gray"}
//                 className="text-normal normal-case" // Aqui, forçamos o texto para 'normal-case'
//             >
//               {brandName}
//             </Typography>
//           </Link>
//           <IconButton
//               variant="text"
//               color="white"
//               size="sm"
//               ripple={false}
//               className="absolute right-0 top-0 grid rounded-br-none rounded-tl-none xl:hidden"
//               onClick={() => setOpenSidenav(dispatch, false)}
//           >
//             <XMarkIcon strokeWidth={2.5} className="h-5 w-5 text-white" />
//           </IconButton>
//         </div>
//
//         <div className="m-4">
//           {routes.map(({ layout, title, pages }, key) => (
//               <ul key={key} className="mb-4 flex flex-col gap-1">
//                 {title === "Clientes" && (
//                     <>
//                       {/* Botão de dropdown para "Clientes" */}
//                       <Button
//                           variant="text"
//                           color="blue-gray"
//                           className="flex items-center gap-4 w-full"
//                           onClick={toggleDropdownClientes}
//                       >
//                         <Typography className="font-medium normal-case">
//                           {title}
//                         </Typography>
//                         <ChevronDownIcon
//                             className={`h-5 w-5 ml-auto transform ${
//                                 openDropdownClientes ? "rotate-180" : ""
//                             } transition-transform duration-200`}
//                         />
//                       </Button>
//
//                       {/* Itens do dropdown Clientes */}
//                       <ul className={`mt-2 pl-6 ${openDropdownClientes ? "block" : "hidden"}`}>
//                         {pages.map(({ icon, name, path }) => (
//                             <li key={name} className="mb-2">
//                               <NavLink to={`/${layout}${path}`}>
//                                 {({ isActive }) => (
//                                     <Button
//                                         variant={isActive ? "gradient" : "text"}
//                                         color={isActive ? sidenavColor : sidenavType === "dark" ? "white" : "blue-gray"}
//                                         className="flex items-center gap-4 w-full"
//                                     >
//                                       {icon}
//                                       <Typography className="font-medium normal-case">
//                                         {name}
//                                       </Typography>
//                                     </Button>
//                                 )}
//                               </NavLink>
//                             </li>
//                         ))}
//                       </ul>
//                     </>
//                 )}
//                 {title === "auth pages" && (
//                     <>
//                       {/* Botão de dropdown para "Auth" */}
//                       <Button
//                           variant="text"
//                           color="blue-gray"
//                           className="flex items-center gap-4 w-full"
//                           onClick={toggleDropdownAuth}
//                       >
//                         <Typography className="font-medium normal-case">{title}</Typography>
//                         <ChevronDownIcon
//                             className={`h-5 w-5 ml-auto transform ${
//                                 openDropdownAuth ? "rotate-180" : ""
//                             } transition-transform duration-200`}
//                         />
//                       </Button>
//
//                       {/* Itens do dropdown Auth */}
//                       <ul className={`mt-2 pl-6 ${openDropdownAuth ? "block" : "hidden"}`}>
//                         {pages.map(({ icon, name, path }) => (
//                             <li key={name} className="mb-2">
//                               <NavLink to={`/${layout}${path}`}>
//                                 {({ isActive }) => (
//                                     <Button
//                                         variant={isActive ? "gradient" : "text"}
//                                         color={isActive ? sidenavColor : sidenavType === "dark" ? "white" : "blue-gray"}
//                                         className="flex items-center gap-4 w-full"
//                                     >
//                                       {icon}
//                                       <Typography className="font-medium normal-case">
//                                         {name}
//                                       </Typography>
//                                     </Button>
//                                 )}
//                               </NavLink>
//                             </li>
//                         ))}
//                       </ul>
//                     </>
//                 )}
//                 {/* Exibição de páginas que não têm título de seção */}
//                 {title !== "Clientes" && title !== "auth pages" && pages.map(({ icon, name, path }) => (
//                     <li key={name}>
//                       <NavLink to={`/${layout}${path}`}>
//                         {({ isActive }) => (
//                             <Button
//                                 variant={isActive ? "gradient" : "text"}
//                                 color={isActive ? sidenavColor : sidenavType === "dark" ? "white" : "blue-gray"}
//                                 className="flex items-center gap-4 px-4"
//                                 fullWidth
//                             >
//                               {icon}
//                               <Typography color="inherit" className="font-medium normal-case">{name}</Typography>
//                             </Button>
//                         )}
//                       </NavLink>
//                     </li>
//                 ))}
//               </ul>
//           ))}
//         </div>
//
//       </aside>
//   );
// }
//
// Sidenav.defaultProps = {
//   brandImg: "/img/logo-ct.png",
//   brandName: "Hungo Delivery",
// };
//
// Sidenav.propTypes = {
//   brandImg: PropTypes.string,
//   brandName: PropTypes.string,
//   routes: PropTypes.arrayOf(PropTypes.object).isRequired,
// };
//
// Sidenav.displayName = "/src/widgets/layout/sidenav.jsx";
//
// export default Sidenav;
//------------------------ Sidebar Antiga ------------------------------------------//
import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { Button, IconButton, Typography } from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";
import { useState } from "react";
import routes from "@/routes.jsx"; // Importando o arquivo de rotas

export function Sidenav({ brandImg, brandName }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav } = controller;
  const [openDropdown, setOpenDropdown] = useState({});

  const sidenavTypes = {
    dark: "bg-gradient-to-br from-gray-800 to-gray-900",
    white: "bg-white shadow-sm",
    transparent: "bg-transparent",
  };

  // Função para alternar o dropdown
  const toggleDropdown = (title) => {
    setOpenDropdown((prevState) => ({
      ...prevState,
      [title]: !prevState[title], // Alterna o estado do dropdown
    }));
  };

  // Função para verificar se o path contém um parâmetro de rota dinâmico, como :id
  const containsIdParam = (path) => {
    // Verifica se a rota contém ':id' no caminho
    return /:\w+/.test(path);
  };

  // Função para filtrar as rotas que não contêm ':id'
  const filterRoutes = (pages) => {
    return pages.filter((page) => !containsIdParam(page.path)); // Filtra páginas com ':id' no path
  };

  return (
      <aside
          className={`${sidenavTypes[sidenavType]} ${
              openSidenav ? "translate-x-0" : "-translate-x-80"
          } fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300 xl:translate-x-0 border border-blue-gray-100 overflow-y-auto`}
      >
        <div className="relative">
          <Link to="/" className="py-6 px-8 text-center">
            <Typography
                variant="h6"
                color={sidenavType === "dark" ? "white" : "blue-gray"}
                className="text-normal normal-case"
            >
              {brandName}
            </Typography>
          </Link>
          <IconButton
              variant="text"
              color="white"
              size="sm"
              ripple={false}
              className="absolute right-0 top-0 grid rounded-br-none rounded-tl-none xl:hidden"
              onClick={() => setOpenSidenav(dispatch, false)}
          >
            <XMarkIcon strokeWidth={2.5} className="h-5 w-5 text-white" />
          </IconButton>
        </div>

        <div className="m-4">
          {routes.map(({ title, layout, pages }, key) => (
              <ul key={key} className="mb-4 flex flex-col gap-1">
                {title && pages.length > 1 ? (
                    <>
                      <Button
                          variant="text"
                          color="blue-gray"
                          className="flex items-center gap-4 w-full"
                          onClick={() => toggleDropdown(title)} // Alterna a exibição do dropdown
                      >
                        <Typography className="font-medium normal-case">{title}</Typography>
                        <ChevronDownIcon
                            className={`h-5 w-5 ml-auto transform ${
                                openDropdown[title] ? "rotate-180" : ""
                            } transition-transform duration-200`}
                        />
                      </Button>

                      <ul
                          className={`mt-2 pl-6 ${openDropdown[title] ? "block" : "hidden"}`}
                      >
                        {filterRoutes(pages).map(({ icon, name, path }, idx) => (
                            <li key={idx} className="mb-2">
                              <NavLink to={`/${layout}${path}`}>
                                {({ isActive }) => (
                                    <Button
                                        variant={isActive ? "gradient" : "text"}
                                        color={
                                          isActive
                                              ? sidenavColor
                                              : sidenavType === "dark"
                                                  ? "white"
                                                  : "blue-gray"
                                        }
                                        className="flex items-center gap-4 w-full"
                                    >
                                      {icon}
                                      <Typography className="font-medium normal-case whitespace-nowrap">
                                        {name}
                                      </Typography>
                                    </Button>
                                )}
                              </NavLink>
                            </li>
                        ))}
                      </ul>
                    </>
                ) : (
                    filterRoutes(pages).map(({ icon, name, path }, idx) => (
                        <li key={idx}>
                          <NavLink to={`/${layout}${path}`}>
                            {({ isActive }) => (
                                <Button
                                    variant={isActive ? "gradient" : "text"}
                                    color={
                                      isActive
                                          ? sidenavColor
                                          : sidenavType === "dark"
                                              ? "white"
                                              : "blue-gray"
                                    }
                                    className="flex items-center gap-4 px-4"
                                    fullWidth
                                >
                                  {icon}
                                  <Typography color="inherit" className="font-medium normal-case">
                                    {name}
                                  </Typography>
                                </Button>
                            )}
                          </NavLink>
                        </li>
                    ))
                )}
              </ul>
          ))}
        </div>
      </aside>
  );
}

Sidenav.defaultProps = {
  brandImg: "/img/logo-ct.png",
  brandName: "Hungo Delivery",
};

Sidenav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Sidenav.displayName = "/src/widgets/layout/sidenav.jsx";

export default Sidenav;
