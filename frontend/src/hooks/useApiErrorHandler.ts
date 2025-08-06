import { useAuth } from '../contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

/**
 * Hook para gerenciar erros de API e token refresh automático
 */
export const useApiErrorHandler = () => {
    const { logout, refreshToken } = useAuth();

    const handleApiError = async (error: any): Promise<boolean> => {
        if (error.message?.includes('TOKEN_EXPIRED')) {
            try {
                await refreshToken();
                toast({
                    title: "Token renovado",
                    description: "Sua sessão foi renovada automaticamente.",
                });
                return true; // Indica que o token foi renovado com sucesso
            } catch (refreshError) {
                console.error('Erro ao renovar token:', refreshError);
                await logout();
                return false;
            }
        }

        if (error.message?.includes('INVALID_TOKEN') || error.message?.includes('USER_NOT_FOUND')) {
            await logout();
            toast({
                title: "Sessão inválida",
                description: "Sua sessão expirou. Faça login novamente.",
                variant: "destructive"
            });
            return false;
        }

        if (error.message?.includes('USER_INACTIVE')) {
            await logout();
            toast({
                title: "Usuário inativo",
                description: "Sua conta foi desativada. Entre em contato com o administrador.",
                variant: "destructive"
            });
            return false;
        }

        if (error.message?.includes('INSUFFICIENT_PERMISSION')) {
            toast({
                title: "Acesso negado",
                description: "Você não tem permissão para executar esta ação.",
                variant: "destructive"
            });
            return false;
        }

        // Erro genérico
        toast({
            title: "Erro na requisição",
            description: "Ocorreu um erro inesperado. Tente novamente.",
            variant: "destructive"
        });
        return false;
    };

    return { handleApiError };
};