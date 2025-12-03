import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function CadastroUsuario() {
  const navigate = useNavigate();
  const { signUp, loading: authLoading } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: "",
    sobrenome: "",
    email: "",
    telefone: "",
    dataNascimento: "",
    regiao: "",
    password: "",
    confirmPassword: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = "Nome é obrigatório";
    }
    
    if (!formData.sobrenome.trim()) {
      newErrors.sobrenome = "Sobrenome é obrigatório";
    }

    if (!formData.email) {
      newErrors.email = "E-mail é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "E-mail inválido";
    }

    if (!formData.telefone) {
      newErrors.telefone = "Telefone é obrigatório";
    } else if (formData.telefone.replace(/\D/g, "").length < 10) {
      newErrors.telefone = "Telefone inválido";
    }

    if (!formData.dataNascimento) {
      newErrors.dataNascimento = "Data de nascimento é obrigatória";
    }

    if (!formData.regiao.trim()) {
      newErrors.regiao = "Região é obrigatória";
    }

    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
    } else if (formData.password.length < 6) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers
        .replace(/^(\d{2})/, "($1) ")
        .replace(/(\d{5})(\d)/, "$1-$2");
    }
    return value;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      // 1. Create auth user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login/usuario`,
          data: {
            nome: formData.nome,
            tipo: 'cliente',
            telefone: formData.telefone,
          }
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("Erro ao criar usuário");
      }

      // 2. Create conta record
      const { error: contaError } = await supabase
        .from('contas')
        .insert({
          id: authData.user.id,
          email: formData.email,
          telefone: formData.telefone.replace(/\D/g, ""),
          senha_hash: 'supabase_auth', // Senha gerenciada pelo Supabase Auth
        });

      if (contaError) {
        console.error('Erro ao criar conta:', contaError);
        // Continue anyway - the trigger may have created it
      }

      // 3. Create perfil record
      const { error: perfilError } = await supabase
        .from('perfis')
        .insert({
          id: authData.user.id,
          conta_id: authData.user.id,
          nome: formData.nome,
          sobrenome: formData.sobrenome,
          telefone: formData.telefone.replace(/\D/g, ""),
          data_nascimento: formData.dataNascimento,
          regiao: formData.regiao,
        });

      if (perfilError) {
        console.error('Erro ao criar perfil:', perfilError);
      }

      // 4. Create user_role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'cliente',
        });

      if (roleError) {
        console.error('Erro ao criar role:', roleError);
      }

      toast.success("Conta criada com sucesso!", {
        description: "Verifique seu e-mail para confirmar o cadastro.",
      });

      setTimeout(() => {
        navigate("/login/usuario");
      }, 1500);

    } catch (error) {
      console.error('Erro no cadastro:', error);
      const message = error instanceof Error ? error.message : "Erro ao criar conta";
      
      if (message.includes('already registered')) {
        toast.error("Este e-mail já está cadastrado", {
          description: "Tente fazer login ou use outro e-mail.",
        });
      } else {
        toast.error("Erro ao criar conta", {
          description: message,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const isLoading = loading || authLoading;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-primary opacity-5 blur-3xl rounded-full" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-primary opacity-5 blur-3xl rounded-full" />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/">
            <Logo size="lg" />
          </Link>
        </div>

        {/* Registration Card */}
        <Card variant="elevated" className="animate-slide-up">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
              <User className="h-7 w-7" />
            </div>
            <CardTitle className="text-2xl">Criar Conta</CardTitle>
            <CardDescription className="text-base">
              Preencha seus dados para começar a agendar
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    placeholder="Seu nome"
                    value={formData.nome}
                    onChange={(e) => handleChange("nome", e.target.value)}
                    variant={errors.nome ? "error" : "default"}
                  />
                  {errors.nome && (
                    <p className="text-xs text-destructive">{errors.nome}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sobrenome">Sobrenome</Label>
                  <Input
                    id="sobrenome"
                    placeholder="Seu sobrenome"
                    value={formData.sobrenome}
                    onChange={(e) => handleChange("sobrenome", e.target.value)}
                    variant={errors.sobrenome ? "error" : "default"}
                  />
                  {errors.sobrenome && (
                    <p className="text-xs text-destructive">{errors.sobrenome}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  variant={errors.email ? "error" : "default"}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={formData.telefone}
                  onChange={(e) => handleChange("telefone", formatPhone(e.target.value))}
                  variant={errors.telefone ? "error" : "default"}
                />
                {errors.telefone && (
                  <p className="text-xs text-destructive">{errors.telefone}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                  <Input
                    id="dataNascimento"
                    type="date"
                    value={formData.dataNascimento}
                    onChange={(e) => handleChange("dataNascimento", e.target.value)}
                    variant={errors.dataNascimento ? "error" : "default"}
                  />
                  {errors.dataNascimento && (
                    <p className="text-xs text-destructive">{errors.dataNascimento}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regiao">Região/Bairro</Label>
                  <Input
                    id="regiao"
                    placeholder="Seu bairro"
                    value={formData.regiao}
                    onChange={(e) => handleChange("regiao", e.target.value)}
                    variant={errors.regiao ? "error" : "default"}
                  />
                  {errors.regiao && (
                    <p className="text-xs text-destructive">{errors.regiao}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    variant={errors.password ? "error" : "default"}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  variant={errors.confirmPassword ? "error" : "default"}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  <>
                    Criar Conta
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Login link */}
        <p className="mt-6 text-center text-sm text-muted-foreground animate-fade-in">
          Já tem uma conta?{" "}
          <Link to="/login/usuario" className="text-primary font-medium hover:underline">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}
