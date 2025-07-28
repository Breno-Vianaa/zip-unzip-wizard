
import React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Interface para definir as propriedades do diálogo de confirmação
interface ConfirmDialogProps {
    isOpen: boolean; // Controla se o diálogo está aberto
    onClose: () => void; // Função chamada quando o diálogo é fechado
    onConfirm: () => void; // Função chamada quando o usuário confirma a ação
    title: string; // Título do diálogo
    description: string; // Descrição da ação que será realizada
    confirmText?: string; // Texto do botão de confirmação (padrão: "Confirmar")
    cancelText?: string; // Texto do botão de cancelar (padrão: "Cancelar")
    variant?: 'default' | 'destructive'; // Variante visual do botão de confirmação
}

/**
 * Componente reutilizável para exibir diálogos de confirmação
 * Usado para confirmar ações importantes como reset de configurações, exclusões, etc.
 */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'default'
}) => {
    // Função que executa a confirmação e fecha o diálogo
    const handleConfirm = () => {
        onConfirm(); // Executa a ação confirmada
        onClose(); // Fecha o diálogo
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose}>
                        {cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        className={variant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : ''}
                    >
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default ConfirmDialog;
