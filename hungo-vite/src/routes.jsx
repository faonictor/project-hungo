import {
  HomeIcon,
  UserCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  UserPlusIcon,
  UserGroupIcon,
  CubeIcon,
} from "@heroicons/react/24/solid";
import {Home} from "@/pages/dashboard";
import {SignIn, SignUp} from "@/pages/auth";
import ClientesList from "@/pages/dashboard/clientes/clientesList.jsx";
import ClienteAdd from "@/pages/dashboard/clientes/clienteAdd.jsx";
import ClienteEnderecoAdd from "@/pages/dashboard/clientes/clienteDeliveryAdd.jsx";
import ClienteForm from "@/widgets/forms/form-cliente.jsx";
import ProdutoAdd from "@/pages/dashboard/produtos/produtoAdd.jsx";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "Dashboard",
        path: "/home",
        element: <Home/>,
      },
    ],
  },
  {
    title: "Clientes",
    layout: "dashboard",
    pages: [
      {
        icon: <UserPlusIcon {...icon} />,
        name: "Cliente Delivery",
        path: "/cliente-rapido",
        element: <ClienteEnderecoAdd/>,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Cadastrar Cliente",
        path: "/cliente",
        element: <ClienteAdd/>,
      },
      {
        icon: <UserGroupIcon {...icon} />,
        name: "Listar Clientes",
        path: "/clientes",
        element: <ClientesList/>,
      },
      // Removemos a rota de "Editar Cliente" do menu
    ],
  },
  {
    title: "Produtos",
    layout: "dashboard",
    pages: [
      {
        icon: <CubeIcon {...icon} />,
        name: "Cadastrar Produto",
        path: "/produto",
        element: <ProdutoAdd />,
      },
      // {
      //   icon: <ShoppingBagIcon {...icon} />,
      //   name: "Listar Produtos",
      //   path: "/produtos",
      //   element: <ProdutosList />,
      // },
      // {
      //   icon: <PencilIcon {...icon} />,
      //   name: "Editar Produto",
      //   path: "/produto/:id",
      //   element: <ProdutoAdd />,
      // },
    ],
  },
  {
    title: "Perfil",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "Sign In",
        path: "/sign-in",
        element: <SignIn/>,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "Sign Up",
        path: "/sign-up",
        element: <SignUp/>,
      },
    ],
  },
  // Mantemos a rota de edição, mas ela não aparecerá no menu
  {
    layout: "dashboard",
    pages: [
      {
        path: "/cliente/:id", // Rota para edição de clientes
        element: <ClienteForm/>,
      },
    ],
  },
];

export default routes;
