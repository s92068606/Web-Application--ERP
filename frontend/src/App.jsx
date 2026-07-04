import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import OrderPage from './pages/OrderPage';
import PrintOrderPage from './pages/PrintOrderPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/orders/:id" element={<OrderPage />} />
      <Route path="/orders/print/:id" element={<PrintOrderPage />} />
    </Routes>
  );
}
