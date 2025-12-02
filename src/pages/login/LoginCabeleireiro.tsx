import { Scissors } from "lucide-react";
import { LoginCard } from "@/components/auth/LoginCard";

export default function LoginCabeleireiro() {
  return (
    <LoginCard
      type="cabeleireiro"
      title="Acesso Profissional"
      description="Gerencie sua agenda, clientes e serviços em um só lugar."
      icon={<Scissors className="h-7 w-7" />}
      redirectPath="/loja/agenda"
      alternativeLogins={[
        { label: "Sou Cliente", path: "/login/usuario" },
        { label: "Sou Admin", path: "/login/administrador" },
      ]}
    />
  );
}
