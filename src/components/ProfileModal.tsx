'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Mail, Phone, MapPin, Calendar, Edit3, Save, Camera } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { TemplateButton } from './PageTemplate';
import Image from 'next/image';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  location: string;
  bio: string;
  avatar?: string;
  joinDate: string;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    location: '',
    bio: '',
    joinDate: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: '',
        company: 'ClientPulse',
        position: 'Usuário',
        location: '',
        bio: 'Bem-vindo ao ClientPulse! Gerencie seus clientes com inteligência artificial.',
        joinDate: new Date().toISOString()
      });
    }
  }, [user]);

  const handleSave = () => {
    // TODO: Implementar salvamento no backend
    console.log('Salvando perfil:', profile);
    setIsEditing(false);
    // Aqui você faria a chamada para a API para salvar os dados
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div 
      className="fixed inset-0" 
      style={{ zIndex: 999999 }}
    >
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
        style={{ zIndex: 999999 }}
      />
      <div 
        className="relative h-full overflow-y-auto"
        style={{ zIndex: 1000000 }}
      >
        <div className="min-h-full flex items-start sm:items-center justify-center p-4 sm:p-6">
          <div 
            className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-2xl my-8"
            onClick={(e) => e.stopPropagation()}
            style={{ zIndex: 1000001 }}
          >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
              {isEditing ? 'Editar Perfil' : 'Meu Perfil'}
            </h2>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            {!isEditing ? (
              <TemplateButton
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Editar
              </TemplateButton>
            ) : (
              <div className="flex space-x-2">
                <TemplateButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </TemplateButton>
                <TemplateButton
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </TemplateButton>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-xl">
                {profile.avatar ? (
                  <Image 
                    src={profile.avatar} 
                    alt="Avatar" 
                    width={96}
                    height={96}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(profile.name)
                )}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-1.5 sm:p-2 rounded-full shadow-lg transition-colors">
                  <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{profile.name}</h3>
              <p className="text-gray-600 dark:text-gray-300">{profile.position} • {profile.company}</p>
              <div className="flex items-center justify-center sm:justify-start text-sm text-gray-500 dark:text-gray-400 mt-1">
                <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                <span className="truncate">Membro desde {formatDate(profile.joinDate)}</span>
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Nome Completo
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">{profile.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">{profile.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Telefone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="(00) 00000-0000"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">{profile.phone || 'Não informado'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Localização
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Cidade, Estado"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">{profile.location || 'Não informado'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Empresa
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.company}
                  onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">{profile.company}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cargo
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.position}
                  onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">{profile.position}</p>
              )}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sobre
            </label>
            {isEditing ? (
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                placeholder="Conte um pouco sobre você..."
              />
            ) : (
              <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg min-h-[100px]">{profile.bio}</p>
            )}
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
