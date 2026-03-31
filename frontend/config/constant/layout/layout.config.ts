// README - Configurações do Sistema
// Este arquivo contém as configurações estáticas do sistema. As configurações estão organizadas 
// em várias seções, incluindo as configurações da Sidebar, Footer, Usuário, Tema e Versão do sistema.

// Sumário de Configurações:
// 1. Sidebar: Configurações da barra lateral, incluindo seções e itens de navegação.
// 2. Footer: Configurações do rodapé, incluindo logo e menu de informações.
// 3. Tema: Configurações de tema da sidebar, como alteração de logo com base no tema.
// 4. Usuário: Dados do usuário autenticado, como nome e perfil.
// 5. Versão: Informação sobre a versão atual do sistema.

export interface SidebarSection {
  id: string;
  title: string;
  icon?: string;
  link?: string;
  items?: SidebarItem[]; // Itens da barra lateral podem ser agrupados por seções
}

export interface SidebarItem {
  id: string;
  label: string;
  link: string;
  icon?: string;
  disabled?: boolean; // Indica se o item está desabilitado
  subItems?: SidebarItem[]; // Itens secundários (sub-níveis) dentro de um item
}

export interface Logo {
  src: string;
  width: number;
  height: number;
  alt: string;
  title: string; // Título da logo
}

export interface FooterMenuItem {
  label: string;
  link: string;
}

export interface User {
  name: string;
  profile: string; // Define o perfil do usuário (ex: admin)
}

// ------------------------
// 1. Configurações da Sidebar
// ------------------------

// A sidebar contém seções que agrupam itens de navegação. Cada seção pode ter ícones e links para páginas.
export const sidebarData = {
  sections: [
    {
      id: "section1",
      title: "Gestão",
      icon: "business",
      items: [
        {
          id: "dashboard",
          label: "Painel de Controle",
          link: "/dashboard",
        },
        {
          id: "farmacia",
          label: "Farmácia",
          link: "/farmacia",
        },
        {
          id: "patologias",
          label: "Patologias",
          link: "/patologias"
        },
        {
          id: "usuarios",
          label: "Usuários",
          link: "/usuarios",
          disabled: true, // Desabilitado
        },
        {
          id: "programas",
          label: "Programas Sociais",
          link: "/programas",
          subItems: [
            { id: "auxilio", label: "Auxílio Pernambuco", link: "/programas/auxilio" },
            { id: "bolsa", label: "Bolsa Cidadã", link: "/programas/bolsa", disabled: true }, // Desabilitado
            { id: "vale", label: "Vale Alimentação", link: "/programas/vale" },
            { id: "renda1", label: "Renda PE", link: "/programas/renda" },
            { id: "digital", label: "Inclusão Digital", link: "/programas/digital", disabled: true }, // Desabilitado
            { id: "energia", label: "Energia para Todos", link: "/programas/energia" },
            { id: "saude", label: "Saúde na Comunidade", link: "/programas/saude" },
            { id: "educacao", label: "Educação PE", link: "/programas/educacao", disabled: true }, // Desabilitado
            { id: "moradia", label: "Minha Casa PE", link: "/programas/moradia" },
            { id: "transporte", label: "Passe Livre", link: "/programas/passe" },
            { id: "trabalho", label: "Trabalho e Renda", link: "/programas/trabalho", disabled: true }, // Desabilitado
            { id: "formacao", label: "Formação Técnica", link: "/programas/formacao" },
            { id: "juventude", label: "Juventude Presente", link: "/programas/juventude" },
            { id: "mulheres", label: "Proteção às Mulheres", link: "/programas/mulheres", disabled: true }, // Desabilitado
            { id: "idosos", label: "Atendimento ao Idoso", link: "/programas/idosos" },
            { id: "deficiencia", label: "Inclusão de PcD", link: "/programas/deficiencia" },
            { id: "saneamento", label: "Saneamento Básico", link: "/programas/saneamento", disabled: true }, // Desabilitado
            { id: "habitacao", label: "Habitação Popular", link: "/programas/habitacao" },
          ],
        },
        {
          id: "relatorios",
          label: "Relatórios",
          link: "/relatorios",
          notificationValue: 5 // Notificação indicando que há 5 relatórios pendentes
        },
        {
          id: "configuracoes",
          label: "Configurações",
          link: "/configuracoes",
        },
      ],
    },
    {
      id: "section2",
      title: "Administração",
      items: [
        {
          id: "institucional",
          label: "Dados Institucionais",
          link: "/institucional",
          icon: "business",
        },
        {
          id: "permissoes",
          label: "Permissões",
          link: "/permissoes",
          disabled: true, // Desabilitado
          icon: "lock"
        },
        {
          id: "responsaveis",
          label: "Responsáveis",
          link: "/responsaveis",
          icon: "person"
        },
        {
          id: "secretarias",
          label: "Secretarias",
          link: "/secretarias",
          icon: "apartment"
        },
        {
          id: "setores",
          label: "Setores",
          link: "/setores",
          icon: "account_tree"
        },
      ],
    },
    {
      id: "section3",
      title: "Ajuda e Suporte",
      link: "/ajuda-suporte", // Link para a página de ajuda e suporte
    },
    {
      id: "section4",
      title: "Login",
      link: "/login", // Link para a página de login
    },
  ],
};

// ------------------------
// 2. Configurações do Footer
// ------------------------

// O rodapé contém configurações como a logo e o menu de links úteis.
export const footerLogo: Logo = {
  src: '/logo.png',
  width: 187,
  height: 50,
  alt: 'Secretaria da Saúde. Governo de Pernambuco',
  title: 'Secretaria da Saúde. Governo de Pernambuco'
};

// ------------------------
// Configurações da Logo do Sidebar
// ------------------------

/**
 * Esta constante define as propriedades da imagem do logo que será exibida
 * no rodapé da barra lateral do sistema. As propriedades incluem:
 * - src: Caminho relativo para o arquivo de imagem do logo
 * - width: Largura da imagem em pixels
 * - height: Altura da imagem em pixels
 * - alt: Texto alternativo para acessibilidade
 * 
 * Esta imagem pode ser alterada dinamicamente com base no tema selecionado
 * através da função updateFooterSidebarLogo().
 */
export const footerSidebarLogo: Logo = {
  src: '/logo.png',
  width: 240,
  height: 96,
  alt: 'Secretaria da Saúde. Governo de Pernambuco',
  title: 'Secretaria da Saúde. Governo de Pernambuco'
};

export const logoPrograma: Logo = {
  src: "/logo.png",
  alt: "Farmácia Digital",
  title: "Farmácia Digital",
  width: 220,
  height: 110,
};

// ------------------------
// 3. Configurações do Tema
// ------------------------

/**
 * Define o tema da sidebar e altera a logo do rodapé conforme o tema escolhido.
 * Sidebar theme options ["theme-default", "theme-primary"]
 */
export type SidebarTheme = 'theme-default' | 'theme-primary';
export const SIDEBAR_THEME = 'theme-primary'; // Tema padrão da sidebar

/**
 * Função para alterar o src da logo da sidebar com base no tema
 */
// export function updateFooterSidebarLogo(theme: SidebarTheme) {
//   if (theme === 'theme-primary') {
//     footerSidebarLogo.src = '/logo-secretaria-white.png'; // Logo do tema primário
//   } else {
//     footerSidebarLogo.src = '/logo-secretaria.png'; // Logo padrão
//   }
// }

// Chamada da função passando o SIDEBAR_THEME
// updateFooterSidebarLogo(SIDEBAR_THEME);

export const footerMenu: FooterMenuItem[] = [
  {
    label: 'E-mail',
    link: '/teste' // Link para o e-mail (exemplo)
  },
  {
    label: 'Telefone',
    link: '/teste' // Link para o telefone (exemplo)
  },
  {
    label: 'Endereço',
    link: '/teste' // Link para o endereço (exemplo)
  },
  {
    label: 'Website',
    link: '/teste' // Link para o website (exemplo)
  },
];

// ------------------------
// 4. Configurações do usuário
// ------------------------
export const user: User = {
  name: 'José da Silva', // Nome do usuário autenticado
  profile: 'admin' // Perfil do usuário (admin)
}; 

// ------------------------
// 5. Configurações de Versão
// ------------------------

// Define a versão atual do sistema.
export const VERSION = '1.0.0'; // Versão do sistema
