'use client';

import { useState, useEffect } from 'react';
import PageTemplate, { TemplateCard, TemplateButton } from '@/components/PageTemplate';
import { 
  Users, 
  MessageSquare, 
  CheckSquare, 
  TrendingUp, 
  Calendar,
  Activity,
  Target,
  Zap
} from 'lucide-react';

interface DashboardStats {
  totalClients: number;
  newClients: number;
  totalMessages: number;
  completedTasks: number;
  revenue: number;
  growth: number;
}

interface RecentActivity {
  id: string;
  type: 'client' | 'message' | 'task';
  description: string;
  time: string;
  status: 'success' | 'pending' | 'info';
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    newClients: 0,
    totalMessages: 0,
    completedTasks: 0,
    revenue: 0,
    growth: 0
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setStats({
        totalClients: 147,
        newClients: 12,
        totalMessages: 89,
        completedTasks: 34,
        revenue: 45680,
        growth: 12.5
      });

      setRecentActivity([
        {
          id: '1',
          type: 'client',
          description: 'Novo cliente cadastrado: Maria Silva',
          time: '2 min atrás',
          status: 'success'
        },
        {
          id: '2',
          type: 'message',
          description: 'Mensagem enviada para João Santos',
          time: '5 min atrás',
          status: 'info'
        },
        {
          id: '3',
          type: 'task',
          description: 'Follow-up com cliente pendente',
          time: '10 min atrás',
          status: 'pending'
        },
        {
          id: '4',
          type: 'client',
          description: 'Reunião agendada com Carlos Lima',
          time: '15 min atrás',
          status: 'success'
        }
      ]);

      setIsLoading(false);
    }, 1500);
  }, []);

  const statsCards = [
    {
      title: 'Total de Clientes',
      value: stats.totalClients,
      change: `+${stats.newClients} este mês`,
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Mensagens Enviadas',
      value: stats.totalMessages,
      change: '+23% este mês',
      icon: MessageSquare,
      color: 'green'
    },
    {
      title: 'Tarefas Concluídas',
      value: stats.completedTasks,
      change: '89% de conclusão',
      icon: CheckSquare,
      color: 'purple'
    },
    {
      title: 'Receita Total',
      value: `R$ ${stats.revenue.toLocaleString()}`,
      change: `+${stats.growth}% este mês`,
      icon: TrendingUp,
      color: 'orange'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'client': return Users;
      case 'message': return MessageSquare;
      case 'task': return CheckSquare;
      default: return Activity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <PageTemplate
        title="Dashboard"
        subtitle="Bem-vindo ao ClientPulse"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <TemplateCard key={i} className="animate-pulse">
              <div className="h-20 bg-gray-200 rounded"></div>
            </TemplateCard>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TemplateCard className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </TemplateCard>
          <TemplateCard className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </TemplateCard>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Dashboard"
      subtitle="Visão geral do seu negócio"
      action={
        <TemplateButton variant="primary" size="sm">
          <Calendar className="w-4 h-4 mr-2" />
          Agendar Reunião
        </TemplateButton>
      }
    >
      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <TemplateCard key={index} className="card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {card.value}
                  </p>
                  <p className="text-xs text-green-600 font-medium">
                    {card.change}
                  </p>
                </div>
                <div className={`p-3 rounded-lg bg-${card.color}-100`}>
                  <IconComponent className={`w-6 h-6 text-${card.color}-600`} />
                </div>
              </div>
            </TemplateCard>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Atividade Recente */}
        <TemplateCard>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Atividade Recente
            </h3>
            <TemplateButton variant="outline" size="sm">
              Ver Todas
            </TemplateButton>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => {
              const IconComponent = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <IconComponent className="w-4 h-4 text-gray-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                  <div className={`flex-shrink-0 ${getStatusColor(activity.status)}`}>
                    <div className="w-2 h-2 rounded-full bg-current"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </TemplateCard>

        {/* Metas e Objetivos */}
        <TemplateCard>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Metas do Mês
            </h3>
            <Target className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Novos Clientes
                </span>
                <span className="text-sm text-gray-500">12/15</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: '80%' }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Receita Mensal
                </span>
                <span className="text-sm text-gray-500">R$ 45.680 / R$ 50.000</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: '91%' }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Follow-ups Realizados
                </span>
                <span className="text-sm text-gray-500">34/40</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: '85%' }}
                ></div>
              </div>
            </div>
          </div>
        </TemplateCard>
      </div>

      {/* Ações Rápidas */}
      <TemplateCard>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Ações Rápidas
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <TemplateButton variant="outline" className="flex flex-col items-center p-6 h-auto">
            <Users className="w-8 h-8 mb-3 text-blue-600" />
            <span className="text-sm font-medium">Adicionar Cliente</span>
          </TemplateButton>
          
          <TemplateButton variant="outline" className="flex flex-col items-center p-6 h-auto">
            <MessageSquare className="w-8 h-8 mb-3 text-green-600" />
            <span className="text-sm font-medium">Enviar Mensagem</span>
          </TemplateButton>
          
          <TemplateButton variant="outline" className="flex flex-col items-center p-6 h-auto">
            <CheckSquare className="w-8 h-8 mb-3 text-purple-600" />
            <span className="text-sm font-medium">Criar Tarefa</span>
          </TemplateButton>
          
          <TemplateButton variant="outline" className="flex flex-col items-center p-6 h-auto">
            <Zap className="w-8 h-8 mb-3 text-orange-600" />
            <span className="text-sm font-medium">Automação</span>
          </TemplateButton>
        </div>
      </TemplateCard>
    </PageTemplate>
  );
}
