import {
  Card,
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";
import { Link } from "react-router-dom";


export function Clientes() {
  return (
    <>
      <section className="bg-white mx-0 mt-0 flex-1 min-h-0 justify-between rounded-lg border border-blue-gray-100 lg:flex">
        <div className="w-full my-8 mx-auto px-8 h-full sm:space-y-16">
          <div className="text-center">
            <Typography variant="h2" className="font-bold">Cadastrar Cliente</Typography>
            <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">Insira os Dados dos Clientes</Typography>
          </div>
          <form className="mt-8 max-w-screen-lg lg:w-full mx-auto">
            <div className="mb-1 grid grid-cols-1 sm:grid-cols-8 gap-6">
              <div className="flex flex-col gap-3 col-span-1 sm:col-span-8">
                <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
                  Seu nome completo
                </Typography>
                <Input
                  type="text"
                  size="lg"
                  placeholder="ex.: João Victor... "
                  className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                />
              </div>

              <div className="flex flex-col gap-3 col-span-1 sm:col-span-4">
                <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
                  Digite seu telefone
                </Typography>
                <Input
                  type="tel"
                  size="lg"
                  placeholder="ex.: (99) 99999-9999"
                  className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                />
              </div>

              <div className="flex flex-col gap-3 col-span-1 sm:col-span-4">
                <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
                  Digite seu e-mail
                </Typography>
                <Input
                  type="email"
                  size="lg"
                  placeholder="ex.: name@mail.com"
                  className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                />
              </div>

              <div className="flex flex-col gap-3 col-span-1 sm:col-span-6">
                <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
                  Rua
                </Typography>
                <Input
                  type="text"
                  size="lg"
                  placeholder="ex.: Av. Quadrada"
                  className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                />
              </div>

              <div className="flex flex-col gap-3 col-span-1 sm:col-span-2">
                <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
                  Número
                </Typography>
                <Input
                  type="text"
                  size="lg"
                  placeholder="ex.: 333"
                  className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                />
              </div>

              <div className="flex flex-col gap-3 col-span-1 sm:col-span-5">
                <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
                  Bairro
                </Typography>
                <Input
                  type="text"
                  size="lg"
                  placeholder="ex.: Centro"
                  className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                />
              </div>

              {/* <div className="flex flex-col gap-3 col-span-1 sm:col-span-2">
                <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
                  Crie uma senha
                </Typography>
                <Input
                  type="password"
                  size="lg"
                  placeholder="********"
                  className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                />
              </div> */}

              <div className="flex flex-col gap-3 col-span-1 sm:col-span-3">
                <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
                  CPF
                </Typography>
                <Input
                  type="text"
                  size="lg"
                  placeholder="ex.: 000.000.000-00"
                  className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                />
              </div>        
            </div>
            <div className="flex w-full justify-center">
              <Button className="mt-6 w-32">
                Cadastrar
              </Button>        
            </div>      
          </form>
        </div>
      </section>
    </>
  );
}

export default Clientes;
