import { useState } from 'react';
import { useToast } from './use-toast';

interface UseImageUploadOptions {
    maxSize?: number; // em MB
    allowedTypes?: string[];
}

export const useImageUpload = (options: UseImageUploadOptions = {}) => {
    const { maxSize = 2, allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'] } = options;
    const [uploading, setUploading] = useState(false);
    const { toast } = useToast();

    const uploadImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            // Validar tamanho
            if (file.size > maxSize * 1024 * 1024) {
                const error = `Arquivo muito grande. Máximo ${maxSize}MB.`;
                toast({
                    title: "Erro no upload",
                    description: error,
                    variant: "destructive"
                });
                reject(new Error(error));
                return;
            }

            // Validar tipo
            if (!allowedTypes.includes(file.type)) {
                const error = "Tipo de arquivo não permitido. Use PNG, JPG ou GIF.";
                toast({
                    title: "Erro no upload",
                    description: error,
                    variant: "destructive"
                });
                reject(new Error(error));
                return;
            }

            setUploading(true);

            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setUploading(false);

                // Salvar no localStorage para persistir
                localStorage.setItem('bvolt-company-logo', result);

                toast({
                    title: "Upload realizado",
                    description: "Logo da empresa atualizado com sucesso!",
                });

                resolve(result);
            };

            reader.onerror = () => {
                setUploading(false);
                const error = "Erro ao ler o arquivo.";
                toast({
                    title: "Erro no upload",
                    description: error,
                    variant: "destructive"
                });
                reject(new Error(error));
            };

            reader.readAsDataURL(file);
        });
    };

    const getStoredLogo = (): string | null => {
        return localStorage.getItem('bvolt-company-logo');
    };

    const clearLogo = () => {
        localStorage.removeItem('bvolt-company-logo');
    };

    return {
        uploadImage,
        uploading,
        getStoredLogo,
        clearLogo
    };
};
