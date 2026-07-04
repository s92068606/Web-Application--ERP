import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Toast from '../Toast';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { clearError, fetchOrders } from '../redux/slices/ordersSlice';

export default function HomePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { orders, loading, error } = useAppSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  useEffect(() => {
    if (!error) return;
    const timer = window.setTimeout(() => dispatch(clearError()), 2500);
    return () => window.clearTimeout(timer);
  }, [dispatch, error]);

  const visibleRows = orders.length > 0 ? orders : Array.from({ length: 8 }, () => null);

  return (
    <div className="min-h-screen bg-slate-200 p-4 md:p-6">
      <Toast toast={error ? { visible: true, message: error, type: 'error', duration: 3000 } : null} onClose={() => dispatch(clearError())} />
      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-slate-400 bg-white shadow">
        <PageHeader
          title="Home"
          actions={<button onClick={() => navigate('/orders/new')} className="rounded border border-slate-700 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Add New</button>}
        />

        <div className="overflow-x-auto p-4">
          <div className="mb-3 text-sm text-slate-600">{loading ? 'Loading orders...' : `${orders.length} order(s) found`}</div>
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="border border-slate-300 px-3 py-3 text-left">Order No</th>
                <th className="border border-slate-300 px-3 py-3 text-left">Customer</th>
                <th className="border border-slate-300 px-3 py-3 text-left">Invoice Date</th>
                <th className="border border-slate-300 px-3 py-3 text-left">Reference</th>
                <th className="border border-slate-300 px-3 py-3 text-left">Items</th>
                <th className="border border-slate-300 px-3 py-3 text-left">Total Excl</th>
                <th className="border border-slate-300 px-3 py-3 text-left">Total Incl</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((order, index) => (
                <tr key={index} className="border-slate-200 hover:bg-slate-50">
                  <td className="border border-slate-300 px-3 py-3">{order?.orderNumber || ''}</td>
                  <td className="border border-slate-300 px-3 py-3">{order?.customerName || ''}</td>
                  <td className="border border-slate-300 px-3 py-3">{order?.orderDate?.slice(0, 10) || ''}</td>
                  <td className="border border-slate-300 px-3 py-3">{order?.referenceNo || ''}</td>
                  <td className="border border-slate-300 px-3 py-3">{order?.items?.length ?? ''}</td>
                  <td className="border border-slate-300 px-3 py-3">{order ? Number(order.totalExclAmount || 0).toFixed(2) : ''}</td>
                  <td className="border border-slate-300 px-3 py-3">{order ? Number(order.totalInclAmount || 0).toFixed(2) : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
