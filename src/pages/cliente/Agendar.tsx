import { useState } from "react";
import { ClienteLayout } from "@/components/layouts/ClienteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Store,
  User,
  Scissors,
  Calendar,
  Clock,
  Check,
  ChevronRight,
  MapPin,
  Star,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, title: "Local", icon: Store },
  { id: 2, title: "Serviço", icon: Scissors },
  { id: 3, title: "Profissional", icon: User },
  { id: 4, title: "Data e Hora", icon: Calendar },
  { id: 5, title: "Confirmar", icon: Check },
];

const mockLojas = [
  { id: "1", nome: "Barbearia Premium", endereco: "Rua das Flores, 123", avaliacao: 4.8, distancia: "1.2 km" },
  { id: "2", nome: "Studio Hair", endereco: "Av. Principal, 456", avaliacao: 4.5, distancia: "2.5 km" },
  { id: "3", nome: "Corte & Estilo", endereco: "Praça Central, 78", avaliacao: 4.9, distancia: "3.1 km" },
];

const mockServicos = [
  { id: "1", nome: "Corte Masculino", duracao: 30, preco: 4500 },
  { id: "2", nome: "Barba", duracao: 20, preco: 2500 },
  { id: "3", nome: "Corte + Barba", duracao: 50, preco: 6000 },
  { id: "4", nome: "Pigmentação", duracao: 45, preco: 8000 },
];

const mockProfissionais = [
  { id: "1", nome: "Carlos Silva", especialidade: "Cortes Clássicos" },
  { id: "2", nome: "João Santos", especialidade: "Degradê" },
  { id: "3", nome: "Pedro Lima", especialidade: "Barba" },
];

const mockHorarios = ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00", "15:30", "16:00"];

export default function ClienteAgendar() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLoja, setSelectedLoja] = useState<string | null>(null);
  const [selectedServico, setSelectedServico] = useState<string | null>(null);
  const [selectedProfissional, setSelectedProfissional] = useState<string | null>(null);
  const [selectedData, setSelectedData] = useState<string>("");
  const [selectedHora, setSelectedHora] = useState<string | null>(null);

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedLoja !== null;
      case 2:
        return selectedServico !== null;
      case 3:
        return selectedProfissional !== null;
      case 4:
        return selectedData !== "" && selectedHora !== null;
      default:
        return true;
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  return (
    <ClienteLayout
      title="Novo Agendamento"
      description="Escolha o melhor horário para você."
    >
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "flex items-center",
                index < steps.length - 1 && "flex-1"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                  currentStep === step.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : currentStep > step.id
                    ? "border-primary bg-primary-light text-primary"
                    : "border-border bg-background text-muted-foreground"
                )}
              >
                {currentStep > step.id ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2 transition-all duration-300",
                    currentStep > step.id ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
          ))}
        </div>
        <div className="hidden sm:flex justify-between text-sm">
          {steps.map((step) => (
            <span
              key={step.id}
              className={cn(
                "transition-colors",
                currentStep >= step.id ? "text-foreground font-medium" : "text-muted-foreground"
              )}
            >
              {step.title}
            </span>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-3xl mx-auto">
        {/* Step 1: Selecionar Loja */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar salão por nome ou endereço..."
                className="pl-10"
                inputSize="lg"
              />
            </div>

            <div className="space-y-3">
              {mockLojas.map((loja) => (
                <Card
                  key={loja.id}
                  variant={selectedLoja === loja.id ? "outlined" : "interactive"}
                  className={cn(
                    "cursor-pointer transition-all",
                    selectedLoja === loja.id && "border-primary ring-2 ring-primary/20"
                  )}
                  onClick={() => setSelectedLoja(loja.id)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
                      <Store className="h-7 w-7 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{loja.nome}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {loja.endereco}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm flex items-center gap-1">
                          <Star className="h-3 w-3 fill-warning text-warning" />
                          {loja.avaliacao}
                        </span>
                        <span className="text-sm text-muted-foreground">{loja.distancia}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Selecionar Serviço */}
        {currentStep === 2 && (
          <div className="space-y-3 animate-fade-in">
            {mockServicos.map((servico) => (
              <Card
                key={servico.id}
                variant={selectedServico === servico.id ? "outlined" : "interactive"}
                className={cn(
                  "cursor-pointer transition-all",
                  selectedServico === servico.id && "border-primary ring-2 ring-primary/20"
                )}
                onClick={() => setSelectedServico(servico.id)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-secondary-light flex items-center justify-center">
                      <Scissors className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{servico.nome}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {servico.duracao} min
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-primary">{formatPrice(servico.preco)}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Step 3: Selecionar Profissional */}
        {currentStep === 3 && (
          <div className="space-y-3 animate-fade-in">
            <Card
              variant={selectedProfissional === "any" ? "outlined" : "interactive"}
              className={cn(
                "cursor-pointer transition-all",
                selectedProfissional === "any" && "border-primary ring-2 ring-primary/20"
              )}
              onClick={() => setSelectedProfissional("any")}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Sem preferência</h3>
                  <p className="text-sm text-muted-foreground">Qualquer profissional disponível</p>
                </div>
              </CardContent>
            </Card>

            {mockProfissionais.map((profissional) => (
              <Card
                key={profissional.id}
                variant={selectedProfissional === profissional.id ? "outlined" : "interactive"}
                className={cn(
                  "cursor-pointer transition-all",
                  selectedProfissional === profissional.id && "border-primary ring-2 ring-primary/20"
                )}
                onClick={() => setSelectedProfissional(profissional.id)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary-light flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {profissional.nome.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{profissional.nome}</h3>
                    <p className="text-sm text-muted-foreground">{profissional.especialidade}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Step 4: Selecionar Data e Hora */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <Label htmlFor="data" className="text-base font-medium mb-2 block">
                Selecione a data
              </Label>
              <Input
                id="data"
                type="date"
                value={selectedData}
                onChange={(e) => setSelectedData(e.target.value)}
                inputSize="lg"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            {selectedData && (
              <div className="animate-fade-in">
                <Label className="text-base font-medium mb-3 block">
                  Horários disponíveis
                </Label>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {mockHorarios.map((hora) => (
                    <Button
                      key={hora}
                      variant={selectedHora === hora ? "default" : "outline"}
                      size="lg"
                      className="w-full"
                      onClick={() => setSelectedHora(hora)}
                    >
                      {hora}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Confirmar */}
        {currentStep === 5 && (
          <div className="animate-fade-in">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Resumo do Agendamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Local</span>
                  <span className="font-medium">
                    {mockLojas.find((l) => l.id === selectedLoja)?.nome}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Serviço</span>
                  <span className="font-medium">
                    {mockServicos.find((s) => s.id === selectedServico)?.nome}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Profissional</span>
                  <span className="font-medium">
                    {selectedProfissional === "any"
                      ? "Sem preferência"
                      : mockProfissionais.find((p) => p.id === selectedProfissional)?.nome}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Data</span>
                  <span className="font-medium">
                    {selectedData && new Date(selectedData + "T12:00:00").toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Horário</span>
                  <span className="font-medium">{selectedHora}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-muted-foreground">Valor</span>
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(mockServicos.find((s) => s.id === selectedServico)?.preco || 0)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-8">
          {currentStep > 1 && (
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              Voltar
            </Button>
          )}
          <Button
            variant="gradient"
            size="lg"
            className="flex-1"
            disabled={!canProceed()}
            onClick={() => {
              if (currentStep < 5) {
                setCurrentStep(currentStep + 1);
              } else {
                // Handle confirmation
              }
            }}
          >
            {currentStep === 5 ? "Confirmar Agendamento" : "Continuar"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </ClienteLayout>
  );
}
