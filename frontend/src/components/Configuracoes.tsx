import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
    Settings,
    Building,
    Palette,
    Database,
    Shield,
    Globe,
    Save,
    RefreshCcw,
    FileText,
    Upload,
    CheckCircle,
    AlertCircle,
    Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { useTheme } from '../hooks/useTheme';
import { useImageUpload } from '../hooks/useImageUpload';
import ConfirmDialog from './ConfirmDialog';

// Interface para configurações da empresa
interface ConfiguracaoEmpresa {
    nome: string;
    cnpj: string;
    endereco: string;
    telefone: string;
    email: string;
    website: string;
    logo: string;
}

/**
 * Componente principal do módulo de Configurações
 * Gerencia configurações da empresa, sistema e backup
 * Utiliza hooks personalizados para tema e upload de imagens
 */
const Configuracoes: React.FC = () => {
    // Hooks de autenticação e notificação
    const { user, hasPermission } = useAuth();
    const { toast } = useToast();

    // Hooks personalizados para tema e upload de imagem
    const { theme, changeTheme } = useTheme();
    const { uploadImage, uploading, getStoredLogo, clearLogo } = useImageUpload();

    // Estados para as configurações da empresa
    const [configEmpresa, setConfigEmpresa] = useState<ConfiguracaoEmpresa>(() => {
        const savedLogo = getStoredLogo();
        return {
            nome: localStorage.getItem('bvolt-empresa-nome') || 'BVOLT Sistemas Ltda',
            cnpj: localStorage.getItem('bvolt-empresa-cnpj') || '12.345.678/0001-90',
            endereco: localStorage.getItem('bvolt-empresa-endereco') || 'Av. Tecnologia, 1000 - São Paulo/SP',
            telefone: localStorage.getItem('bvolt-empresa-telefone') || '(11) 3333-4444',
            email: localStorage.getItem('bvolt-empresa-email') || 'contato@bvolt.com',
            website: localStorage.getItem('bvolt-empresa-website') || 'www.bvolt.com',
            logo: savedLogo || ''
        };
    });

    // Estados para controle de ações e configurações temporárias
    const [salvando, setSalvando] = useState(false);
    const [errosValidacao, setErrosValidacao] = useState<Record<string, string>>({});
    const [showResetDialog, setShowResetDialog] = useState(false);
    const [backupAutomatico, setBackupAutomatico] = useState(() => {
        return localStorage.getItem('bvolt-backup-automatico') === 'true';
    });

    // Estado temporário para tema (só aplica ao salvar)
    const [tempTheme, setTempTheme] = useState(theme);

    // Verificação de permissão - apenas admin e gerente podem acessar
    if (!hasPermission(['admin', 'gerente'])) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Card className="max-w-md">
                    <CardContent className="pt-6 text-center">
                        <Shield className="h-12 w-12 mx-auto text-red-500 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Acesso Restrito</h3>
                        <p className="text-gray-600 mb-4">
                            Apenas administradores e gerentes podem acessar as configurações do sistema.
                        </p>
                        <Badge variant="destructive">Permissão Insuficiente</Badge>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Função para validar configurações da empresa
    const validarConfigEmpresa = (): boolean => {
        const erros: Record<string, string> = {};

        if (!configEmpresa.nome.trim()) {
            erros.nome = 'Nome da empresa é obrigatório';
        }

        if (!configEmpresa.cnpj.trim()) {
            erros.cnpj = 'CNPJ é obrigatório';
        } else if (!/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(configEmpresa.cnpj)) {
            erros.cnpj = 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX';
        }

        if (!configEmpresa.email.trim()) {
            erros.email = 'Email é obrigatório';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(configEmpresa.email)) {
            erros.email = 'Email deve ter um formato válido';
        }

        if (!configEmpresa.telefone.trim()) {
            erros.telefone = 'Telefone é obrigatório';
        }

        setErrosValidacao(erros);
        return Object.keys(erros).length === 0;
    };

    // Função para atualizar configurações da empresa
    const updateConfigEmpresa = (campo: keyof ConfiguracaoEmpresa, valor: string) => {
        setConfigEmpresa(prev => ({
            ...prev,
            [campo]: valor
        }));

        // Limpar erro de validação quando o campo for alterado
        if (errosValidacao[campo]) {
            setErrosValidacao(prev => {
                const novosErros = { ...prev };
                delete novosErros[campo];
                return novosErros;
            });
        }
    };

    // Função para fazer upload de logo
    const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const logoUrl = await uploadImage(file);
                updateConfigEmpresa('logo', logoUrl);
            } catch (error) {
                console.error('Erro no upload:', error);
            }
        }
    };

    // Função para remover logo
    const handleRemoveLogo = () => {
        clearLogo();
        updateConfigEmpresa('logo', '');
        toast({
            title: "Logo removido",
            description: "Logo da empresa foi removido com sucesso.",
        });
    };

    // Função para salvar configurações
    const salvarConfiguracoes = async () => {
        console.log('Iniciando salvamento das configurações...');

        // Validar antes de salvar
        if (!validarConfigEmpresa()) {
            toast({
                title: "Erro de validação",
                description: "Por favor, corrija os erros antes de salvar.",
                variant: "destructive"
            });
            return;
        }

        setSalvando(true);

        try {
            // Simula salvamento das configurações
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Salvar configurações da empresa no localStorage
            localStorage.setItem('bvolt-empresa-nome', configEmpresa.nome);
            localStorage.setItem('bvolt-empresa-cnpj', configEmpresa.cnpj);
            localStorage.setItem('bvolt-empresa-endereco', configEmpresa.endereco);
            localStorage.setItem('bvolt-empresa-telefone', configEmpresa.telefone);
            localStorage.setItem('bvolt-empresa-email', configEmpresa.email);
            localStorage.setItem('bvolt-empresa-website', configEmpresa.website);

            // Salvar configurações do sistema
            localStorage.setItem('bvolt-backup-automatico', backupAutomatico.toString());

            // Aplicar tema somente agora
            if (tempTheme !== theme) {
                changeTheme(tempTheme);
            }

            console.log('Configurações da Empresa:', configEmpresa);
            console.log('Configurações do Sistema:', { theme: tempTheme, backupAutomatico });

            toast({
                title: "Configurações salvas",
                description: "Todas as configurações foram salvas e aplicadas com sucesso.",
            });

        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            toast({
                title: "Erro ao salvar",
                description: "Ocorreu um erro ao salvar as configurações. Tente novamente.",
                variant: "destructive"
            });
        } finally {
            setSalvando(false);
        }
    };

    // Função para resetar configurações (com confirmação)
    const resetarConfiguracoes = () => {
        setConfigEmpresa({
            nome: 'BVOLT Sistemas Ltda',
            cnpj: '12.345.678/0001-90',
            endereco: 'Av. Tecnologia, 1000 - São Paulo/SP',
            telefone: '(11) 3333-4444',
            email: 'contato@bvolt.com',
            website: 'www.bvolt.com',
            logo: ''
        });

        // Resetar tema e configurações do sistema
        setTempTheme('claro');
        setBackupAutomatico(true);

        // Limpar localStorage
        localStorage.removeItem('bvolt-empresa-nome');
        localStorage.removeItem('bvolt-empresa-cnpj');
        localStorage.removeItem('bvolt-empresa-endereco');
        localStorage.removeItem('bvolt-empresa-telefone');
        localStorage.removeItem('bvolt-empresa-email');
        localStorage.removeItem('bvolt-empresa-website');
        localStorage.removeItem('bvolt-backup-automatico');
        clearLogo();

        setErrosValidacao({});

        toast({
            title: "Configurações resetadas",
            description: "Todas as configurações foram restauradas para os valores padrão. Clique em 'Salvar' para aplicar.",
        });
    };

    // Função para fazer backup manual
    const fazerBackup = () => {
        toast({
            title: "Backup iniciado",
            description: "O backup manual foi iniciado e será concluído em alguns minutos.",
        });
    };

    // Função para restaurar backup
    const restaurarBackup = () => {
        toast({
            title: "Restauração iniciada",
            description: "O processo de restauração foi iniciado.",
        });
    };

    // Dados dinâmicos para estatísticas do sistema
    const estatisticasSistema = {
        versao: '1.0.0',
        ultimoBackup: localStorage.getItem('bvolt-ultimo-backup') || 'Nunca',
        espacoUsado: '0.1 GB',
        usuarios_online: 1
    };

    return (
        <div className="space-y-6">
            {/* Cabeçalho da página com título e botões de ação */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Configurações</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Personalize e configure o sistema</p>
                </div>

                {/* Botões para salvar e resetar configurações */}
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowResetDialog(true)}
                        disabled={salvando}
                    >
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        Resetar
                    </Button>
                    <Button
                        onClick={salvarConfiguracoes}
                        disabled={salvando}
                        className="bg-bvolt-gradient hover:opacity-90"
                    >
                        {salvando ? (
                            <>
                                <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Salvar Configurações
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Cards de estatísticas do sistema */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="dark:bg-slate-800 dark:border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium dark:text-slate-200">Versão do Sistema</CardTitle>
                        <Settings className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold dark:text-slate-100">{estatisticasSistema.versao}</div>
                        <p className="text-xs text-muted-foreground">versão atual</p>
                    </CardContent>
                </Card>

                <Card className="dark:bg-slate-800 dark:border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium dark:text-slate-200">Último Backup</CardTitle>
                        <Database className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm font-bold text-green-600">{estatisticasSistema.ultimoBackup}</div>
                        <p className="text-xs text-muted-foreground">backup automático</p>
                    </CardContent>
                </Card>

                <Card className="dark:bg-slate-800 dark:border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium dark:text-slate-200">Espaço Usado</CardTitle>
                        <FileText className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{estatisticasSistema.espacoUsado}</div>
                        <p className="text-xs text-muted-foreground">dados armazenados</p>
                    </CardContent>
                </Card>

                <Card className="dark:bg-slate-800 dark:border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium dark:text-slate-200">Usuários Online</CardTitle>
                        <Globe className="h-4 w-4 text-bvolt-blue" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-bvolt-blue">{estatisticasSistema.usuarios_online}</div>
                        <p className="text-xs text-muted-foreground">conectados agora</p>
                    </CardContent>
                </Card>
            </div>

            {/* Seção principal com abas para diferentes configurações */}
            <Tabs defaultValue="empresa" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3 dark:bg-slate-800">
                    <TabsTrigger value="empresa" className="dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-slate-100">Empresa</TabsTrigger>
                    <TabsTrigger value="sistema" className="dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-slate-100">Sistema</TabsTrigger>
                    <TabsTrigger value="backup" className="dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-slate-100">Backup</TabsTrigger>
                </TabsList>

                <TabsContent value="empresa">
                    <Card className="dark:bg-slate-800 dark:border-slate-700">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2 dark:text-slate-100">
                                <Building className="h-5 w-5" />
                                <span>Dados da Empresa</span>
                            </CardTitle>
                            <CardDescription className="dark:text-slate-400">Informações básicas da sua empresa</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Formulário de dados da empresa */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nome" className="dark:text-slate-200">Nome da Empresa *</Label>
                                    <Input
                                        id="nome"
                                        value={configEmpresa.nome}
                                        onChange={(e) => updateConfigEmpresa('nome', e.target.value)}
                                        placeholder="Nome da sua empresa"
                                        className={`dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 ${errosValidacao.nome ? 'border-red-500' : ''}`}
                                    />
                                    {errosValidacao.nome && (
                                        <p className="text-sm text-red-500 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" />
                                            {errosValidacao.nome}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cnpj" className="dark:text-slate-200">CNPJ *</Label>
                                    <Input
                                        id="cnpj"
                                        value={configEmpresa.cnpj}
                                        onChange={(e) => updateConfigEmpresa('cnpj', e.target.value)}
                                        placeholder="00.000.000/0000-00"
                                        className={`dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 ${errosValidacao.cnpj ? 'border-red-500' : ''}`}
                                    />
                                    {errosValidacao.cnpj && (
                                        <p className="text-sm text-red-500 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" />
                                            {errosValidacao.cnpj}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="endereco" className="dark:text-slate-200">Endereço Completo</Label>
                                <Input
                                    id="endereco"
                                    value={configEmpresa.endereco}
                                    onChange={(e) => updateConfigEmpresa('endereco', e.target.value)}
                                    placeholder="Endereço completo da empresa"
                                    className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="telefone" className="dark:text-slate-200">Telefone *</Label>
                                    <Input
                                        id="telefone"
                                        value={configEmpresa.telefone}
                                        onChange={(e) => updateConfigEmpresa('telefone', e.target.value)}
                                        placeholder="(11) 99999-9999"
                                        className={`dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 ${errosValidacao.telefone ? 'border-red-500' : ''}`}
                                    />
                                    {errosValidacao.telefone && (
                                        <p className="text-sm text-red-500 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" />
                                            {errosValidacao.telefone}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="dark:text-slate-200">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={configEmpresa.email}
                                        onChange={(e) => updateConfigEmpresa('email', e.target.value)}
                                        placeholder="contato@empresa.com"
                                        className={`dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 ${errosValidacao.email ? 'border-red-500' : ''}`}
                                    />
                                    {errosValidacao.email && (
                                        <p className="text-sm text-red-500 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" />
                                            {errosValidacao.email}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="website" className="dark:text-slate-200">Website</Label>
                                    <Input
                                        id="website"
                                        value={configEmpresa.website}
                                        onChange={(e) => updateConfigEmpresa('website', e.target.value)}
                                        placeholder="www.empresa.com"
                                        className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                                    />
                                </div>
                            </div>

                            {/* Seção para upload do logo da empresa */}
                            <div className="space-y-2">
                                <Label className="dark:text-slate-200">Logo da Empresa</Label>
                                <div className="flex items-center space-x-4">
                                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center overflow-hidden">
                                        {configEmpresa.logo ? (
                                            <img src={configEmpresa.logo} alt="Logo da Empresa" className="w-full h-full object-cover" />
                                        ) : (
                                            <Building className="h-10 w-10 text-white" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleLogoUpload}
                                                disabled={uploading}
                                                className="flex-1 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                                            />
                                            {configEmpresa.logo && (
                                                <Button variant="outline" size="sm" onClick={handleRemoveLogo}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            Formato recomendado: PNG ou JPG, tamanho máximo: 2MB
                                        </p>
                                        {uploading && (
                                            <p className="text-xs text-blue-600 mt-1">Fazendo upload...</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Aba com configurações do sistema - apenas tema */}
                <TabsContent value="sistema">
                    <Card className="dark:bg-slate-800 dark:border-slate-700">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2 dark:text-slate-100">
                                <Palette className="h-5 w-5" />
                                <span>Configurações do Sistema</span>
                            </CardTitle>
                            <CardDescription className="dark:text-slate-400">
                                Personalize a aparência do sistema
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h4 className="text-sm font-medium mb-3 dark:text-slate-200">Aparência</h4>
                                <div className="space-y-2">
                                    <Label htmlFor="tema" className="dark:text-slate-200">Tema</Label>
                                    <select
                                        id="tema"
                                        value={tempTheme}
                                        onChange={(e) => setTempTheme(e.target.value as any)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-bvolt-blue dark:bg-slate-700 dark:text-slate-100"
                                    >
                                        <option value="claro">Claro</option>
                                        <option value="escuro">Escuro</option>
                                        <option value="auto">Automático</option>
                                    </select>
                                    {tempTheme !== theme && (
                                        <p className="text-xs text-amber-600 dark:text-amber-400">
                                            ⚠️ Clique em "Salvar Configurações" para aplicar o novo tema
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium mb-3 dark:text-slate-200">Sistema</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="backup_automatico" className="dark:text-slate-200">Backup Automático</Label>
                                            <p className="text-sm text-gray-500 dark:text-slate-400">Fazer backup automático dos dados diariamente</p>
                                        </div>
                                        <Switch
                                            id="backup_automatico"
                                            checked={backupAutomatico}
                                            onCheckedChange={setBackupAutomatico}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="backup">
                    <Card className="dark:bg-slate-800 dark:border-slate-700">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2 dark:text-slate-100">
                                <Database className="h-5 w-5" />
                                <span>Backup e Segurança</span>
                            </CardTitle>
                            <CardDescription className="dark:text-slate-400">Configure backups e políticas de segurança</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 border rounded-lg dark:border-slate-600">
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="h-8 w-8 text-green-500" />
                                        <div>
                                            <h4 className="font-medium dark:text-slate-100">Último Backup</h4>
                                            <p className="text-sm text-gray-500 dark:text-slate-400">{estatisticasSistema.ultimoBackup}</p>
                                        </div>
                                    </div>
                                    <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                        Concluído
                                    </Badge>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium mb-3 dark:text-slate-200">Configurações de Backup</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label className="dark:text-slate-200">Backup Automático Diário</Label>
                                                <p className="text-sm text-gray-500 dark:text-slate-400">Realizar backup automaticamente todos os dias às 03:00</p>
                                            </div>
                                            <Switch
                                                checked={backupAutomatico}
                                                onCheckedChange={setBackupAutomatico}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium mb-3 dark:text-slate-200">Ações</h4>
                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={fazerBackup}>
                                            <Database className="h-4 w-4 mr-2" />
                                            Fazer Backup Agora
                                        </Button>
                                        <Button variant="outline" onClick={restaurarBackup}>
                                            <RefreshCcw className="h-4 w-4 mr-2" />
                                            Restaurar Backup
                                        </Button>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium mb-3 dark:text-slate-200">Informações do Sistema</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium dark:text-slate-200">Espaço Total:</span>
                                            <span className="ml-2 text-gray-600 dark:text-slate-400">10 GB</span>
                                        </div>
                                        <div>
                                            <span className="font-medium dark:text-slate-200">Espaço Usado:</span>
                                            <span className="ml-2 text-gray-600 dark:text-slate-400">{estatisticasSistema.espacoUsado}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium dark:text-slate-200">Espaço Livre:</span>
                                            <span className="ml-2 text-gray-600 dark:text-slate-400">7.6 GB</span>
                                        </div>
                                        <div>
                                            <span className="font-medium dark:text-slate-200">Última Verificação:</span>
                                            <span className="ml-2 text-gray-600 dark:text-slate-400">Hoje, 08:30</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Diálogo de confirmação para reset */}
            <ConfirmDialog
                isOpen={showResetDialog}
                onClose={() => setShowResetDialog(false)}
                onConfirm={resetarConfiguracoes}
                title="Confirmar Reset"
                description="Tem certeza que deseja resetar todas as configurações? Esta ação não pode ser desfeita e todas as configurações voltarão aos valores padrão."
                confirmText="Sim, Resetar"
                cancelText="Cancelar"
                variant="destructive"
            />
        </div>
    );
};

export default Configuracoes;