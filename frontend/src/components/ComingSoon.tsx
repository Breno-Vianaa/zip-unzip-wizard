
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Construction, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ComingSoonProps {
    title: string;
    description: string;
    features?: string[];
}

const ComingSoon: React.FC<ComingSoonProps> = ({ title, description, features = [] }) => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            {/* Botão de voltar */}
            <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="mb-4"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
            </Button>

            {/* Card principal */}
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="w-full max-w-2xl text-center">
                    <CardHeader>
                        <div className="mx-auto w-20 h-20 bg-bvolt-gradient rounded-full flex items-center justify-center mb-4">
                            <Construction className="h-10 w-10 text-white" />
                        </div>
                        <CardTitle className="text-2xl">{title}</CardTitle>
                        <CardDescription className="text-lg mt-2">
                            {description}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Lista de funcionalidades planejadas */}
                        {features.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-lg mb-4 text-slate-700">
                                    Funcionalidades Planejadas:
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {features.map((feature, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center p-3 bg-slate-50 rounded-lg border"
                                        >
                                            <div className="w-2 h-2 bg-bvolt-gradient rounded-full mr-3"></div>
                                            <span className="text-sm text-slate-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Mensagem de desenvolvimento */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-blue-800 text-sm">
                                Esta seção está em desenvolvimento ativo. As funcionalidades serão implementadas
                                seguindo a metodologia ágil conforme o roadmap do projeto BVOLT Sistemas.
                            </p>
                        </div>

                        {/* Botões de ação */}
                        <div className="flex gap-3 justify-center">
                            <Button
                                onClick={() => navigate('/dashboard')}
                                className="bg-bvolt-gradient hover:bg-bvolt-gradient-hover"
                            >
                                Voltar ao Dashboard
                            </Button>
                            <Button variant="outline">
                                Ver Roadmap Completo
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ComingSoon;
