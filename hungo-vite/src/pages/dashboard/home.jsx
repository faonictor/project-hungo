// import React from "react";
// import {
//   Typography,
//   Card,
//   CardHeader,
//   CardBody,
//   IconButton,
//   Menu,
//   MenuHandler,
//   MenuList,
//   MenuItem,
//   Avatar,
//   Tooltip,
//   Progress,
// } from "@material-tailwind/react";
// import {
//   EllipsisVerticalIcon,
//   ArrowUpIcon,
// } from "@heroicons/react/24/outline";
// import { StatisticsCard } from "@/widgets/cards";
// import { StatisticsChart } from "@/widgets/charts";
// import {
//   statisticsCardsData,
//   statisticsChartsData,
//   projectsTableData,
//   ordersOverviewData,
// } from "@/data";
// import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/solid";
//
// export function Home() {
//   return (
//     <div className="mt-12">
//       <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
//         {statisticsCardsData.map(({ icon, title, footer, ...rest }) => (
//           <StatisticsCard
//             key={title}
//             {...rest}
//             title={title}
//             icon={React.createElement(icon, {
//               className: "w-6 h-6 text-white",
//             })}
//             footer={
//               <Typography className="font-normal text-blue-gray-600">
//                 <strong className={footer.color}>{footer.value}</strong>
//                 &nbsp;{footer.label}
//               </Typography>
//             }
//           />
//         ))}
//       </div>
//       <div className="mb-6 grid grid-cols-1 gap-y-12 gap-x-6 md:grid-cols-2 xl:grid-cols-3">
//         {statisticsChartsData.map((props) => (
//           <StatisticsChart
//             key={props.title}
//             {...props}
//             footer={
//               <Typography
//                 variant="small"
//                 className="flex items-center font-normal text-blue-gray-600"
//               >
//                 <ClockIcon strokeWidth={2} className="h-4 w-4 text-blue-gray-400" />
//                 &nbsp;{props.footer}
//               </Typography>
//             }
//           />
//         ))}
//       </div>
//       <div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
//         <Card className="overflow-hidden xl:col-span-2 border border-blue-gray-100 shadow-sm">
//           <CardHeader
//             floated={false}
//             shadow={false}
//             color="transparent"
//             className="m-0 flex items-center justify-between p-6"
//           >
//             <div>
//               <Typography variant="h6" color="blue-gray" className="mb-1">
//                 Projects
//               </Typography>
//               <Typography
//                 variant="small"
//                 className="flex items-center gap-1 font-normal text-blue-gray-600"
//               >
//                 <CheckCircleIcon strokeWidth={3} className="h-4 w-4 text-blue-gray-200" />
//                 <strong>30 done</strong> this month
//               </Typography>
//             </div>
//             <Menu placement="left-start">
//               <MenuHandler>
//                 <IconButton size="sm" variant="text" color="blue-gray">
//                   <EllipsisVerticalIcon
//                     strokeWidth={3}
//                     fill="currenColor"
//                     className="h-6 w-6"
//                   />
//                 </IconButton>
//               </MenuHandler>
//               <MenuList>
//                 <MenuItem>Action</MenuItem>
//                 <MenuItem>Another Action</MenuItem>
//                 <MenuItem>Something else here</MenuItem>
//               </MenuList>
//             </Menu>
//           </CardHeader>
//           <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
//             <table className="w-full min-w-[640px] table-auto">
//               <thead>
//                 <tr>
//                   {["companies", "members", "budget", "completion"].map(
//                     (el) => (
//                       <th
//                         key={el}
//                         className="border-b border-blue-gray-50 py-3 px-6 text-left"
//                       >
//                         <Typography
//                           variant="small"
//                           className="text-[11px] font-medium uppercase text-blue-gray-400"
//                         >
//                           {el}
//                         </Typography>
//                       </th>
//                     )
//                   )}
//                 </tr>
//               </thead>
//               <tbody>
//                 {projectsTableData.map(
//                   ({ img, name, members, budget, completion }, key) => {
//                     const className = `py-3 px-5 ${
//                       key === projectsTableData.length - 1
//                         ? ""
//                         : "border-b border-blue-gray-50"
//                     }`;
//
//                     return (
//                       <tr key={name}>
//                         <td className={className}>
//                           <div className="flex items-center gap-4">
//                             <Avatar src={img} alt={name} size="sm" />
//                             <Typography
//                               variant="small"
//                               color="blue-gray"
//                               className="font-bold"
//                             >
//                               {name}
//                             </Typography>
//                           </div>
//                         </td>
//                         <td className={className}>
//                           {members.map(({ img, name }, key) => (
//                             <Tooltip key={name} content={name}>
//                               <Avatar
//                                 src={img}
//                                 alt={name}
//                                 size="xs"
//                                 variant="circular"
//                                 className={`cursor-pointer border-2 border-white ${
//                                   key === 0 ? "" : "-ml-2.5"
//                                 }`}
//                               />
//                             </Tooltip>
//                           ))}
//                         </td>
//                         <td className={className}>
//                           <Typography
//                             variant="small"
//                             className="text-xs font-medium text-blue-gray-600"
//                           >
//                             {budget}
//                           </Typography>
//                         </td>
//                         <td className={className}>
//                           <div className="w-10/12">
//                             <Typography
//                               variant="small"
//                               className="mb-1 block text-xs font-medium text-blue-gray-600"
//                             >
//                               {completion}%
//                             </Typography>
//                             <Progress
//                               value={completion}
//                               variant="gradient"
//                               color={completion === 100 ? "green" : "blue"}
//                               className="h-1"
//                             />
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   }
//                 )}
//               </tbody>
//             </table>
//           </CardBody>
//         </Card>
//         <Card className="border border-blue-gray-100 shadow-sm">
//           <CardHeader
//             floated={false}
//             shadow={false}
//             color="transparent"
//             className="m-0 p-6"
//           >
//             <Typography variant="h6" color="blue-gray" className="mb-2">
//               Orders Overview
//             </Typography>
//             <Typography
//               variant="small"
//               className="flex items-center gap-1 font-normal text-blue-gray-600"
//             >
//               <ArrowUpIcon
//                 strokeWidth={3}
//                 className="h-3.5 w-3.5 text-green-500"
//               />
//               <strong>24%</strong> this month
//             </Typography>
//           </CardHeader>
//           <CardBody className="pt-0">
//             {ordersOverviewData.map(
//               ({ icon, color, title, description }, key) => (
//                 <div key={title} className="flex items-start gap-4 py-3">
//                   <div
//                     className={`relative p-1 after:absolute after:-bottom-6 after:left-2/4 after:w-0.5 after:-translate-x-2/4 after:bg-blue-gray-50 after:content-[''] ${
//                       key === ordersOverviewData.length - 1
//                         ? "after:h-0"
//                         : "after:h-4/6"
//                     }`}
//                   >
//                     {React.createElement(icon, {
//                       className: `!w-5 !h-5 ${color}`,
//                     })}
//                   </div>
//                   <div>
//                     <Typography
//                       variant="small"
//                       color="blue-gray"
//                       className="block font-medium"
//                     >
//                       {title}
//                     </Typography>
//                     <Typography
//                       as="span"
//                       variant="small"
//                       className="text-xs font-medium text-blue-gray-500"
//                     >
//                       {description}
//                     </Typography>
//                   </div>
//                 </div>
//               )
//             )}
//           </CardBody>
//         </Card>
//       </div>
//     </div>
//   );
// }
//
// export default Home;

import React, { useState, useEffect } from "react";
import {Button, Card, CardBody, CardHeader, Typography} from "@material-tailwind/react";
import { StatisticsCard } from "@/widgets/cards"; // Seu componente
import { ArrowUpIcon, ArrowDownIcon, BanknotesIcon } from "@heroicons/react/24/outline"; // Ícones
import { CheckCircleIcon } from "@heroicons/react/24/solid"; // Ícone de saldo
import api from "../../services/axiosConfig";
import AlertMessage from "@/widgets/alert-message.jsx";
import SelectField from "@/widgets/forms/select-field.jsx";
import {LockOpenIcon, PlusCircleIcon, PlusSmallIcon, ShoppingCartIcon} from "@heroicons/react/24/solid/index.js";
import {ArrowPathIcon, TrashIcon} from "@heroicons/react/24/outline/index.js";
import InputField from "@/widgets/forms/input-field.jsx";
import VendasList from "@/pages/dashboard/pedidos/vendasList.jsx";
import FluxoList from "@/pages/dashboard/financeiro/financeiroList.jsx"; // Para buscar os dados de fluxo financeiro

export function Home() {
  const [totais, setTotais] = useState({
    totalVendas: 0,
    totalEntradas: 0,
    totalSaidas: 0,
    saldo: 0,
  });

  // Usar useEffect para buscar os dados e calcular os totais
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vendasResponse, fluxosResponse] = await Promise.all([
          api.get("/venda/fechadas"),
          api.get("/fluxo"),
        ]);

        const totalVendas = vendasResponse.data.reduce((acc, venda) => acc + venda.total, 0);
        const totalEntradas = fluxosResponse.data
            .filter((fluxo) => fluxo.transacao === "entrada")
            .reduce((acc, fluxo) => acc + fluxo.fluxo, 0);
        const totalSaidas = fluxosResponse.data
            .filter((fluxo) => fluxo.transacao === "saida")
            .reduce((acc, fluxo) => acc + fluxo.fluxo, 0);
        const saldo = totalEntradas + totalVendas - totalSaidas;

        setTotais({ totalVendas, totalEntradas, totalSaidas, saldo });
      } catch (error) {
        console.error("Erro ao carregar dados", error);
      }
    };

    fetchData();
  }, []);

  // Criar os dados dinâmicos para os Statistic Cards com ícones
  const statisticsCardsData = [
    {
      title: "Total de Vendas",
      icon: <BanknotesIcon className="w-6 h-6 text-white" />,
      value: `R$ ${totais.totalVendas.toFixed(2)}`,
      footer: { value: totais.totalVendas.toFixed(2), label: "Vendas realizadas", color: "text-green-600" },
      color: "green", // Cor do card
    },
    {
      title: "Total de Entradas",
      icon: <ArrowUpIcon className="w-6 h-6 text-white" />,
      value: `R$ ${totais.totalEntradas.toFixed(2)}`,
      footer: { value: totais.totalEntradas.toFixed(2), label: "Entradas registradas", color: "text-blue-600" },
      color: "blue", // Cor do card
    },
    {
      title: "Total de Saídas",
      icon: <ArrowDownIcon className="w-6 h-6 text-white" />,
      value: `R$ ${totais.totalSaidas.toFixed(2)}`,
      footer: { value: totais.totalSaidas.toFixed(2), label: "Saídas registradas", color: "text-red-600" },
      color: "red", // Cor do card
    },
    {
      title: "Saldo",
      icon: <CheckCircleIcon className="w-6 h-6 text-white" />,
      value: `R$ ${totais.saldo.toFixed(2)}`,
      footer: { value: totais.saldo.toFixed(2), label: "Saldo total", color: totais.saldo >= 0 ? "text-green-600" : "text-red-600" },
      color: totais.saldo >= 0 ? "green" : "red", // Cor do card baseado no saldo
    },
  ];

  return (
    <>
      <Card className="bg-white w-full h-full flex-1 min-h-0 rounded-xl border border-blue-gray-100 lg:flex">
        <CardBody className="px-10 pt-0 pb-6 h-full flex flex-col flex-1">
          <div className="mt-12">
            <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
              {statisticsCardsData.map(({icon, title, footer, color, value}, index) => (
                  <StatisticsCard
                      key={title}
                      title={title}
                      icon={icon} // Passando o ícone
                      value={value}
                      footer={
                        <Typography className={`font-normal ${footer.color}`}>
                          <strong>{footer.value}</strong>&nbsp;{footer.label}
                        </Typography>
                      }
                      color={color} // Cor do card
                  />
              ))}
            </div>
          </div>
        </CardBody>


      </Card>
    </>

  );
}

export default Home;


