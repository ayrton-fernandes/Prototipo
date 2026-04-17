import { Card, Typography } from '@uigovpe/components';

const GeneralPage = () => {

  return (
    <>
      <section className="mb-6">
        <Typography variant="h1" className="mb-2 cpo-page-title">
          Página Inicial
        </Typography>

        <Typography variant="p" className="cpo-page-subtitle">
          Bem-vindo ao sistema
        </Typography>
      </section>

      <Card title="Início" elevation='low'>
        <Typography variant="p">
          Esta é a página inicial do sistema.
        </Typography>
      </Card>
    </>
  );
};

export default GeneralPage;
