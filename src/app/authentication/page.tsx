import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/auth";

import LoginForm from "./components/login-form";
import SignUpForm from "./components/sign-up-form";

const AuthenticationPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session?.user) {
    redirect("/dashboard");
  }
  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden">
      <Image
        src="/Principal.svg"
        alt="Plano de fundo"
        fill
        className="absolute inset-0 z-0 object-cover"
        priority
      />
      {/* Overlay para contraste */}
      <div />
      {/* Conteúdo do formulário */}
      <div className="relative z-10 flex w-full items-center justify-center">
        <div>
          <Tabs defaultValue="login">
            <TabsList className="grid h-14 w-full grid-cols-2 bg-black/15 p-2 py-4">
              <TabsTrigger
                value="login"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Criar conta
              </TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm />
            </TabsContent>
            <TabsContent value="register">
              <SignUpForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AuthenticationPage;
