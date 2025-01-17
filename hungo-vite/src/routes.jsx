import {
  HomeIcon,
  UserCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  UserPlusIcon,
  UserGroupIcon,
  CubeIcon,
  ShoppingBagIcon,
  PencilIcon,
  ArchiveBoxArrowDownIcon,
  SquaresPlusIcon,
  MapPinIcon,
  ShoppingCartIcon,
  LockClosedIcon, CurrencyDollarIcon, KeyIcon,
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
import VendaAddEdit from "@/pages/dashboard/pedidos/vendasAddEdit.jsx";
import PedidoAddEdit from "@/pages/dashboard/pedidos/pedidoAddEdit.jsx";
import VendasList from "@/pages/dashboard/pedidos/vendasList.jsx";
import PedidoTable from "@/widgets/tables/table-pedidos.jsx";
import FluxoList from "@/pages/dashboard/financeiro/financeiroList.jsx";

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
    title: "Pedidos",
    layout: "dashboard",
    pages: [
      {
        icon: <ShoppingBagIcon {...icon} />,
        name: "Pedidos",
        path: "/pedido",
        element: <PedidoTable/>,
      },
    ],
  },
  {
    title: "Vendas",
    layout: "dashboard",
    pages: [
      {
        icon: <ShoppingCartIcon {...icon} />,
        name: "Abertas",
        path: "/vendas",
        element: <VendaAddEdit/>,
      },
      {
        icon: <LockClosedIcon {...icon} />,
        name: "Encerradas",
        path: "/venda/fechadas",
        element: <VendasList/>,
      },
      {
        icon: <ShoppingCartIcon {...icon} />,
        name: "Adicionar Pedido",
        path: "/pedido/novo/:vendaId",
        element: <PedidoAddEdit />,
      },
      {
        icon: <ShoppingCartIcon {...icon} />,
        name: "Adicionar Pedido",
        path: "/pedido/:pedidoId",
        element: <PedidoAddEdit />,
      },
      {
        icon: <CurrencyDollarIcon {...icon} />,
        name: "Financeiro",
        path: "/financeiro",
        element: <FluxoList />,
      }
    ],
  },
  {
    title: "Clientes",
    layout: "dashboard",
    pages: [
      {
        icon: <UserPlusIcon {...icon} />,
        name: "Novo Cliente",
        path: "/cliente-rapido",
        element: <ClienteEnderecoAdd/>,
      },

        //implementação de cliente usuário somente depois
      // {
      //   icon: <UserCircleIcon {...icon} />,
      //   name: "Cadastrar Cliente",
      //   path: "/cliente",
      //   element: <ClienteAddEdit/>,
      // },

      {
        icon: <UserGroupIcon {...icon} />,
        name: "Listar Clientes",
        path: "/clientes",
        element: <ClientesList/>,
      },
    ],
  },
  {
    title: "Produtos",
    layout: "dashboard",
    pages: [
      {
        icon: <ArchiveBoxArrowDownIcon {...icon} />,
        name: "Novo Produto",
        path: "/produto",
        element: <ProdutoAddEdit />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
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
        name: "Editar Categoria",
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
    title: "Endereços",
    layout: "dashboard",
    pages: [
      {
        icon: <MapPinIcon {...icon} />,
        name: "Novo Endereço",
        path: "/endereco/cadastro",
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
  // {
  //   title: "Perfil",
  //   layout: "auth",
  //   pages: [
  //     {
  //       icon: <ServerStackIcon {...icon} />,
  //       name: "Sign In",
  //       path: "/sign-in",
  //       element: <SignIn/>,
  //     },
  //     {
  //       icon: <RectangleStackIcon {...icon} />,
  //       name: "Sign Up",
  //       path: "/sign-up",
  //       element: <SignUp/>,
  //     },
  //   ],
  // },
  {
    layout: "dashboard",
    pages: [
      {
        path: "/cliente/:id",
        element: <ClienteAddEdit />,
      },
    ],
  },
];

export default routes;
