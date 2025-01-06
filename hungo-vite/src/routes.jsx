import {
  HomeIcon,
  UserCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  UserPlusIcon,
  UserGroupIcon,
  CubeIcon, ShoppingBagIcon, PencilIcon, ArchiveBoxArrowDownIcon, SquaresPlusIcon, MapPinIcon, ShoppingCartIcon,
} from "@heroicons/react/24/solid";
import {Home} from "@/pages/dashboard";
import {SignIn, SignUp} from "@/pages/auth";
import ClientesList from "@/pages/dashboard/clientes/clientesList.jsx";
import ClienteAddEdit from "@/pages/dashboard/clientes/clienteAddEdit.jsx";
import ClienteEnderecoAdd from "@/pages/dashboard/clientes/clienteDeliveryAdd.jsx";
import ProdutoAddEdit from "@/pages/dashboard/produtos/produtoAddEdit.jsx";
import ProdutosList from "@/pages/dashboard/produtos/produtosList.jsx";
import EnderecoAddEdit from "@/pages/dashboard/enderecos/enderecoAddEdit.jsx";
import InsumoAddEdit from "@/pages/dashboard/produtos/insumoAddEdit.jsx";
import CategoriaAddEdit from "@/pages/dashboard/produtos/categoriaAddEdit.jsx";
import PedidoForm from "@/widgets/forms/form-pedido.jsx";

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
    title: "Vendas",
    layout: "dashboard",
    pages: [
      {
        icon: <ShoppingCartIcon {...icon} />,
        name: "Vendas Aberta",
        path: "/vendas",  // **Nova Rota para listar todas as vendas em aberto**. O usuário poderá visualizar as vendas que estão em aberto.
        element: <PedidoForm/>,   // **Componente** que será responsável por listar todas as vendas em aberto.
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
        icon: <ArchiveBoxArrowDownIcon {...icon} />,
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
        icon: <SquaresPlusIcon {...icon} />,
        name: "Categorias",
        path: "/categoria",
        element: <CategoriaAddEdit />,
      },
      {
        icon: <CubeIcon {...icon} />,
        name: "Insumos",
        path: "/insumo",
        element: <InsumoAddEdit />,
      },
      {
        icon: <PencilIcon {...icon} />,
        name: "Editar Categoriao",
        path: "/insumo/:id",
        element: <InsumoAddEdit />,
      },
      {
        icon: <PencilIcon {...icon} />,
        name: "Editar Produto",
        path: "/produto/:id",
        element: <ProdutoAddEdit />,
      },
      {
        icon: <PencilIcon {...icon} />,
        name: "Editar Categoriao",
        path: "/categoria/:id",
        element: <CategoriaAddEdit />,
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
        icon: <MapPinIcon {...icon} />,
        name: "Cadastrar Endereço",
        path: "/endereco/cadastro", // Rota Visível no Menu
        element: <EnderecoAddEdit />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "Cadastrar Endereço para Cliente",
        path: "/endereco/cadastro/:clienteId",
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
