import React from 'react';
import { Card } from '../ui/Card';
import { BarChart3, TrendingUp, DollarSign, Calendar, Download, Filter } from 'lucide-react';
import { Button } from '../ui/Button';

export const Relatorios: React.FC = () => {
  return (
    <div className="space-y-section">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-title font-bold text-neutral-black">Relatórios</h1>
          <p className="text-neutral-gray-medium mt-1">Análises e métricas do seu negócio</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-gray-medium">Vendas do Mês</p>
              <p className="text-2xl font-bold text-neutral-black">R$ 2.4M</p>
              <p className="text-sm text-status-success">+18% vs mês anterior</p>
            </div>
            <div className="p-3 bg-status-success bg-opacity-10 rounded-default">
              <DollarSign className="w-6 h-6 text-status-success" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-gray-medium">Contratos Fechados</p>
              <p className="text-2xl font-bold text-neutral-black">47</p>
              <p className="text-sm text-status-success">+12% vs mês anterior</p>
            </div>
            <div className="p-3 bg-primary-orange bg-opacity-10 rounded-default">
              <BarChart3 className="w-6 h-6 text-primary-orange" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-gray-medium">Taxa de Conversão</p>
              <p className="text-2xl font-bold text-neutral-black">23.5%</p>
              <p className="text-sm text-status-success">+5% vs mês anterior</p>
            </div>
            <div className="p-3 bg-status-info bg-opacity-10 rounded-default">
              <TrendingUp className="w-6 h-6 text-status-info" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-gray-medium">Ticket Médio</p>
              <p className="text-2xl font-bold text-neutral-black">R$ 51K</p>
              <p className="text-sm text-status-success">+8% vs mês anterior</p>
            </div>
            <div className="p-3 bg-purple-500 bg-opacity-10 rounded-default">
              <Calendar className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-title font-semibold">Vendas por Período</h3>
            <select className="text-sm border border-neutral-gray rounded px-2 py-1">
              <option>Últimos 6 meses</option>
              <option>Último ano</option>
              <option>Últimos 2 anos</option>
            </select>
          </div>
          <div className="h-64 bg-gray-50 rounded-default flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-neutral-gray-medium mx-auto mb-2" />
              <p className="text-neutral-gray-medium">Gráfico de vendas por período</p>
              <p className="text-sm text-neutral-gray-medium">Integração com biblioteca de gráficos</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-title font-semibold">Tipos de Imóveis</h3>
            <select className="text-sm border border-neutral-gray rounded px-2 py-1">
              <option>Este mês</option>
              <option>Últimos 3 meses</option>
              <option>Este ano</option>
            </select>
          </div>
          <div className="h-64 bg-gray-50 rounded-default flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-neutral-gray-medium mx-auto mb-2" />
              <p className="text-neutral-gray-medium">Distribuição por tipo de imóvel</p>
              <p className="text-sm text-neutral-gray-medium">Gráfico de pizza ou barras</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-title font-semibold">Relatórios Detalhados</h3>
          <Button variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Exportar Todos
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border border-neutral-gray rounded-default hover:border-primary-orange transition-colors cursor-pointer">
            <div className="flex items-center mb-3">
              <BarChart3 className="w-5 h-5 text-primary-orange mr-2" />
              <h4 className="font-medium">Relatório de Vendas</h4>
            </div>
            <p className="text-sm text-neutral-gray-medium mb-3">
              Análise completa das vendas por período, vendedor e tipo de imóvel.
            </p>
            <Button size="sm" className="w-full">Gerar Relatório</Button>
          </div>

          <div className="p-4 border border-neutral-gray rounded-default hover:border-primary-orange transition-colors cursor-pointer">
            <div className="flex items-center mb-3">
              <TrendingUp className="w-5 h-5 text-status-success mr-2" />
              <h4 className="font-medium">Performance de Clientes</h4>
            </div>
            <p className="text-sm text-neutral-gray-medium mb-3">
              Métricas de conversão, tempo médio de fechamento e valor por cliente.
            </p>
            <Button size="sm" className="w-full">Gerar Relatório</Button>
          </div>

          <div className="p-4 border border-neutral-gray rounded-default hover:border-primary-orange transition-colors cursor-pointer">
            <div className="flex items-center mb-3">
              <DollarSign className="w-5 h-5 text-status-info mr-2" />
              <h4 className="font-medium">Análise Financeira</h4>
            </div>
            <p className="text-sm text-neutral-gray-medium mb-3">
              Receitas, comissões, custos operacionais e margem de lucro.
            </p>
            <Button size="sm" className="w-full">Gerar Relatório</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};