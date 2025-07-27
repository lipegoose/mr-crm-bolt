import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Info, Home, Ruler, DollarSign, CheckSquare, Building, MapPin, 
  Store, FileText, Plus, Image, Eye, Lock, Save, ArrowLeft 
} from 'lucide-react';
import { Button } from '../ui/Button';
// import { Card } from '../ui/Card'; // Removido pois não está sendo usado
import { Step, StepNavigation } from '../ui/StepNavigation';

// Importando os componentes de passos que serão criados
import InformacoesIniciais from '../imoveis/InformacoesIniciais';
import Comodos from '../imoveis/Comodos';
import Medidas from '../imoveis/Medidas';
import Preco from '../imoveis/Preco';
import CaracteristicasImovel from '../imoveis/CaracteristicasImovel';
import CaracteristicasCondominio from '../imoveis/CaracteristicasCondominio';
import Localizacao from '../imoveis/Localizacao';
import Proximidades from '../imoveis/Proximidades';
import Descricao from '../imoveis/Descricao';
import Complementos from '../imoveis/Complementos';
import DadosPrivativos from '../imoveis/DadosPrivativos';
import ImagensImovel from '../imoveis/ImagensImovel';
import Publicacao from '../imoveis/Publicacao';

const ImovelCadastro: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState('informacoes');
  const [formData, setFormData] = useState({});
  const [stepsCompleted, setStepsCompleted] = useState<string[]>([]);

  // Define os passos do cadastro
  const steps: Step[] = [
    { id: 'informacoes', label: 'Informações', icon: <Info size={16} />, completed: stepsCompleted.includes('informacoes') },
    { id: 'comodos', label: 'Cômodos', icon: <Home size={16} />, completed: stepsCompleted.includes('comodos') },
    { id: 'medidas', label: 'Medidas', icon: <Ruler size={16} />, completed: stepsCompleted.includes('medidas') },
    { id: 'preco', label: 'Preço', icon: <DollarSign size={16} />, completed: stepsCompleted.includes('preco') },
    { id: 'caracteristicas-imovel', label: 'Características do Imóvel', icon: <CheckSquare size={16} />, completed: stepsCompleted.includes('caracteristicas-imovel') },
    { id: 'caracteristicas-condominio', label: 'Características do Condomínio', icon: <Building size={16} />, completed: stepsCompleted.includes('caracteristicas-condominio') },
    { id: 'localizacao', label: 'Localização', icon: <MapPin size={16} />, completed: stepsCompleted.includes('localizacao') },
    { id: 'proximidades', label: 'Proximidades', icon: <Store size={16} />, completed: stepsCompleted.includes('proximidades') },
    { id: 'descricao', label: 'Descrição', icon: <FileText size={16} />, completed: stepsCompleted.includes('descricao') },
    { id: 'complementos', label: 'Complementos', icon: <Plus size={16} />, completed: stepsCompleted.includes('complementos') },
    { id: 'dados-privativos', label: 'Dados privativos', icon: <Lock size={16} />, completed: stepsCompleted.includes('dados-privativos') },
    { id: 'imagens', label: 'Imagens do imóvel', icon: <Image size={16} />, completed: stepsCompleted.includes('imagens') },
    { id: 'publicacao', label: 'Publicação', icon: <Eye size={16} />, completed: stepsCompleted.includes('publicacao') },
  ];

  // Função para atualizar os dados do formulário
  const handleUpdateFormData = useCallback((stepId: string, data: any) => {
    setFormData(prev => ({
      ...prev,
      [stepId]: data
    }));
    
    // Marca o passo como concluído
    if (!stepsCompleted.includes(stepId)) {
      setStepsCompleted(prev => [...prev, stepId]);
    }
  }, [stepsCompleted]);

  // Função para avançar para o próximo passo
  const handleNextStep = () => {
    const currentIndex = steps.findIndex(step => step.id === activeStep);
    if (currentIndex < steps.length - 1) {
      setActiveStep(steps[currentIndex + 1].id);
    }
  };

  // Função para voltar ao passo anterior
  const handlePreviousStep = () => {
    const currentIndex = steps.findIndex(step => step.id === activeStep);
    if (currentIndex > 0) {
      setActiveStep(steps[currentIndex - 1].id);
    }
  };

  // Função para salvar o formulário
  const handleSave = () => {
    // Aqui seria implementada a lógica para salvar os dados no backend
    console.log('Dados do formulário:', formData);
    alert('Imóvel cadastrado com sucesso!');
    navigate('/imoveis');
  };

  // Renderiza o componente de acordo com o passo ativo
  const renderStepContent = () => {
    switch (activeStep) {
      case 'informacoes':
        return <InformacoesIniciais onUpdate={(data) => handleUpdateFormData('informacoes', data)} />;
      case 'comodos':
        return <Comodos onUpdate={(data) => handleUpdateFormData('comodos', data)} />;
      case 'medidas':
        return <Medidas onUpdate={(data) => handleUpdateFormData('medidas', data)} />;
      case 'preco':
        return <Preco onUpdate={(data) => handleUpdateFormData('preco', data)} />;
      case 'caracteristicas-imovel':
        return <CaracteristicasImovel onUpdate={(data) => handleUpdateFormData('caracteristicas-imovel', data)} />;
      case 'caracteristicas-condominio':
        return <CaracteristicasCondominio onUpdate={(data) => handleUpdateFormData('caracteristicas-condominio', data)} />;
      case 'localizacao':
        return <Localizacao onUpdate={(data) => handleUpdateFormData('localizacao', data)} />;
      case 'proximidades':
        return <Proximidades onUpdate={(data) => handleUpdateFormData('proximidades', data)} />;
      case 'descricao':
        return <Descricao onUpdate={(data) => handleUpdateFormData('descricao', data)} />;
      case 'complementos':
        return <Complementos onUpdate={(data) => handleUpdateFormData('complementos', data)} />;
      case 'dados-privativos':
        return <DadosPrivativos onUpdate={(data) => handleUpdateFormData('dados-privativos', data)} />;
      case 'imagens':
        return <ImagensImovel onUpdate={(data) => handleUpdateFormData('imagens', data)} />;
      case 'publicacao':
        return <Publicacao onUpdate={(data) => handleUpdateFormData('publicacao', data)} />;
      default:
        return <div>Passo não encontrado</div>;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-title font-bold text-neutral-black">Cadastro de Imóvel</h1>
          <p className="text-neutral-gray-medium">Preencha os dados do imóvel em cada etapa</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="secondary" 
            onClick={() => navigate('/imoveis')}
            className="flex items-center"
          >
            <ArrowLeft size={16} className="mr-2" />
            Voltar
          </Button>
          <Button 
            onClick={handleSave}
            className="flex items-center"
          >
            <Save size={16} className="mr-2" />
            Salvar Imóvel
          </Button>
        </div>
      </div>

      <div className="flex bg-white border border-neutral-gray rounded-default shadow-sm">
        <StepNavigation 
          steps={steps} 
          activeStep={activeStep} 
          onStepChange={setActiveStep} 
        />
        
        <div className="flex-1 p-6">
          {renderStepContent()}
          
          <div className="flex justify-between mt-8 pt-4 border-t border-neutral-gray">
            <Button 
              variant="secondary" 
              onClick={handlePreviousStep}
              disabled={activeStep === steps[0].id}
            >
              Anterior
            </Button>
            
            <div className="flex space-x-3">
              {activeStep !== steps[steps.length - 1].id ? (
                <Button onClick={handleNextStep}>
                  Próximo
                </Button>
              ) : (
                <Button onClick={handleSave}>
                  Finalizar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImovelCadastro;
