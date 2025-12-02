import { useState } from "react";
import { LojaLayout } from "@/components/layouts/LojaLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Clock, DollarSign, HelpCircle, Scissors } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

interface Servico {
  id: string;
  nome: string;
  duracao: number;
  preco: number;
  ativo: boolean;
}

const mockServicos: Servico[] = [
  { id: "1", nome: "Corte Masculino", duracao: 30, preco: 4500, ativo: true },
  { id: "2", nome: "Barba", duracao: 20, preco: 2500, ativo: true },
  { id: "3", nome: "Corte + Barba", duracao: 50, preco: 6000, ativo: true },
  { id: "4", nome: "Pigmentação", duracao: 45, preco: 8000, ativo: true },
  { id: "5", nome: "Hidratação", duracao: 30, preco: 5000, ativo: false },
];

export default function LojaServicos() {
  const [servicos, setServicos] = useState<Servico[]>(mockServicos);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    duracao: "",
    preco: "",
  });

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const handleOpenDialog = (servico?: Servico) => {
    if (servico) {
      setEditingServico(servico);
      setFormData({
        nome: servico.nome,
        duracao: servico.duracao.toString(),
        preco: (servico.preco / 100).toFixed(2),
      });
    } else {
      setEditingServico(null);
      setFormData({ nome: "", duracao: "", preco: "" });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    const newServico: Servico = {
      id: editingServico?.id || Date.now().toString(),
      nome: formData.nome,
      duracao: parseInt(formData.duracao),
      preco: Math.round(parseFloat(formData.preco) * 100),
      ativo: editingServico?.ativo ?? true,
    };

    if (editingServico) {
      setServicos(servicos.map((s) => (s.id === editingServico.id ? newServico : s)));
      toast.success("Serviço atualizado com sucesso!");
    } else {
      setServicos([...servicos, newServico]);
      toast.success("Serviço criado com sucesso!");
    }

    setIsDialogOpen(false);
  };

  const toggleAtivo = (id: string) => {
    setServicos(
      servicos.map((s) => (s.id === id ? { ...s, ativo: !s.ativo } : s))
    );
    toast.success("Status do serviço atualizado!");
  };

  const handleDelete = (id: string) => {
    setServicos(servicos.filter((s) => s.id !== id));
    toast.success("Serviço removido com sucesso!");
  };

  return (
    <LojaLayout
      title="Serviços"
      description="Gerencie os serviços oferecidos pelo seu salão."
    >
      <Card variant="elevated">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Lista de Serviços</CardTitle>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Cadastre os serviços que seu salão oferece</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient" size="sm" onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Serviço
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingServico ? "Editar Serviço" : "Novo Serviço"}
                </DialogTitle>
                <DialogDescription>
                  Preencha as informações do serviço abaixo.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Serviço</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Corte Masculino"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duracao">Duração (minutos)</Label>
                    <Input
                      id="duracao"
                      type="number"
                      value={formData.duracao}
                      onChange={(e) => setFormData({ ...formData, duracao: e.target.value })}
                      placeholder="30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preco">Preço (R$)</Label>
                    <Input
                      id="preco"
                      type="number"
                      step="0.01"
                      value={formData.preco}
                      onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                      placeholder="45.00"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="gradient" onClick={handleSave}>
                  {editingServico ? "Salvar" : "Criar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {servicos.map((servico) => (
              <div
                key={servico.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary-light flex items-center justify-center">
                    <Scissors className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{servico.nome}</h3>
                      {!servico.ativo && (
                        <Badge variant="secondary">Inativo</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {servico.duracao} min
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5" />
                        {formatPrice(servico.preco)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={servico.ativo}
                    onCheckedChange={() => toggleAtivo(servico.id)}
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleOpenDialog(servico)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(servico.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </LojaLayout>
  );
}
