import { SIDEBAR_THEME } from "@/config/constant/layout/layout.config";
import { Inter } from "next/font/google";
import Providers from "@/app/providers";


const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "CPO Digital - Backoffice",
    description: "",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // Injeta variáveis de ambiente no window para acesso client-side
    const envScript = `
    window.__ENV = {
      NEXT_PUBLIC_API_URL: "${process.env.NEXT_PUBLIC_API_URL ?? ""}"
    };
  `;

    const script = `
    (function() {
      try {
        // Carrega o tamanho da fonte salva no localStorage
        const FONT_SCALES = [0.8, 0.9, 1, 1.1, 1.2];
        const index = parseInt(localStorage.getItem("fontSizeIndex"), 10);
        if (!isNaN(index) && FONT_SCALES[index]) {
          const scale = FONT_SCALES[index];
          document.documentElement.style.fontSize = 'calc(' + scale + ' * var(--root-font-size))';
        }

        // Aguarda carregamento da fonte Material Symbols
        document.fonts.load('400 24px "Material Symbols Outlined"').then(() => {
          document.documentElement.classList.add('fonts-loaded');
        });
        
      } catch (e) {
        console.error("Erro ao tentar configurar o layout:", e);
      }
    })();
  `;

    return (
        <html lang="pt-BR" suppressHydrationWarning className={`${SIDEBAR_THEME} dark`}>
            <head>
                <script dangerouslySetInnerHTML={{ __html: envScript }} />
                <script dangerouslySetInnerHTML={{ __html: script }} />
            </head>
            <body className={`${inter.className} antialiased`}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
