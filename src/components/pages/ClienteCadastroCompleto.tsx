import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { InputMask } from '../ui/InputMask';
import { Select } from '../ui/Select';
import { TextArea } from '../ui/TextArea';
import { RadioGroup } from '../ui/RadioGroup';

const ClienteCadastroCompleto: React.FC = () => {
  const navigate = useNavigate();
  const [tipoPessoa, setTipoPessoa] = useState('fisica');

  // Opções para os selects
  const origemOptions = [
    { value: '', label: 'Selecione' },
    { value: 'site', label: 'Site' },
    { value: 'indicacao', label: 'Indicação' },
    { value: 'redes_sociais', label: 'Redes Sociais' },
    { value: 'anuncio', label: 'Anúncio' },
    { value: 'outro', label: 'Outro' },
  ];

  const categoriaOptions = [
    { value: '', label: 'Selecione' },
    { value: 'cliente', label: 'Cliente' },
    { value: 'prospecto', label: 'Prospecto' },
    { value: 'lead', label: 'Lead' },
  ];

  const estadoCivilOptions = [
    { value: '', label: 'Selecione' },
    { value: 'solteiro', label: 'Solteiro(a)' },
    { value: 'casado', label: 'Casado(a)' },
    { value: 'divorciado', label: 'Divorciado(a)' },
    { value: 'viuvo', label: 'Viúvo(a)' },
    { value: 'uniao_estavel', label: 'União Estável' },
  ];

  const ufOptions = [
    { value: '', label: 'Selecione' },
    { value: 'AC', label: 'AC' },
    { value: 'AL', label: 'AL' },
    { value: 'AP', label: 'AP' },
    { value: 'AM', label: 'AM' },
    { value: 'BA', label: 'BA' },
    { value: 'CE', label: 'CE' },
    { value: 'DF', label: 'DF' },
    { value: 'ES', label: 'ES' },
    { value: 'GO', label: 'GO' },
    { value: 'MA', label: 'MA' },
    { value: 'MT', label: 'MT' },
    { value: 'MS', label: 'MS' },
    { value: 'MG', label: 'MG' },
    { value: 'PA', label: 'PA' },
    { value: 'PB', label: 'PB' },
    { value: 'PR', label: 'PR' },
    { value: 'PE', label: 'PE' },
    { value: 'PI', label: 'PI' },
    { value: 'RJ', label: 'RJ' },
    { value: 'RN', label: 'RN' },
    { value: 'RS', label: 'RS' },
    { value: 'RO', label: 'RO' },
    { value: 'RR', label: 'RR' },
    { value: 'SC', label: 'SC' },
    { value: 'SP', label: 'SP' },
    { value: 'SE', label: 'SE' },
    { value: 'TO', label: 'TO' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui iria a lógica para salvar os dados do cliente
    alert('Cliente cadastrado com sucesso!');
    navigate('/clientes');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Cadastro Completo de Cliente</h1>
          <Button 
            variant="secondary"
            onClick={() => navigate('/clientes')}
          >
            Voltar
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Seção: Campos Principais */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Informações Principais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input 
                  label="Nome" 
                  placeholder="Digite o nome completo" 
                  required 
                />
              </div>
              <div>
                <InputMask 
                  label="Telefone" 
                  placeholder="(00) 00000-0000" 
                  mask="(##) #####-####" 
                />
              </div>
              <div>
                <Input 
                  label="E-mail" 
                  type="email" 
                  placeholder="email@exemplo.com" 
                />
              </div>
              <div>
                <Select 
                  label="Origem da captação" 
                  required 
                  options={origemOptions} 
                />
              </div>
              <div>
                <Select 
                  label="Categoria" 
                  required 
                  options={categoriaOptions} 
                />
              </div>
            </div>
          </div>

          {/* Seção: Tipo de Pessoa */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Tipo de Pessoa</h2>
            <div className="mb-4">
              <RadioGroup 
                label="Tipo de Pessoa"
                name="tipoPessoa"
                options={[
                  { value: 'fisica', label: 'Pessoa Física' },
                  { value: 'juridica', label: 'Pessoa Jurídica' },
                ]}
                value={tipoPessoa}
                onChange={(value) => setTipoPessoa(value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tipoPessoa === 'fisica' ? (
                <>
                  <div>
                    <InputMask 
                      label="CPF" 
                      placeholder="000.000.000-00" 
                      mask="###.###.###-##" 
                    />
                  </div>
                  <div>
                    <InputMask 
                      label="RG" 
                      placeholder="00.000.000-0" 
                      mask="##.###.###-#"
                    />
                  </div>
                  <div>
                    <InputMask 
                      label="Data de Nascimento" 
                      placeholder="00/00/0000" 
                      mask="##/##/####" 
                    />
                  </div>
                  <div>
                    <Input 
                      label="Profissão" 
                      placeholder="Digite a profissão" 
                    />
                  </div>
                  <div>
                    <Select 
                      label="Estado Civil" 
                      options={estadoCivilOptions} 
                    />
                  </div>
                  <div>
                    <InputMask 
                      label="Renda Mensal" 
                      placeholder="R$ 0,00" 
                      mask="R$ #.###.###,##" 
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <InputMask 
                      label="CNPJ" 
                      placeholder="00.000.000/0000-00" 
                      mask="##.###.###/####-##" 
                    />
                  </div>
                  <div>
                    <Input 
                      label="Razão Social" 
                      placeholder="Digite a razão social" 
                    />
                  </div>
                  <div>
                    <Input 
                      label="Nome Fantasia" 
                      placeholder="Digite o nome fantasia" 
                    />
                  </div>
                  <div>
                    <InputMask 
                      label="Inscrição Estadual" 
                      placeholder="000.000.000.000" 
                      mask="###.###.###.###"
                    />
                  </div>
                  <div>
                    <InputMask 
                      label="Data de Fundação" 
                      placeholder="00/00/0000" 
                      mask="##/##/####" 
                    />
                  </div>
                  <div>
                    <Input 
                      label="Ramo de Atividade" 
                      placeholder="Digite o ramo de atividade" 
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Seção: Endereço */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Endereço</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <InputMask 
                  label="CEP" 
                  placeholder="00000-000" 
                  mask="#####-###" 
                />
              </div>
              <div>
                <Input 
                  label="País" 
                  placeholder="Brasil" 
                  defaultValue="Brasil"
                />
              </div>
              <div>
                <Select 
                  label="UF" 
                  options={ufOptions} 
                />
              </div>
              <div>
                <Input 
                  label="Cidade" 
                  placeholder="Digite a cidade" 
                />
              </div>
              <div>
                <Input 
                  label="Bairro" 
                  placeholder="Digite o bairro" 
                />
              </div>
              <div>
                <Input 
                  label="Rua" 
                  placeholder="Digite a rua" 
                />
              </div>
              <div>
                <Input 
                  label="Número" 
                  placeholder="Digite o número" 
                />
              </div>
              <div>
                <Input 
                  label="Complemento" 
                  placeholder="Apto, bloco, etc." 
                />
              </div>
            </div>
          </div>

          {/* Seção: Observações */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Observações</h2>
            <TextArea 
              label="Observações" 
              placeholder="Digite observações relevantes sobre este cliente..." 
              rows={4}
            />
          </div>

          {/* Seção: Telefones Adicionais */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Telefones Adicionais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <InputMask 
                  label="Telefone Comercial" 
                  placeholder="(00) 0000-0000" 
                  mask="(##) ####-####" 
                />
              </div>
              <div>
                <InputMask 
                  label="Telefone Residencial" 
                  placeholder="(00) 0000-0000" 
                  mask="(##) ####-####" 
                />
              </div>
            </div>
          </div>

          {/* Seção: Pessoas Relacionadas */}
          <div className="pb-6">
            <h2 className="text-xl font-semibold mb-4">Pessoas Relacionadas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input 
                  label="Nome do Cônjuge/Sócio" 
                  placeholder="Digite o nome completo" 
                />
              </div>
              <div>
                <InputMask 
                  label="Telefone" 
                  placeholder="(00) 00000-0000" 
                  mask="(##) #####-####" 
                />
              </div>
              <div>
                <Input 
                  label="E-mail" 
                  type="email" 
                  placeholder="email@exemplo.com" 
                />
              </div>
              <div>
                <InputMask 
                  label="CPF/CNPJ" 
                  placeholder="000.000.000-00" 
                  mask="###.###.###-##"
                />
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-4">
            <Button 
              variant="secondary" 
              type="button"
              onClick={() => navigate('/clientes')}
            >
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              type="submit"
            >
              Cadastrar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClienteCadastroCompleto;
