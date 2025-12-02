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
import { Plus, Pencil, Trash2, User, HelpCircle, Calendar } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

interface Profissional {
  id: string;
  nome: string;
  especialidade: string;
  ativo: boolean;
  agendamentosHoje: number;
}

const mockProfissionais: Profissional[] = [
  { id: "1", nome: "Carlos Silva", especialidade: "Cortes Clássicos", ativo: true, agendamentosHoje: 8 },
  { id: "2", nome: "João Santos", especialidade: "Degradê e Navalhado", ativo: true, agendamentosHoje: 6 },
  { id: "3", nome: "Pedro Lima", especialidade: "Barba", ativo: true, agendamentosHoje: 5 },
  { id: "4", nome: "Lucas Oliveira", especialidade: "Coloração", ativo: false, agendamentosHoje: 0 },
];

export default function LojaProfissionais() {
  const [profissionais, setProfissionais] = useState<Profissional[]>(mockProfissionais);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfissional, setEditingProfissional] = useState<Profissional | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    especialidade: "",
  });

  const handleOpenDialog = (profissional?: Profissional) => {
    if (profissional) {
      setEditingProfissional(profissional);
      setFormData({
        nome: profissional.nome,
        especialidade: profissional.especialidade,
      });
    } else {
      setEditingProfissional(null);
      setFormData({ nome: "", especialidade: "" });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    const newProfissional: Profissional = {
      id: editingProfissional?.id || Date.now().toString(),
      nome: formData.nome,
      especialidade: formData.especialidade,
      ativo: editingProfissional?.ativo ?? true,
      agendamentosHoje: editingProfissional?.agendamentosHoje ?? 0,
    };

    if (editingProfissional) {
      setProfissionais(
        profissionais.map((p) => (p.id === editingProfissional.id ? newProfissional : p))
      );
      toast.success("Profissional atualizado com sucesso!");
    } else {
      setProfissionais([...profissionais, newProfissional]);
      toast.success("Profissional cadastrado com sucesso!");
    }

    setIsDialogOpen(false);
  };

  const toggleAtivo = (id: string) => {
    setProfissionais(
      profissionais.map((p) => (p.id === id ? { ...p, ativo: !p.ativo } : p))
    );
    toast.success("Status do profissional atualizado!");
  };

  const handleDelete = (id: string) => {
    setProfissionais(profissionais.filter((p) => p.id !== id));
    toast.success("Profissional removido com sucesso!");
  };

  return (
    <LojaLayout
      title="Profissionais"
      description="Gerencie a equipe do seu salão."
    >
      <Card variant="elevated">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Equipe</CardTitle>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Cadastre os profissionais que atendem no seu salão</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient" size="sm" onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Profissional
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingProfissional ? "Editar Profissional" : "Novo Profissional"}
                </DialogTitle>
                <DialogDescription>
                  Preencha as informações do profissional abaixo.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Carlos Silva"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="especialidade">Especialidade</Label>
                  <Input
                    id="especialidade"
                    value={formData.especialidade}
                    onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}
                    placeholder="Ex: Cortes Clássicos"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="gradient" onClick={handleSave}>
                  {editingProfissional ? "Salvar" : "Cadastrar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {profissionais.map((profissional) => (
              <Card
                key={profissional.id}
                variant="interactive"
                className="overflow-hidden"
              >
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full bg-primary-light flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary">
                          {profissional.nome
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{profissional.nome}</h3>
                          {!profissional.ativo && (
                            <Badge variant="secondary">Inativo</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {profissional.especialidade}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{profissional.agendamentosHoje} agendamentos hoje</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Ativo</span>
                      <Switch
                        checked={profissional.ativo}
                        onCheckedChange={() => toggleAtivo(profissional.id)}
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleOpenDialog(profissional)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(profissional.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </LojaLayout>
  );
}
