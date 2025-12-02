import { useState } from "react";
import { LojaLayout } from "@/components/layouts/LojaLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  QrCode,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Smartphone,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ConnectionStatus = "disconnected" | "connecting" | "connected";

export default function LojaWhatsApp() {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  const handleGenerateQR = async () => {
    setIsGeneratingQR(true);
    setStatus("connecting");

    // Simulate QR generation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsGeneratingQR(false);

    toast.info("QR Code gerado!", {
      description: "Escaneie o código com seu WhatsApp.",
    });
  };

  const handleSimulateConnect = async () => {
    setStatus("connecting");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setStatus("connected");
    toast.success("WhatsApp conectado com sucesso!");
  };

  const handleDisconnect = () => {
    setStatus("disconnected");
    toast.success("WhatsApp desconectado.");
  };

  const statusConfig = {
    disconnected: {
      label: "Desconectado",
      color: "destructive",
      icon: XCircle,
    },
    connecting: {
      label: "Conectando...",
      color: "warning",
      icon: RefreshCw,
    },
    connected: {
      label: "Conectado",
      color: "success",
      icon: CheckCircle2,
    },
  };

  const currentStatus = statusConfig[status];
  const StatusIcon = currentStatus.icon;

  return (
    <LojaLayout
      title="WhatsApp"
      description="Conecte seu WhatsApp para receber notificações e confirmar agendamentos."
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Status Card */}
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Status da Conexão
                </CardTitle>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Conecte seu WhatsApp para enviar lembretes automáticos</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Badge
                variant={
                  status === "connected"
                    ? "success"
                    : status === "connecting"
                    ? "warning"
                    : "error"
                }
                className="flex items-center gap-1"
              >
                <StatusIcon
                  className={cn(
                    "h-3 w-3",
                    status === "connecting" && "animate-spin"
                  )}
                />
                {currentStatus.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {status === "connected" ? (
              <div className="flex items-center gap-4 p-4 rounded-lg bg-success-light">
                <div className="h-12 w-12 rounded-full bg-success/20 flex items-center justify-center">
                  <Smartphone className="h-6 w-6 text-success" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-success">WhatsApp conectado</p>
                  <p className="text-sm text-success/80">
                    Você receberá notificações de novos agendamentos.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleDisconnect}>
                  Desconectar
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                {status === "connecting" ? (
                  <div className="space-y-6">
                    {/* QR Code Placeholder */}
                    <div className="mx-auto w-64 h-64 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/50">
                      {isGeneratingQR ? (
                        <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
                      ) : (
                        <div className="space-y-4">
                          <QrCode className="h-32 w-32 text-foreground mx-auto" />
                          <p className="text-sm text-muted-foreground">
                            Escaneie com seu WhatsApp
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Aguardando conexão...
                      </p>
                      <Button
                        variant="soft"
                        size="sm"
                        onClick={handleSimulateConnect}
                      >
                        Simular Conexão (Demo)
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="mx-auto h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                      <MessageCircle className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        Conecte seu WhatsApp
                      </h3>
                      <p className="text-muted-foreground max-w-sm mx-auto">
                        Receba notificações de novos agendamentos e envie
                        lembretes automáticos para seus clientes.
                      </p>
                    </div>
                    <Button
                      variant="gradient"
                      size="lg"
                      onClick={handleGenerateQR}
                      disabled={isGeneratingQR}
                    >
                      {isGeneratingQR ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Gerando QR Code...
                        </>
                      ) : (
                        <>
                          <QrCode className="h-4 w-4 mr-2" />
                          Gerar QR Code
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions Card */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Como conectar</CardTitle>
            <CardDescription>
              Siga os passos abaixo para conectar seu WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {[
                "Clique em 'Gerar QR Code' acima",
                "Abra o WhatsApp no seu celular",
                "Vá em Configurações > Dispositivos conectados",
                "Toque em 'Conectar um dispositivo'",
                "Escaneie o QR Code exibido na tela",
              ].map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Features Card */}
        <Card variant="gradient">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4">
              O que você pode fazer com o WhatsApp conectado:
            </h3>
            <ul className="space-y-3">
              {[
                "Receber notificações de novos agendamentos",
                "Enviar lembretes automáticos 24h antes",
                "Confirmar ou cancelar agendamentos via chat",
                "Enviar promoções para seus clientes",
              ].map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </LojaLayout>
  );
}
