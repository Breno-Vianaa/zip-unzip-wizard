import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

/**
 * Hook personalizado para gerenciar auto-logout por inatividade
 * Monitora atividade do usuário e faz logout automático após período de inatividade
 */
export const useAutoLogout = (timeoutMinutes: number = 10) => {
    const { logout } = useAuth();
    const [isActive, setIsActive] = useState(true);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Função para resetar o timer de inatividade
    const resetTimer = () => {
        setIsActive(true);

        // Limpa timers anteriores se existirem
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        if (warningTimeoutRef.current) {
            clearTimeout(warningTimeoutRef.current);
        }

        // Aviso 2 minutos antes do logout
        const warningTime = (timeoutMinutes - 2) * 60 * 1000;
        if (warningTime > 0) {
            warningTimeoutRef.current = setTimeout(() => {
                toast({
                    title: "Aviso de Inatividade",
                    description: "Você será desconectado em 2 minutos por inatividade. Mova o mouse para continuar.",
                    variant: "destructive",
                });
            }, warningTime);
        }

        // Timer principal para logout
        timeoutRef.current = setTimeout(() => {
            setIsActive(false);
            toast({
                title: "Sessão Encerrada",
                description: "Sua sessão foi encerrada por inatividade. Por favor, faça login novamente.",
                variant: "destructive",
            });

            // Delay pequeno para mostrar a mensagem antes do logout
            setTimeout(() => {
                logout();
            }, 2000);
        }, timeoutMinutes * 60 * 1000);
    };

    // Eventos que indicam atividade do usuário
    const events = [
        'mousedown',
        'mousemove',
        'keypress',
        'scroll',
        'touchstart',
        'click',
    ];

    // Função para lidar com atividade do usuário
    const handleUserActivity = () => {
        resetTimer();
    };

    useEffect(() => {
        // Inicia o timer na montagem do componente
        resetTimer();

        // Adiciona listeners para eventos de atividade
        events.forEach(event => {
            document.addEventListener(event, handleUserActivity, true);
        });

        // Listener para detectar mudança de visibilidade da página
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                resetTimer();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Cleanup function
        return () => {
            // Remove todos os listeners
            events.forEach(event => {
                document.removeEventListener(event, handleUserActivity, true);
            });

            document.removeEventListener('visibilitychange', handleVisibilityChange);

            // Limpa timers
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (warningTimeoutRef.current) {
                clearTimeout(warningTimeoutRef.current);
            }
        };
    }, [timeoutMinutes]);

    return {
        isActive,
        resetTimer,
    };
};