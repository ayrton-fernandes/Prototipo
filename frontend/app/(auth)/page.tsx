// page.tsx
'use client'
import { Card, Typography } from '@uigovpe/components';

const Home = () => {

  return (
    <>
      <section className="mb-6">
        <Typography variant="h1" className='mb-2'>
          Título da página
        </Typography>

        <Typography variant="p">
          Subtítulo
        </Typography>
      </section>

      <Card title="Titulo" elevation='low'>
        <Typography variant="p">
          Conteúdo
        </Typography>
      </Card>
    </>
  );
};

export default Home;