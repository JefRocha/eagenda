"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, Search } from "lucide-react";
import { CalendarIcon } from "lucide-react";
import { forwardRef,useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { NumericFormat, PatternFormat } from "react-number-format";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

import { getCnpjInfo } from "@/actions/get-cnpj-info";
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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Client } from "@/db/schema";
import { useAction } from "@/hooks/use-action";

//const CustomNumericInput = forwardRef<HTMLInputElement, any>(({ className, ...props }, ref) => (
//  <Input className={className} {...props} ref={ref} />
//));

const CustomNumericInput = forwardRef<HTMLInputElement, any>(({ className, ...props }, ref) => {
  // Remova props que o DOM não entende
  const {
    allowLeadingZeros,
    format,
    mask,
    onValueChange,
    customInput,
    ...rest
  } = props;

  return <Input className={className} ref={ref} {...rest} />;
});


CustomNumericInput.displayName = "CustomNumericInput";

const defaultEmptyValues = {
  razaoSocial: "",
  fantasia: "",
  cpf: "",
  endereco: "",
  numero: "",
  bairro: "",
  cidade: "",
  uf: "",
  cep: "",
  complemento: "",
  telefone1: "",
  telefone2: "",
  telefone3: "",
  celular: "",
  email: "",
  rg: "",
  estadoCivil: "",
  empresa: "",
  cnae: "",
  codMunicipioIbge: "",
  ibge: "",
  correspEndereco: "",
  correspBairro: "",
  correspCidade: "",
  correspUf: "",
  correspCep: "",
  correspComplemento: "",
  correspNumero: "",
  foto: "",
  tipoCadastro: "",
  ie: "",
  mdia: "",
  tDocumento: "",
  tVencimento: "",
  tCobranca: "",
  retencoes: "",
  simples: "",
  correios: "",
  email1: "",
  email2: "",
  email3: "",
  email4: "",
  email5: "",
  contribuinte: "N",
  observacao: "",
  usaFor: "",
  crt: "",
  melhorDia: "",
  vendedor: "",
  teste: "",
  documentosPdf: "",
  codigoAnterior: "",
  pessoa: "J",
  travado: false,
  ativo: false,
  inadimplente: false,
  especial: false,
  bloqueado: false,
  moradia: undefined,
  tipo: undefined,
  situacao: undefined,
  vlrMens: undefined,
  dataCadastro: undefined,
  dataUltimaCompra: undefined,
  previsao: undefined,
};


function validarCNPJ(cnpj: string): boolean {
  cnpj = cnpj.replace(/[^\d]+/g, '');

  if (cnpj.length !== 14) return false;

  // Rejeita CNPJs com todos os dígitos iguais (ex: 00000000000000)
  if (/^(\d)\1+$/.test(cnpj)) return false;

  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  const digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;

  tamanho += 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  return resultado === parseInt(digitos.charAt(1));
}

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
  const queryClient = useQueryClient();
  const form = useForm<upsertClientSchema>({
    resolver: zodResolver(upsertClientSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          razaoSocial: initialData.razaoSocial || "",
          fantasia: initialData.fantasia || "",
          cpf: initialData.cpf || "",
          endereco: initialData.endereco || "",
          numero: initialData.numero || "",
          bairro: initialData.bairro || "",
          cidade: initialData.cidade || "",
          uf: initialData.uf || "",
          cep: initialData.cep || "",
          complemento: initialData.complemento || "",
          telefone1: initialData.telefone1 || "",
          telefone2: initialData.telefone2 || "",
          telefone3: initialData.telefone3 || "",
          celular: initialData.celular || "",
          email: initialData.email || "",
          rg: initialData.rg || "",
          estadoCivil: initialData.estadoCivil || "",
          empresa: initialData.empresa || "",
          cnae: initialData.cnae || "",
          codMunicipioIbge: initialData.codMunicipioIbge || "",
          ibge: initialData.ibge || "",
          correspEndereco: initialData.correspEndereco || "",
          correspBairro: initialData.correspBairro || "",
          correspCidade: initialData.correspCidade || "",
          correspUf: initialData.correspUf || "",
          correspCep: initialData.correspCep || "",
          correspComplemento: initialData.correspComplemento || "",
          correspNumero: initialData.correspNumero || "",
          foto: initialData.foto || "",
          tipoCadastro: initialData.tipoCadastro || "",
          ie: initialData.ie || "",
          mdia: initialData.mdia || "",
          tDocumento: initialData.tDocumento || "",
          tVencimento: initialData.tVencimento || "",
          tCobranca: initialData.tCobranca || "",
          retencoes: initialData.retencoes || "",
          simples: initialData.simples || "",
          correios: initialData.correios || "",
          email1: initialData.email1 || "",
          email2: initialData.email2 || "",
          email3: initialData.email3 || "",
          email4: initialData.email4 || "",
          email5: initialData.email5 || "",
          contribuinte: initialData.contribuinte || "N",
          observacao: initialData.observacao || "",
          usaFor: initialData.usaFor || "",
          crt: initialData.crt || "",
          melhorDia: initialData.melhorDia || "",
          vendedor: initialData.vendedor || "",
          teste: initialData.teste || "",
          documentosPdf: initialData.documentosPdf || "",
          codigoAnterior: initialData.codigoAnterior || "",
          moradia: initialData.moradia || undefined,
          tipo: initialData.tipo || undefined,
          situacao: initialData.situacao || undefined,
          vlrMens: initialData.vlrMens || undefined,
          travado: initialData.travado || false,
          ativo: initialData.ativo || false,
          inadimplente: initialData.inadimplente || false,
          especial: initialData.especial || false,
          bloqueado: initialData.bloqueado || false,
          pessoa: initialData.pessoa || "J",
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
          cpf: "",
          endereco: "",
          numero: "",
          bairro: "",
          cidade: "",
          uf: "",
          cep: "",
          complemento: "",
          telefone1: "",
          telefone2: "",
          telefone3: "",
          celular: "",
          email: "",
          rg: "",
          estadoCivil: "",
          empresa: "",
          cnae: "",
          codMunicipioIbge: "",
          ibge: "",
          correspEndereco: "",
          correspBairro: "",
          correspCidade: "",
          correspUf: "",
          correspCep: "",
          correspComplemento: "",
          correspNumero: "",
          foto: "",
          tipoCadastro: "",
          ie: "",
          mdia: "",
          tDocumento: "",
          tVencimento: "",
          tCobranca: "",
          retencoes: "",
          simples: "",
          correios: "",
          email1: "",
          email2: "",
          email3: "",
          email4: "",
          email5: "",
          contribuinte: "N",
          observacao: "",
          usaFor: "",
          crt: "",
          melhorDia: "",
          vendedor: "",
          teste: "",
          documentosPdf: "",
          codigoAnterior: "",
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
      console.log("Ação upsertClient bem-sucedida.");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success(initialData ? "Cliente atualizado" : "Cliente criado");
      form.reset();
      onSuccess();
    },
    onError: (error) => {
      console.error("Erro na ação upsertClient:", error);
      toast.error(error.serverError || "Ocorreu um erro inesperado.");
    },
  });

  useEffect(() => {
    form.reset(initialData || defaultEmptyValues);
  }, [initialData, form]);

  const { execute: executeCnpjSearch, isLoading: isLoadingCnpjSearch } = useAction(getCnpjInfo, {
    onSuccess: (response) => {
      if (response.data.success) {
        form.setValue("razaoSocial", (response.data.data.nome || "").toUpperCase());
        form.setValue("fantasia", (response.data.data.fantasia || response.data.data.nome || "").toUpperCase());
        form.setValue("endereco", (response.data.data.logradouro || "").toUpperCase());
        form.setValue("numero", (response.data.data.numero || "").toUpperCase());
        form.setValue("complemento", (response.data.data.complemento || "").toUpperCase());
        form.setValue("bairro", (response.data.data.bairro || "").toUpperCase());
        form.setValue("cidade", (response.data.data.municipio || "").toUpperCase());
        form.setValue("uf", (response.data.data.uf || "").toUpperCase());
        form.setValue("cep", response.data.data.cep || "");
        form.setValue("ie", (response.data.data.ie || "").toUpperCase());
        form.setValue("cnae", (response.data.data.cnae_fiscal || "").toUpperCase());
        form.setValue("telefone1", response.data.data.telefone || "");
        form.setValue("email", response.data.data.email || "");

        const rawCpfCnpj = response.data.data.cnpj || response.data.data.cpf;
        if (rawCpfCnpj) {
          const cleanedValue = rawCpfCnpj.replace(/\D/g, '');
          form.setValue("pessoa", "J"); // Define o tipo de pessoa como Jurídica
          form.setValue("cpf", cleanedValue);
        }

        toast.success("Dados do CNPJ preenchidos com sucesso!");
        setTimeout(() => {
          form.setFocus("cpf");
        }, 0);
      } else {
        toast.error(response.data.error || "Erro ao buscar CNPJ.");
      }
    },
    onError: (error) => {
      toast.error(error.serverError || "Ocorreu um erro inesperado ao buscar CNPJ.");
    },
  });

  const onSubmit = (values: upsertClientSchema) => {
    console.log("Dados do formulário enviados:", values);
    execute(values);
  };

  const cpfValue = form.watch("cpf");
  const pessoaValue = form.watch("pessoa");

  const handleCnpjSearch = () => {
  const cleanedCnpj = cpfValue ? cpfValue.replace(/\D/g, "") : "";

  if (pessoaValue === "J") {
    if (cleanedCnpj.length !== 14) {
      toast.error("Por favor, insira um CNPJ com 14 dígitos.");
      return;
    }

    if (!validarCNPJ(cleanedCnpj)) {
      toast.error("CNPJ inválido.");
      return;
    }

    executeCnpjSearch({ cnpj: cleanedCnpj });
  } else {
    toast.info("A busca de CNPJ é apenas para Pessoa Jurídica.");
  }
};

  const cepValue = form.watch("cep");
  const enderecoValue = form.watch("endereco"); // Adicionado: Observa o valor do campo endereco
  const [debouncedCep] = useDebounce(cepValue, 500);

  const correspCepValue = form.watch("correspCep");
  const correspEnderecoValue = form.watch("correspEndereco");
  const [debouncedCorrespCep] = useDebounce(correspCepValue, 500);

  useEffect(() => {
    const fetchAddress = async () => {
      // Condição: CEP preenchido (8 dígitos) E Endereço vazio
      if (debouncedCep && debouncedCep.replace(/\D/g, "").length === 8 && !enderecoValue) {
        console.log("Searching CEP:", debouncedCep);
        try {
          const response = await fetch(
            `https://viacep.com.br/ws/${debouncedCep.replace(/\D/g, "")}/json/`,
          );
          const data = await response.json();
          console.log("ViaCEP Response Data:", data);

          if (!data.erro) {
            form.setValue("endereco", data.logradouro.toUpperCase());
            form.setValue("bairro", data.bairro.toUpperCase());
            form.setValue("cidade", data.localidade.toUpperCase());
            form.setValue("uf", data.uf.toUpperCase());
            form.setValue("cep", data.cep); // Atualiza o próprio campo CEP
          } else {
            toast.error("CEP não encontrado.");
          }
        } catch (error) {
          toast.error("Erro ao buscar CEP.");
        }
      }
    };

    fetchAddress();
  }, [debouncedCep, form, enderecoValue]); // Adicionado enderecoValue às dependências

  useEffect(() => {
    const fetchCorrespAddress = async () => {
      if (debouncedCorrespCep && debouncedCorrespCep.replace(/\D/g, "").length === 8 && !correspEnderecoValue) {
        console.log("Searching Corresp CEP:", debouncedCorrespCep);
        try {
          const response = await fetch(
            `https://viacep.com.br/ws/${debouncedCorrespCep.replace(/\D/g, "")}/json/`,
          );
          const data = await response.json();
          console.log("ViaCEP Corresp Response Data:", data);

          if (!data.erro) {
            form.setValue("correspEndereco", data.logradouro.toUpperCase());
            form.setValue("correspBairro", data.bairro.toUpperCase());
            form.setValue("correspCidade", data.localidade.toUpperCase());
            form.setValue("correspUf", data.uf.toUpperCase());
            form.setValue("correspCep", data.cep); // Atualiza o próprio campo CEP
            form.setValue("correspNumero", ""); // Limpa o número para ser preenchido manualmente
          } else {
            toast.error("CEP de Correspondência não encontrado.");
          }
        } catch (error) {
          toast.error("Erro ao buscar CEP de Correspondência.");
        }
      }
    };

    fetchCorrespAddress();
  }, [debouncedCorrespCep, form, correspEnderecoValue]);

  return (
    <Dialog open={isOpen} onOpenChange={onSuccess}>
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
                        <FormLabel>{form.watch("pessoa") === "J" ? "CNPJ" : "CPF"}</FormLabel>
                        <div className="flex items-center space-x-2">
                          <FormControl>
                            <PatternFormat
                              format={form.watch("pessoa") === "J" ? "##.###.###/####-##" : "###.###.###-##"}
                              mask="_"
                              value={field.value || ""}
                              onValueChange={(values) => {
                                field.onChange(values.value);
                              }}
                              customInput={CustomNumericInput}
                              placeholder={form.watch("pessoa") === "J" ? "00.000.000/0000-00" : "000.000.000-00"}
                              allowLeadingZeros={true}
                            />
                          </FormControl>
                          {form.watch("pessoa") === "J" && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    size="icon"
                                    onClick={handleCnpjSearch}
                                    disabled={isLoadingCnpjSearch || !form.getValues("cpf") || form.getValues("cpf").replace(/\D/g, "").length !== 14}
                                  >
                                    {isLoadingCnpjSearch ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Search className="h-4 w-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Buscar CNPJ</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
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
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="razaoSocial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Razão Social</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Razão Social"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
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
                        <Input
                          placeholder="Nome Fantasia"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="cnae"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CNAE</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="CNAE"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          />
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
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <FormField
                    control={form.control}
                    name="cep"
                    render={({ field }) => (
                      <FormItem className="col-span-12 md:col-span-2">
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
                      <FormItem className="col-span-12 md:col-span-8">
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Endereço"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                  control={form.control}
                  name="numero"
                  render={({ field }) => (
                    <FormItem className="col-span-12 md:col-span-2">
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Número"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <FormField
                  control={form.control}
                  name="complemento"
                  render={({ field }) => (
                    <FormItem className="col-span-12 md:col-span-3">
                      <FormLabel>Complemento</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Complemento"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bairro"
                  render={({ field }) => (
                    <FormItem className="col-span-12 md:col-span-3">
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Bairro"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cidade"
                  render={({ field }) => (
                    <FormItem className="col-span-12 md:col-span-4">
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Cidade"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="uf"
                  render={({ field }) => (
                    <FormItem className="col-span-12 md:col-span-2">
                      <FormLabel>UF</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="UF"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                </div>
                <Separator className="my-4" />
                <div className="p-4 border rounded-lg mb-4">
                  <h4 className="text-lg font-semibold">Endereço de Correspondência</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <FormField
                      control={form.control}
                      name="correspCep"
                      render={({ field }) => (
                        <FormItem className="col-span-12 md:col-span-2">
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
                      name="correspEndereco"
                      render={({ field }) => (
                        <FormItem className="col-span-12 md:col-span-8">
                          <FormLabel>Endereço</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Endereço"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="correspNumero"
                      render={({ field }) => (
                        <FormItem className="col-span-12 md:col-span-2">
                          <FormLabel>Número</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Número"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <FormField
                      control={form.control}
                      name="correspComplemento"
                      render={({ field }) => (
                        <FormItem className="col-span-12 md:col-span-3">
                          <FormLabel>Complemento</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Complemento"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
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
                        <FormItem className="col-span-12 md:col-span-3">
                          <FormLabel>Bairro</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Bairro"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
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
                        <FormItem className="col-span-12 md:col-span-4">
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Cidade"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
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
                        <FormItem className="col-span-12 md:col-span-2">
                          <FormLabel>UF</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="UF"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
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
  )
};

export default UpsertClientForm;
