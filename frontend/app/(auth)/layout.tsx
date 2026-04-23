// layout.tsx

'use client'

import {
  AdminSideBar, 
  AppLayout, 
  GovBar, 
  BreadCrumb, 
  AdminUserBar, 
  Icon, 
  MenuAction, 
  SidebarSectionProps,
  Loading
} from '@uigovpe/components';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { userService } from '@/services/userService';
import { mapUserMenusToSidebar } from '@/utils/navegation/mapUserMenusToSidebar';
import { UserMeResponse } from '@/domain/types/userMe';
import { usePage } from '@/context/page/page-context';
import { useAppDispatch } from '@/store/store';
import { setUserData, clearUser } from '@/store/slices/authReducer';
import { removeToken } from '@/services/utils/cookie';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { breadcrumb } = usePage();
  const [userData, setUserDataLocal] = useState<UserMeResponse | null>(null);
  const [sections, setSections] = useState<SidebarSectionProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await userService.getCurrentUser();
        setUserDataLocal(response.data);
        
        // Armazena os dados do usuário no Redux
        dispatch(setUserData({
          name: response.data.name,
          email: response.data.email,
          profiles: response.data.profiles,
          menus: response.data.menus,
        }));
        
        if (response.data?.menus) {
          const sidebarSections = mapUserMenusToSidebar(response.data.menus);
          setSections(sidebarSections);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [dispatch]);

  // Logo exibida no rodapé da barra lateral
  // const footerSidebarLogo = {
  //   src: '',
  //   alt: 'Logo GovPE',
  //   width: 179,
  //   height: 48,
  // }

  // Logo principal exibida na barra lateral
  const sidebarLogo = {
    src: '/logos/logo-secretaria.png',
    alt: 'Logo Polícia Civíl de Pernambuco',
    width: 80,
    height: 80,
  }

  // Ações do menu do usuário (avatar)
  const userMenuActions: MenuAction = [
    {
      label: 'Sair',
      icon: <Icon icon="logout" />,
      command: () => {
        // Limpa o token
        removeToken();
        // Limpa os dados do usuário no Redux
        dispatch(clearUser());
        // Redireciona para a tela de login
        router.push('/login');
      }
    },
  ];

  const user = {
    name: userData?.name || 'Carregando...',
    profile: userData?.profiles?.[0]?.descName || ''
  }

  return (
    <AppLayout>
      {/* Barra superior do Governo de PE */}
      <GovBar
        ui={{
          container: {
            className: 'bg-theme-default border-b border-gray-700',
          },
          fontSizeContainer: {
            className: 'bg-theme-primary text-theme-default',
          },
        }}
      />
      {loading ? (
        <div className="flex gap-2 justify-center items-center h-screen">
          <Loading />
          Carregando...
        </div>
      ) : (
      <AppLayout.MainLayout>
        {/* Barra lateral de navegação da área administrativa */}
        <AdminSideBar
          theme="primary"
          sections={sections}
          version="1.0.0"
          title="CPO Digital"
          footerSidebarLogo={undefined}
          logo={sidebarLogo}
          ui={{
            container: {
              className: 'bg-[#18181A]',
            },
          }}
        />

        <AppLayout.ContentSection>
          {/* Barra do usuário com breadcrumb e ações */}
          <AdminUserBar 
            user={user}
            menuActions={userMenuActions}
            breadcrumb={breadcrumb}
          />
          <AppLayout.MainContent>
            {/* Trilha de navegação (breadcrumb) */}
            <AppLayout.BreadCrumbSection>
              <BreadCrumb
                model={breadcrumb?.items}
                home={breadcrumb?.home}
              />
            </AppLayout.BreadCrumbSection>

            <AppLayout.PageContent>
              {children}
            </AppLayout.PageContent>
            
          </AppLayout.MainContent>
        </AppLayout.ContentSection>
      </AppLayout.MainLayout>
      )}
    </AppLayout>
  );
}