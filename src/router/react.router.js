import { Router } from 'express';
import ReactDOMServer from 'react-dom/server';
import ProductList from '../frontend/src/components/ProductList';

const reactRoutes = () => {
  const router = Router();

  router.get('/react-route', (req, res) => {
    const reactComponent = ReactDOMServer.renderToString(<ProductList />);
    res.render('YourReactComponent', { reactComponent, /* Otros datos para la vista React */ });
  });

  return router;
};

export default reactRoutes;


