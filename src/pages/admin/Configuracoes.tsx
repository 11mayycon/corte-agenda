import { useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  Bell,
  Shield,
  Database,
  Mail,
  Save,
  Globe,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminConfiguracoes() {
  const [settings, setSettings] = useState({
    // Notificações
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,

    // Segurança
    twoFactorAuth: false,
    sessionTimeout: "30",
    ipWhitelist: "",

    // Sistema
    maintenanceMode: false,
    debugMode: false,
    autoBackup: true,

    // Email
    smtpHost: "smtp.example.com",
    smtpPort: "587",
    smtpUser: "noreply@agendecorte.com",
  });

  const handleSave = () => {
    toast.success("Configurações salvas com sucesso!");
  };

  return (
    <AdminLayout
      title="Configurações"
      description="Configure as preferências globais da plataforma."
    >
      <div className="space-y-6 max-w-3xl">
        {/* Notificações */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
            </CardTitle>
            <CardDescription>
              Configure como os usuários recebem notificações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notificações por E-mail</p>
                <p className="text-sm text-muted-foreground">
                  Enviar e-mails para agendamentos e lembretes
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, emailNotifications: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notificações Push</p>
                <p className="text-sm text-muted-foreground">
                  Enviar notificações push para o navegador
                </p>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, pushNotifications: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notificações SMS</p>
                <p className="text-sm text-muted-foreground">
                  Enviar SMS para lembretes de agendamento
                </p>
              </div>
              <Switch
                checked={settings.smsNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, smsNotifications: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Segurança
            </CardTitle>
            <CardDescription>
              Configurações de segurança da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Autenticação de Dois Fatores</p>
                <p className="text-sm text-muted-foreground">
                  Exigir 2FA para administradores
                </p>
              </div>
              <Switch
                checked={settings.twoFactorAuth}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, twoFactorAuth: checked })
                }
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Timeout de Sessão (minutos)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) =>
                  setSettings({ ...settings, sessionTimeout: e.target.value })
                }
                className="max-w-[200px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ipWhitelist">Whitelist de IPs (um por linha)</Label>
              <Input
                id="ipWhitelist"
                value={settings.ipWhitelist}
                onChange={(e) =>
                  setSettings({ ...settings, ipWhitelist: e.target.value })
                }
                placeholder="192.168.1.1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Sistema */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Sistema
            </CardTitle>
            <CardDescription>
              Configurações gerais do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Modo de Manutenção</p>
                <p className="text-sm text-muted-foreground">
                  Desativar acesso ao sistema temporariamente
                </p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, maintenanceMode: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Modo Debug</p>
                <p className="text-sm text-muted-foreground">
                  Exibir informações de debug nos logs
                </p>
              </div>
              <Switch
                checked={settings.debugMode}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, debugMode: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Backup Automático</p>
                <p className="text-sm text-muted-foreground">
                  Realizar backup diário do banco de dados
                </p>
              </div>
              <Switch
                checked={settings.autoBackup}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, autoBackup: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Email */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Configurações de E-mail
            </CardTitle>
            <CardDescription>
              Configure o servidor SMTP para envio de e-mails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtpHost">Servidor SMTP</Label>
                <Input
                  id="smtpHost"
                  value={settings.smtpHost}
                  onChange={(e) =>
                    setSettings({ ...settings, smtpHost: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPort">Porta</Label>
                <Input
                  id="smtpPort"
                  value={settings.smtpPort}
                  onChange={(e) =>
                    setSettings({ ...settings, smtpPort: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpUser">Usuário SMTP</Label>
              <Input
                id="smtpUser"
                value={settings.smtpUser}
                onChange={(e) =>
                  setSettings({ ...settings, smtpUser: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Button variant="gradient" size="lg" className="w-full sm:w-auto" onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>
    </AdminLayout>
  );
}
