import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import PrintOrder from './PrintOrder';
import Toast from './Toast';
import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

const emptyLine = () => ({
  id: 0,
  itemId: null,
  itemCode: '',
  itemDescription: '',
  unitPrice: 0,
  quantity: 1,
  taxRate: 0,
  exclAmount: 0,
  taxAmount: 0,
  inclAmount: 0,
  note: '',
});

const emptyOrder = () => ({
  id: 0,
  orderNumber: `SO-${Date.now()}`,
  orderDate: new Date().toISOString().slice(0, 10),
  customerId: 0,
  customerName: '',
  addressLine1: '',
  addressLine2: '',
  addressLine3: '',
  suburb: '',
  state: '',
  postalCode: '',
  country: '',
  invoiceDate: new Date().toISOString().slice(0, 10),
  referenceNo: '',
  notes: '',
  totalExclAmount: 0,
  totalTaxAmount: 0,
  totalInclAmount: 0,
  items: [emptyLine()],
});

function HomePage() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success', duration: 3000 });

  useEffect(() => {
    API.get('/orders').then((res) => setOrders(res.data)).catch(() => setOrders([]));
  }, []);

  const visibleRows = orders.length > 0 ? orders : Array.from({ length: 8 }, () => null);

  return (
    <div className="min-h-screen bg-slate-200 p-6">
      <Toast toast={toast} onClose={() => setToast({ ...toast, visible: false })} />
      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-slate-400 bg-white shadow">
        <div className="flex items-center justify-between border-b border-slate-400 bg-slate-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-slate-700"></span>
            <span className="h-3 w-3 rounded-full bg-slate-700"></span>
            <span className="h-3 w-3 rounded-full bg-slate-700"></span>
          </div>
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-700">Home</div>
          <button onClick={() => navigate('/orders/new')} className="rounded border border-slate-700 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Add New</button>
        </div>

        <div className="overflow-x-auto p-4">
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
                  <td className="border border-slate-300 px-3 py-3">{order ? order.totalExclAmount.toFixed(2) : ''}</td>
                  <td className="border border-slate-300 px-3 py-3">{order ? order.totalInclAmount.toFixed(2) : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function OrderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(emptyOrder());
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success', duration: 3000 });
  const [clients, setClients] = useState([]);
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([API.get('/orders/clients'), API.get('/orders/items')]).then(([clientsRes, itemsRes]) => {
      setClients(clientsRes.data);
      setItems(itemsRes.data);
    });

    if (id && id !== 'new') {
      API.get(`/orders/${id}`).then((res) => {
        const existing = res.data;
        setOrder({
          ...existing,
          orderDate: existing.orderDate?.slice(0, 10) || new Date().toISOString().slice(0, 10),
          invoiceDate: existing.orderDate?.slice(0, 10) || new Date().toISOString().slice(0, 10),
          addressLine3: existing.addressLine2 || '',
          suburb: existing.city || '',
        });
      });
    }
  }, [id]);

  const updateLine = (index, field, value) => {
    const updatedLines = order.items.map((line, lineIndex) => {
      if (lineIndex !== index) return line;
      const next = { ...line, [field]: value };
      if (['quantity', 'taxRate', 'unitPrice'].includes(field)) {
        const qty = Number(next.quantity || 0);
        const price = Number(next.unitPrice || 0);
        const taxRate = Number(next.taxRate || 0);
        const excl = qty * price;
        const tax = excl * (taxRate / 100);
        const incl = excl + tax;
        next.exclAmount = excl;
        next.taxAmount = tax;
        next.inclAmount = incl;
      }
      return next;
    });

    const totalExcl = updatedLines.reduce((sum, l) => sum + Number(l.exclAmount || 0), 0);
    const totalTax = updatedLines.reduce((sum, l) => sum + Number(l.taxAmount || 0), 0);
    const totalIncl = updatedLines.reduce((sum, l) => sum + Number(l.inclAmount || 0), 0);

    setOrder({ ...order, items: updatedLines, totalExclAmount: totalExcl, totalTaxAmount: totalTax, totalInclAmount: totalIncl });
  };

  const addLine = () => {
    setOrder({ ...order, items: [...order.items, emptyLine()] });
  };

  const chooseItem = (index, itemCode) => {
    const selectedItem = items.find((item) => item.code === itemCode);
    if (!selectedItem) return;
    const updatedLines = order.items.map((line, lineIndex) => {
      if (lineIndex !== index) return line;
      return {
        ...line,
        itemId: selectedItem.id,
        itemCode: selectedItem.code,
        itemDescription: selectedItem.description,
        unitPrice: selectedItem.unitPrice,
      };
    });
    setOrder({ ...order, items: updatedLines });
    updateLine(index, 'unitPrice', selectedItem.unitPrice);
  };

  const handleCustomerChange = (customerId) => {
    const client = clients.find((item) => item.id === Number(customerId));
    if (!client) return;
    setOrder({
      ...order,
      customerId: client.id,
      customerName: client.name,
      addressLine1: client.addressLine1,
      addressLine2: client.addressLine2 || '',
      addressLine3: '',
      suburb: client.city,
      state: client.state,
      postalCode: client.postalCode,
      country: client.country,
    });
  };

  const saveOrder = async () => {
    setSaving(true);
    try {
      const payload = {
        ...order,
        orderDate: order.invoiceDate,
        items: order.items.map((line) => ({
          ...line,
          quantity: Number(line.quantity || 0),
          taxRate: Number(line.taxRate || 0),
          unitPrice: Number(line.unitPrice || 0),
          exclAmount: Number(line.exclAmount || 0),
          taxAmount: Number(line.taxAmount || 0),
          inclAmount: Number(line.inclAmount || 0),
        })),
      };
      await API.post('/orders', payload);
      setToast({ visible: true, message: 'Order saved successfully', type: 'success', duration: 2000 });
      setTimeout(() => navigate('/'), 900);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Error saving order';
      showError(msg);
    } finally {
      setSaving(false);
    }
  };

  const showError = (msg) => {
    setToast({ visible: true, message: msg || 'Error saving order', type: 'error', duration: 4000 });
  };

  const lineCount = Math.max(order.items.length, 8);
  const visibleLines = Array.from({ length: lineCount }, (_, index) => order.items[index] || emptyLine());

  return (
    <div className="min-h-screen bg-slate-200 p-6">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-slate-400 bg-white shadow">
        <div className="flex items-center justify-between border-b border-slate-400 bg-slate-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-slate-700"></span>
            <span className="h-3 w-3 rounded-full bg-slate-700"></span>
            <span className="h-3 w-3 rounded-full bg-slate-700"></span>
          </div>
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-700">Sales Order</div>
            <div className="flex items-center gap-2">
              <Link to="/" className="rounded border border-slate-700 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Home</Link>
              {order.id > 0 && (
                <Link to={`/orders/print/${order.id}`} className="rounded-frame-btn bg-white">Print</Link>
              )}
              <button onClick={saveOrder} disabled={saving} className="rounded-frame-btn bg-black text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2" aria-hidden>
                  <path d="M19 21H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                </svg>
                {saving ? 'Saving...' : 'Save Order'}
              </button>
            </div>
        </div>

        <div className="grid gap-4 border-b border-slate-200 p-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-2 rounded-2xl border border-slate-300 bg-slate-50 p-3">
            <label className="text-sm font-medium text-slate-700">Customer Name</label>
            <select value={order.customerId} onChange={(e) => handleCustomerChange(e.target.value)} className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm">
              <option value="0">Select customer</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>

            <div className="mt-2">
              <label className="text-sm font-medium text-slate-700">Address 1</label>
              <input value={order.addressLine1} onChange={(e) => setOrder({ ...order, addressLine1: e.target.value })} className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm" />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Address 2</label>
              <input value={order.addressLine2} onChange={(e) => setOrder({ ...order, addressLine2: e.target.value })} className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm" />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Address 3</label>
              <input value={order.addressLine3} onChange={(e) => setOrder({ ...order, addressLine3: e.target.value })} className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-sm font-medium text-slate-700">Suburb</label>
                <input value={order.suburb} onChange={(e) => setOrder({ ...order, suburb: e.target.value })} className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">State</label>
                <input value={order.state} onChange={(e) => setOrder({ ...order, state: e.target.value })} className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Post Code</label>
                <input value={order.postalCode} onChange={(e) => setOrder({ ...order, postalCode: e.target.value })} className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl border border-slate-300 bg-slate-50 p-3">
            <label className="text-sm font-medium text-slate-700">Invoice No.</label>
            <input value={order.orderNumber} onChange={(e) => setOrder({ ...order, orderNumber: e.target.value })} className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm" />

            <label className="text-sm font-medium text-slate-700">Invoice Date</label>
            <input type="date" value={order.invoiceDate} onChange={(e) => setOrder({ ...order, invoiceDate: e.target.value })} className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm" />

            <label className="text-sm font-medium text-slate-700">Reference no</label>
            <input value={order.referenceNo} onChange={(e) => setOrder({ ...order, referenceNo: e.target.value })} className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm" />

            <label className="text-sm font-medium text-slate-700">Note</label>
            <textarea value={order.notes} onChange={(e) => setOrder({ ...order, notes: e.target.value })} className="mt-1 min-h-[140px] w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm" />
          </div>
        </div>

        <div className="overflow-x-auto p-4">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr className="align-middle">
                <th className="border border-slate-300 px-2 py-1 text-left text-sm">Item Code</th>
                <th className="border border-slate-300 px-2 py-1 text-left text-sm">Description</th>
                <th className="border border-slate-300 px-2 py-1 text-left text-sm">Note</th>
                <th className="border border-slate-300 px-2 py-1 text-left text-sm">Quantity</th>
                <th className="border border-slate-300 px-2 py-1 text-left text-sm">Price</th>
                <th className="border border-slate-300 px-2 py-1 text-left text-sm">Tax</th>
                <th className="border border-slate-300 px-2 py-1 text-left text-sm">Excl Amount</th>
                <th className="border border-slate-300 px-2 py-1 text-left text-sm">Tax Amount</th>
                <th className="border border-slate-300 px-2 py-1 text-left text-sm">Incl Amount</th>
              </tr>
            </thead>
            <tbody>
              {visibleLines.map((line, index) => (
                <tr key={index} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="border border-slate-300 px-3 py-2">
                    <select value={line.itemCode} onChange={(e) => chooseItem(index, e.target.value)} className="w-full rounded border border-slate-300 px-2 py-2">
                      <option value="">Select item</option>
                      {items.map((item) => (
                        <option key={item.id} value={item.code}>{item.code}</option>
                      ))}
                    </select>
                  </td>
                  <td className="border border-slate-300 px-3 py-2">
                    <select value={line.itemDescription} onChange={(e) => { const item = items.find((entry) => entry.description === e.target.value); if (item) chooseItem(index, item.code); }} className="w-full rounded border border-slate-300 px-2 py-2">
                      <option value="">Select description</option>
                      {items.map((item) => (
                        <option key={item.id} value={item.description}>{item.description}</option>
                      ))}
                    </select>
                  </td>
                  <td className="border border-slate-300 px-3 py-2">
                    <input value={line.note} onChange={(e) => updateLine(index, 'note', e.target.value)} className="w-full rounded border border-slate-300 px-2 py-2" />
                  </td>
                  <td className="border border-slate-300 px-3 py-2">
                    <input type="number" value={line.quantity} min="1" onChange={(e) => updateLine(index, 'quantity', Number(e.target.value))} className="w-full rounded border border-slate-300 px-2 py-2" />
                  </td>
                  <td className="border border-slate-300 px-3 py-2">
                    <input type="number" value={line.unitPrice} min="0" onChange={(e) => updateLine(index, 'unitPrice', Number(e.target.value))} className="w-full rounded border border-slate-300 px-2 py-2" />
                  </td>
                  <td className="border border-slate-300 px-3 py-2">
                    <input type="number" value={line.taxRate} min="0" onChange={(e) => updateLine(index, 'taxRate', Number(e.target.value))} className="w-full rounded border border-slate-300 px-2 py-2" />
                  </td>
                  <td className="border border-slate-300 px-3 py-2">{line.exclAmount.toFixed(2)}</td>
                  <td className="border border-slate-300 px-3 py-2">{line.taxAmount.toFixed(2)}</td>
                  <td className="border border-slate-300 px-3 py-2">{line.inclAmount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-end p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-300 bg-slate-50 p-4">
            <div className="grid gap-3">
              <div className="flex justify-between text-sm text-slate-700"><span>Total Excl</span><span>{order.totalExclAmount.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm text-slate-700"><span>Total Tax</span><span>{order.totalTaxAmount.toFixed(2)}</span></div>
              <div className="flex justify-between text-base font-semibold text-slate-900"><span>Total Incl</span><span>{order.totalInclAmount.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/orders/:id" element={<OrderPage />} />
      <Route path="/orders/print/:id" element={<PrintOrder />} />
    </Routes>
  );
}
