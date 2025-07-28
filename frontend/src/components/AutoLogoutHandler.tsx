import { useAutoLogout } from '../hooks/useAutoLogout';

/**
 * Componente responsável por gerenciar o auto-logout por inatividade
 * Deve ser usado dentro do AuthProvider para ter acesso ao contexto
 */
export const AutoLogoutHandler: React.FC = () => {
    // Hook para auto-logout por inatividade (10 minutos)
    useAutoLogout(10);

    // Este componente não renderiza nada, apenas gerencia o auto-logout
    return null;
};