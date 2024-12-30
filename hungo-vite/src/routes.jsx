import {
  HomeIcon,
  UserCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  UserPlusIcon,
  UserGroupIcon,
  CubeIcon, ShoppingBagIcon, PencilIcon,
} from "@heroicons/react/24/solid";
import {Home} from "@/pages/dashboard";
import {SignIn, SignUp} from "@/pages/auth";
import ClientesList from "@/pages/dashboard/clientes/clientesList.jsx";
import ClienteAddEdit from "@/pages/dashboard/clientes/clienteAddEdit.jsx";
import ClienteEnderecoAdd from "@/pages/dashboard/clientes/clienteDeliveryAdd.jsx";
import ProdutoAddEdit from "@/pages/dashboard/produtos/produtoAdd.jsx";
import ProdutosList from "@/pages/dashboard/produtos/produtosList.jsx";
import EnderecoAddEdit from "@/pages/dashboard/enderecos/enderecoAddEdit.jsx";

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
        element: <ClienteAddEdit/>,
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
        element: <ProdutoAddEdit />,
      },
      {
        icon: <ShoppingBagIcon {...icon} />,
        name: "Listar Produtos",
        path: "/produtos",
        element: <ProdutosList />,
      },
      {
        icon: <PencilIcon {...icon} />,
        name: "Editar Produto",
        path: "/produto/:id",
        element: <ProdutoAddEdit />,
      },
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
  {
    title: "Endereços",
    layout: "dashboard",
    pages: [
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "Cadastrar Endereço",
        path: "/endereco/cadastro", // Rota Visível no Menu
        element: <EnderecoAddEdit />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "Cadastrar Endereço para Cliente",
        path: "/endereco/cadastro/:clienteId", // Rota para cadastro a partir de cliente selecionado
        element: <EnderecoAddEdit />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "Editar Endereço",
        path: "endereco/editar/:id",
        element: <EnderecoAddEdit />,
      },
    ],
  },
  // Mantemos a rota de edição, mas ela não aparecerá no menu
  {
    layout: "dashboard",
    pages: [
      {
        path: "/cliente/:id", // Rota para edição de clientes
        element: <ClienteAddEdit />,
      },
    ],
  },
];

export default routes;
