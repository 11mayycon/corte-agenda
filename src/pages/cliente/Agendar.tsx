import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClienteLayout } from "@/components/layouts/ClienteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Store,
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
import { toast } from "sonner";
import { clienteAPI, type Loja, type Servico } from "@/services/clienteAPI";

const steps = [
  { id: 1, title: "Local", icon: Store },
  { id: 2, title: "Serviço", icon: Scissors },
  { id: 3, title: "Data e Hora", icon: Calendar },
  { id: 4, title: "Confirmar", icon: Check },
];

export default function ClienteAgendar() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Dados
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);

  // Seleções
  const [selectedLoja, setSelectedLoja] = useState<Loja | null>(null);
  const [selectedServico, setSelectedServico] = useState<Servico | null>(null);
  const [selectedData, setSelectedData] = useState<string>("");
  const [selectedHora, setSelectedHora] = useState<string | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadLojas();
  }, []);

  useEffect(() => {
    if (selectedLoja) {
      loadServicos(selectedLoja.id);
    }
  }, [selectedLoja]);

  useEffect(() => {
    if (selectedLoja && selectedServico && selectedData) {
      loadHorariosDisponiveis();
    }
  }, [selectedLoja, selectedServico, selectedData]);

  const loadLojas = async () => {
    setLoading(true);
    const { data } = await clienteAPI.getLojas({ search: searchTerm });
    if (data) {
      setLojas(data);
    }
    setLoading(false);
  };

  const loadServicos = async (lojaId: string) => {
    setLoading(true);
    const { data } = await clienteAPI.getServicosLoja(lojaId);
    if (data) {
      setServicos(data);
    }
    setLoading(false);
  };

  const loadHorariosDisponiveis = async () => {
    if (!selectedLoja || !selectedServico || !selectedData) return;

    setLoading(true);
    const { data } = await clienteAPI.getHorariosDisponiveis(
      selectedLoja.id,
      selectedServico.id,
      selectedData
    );
    if (data) {
      setHorariosDisponiveis(data);
    }
    setLoading(false);
  };

  const handleConfirm = async () => {
    if (!selectedLoja || !selectedServico || !selectedData || !selectedHora) {
      toast.error("Preencha todos os campos");
      return;
    }

    setLoading(true);
    const { data, error } = await clienteAPI.createAgendamento({
      loja_id: selectedLoja.id,
      servico_id: selectedServico.id,
      data: selectedData,
      hora: selectedHora,
    });

    setLoading(false);

    if (!error && data) {
      toast.success("Agendamento confirmado com sucesso!");
      navigate("/cliente/minhas-reservas");
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedLoja !== null;
      case 2:
        return selectedServico !== null;
      case 3:
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

  const filteredLojas = lojas.filter((loja) =>
    loja.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loja.cidade?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                    ? "border-primary bg-primary/10 text-primary"
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
                placeholder="Buscar salão por nome ou cidade..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onBlur={() => loadLojas()}
              />
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <Skeleton className="h-14 w-14 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-1/2" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredLojas.length === 0 ? (
              <div className="text-center py-12">
                <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum salão encontrado</h3>
                <p className="text-sm text-muted-foreground">
                  Tente ajustar sua busca ou verifique sua localização
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLojas.map((loja) => (
                  <Card
                    key={loja.id}
                    variant={selectedLoja?.id === loja.id ? "outlined" : "interactive"}
                    className={cn(
                      "cursor-pointer transition-all",
                      selectedLoja?.id === loja.id && "border-primary ring-2 ring-primary/20"
                    )}
                    onClick={() => setSelectedLoja(loja)}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Store className="h-7 w-7 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{loja.nome}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {loja.cidade}, {loja.uf}
                        </p>
                        {loja.rating && (
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm flex items-center gap-1">
                              <Star className="h-3 w-3 fill-orange-400 text-orange-400" />
                              {loja.rating.toFixed(1)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {loja.total_avaliacoes} avaliações
                            </span>
                          </div>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Selecionar Serviço */}
        {currentStep === 2 && (
          <div className="space-y-3 animate-fade-in">
            {loading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-xl" />
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : servicos.length === 0 ? (
              <div className="text-center py-12">
                <Scissors className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum serviço disponível</h3>
                <p className="text-sm text-muted-foreground">
                  Este salão ainda não cadastrou serviços
                </p>
              </div>
            ) : (
              servicos.map((servico) => (
                <Card
                  key={servico.id}
                  variant={selectedServico?.id === servico.id ? "outlined" : "interactive"}
                  className={cn(
                    "cursor-pointer transition-all",
                    selectedServico?.id === servico.id && "border-primary ring-2 ring-primary/20"
                  )}
                  onClick={() => setSelectedServico(servico)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                        <Scissors className="h-6 w-6 text-secondary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{servico.nome}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {servico.duracao_minutos} min
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-primary">
                      {formatPrice(servico.preco_centavos || 0)}
                    </span>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Step 3: Selecionar Data e Hora */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <Label htmlFor="data" className="text-base font-medium mb-2 block">
                Selecione a data
              </Label>
              <Input
                id="data"
                type="date"
                value={selectedData}
                onChange={(e) => {
                  setSelectedData(e.target.value);
                  setSelectedHora(null);
                }}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            {selectedData && (
              <div className="animate-fade-in">
                <Label className="text-base font-medium mb-3 block">
                  Horários disponíveis
                </Label>
                {loading ? (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : horariosDisponiveis.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Nenhum horário disponível para esta data
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {horariosDisponiveis.map((hora) => (
                      <Button
                        key={hora}
                        variant={selectedHora === hora ? "default" : "outline"}
                        className="w-full"
                        onClick={() => setSelectedHora(hora)}
                      >
                        {hora}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Confirmar */}
        {currentStep === 4 && (
          <div className="animate-fade-in">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Resumo do Agendamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Local</span>
                  <span className="font-medium">{selectedLoja?.nome}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Endereço</span>
                  <span className="font-medium text-right text-sm">
                    {selectedLoja?.endereco}, {selectedLoja?.cidade}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Serviço</span>
                  <span className="font-medium">{selectedServico?.nome}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Duração</span>
                  <span className="font-medium">{selectedServico?.duracao_minutos} minutos</span>
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
                    {formatPrice(selectedServico?.preco_centavos || 0)}
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
              disabled={loading}
            >
              Voltar
            </Button>
          )}
          <Button
            size="lg"
            className="flex-1 gap-2"
            disabled={!canProceed() || loading}
            onClick={() => {
              if (currentStep < 4) {
                setCurrentStep(currentStep + 1);
              } else {
                handleConfirm();
              }
            }}
          >
            {loading ? "Processando..." : currentStep === 4 ? "Confirmar Agendamento" : "Continuar"}
            {!loading && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </ClienteLayout>
  );
}
