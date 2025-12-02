import { useState } from "react";
import { LojaLayout } from "@/components/layouts/LojaLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { HelpCircle, Save, Clock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DiaHorario {
  dia: string;
  diaAbrev: string;
  aberto: boolean;
  abre: string;
  fecha: string;
}

const diasSemana: DiaHorario[] = [
  { dia: "Segunda-feira", diaAbrev: "Seg", aberto: true, abre: "09:00", fecha: "19:00" },
  { dia: "Terça-feira", diaAbrev: "Ter", aberto: true, abre: "09:00", fecha: "19:00" },
  { dia: "Quarta-feira", diaAbrev: "Qua", aberto: true, abre: "09:00", fecha: "19:00" },
  { dia: "Quinta-feira", diaAbrev: "Qui", aberto: true, abre: "09:00", fecha: "19:00" },
  { dia: "Sexta-feira", diaAbrev: "Sex", aberto: true, abre: "09:00", fecha: "20:00" },
  { dia: "Sábado", diaAbrev: "Sáb", aberto: true, abre: "08:00", fecha: "18:00" },
  { dia: "Domingo", diaAbrev: "Dom", aberto: false, abre: "09:00", fecha: "13:00" },
];

export default function LojaHorarios() {
  const [horarios, setHorarios] = useState<DiaHorario[]>(diasSemana);
  const [intervalo, setIntervalo] = useState("30");

  const updateHorario = (index: number, field: keyof DiaHorario, value: string | boolean) => {
    const newHorarios = [...horarios];
    newHorarios[index] = { ...newHorarios[index], [field]: value };
    setHorarios(newHorarios);
  };

  const handleSave = () => {
    toast.success("Horários atualizados com sucesso!");
  };

  return (
    <LojaLayout
      title="Horários de Funcionamento"
      description="Configure os horários de atendimento do seu salão."
    >
      <div className="space-y-6">
        {/* Intervalo entre agendamentos */}
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Intervalo entre Agendamentos
              </CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Define o tempo mínimo entre cada agendamento</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Label htmlFor="intervalo" className="whitespace-nowrap">
                Intervalo padrão:
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="intervalo"
                  type="number"
                  value={intervalo}
                  onChange={(e) => setIntervalo(e.target.value)}
                  className="w-20"
                />
                <span className="text-muted-foreground">minutos</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Horários por dia */}
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Horários Semanais</CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Configure o horário de abertura e fechamento de cada dia</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {horarios.map((dia, index) => (
                <div
                  key={dia.dia}
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border transition-colors",
                    dia.aberto
                      ? "border-border bg-card"
                      : "border-border/50 bg-muted/30"
                  )}
                >
                  <div className="flex items-center justify-between sm:w-48">
                    <span className="font-medium">
                      <span className="hidden sm:inline">{dia.dia}</span>
                      <span className="sm:hidden">{dia.diaAbrev}</span>
                    </span>
                    <Switch
                      checked={dia.aberto}
                      onCheckedChange={(checked) => updateHorario(index, "aberto", checked)}
                    />
                  </div>

                  {dia.aberto ? (
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center gap-2 flex-1">
                        <Label className="text-sm text-muted-foreground whitespace-nowrap">
                          Abre:
                        </Label>
                        <Input
                          type="time"
                          value={dia.abre}
                          onChange={(e) => updateHorario(index, "abre", e.target.value)}
                          className="flex-1"
                        />
                      </div>
                      <div className="flex items-center gap-2 flex-1">
                        <Label className="text-sm text-muted-foreground whitespace-nowrap">
                          Fecha:
                        </Label>
                        <Input
                          type="time"
                          value={dia.fecha}
                          onChange={(e) => updateHorario(index, "fecha", e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">Fechado</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button variant="gradient" size="lg" className="w-full sm:w-auto" onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Salvar Horários
        </Button>
      </div>
    </LojaLayout>
  );
}
