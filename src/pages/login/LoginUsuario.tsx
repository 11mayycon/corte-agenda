import { User } from "lucide-react";
import { LoginCard } from "@/components/auth/LoginCard";

export default function LoginUsuario() {
  return (
    <LoginCard
      type="usuario"
      title="Acesso Cliente"
      description="Entre para agendar seu próximo corte no salão preferido."
      icon={<User className="h-7 w-7" />}
      redirectPath="/cliente/agendar"
      alternativeLogins={[
        { label: "Sou Profissional", path: "/login/cabeleireiro" },
        { label: "Sou Admin", path: "/login/administrador" },
      ]}
    />
  );
}
