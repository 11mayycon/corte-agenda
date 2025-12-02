import { useState } from "react";
import { ClienteLayout } from "@/components/layouts/ClienteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Bell,
  Moon,
  Eye,
  Type,
  Save,
  Camera,
} from "lucide-react";
import { toast } from "sonner";

export default function ClientePerfil() {
  const [profile, setProfile] = useState({
    nome: "João da Silva",
    sobrenome: "Oliveira",
    telefone: "(11) 99999-9999",
    email: "joao@email.com",
    bairro: "Centro",
  });

  const [preferences, setPreferences] = useState({
    notificacoes: true,
    lembretes: true,
    promocoes: false,
    modoEscuro: false,
    altoContraste: false,
    fonteMaior: false,
  });

  const handleSave = () => {
    toast.success("Perfil atualizado com sucesso!");
  };

  return (
    <ClienteLayout
      title="Meu Perfil"
      description="Gerencie suas informações e preferências."
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Avatar Section */}
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-primary-light flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {profile.nome[0]}{profile.sobrenome[0]}
                  </span>
                </div>
                <Button
                  size="icon-sm"
                  variant="secondary"
                  className="absolute -bottom-1 -right-1 rounded-full"
                >
                  <Camera className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {profile.nome} {profile.sobrenome}
                </h2>
                <p className="text-muted-foreground">{profile.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Info */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={profile.nome}
                  onChange={(e) => setProfile({ ...profile, nome: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sobrenome">Sobrenome</Label>
                <Input
                  id="sobrenome"
                  value={profile.sobrenome}
                  onChange={(e) => setProfile({ ...profile, sobrenome: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">
                <Phone className="h-4 w-4 inline mr-2" />
                Telefone
              </Label>
              <Input
                id="telefone"
                type="tel"
                value={profile.telefone}
                onChange={(e) => setProfile({ ...profile, telefone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="h-4 w-4 inline mr-2" />
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bairro">
                <MapPin className="h-4 w-4 inline mr-2" />
                Bairro / Região
              </Label>
              <Input
                id="bairro"
                value={profile.bairro}
                onChange={(e) => setProfile({ ...profile, bairro: e.target.value })}
                placeholder="Ex: Centro, Vila Mariana..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notificações Push</p>
                <p className="text-sm text-muted-foreground">
                  Receba alertas sobre seus agendamentos
                </p>
              </div>
              <Switch
                checked={preferences.notificacoes}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, notificacoes: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Lembretes</p>
                <p className="text-sm text-muted-foreground">
                  Lembrete 24h antes do agendamento
                </p>
              </div>
              <Switch
                checked={preferences.lembretes}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, lembretes: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Promoções</p>
                <p className="text-sm text-muted-foreground">
                  Receba ofertas especiais dos salões
                </p>
              </div>
              <Switch
                checked={preferences.promocoes}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, promocoes: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Accessibility */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Acessibilidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Modo Escuro</p>
                  <p className="text-sm text-muted-foreground">
                    Tema mais confortável para os olhos
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.modoEscuro}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, modoEscuro: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Alto Contraste</p>
                  <p className="text-sm text-muted-foreground">
                    Aumenta o contraste das cores
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.altoContraste}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, altoContraste: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Type className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Fonte Maior</p>
                  <p className="text-sm text-muted-foreground">
                    Aumenta o tamanho do texto
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.fonteMaior}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, fonteMaior: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button variant="gradient" size="lg" className="w-full" onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Salvar Alterações
        </Button>
      </div>
    </ClienteLayout>
  );
}
