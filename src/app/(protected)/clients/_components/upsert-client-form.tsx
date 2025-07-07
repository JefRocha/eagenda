"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { CalendarIcon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

import { upsertClient } from "@/actions/upsert-client";
import { upsertClientSchema } from "@/actions/upsert-client/schema";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Client } from "@/db/schema";
import { useAction } from "@/hooks/use-action";

interface UpsertClientFormProps {
  initialData?: Client;
  isOpen: boolean;
  onSuccess: () => void;
}

const UpsertClientForm = ({
  initialData,
  isOpen,
  onSuccess,
}: UpsertClientFormProps) => {
  const form = useForm<upsertClientSchema>({
    resolver: zodResolver(upsertClientSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          moradia: initialData.moradia || undefined,
          tipo: initialData.tipo || undefined,
          situacao: initialData.situacao || undefined,
          retencoes: initialData.retencoes || undefined,
          simples: initialData.simples || undefined,
          correios: initialData.correios || undefined,
          contribuinte: initialData.contribuinte || undefined,
          vlrMens: initialData.vlrMens || undefined,
          usaFor: initialData.usaFor || undefined,
          crt: initialData.crt || undefined,
          travado: initialData.travado || false,
          ativo: initialData.ativo || false,
          inadimplente: initialData.inadimplente || false,
          especial: initialData.especial || false,
          bloqueado: initialData.bloqueado || false,
          pessoa: initialData.pessoa || "J",
          // Handle Date objects for timestamp fields
          dataCadastro: initialData.dataCadastro
            ? new Date(initialData.dataCadastro)
            : undefined,
          dataUltimaCompra: initialData.dataUltimaCompra
            ? new Date(initialData.dataUltimaCompra)
            : undefined,
          previsao: initialData.previsao
            ? new Date(initialData.previsao)
            : undefined,
        }
      : {
          razaoSocial: "",
          fantasia: "",
          pessoa: "J",
          travado: false,
          ativo: false,
          inadimplente: false,
          especial: false,
          bloqueado: false,
        },
  });

  const { execute, isLoading } = useAction(upsertClient, {
    onSuccess: () => {
      toast.success(initialData ? "Cliente atualizado" : "Cliente criado");
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.serverError || "Ocorreu um erro inesperado.");
    },
  });

  const onSubmit = (values: upsertClientSchema) => {
    execute(values);
  };

  const cepValue = form.watch("cep");
  const [debouncedCep] = useDebounce(cepValue, 500);

  useEffect(() => {
    const fetchAddress = async () => {
      if (debouncedCep && debouncedCep.replace(/\D/g, "").length === 8) {
        try {
          const response = await fetch(
            `https://viacep.com.br/ws/${debouncedCep.replace(/\D/g, "")}/json/`,
          );
          const data = await response.json();

          if (!data.erro) {
            form.setValue("endereco", data.logradouro);
            form.setValue("bairro", data.bairro);
            form.setValue("cidade", data.localidade);
            form.setValue("uf", data.uf);
          } else {
            toast.error("CEP não encontrado.");
          }
        } catch (error) {
          toast.error("Erro ao buscar CEP.");
        }
      }
    };

    fetchAddress();
  }, [debouncedCep, form]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onSuccess();
      }}
    >
      <DialogContent className="max-h-[90vh] w-full max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
          <DialogDescription>
            Preencha os campos para adicionar ou editar um cliente.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-4"
          >
            <Tabs defaultValue="geral" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="geral">Geral</TabsTrigger>
                <TabsTrigger value="endereco">Endereço</TabsTrigger>
                <TabsTrigger value="contato">Contato</TabsTrigger>
              </TabsList>
              <TabsContent value="geral" className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="razaoSocial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Razão Social</FormLabel>
                      <FormControl>
                        <Input placeholder="Razão Social" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fantasia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Fantasia</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome Fantasia" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="pessoa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Pessoa</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="J">Jurídica</SelectItem>
                            <SelectItem value="F">Física</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF</FormLabel>
                        <FormControl>
                          <NumericFormat
                            format="###.###.###-##"
                            mask="_"
                            value={field.value}
                            onValueChange={(values) => {
                              field.onChange(values.formattedValue);
                            }}
                            customInput={(props) => (
                              <Input {...props} className="w-full" />
                            )}
                            placeholder="000.000.000-00"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ie"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Inscrição Estadual</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Inscrição Estadual"
                            {...field}
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="cnae"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CNAE</FormLabel>
                        <FormControl>
                          <Input placeholder="CNAE" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="codMunicipioIbge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cód. Município IBGE</FormLabel>
                        <FormControl>
                          <Input placeholder="Código Município IBGE" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="crt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CRT</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o CRT" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="SIMPLES NACIONAL">SIMPLES NACIONAL</SelectItem>
                            <SelectItem value="SIMPLES NACIONAL - EXCESSO DE SUBLIMITE DA RECEITA BRUTA">SIMPLES NACIONAL - EXCESSO DE SUBLIMITE DA RECEITA BRUTA</SelectItem>
                            <SelectItem value="REGIME NORMAL">REGIME NORMAL</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="tDocumento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo Documento</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NOTA FISCAL">NOTA FISCAL</SelectItem>
                            <SelectItem value="RECIBO">RECIBO</SelectItem>
                            <SelectItem value="OUTROS">OUTROS</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tVencimento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo Vencimento</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NO MESMO MÊS">NO MESMO MÊS</SelectItem>
                            <SelectItem value="MÊS SUB-SEQUENTE">MÊS SUB-SEQUENTE</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tCobranca"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo Cobrança</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="BOLETO BANCÁRIO">BOLETO BANCÁRIO</SelectItem>
                            <SelectItem value="DEPÓSITO EM CONTA">DEPÓSITO EM CONTA</SelectItem>
                            <SelectItem value="CARTEIRA">CARTEIRA</SelectItem>
                            <SelectItem value="OUTROS">OUTROS</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="contribuinte"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Contribuinte</FormLabel>
                          <FormDescription>
                            Define se o cliente é contribuinte.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value === "S"}
                            onCheckedChange={(checked) =>
                              field.onChange(checked ? "S" : "N")
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vlrMens"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Mensal</FormLabel>
                        <FormControl>
                          <NumericFormat
                            value={field.value}
                            onValueChange={(values) => {
                              field.onChange(values.floatValue);
                            }}
                            decimalScale={2}
                            fixedDecimalScale
                            decimalSeparator=","
                            allowNegative={false}
                            allowLeadingZeros={false}
                            thousandSeparator="."
                            customInput={Input}
                            prefix="R$"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="melhorDia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Melhor Dia</FormLabel>
                        <FormControl>
                          <Input placeholder="Melhor Dia" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                </TabsContent>
              <TabsContent value="endereco" className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="cep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <NumericFormat
                          format="#####-###"
                          mask="_"
                          value={field.value}
                          onValueChange={(values) => {
                            field.onChange(values.formattedValue);
                          }}
                          customInput={Input}
                          placeholder="00000-000"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endereco"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input placeholder="Endereço" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="numero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input placeholder="Número" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="complemento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complemento</FormLabel>
                      <FormControl>
                        <Input placeholder="Complemento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bairro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input placeholder="Bairro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Cidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="uf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UF</FormLabel>
                      <FormControl>
                        <Input placeholder="UF" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="correspCep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP Correspondência</FormLabel>
                      <FormControl>
                        <Input placeholder="CEP Correspondência" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="correspEndereco"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço Correspondência</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Endereço Correspondência"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="correspBairro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro Correspondência</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Bairro Correspondência"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="correspCidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade Correspondência</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Cidade Correspondência"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="correspUf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UF Correspondência</FormLabel>
                      <FormControl>
                        <Input placeholder="UF Correspondência" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="correspComplemento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complemento Correspondência</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Complemento Correspondência"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              <TabsContent value="contato" className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="telefone1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone 1</FormLabel>
                      <FormControl>
                        <NumericFormat
                          format="(##) ####-####"
                          mask="_"
                          value={field.value}
                          onValueChange={(values) => {
                            field.onChange(values.formattedValue);
                          }}
                          customInput={Input}
                          placeholder="(00) 0000-0000"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="telefone2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone 2</FormLabel>
                      <FormControl>
                        <NumericFormat
                          format="(##) ####-####"
                          mask="_"
                          value={field.value}
                          onValueChange={(values) => {
                            field.onChange(values.formattedValue);
                          }}
                          customInput={Input}
                          placeholder="(00) 0000-0000"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="telefone3"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone 3</FormLabel>
                      <FormControl>
                        <NumericFormat
                          format="(##) ####-####"
                          mask="_"
                          value={field.value}
                          onValueChange={(values) => {
                            field.onChange(values.formattedValue);
                          }}
                          customInput={Input}
                          placeholder="(00) 0000-0000"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="celular"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Celular</FormLabel>
                      <FormControl>
                        <NumericFormat
                          format="(##) #####-####"
                          mask="_"
                          value={field.value}
                          onValueChange={(values) => {
                            field.onChange(values.formattedValue);
                          }}
                          customInput={Input}
                          placeholder="(00) 00000-0000"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Principal</FormLabel>
                      <FormControl>
                        <Input placeholder="Email Principal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email 1</FormLabel>
                      <FormControl>
                        <Input placeholder="Email 1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email 2</FormLabel>
                      <FormControl>
                        <Input placeholder="Email 2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email3"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email 3</FormLabel>
                      <FormControl>
                        <Input placeholder="Email 3" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email4"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email 4</FormLabel>
                      <FormControl>
                        <Input placeholder="Email 4" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email5"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email 5</FormLabel>
                      <FormControl>
                        <Input placeholder="Email 5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : initialData ? (
                  "Salvar Alterações"
                ) : (
                  "Criar Cliente"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertClientForm;
