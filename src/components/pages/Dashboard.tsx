import React from 'react';
import { Card } from '../ui/Card';
import { Users, Building, FileText, TrendingUp, DollarSign, Calendar } from 'lucide-react';

const stats = [
  {
    title: 'Total de Clientes',
    value: '1,234',
    change: '+12%',
    changeType: 'positive' as const,
    icon: Users,
  },
  {
    title: 'Imóveis Ativos',
    value: '856',
    change: '+8%',
    changeType: 'positive' as const,
    icon: Building,
  },
  {
    title: 'Contratos Assinados',
    value: '342',
    change: '+15%',
    changeType: 'positive' as const,
    icon: FileText,
  },
  {
    title: 'Receita Mensal',
    value: 'R$ 125.430',
    change: '+23%',
    changeType: 'positive' as const,
    icon: DollarSign,
  },
];

const recentActivities = [
  {
    id: 1,
    type: 'cliente',
    message: 'Novo cliente cadastrado: Maria Santos',
    time: '2 horas atrás',
  },
  {
    id: 2,
    type: 'contrato',
    message: 'Contrato assinado para Apartamento Centro',
    time: '4 horas atrás',
  },
  {
    id: 3,
    type: 'imovel',
    message: 'Novo imóvel adicionado: Casa Jardim América',
    time: '6 horas atrás',
  },
  {
    id: 4,
    type: 'cliente',
    message: 'Cliente João Silva atualizou dados',
    time: '1 dia atrás',
  },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-section">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-title font-bold text-neutral-black">Dashboard</h1>
        <p className="text-neutral-gray-medium mt-1">Visão geral do seu negócio</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-gray-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-neutral-black mt-1">{stat.value}</p>
                  <p className={`text-sm mt-1 ${
                    stat.changeType === 'positive' ? 'text-status-success' : 'text-status-error'
                  }`}>
                    {stat.change} vs mês anterior
                  </p>
                </div>
                <div className="p-3 bg-primary-orange bg-opacity-10 rounded-default">
                  <Icon className="w-6 h-6 text-primary-orange" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts and Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart placeholder */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-title font-semibold">Vendas por Mês</h3>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-neutral-gray-medium" />
              <span className="text-sm text-neutral-gray-medium">Últimos 6 meses</span>
            </div>
          </div>
          <div className="h-64 bg-gray-50 rounded-default flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-neutral-gray-medium mx-auto mb-2" />
              <p className="text-neutral-gray-medium">Gráfico de vendas</p>
              <p className="text-sm text-neutral-gray-medium">Em desenvolvimento</p>
            </div>
          </div>
        </Card>

        {/* Recent Activities */}
        <Card>
          <h3 className="text-lg font-title font-semibold mb-4">Atividades Recentes</h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary-orange rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-neutral-black">{activity.message}</p>
                  <p className="text-xs text-neutral-gray-medium mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};