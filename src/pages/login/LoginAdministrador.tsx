import { Shield } from "lucide-react";
import { LoginCard } from "@/components/auth/LoginCard";

export default function LoginAdministrador() {
  return (
    <LoginCard
      type="administrador"
      title="Acesso Administrador"
      description="Painel de controle completo para gestão da plataforma."
      icon={<Shield className="h-7 w-7" />}
      redirectPath="/admin/visao-geral"
      alternativeLogins={[
        { label: "Sou Cliente", path: "/login/usuario" },
        { label: "Sou Profissional", path: "/login/cabeleireiro" },
      ]}
    />
  );
}
