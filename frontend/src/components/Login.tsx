
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Lock, User, LogIn } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Login: React.FC = () => {
    // Estados para controlar os campos do formulário
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Hook de autenticação
    const { login } = useAuth();

    // Função para submeter o formulário de login
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validação básica dos campos
        if (!email || !password) {
            toast({
                title: "Erro de validação",
                description: "Por favor, preencha todos os campos.",
                variant: "destructive"
            });
            return;
        }

        // Validação de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast({
                title: "Email inválido",
                description: "Por favor, insira um email válido.",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);

        try {
            // Tenta fazer login
            const success = await login(email, password);

            if (success) {
                toast({
                    title: "Login realizado com sucesso!",
                    description: "Bem-vindo ao BVOLT Sistemas.",
                });
            }
            // Error handling is now done in AuthContext
        } catch (error) {
            toast({
                title: "Erro interno",
                description: "Ocorreu um erro inesperado. Tente novamente.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Função para preencher dados de demonstração
    const fillDemoData = (userType: 'admin' | 'gerente' | 'vendedor') => {
        const demoUsers = {
            admin: { email: 'admin@bvolt.com', password: 'admin123' },
            gerente: { email: 'gerente@bvolt.com', password: 'gerente123' },
            vendedor: { email: 'vendedor@bvolt.com', password: 'vendedor123' }
        };

        setEmail(demoUsers[userType].email);
        setPassword(demoUsers[userType].password);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Logo e título principal */}
                <div className="text-center space-y-2">
                    <div className="mx-auto w-20 h-20 bg-bvolt-gradient rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-2xl font-bold text-white"><div className="mx-auto w-20 h-20 rounded-2xl overflow-hidden shadow-lg">
                            <img
                                src="/public/logoBV.png"
                                alt="Logo BVOLT"
                                className="w-full h-full object-contain"
                            />
                        </div></span>
                    </div>
                    <h1 className="text-3xl font-bold bg-bvolt-gradient bg-clip-text text-transparent">
                        BVOLT SISTEMAS
                    </h1>
                    <p className="text-slate-600">
                        Sistema de Gestão Comercial
                    </p>
                </div>

                {/* Card do formulário de login */}
                <Card className="shadow-xl border-0">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-center">Fazer Login</CardTitle>
                        <CardDescription className="text-center">
                            Entre com suas credenciais para acessar o sistema
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Campo de email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Digite seu email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Campo de senha */}
                            <div className="space-y-2">
                                <Label htmlFor="password">Senha</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Sua senha"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 pr-10"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 h-4 w-4 text-slate-400 hover:text-slate-600"
                                        disabled={isLoading}
                                    >
                                        {showPassword ? <EyeOff /> : <Eye />}
                                    </button>
                                </div>
                            </div>

                            {/* Botão de login */}
                            <Button
                                type="submit"
                                className="w-full bg-bvolt-gradient hover:bg-bvolt-gradient-hover text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Entrando...
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="w-4 h-4 mr-2" />
                                        Entrar
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* Botões de demonstração */}
                        <div className="mt-6 pt-4 border-t">
                            <p className="text-xs text-center text-slate-500 mb-3">
                                Dados para demonstração:
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fillDemoData('admin')}
                                    className="text-xs"
                                    disabled={isLoading}
                                >
                                    Admin
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fillDemoData('gerente')}
                                    className="text-xs"
                                    disabled={isLoading}
                                >
                                    Gerente
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fillDemoData('vendedor')}
                                    className="text-xs"
                                    disabled={isLoading}
                                >
                                    Vendedor
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Rodapé */}
                <p className="text-center text-xs text-slate-500">
                    © 2024 BVOLT Sistemas. Todos os direitos reservados.
                </p>
            </div>
        </div>
    );
};

export default Login;