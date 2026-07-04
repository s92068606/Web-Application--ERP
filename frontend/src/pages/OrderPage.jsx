import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FormField from '../components/FormField';
import PageHeader from '../components/PageHeader';
import Toast from '../Toast';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { clearCurrentOrder, clearError, createEmptyOrder, fetchClientsAndItems, fetchOrderById, setCurrentOrder, submitOrder } from '../redux/slices/ordersSlice';

export default function OrderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentOrder, clients, items, saving, loading, error } = useAppSelector((state) => state.orders);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success', duration: 3000 });

  useEffect(() => {
    dispatch(fetchClientsAndItems());
    if (id && id !== 'new') {
      dispatch(fetchOrderById(id));
    } else {
      dispatch(clearCurrentOrder());
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (!error) return;
    setToast({ visible: true, message: error, type: 'error', duration: 4000 });
  }, [error]);

  const order = useMemo(() => currentOrder || createEmptyOrder(), [currentOrder]);

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

    const totalExcl = updatedLines.reduce((sum, line) => sum + Number(line.exclAmount || 0), 0);
    const totalTax = updatedLines.reduce((sum, line) => sum + Number(line.taxAmount || 0), 0);
    const totalIncl = updatedLines.reduce((sum, line) => sum + Number(line.inclAmount || 0), 0);

    dispatch(setCurrentOrder({ ...order, items: updatedLines, totalExclAmount: totalExcl, totalTaxAmount: totalTax, totalInclAmount: totalIncl }));
  };

  const addLine = () => {
    dispatch(setCurrentOrder({ ...order, items: [...order.items, { ...createEmptyOrder().items[0] }] }));
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

    dispatch(setCurrentOrder({ ...order, items: updatedLines }));
    updateLine(index, 'unitPrice', selectedItem.unitPrice);
  };

  const handleCustomerChange = (customerId) => {
    const client = clients.find((item) => item.id === Number(customerId));
    if (!client) return;
    dispatch(setCurrentOrder({
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
    }));
  };

  const saveOrder = async () => {
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

    const resultAction = await dispatch(submitOrder(payload));
    if (submitOrder.fulfilled.match(resultAction)) {
      setToast({ visible: true, message: 'Order saved successfully', type: 'success', duration: 2000 });
      setTimeout(() => navigate('/'), 900);
    } else {
      setToast({ visible: true, message: resultAction.payload || 'Error saving order', type: 'error', duration: 4000 });
    }
  };

  const lineCount = Math.max(order.items.length, 8);
  const visibleLines = Array.from({ length: lineCount }, (_, index) => order.items[index] || { ...createEmptyOrder().items[0], id: index + 1 });

  return (
    <div className="min-h-screen bg-slate-200 p-4 md:p-6">
      <Toast toast={toast} onClose={() => setToast({ ...toast, visible: false })} />
      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-slate-400 bg-white shadow">
        <PageHeader
          title="Sales Order"
          actions={(
            <>
              <Link to="/" className="rounded border border-slate-700 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Home</Link>
              {order.id > 0 && <Link to={`/orders/print/${order.id}`} className="rounded border border-slate-700 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Print</Link>}
              <button onClick={saveOrder} disabled={saving} className="rounded border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">{saving ? 'Saving...' : 'Save Order'}</button>
            </>
          )}
        />

        <div className="grid gap-4 border-b border-slate-200 p-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-300 bg-slate-50 p-3">
            <FormField label="Customer Name">
              <select value={order.customerId} onChange={(e) => handleCustomerChange(e.target.value)} className="w-full rounded border border-slate-300 bg-white px-2 py-2 text-sm">
                <option value="0">Select customer</option>
                {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
              </select>
            </FormField>
            <FormField label="Address 1"><input value={order.addressLine1} onChange={(e) => dispatch(setCurrentOrder({ ...order, addressLine1: e.target.value }))} className="w-full rounded border border-slate-300 bg-white px-2 py-2 text-sm" /></FormField>
            <FormField label="Address 2"><input value={order.addressLine2} onChange={(e) => dispatch(setCurrentOrder({ ...order, addressLine2: e.target.value }))} className="w-full rounded border border-slate-300 bg-white px-2 py-2 text-sm" /></FormField>
            <FormField label="Address 3"><input value={order.addressLine3} onChange={(e) => dispatch(setCurrentOrder({ ...order, addressLine3: e.target.value }))} className="w-full rounded border border-slate-300 bg-white px-2 py-2 text-sm" /></FormField>
            <div className="grid gap-2 md:grid-cols-3">
              <FormField label="Suburb"><input value={order.suburb} onChange={(e) => dispatch(setCurrentOrder({ ...order, suburb: e.target.value }))} className="w-full rounded border border-slate-300 bg-white px-2 py-2 text-sm" /></FormField>
              <FormField label="State"><input value={order.state} onChange={(e) => dispatch(setCurrentOrder({ ...order, state: e.target.value }))} className="w-full rounded border border-slate-300 bg-white px-2 py-2 text-sm" /></FormField>
              <FormField label="Post Code"><input value={order.postalCode} onChange={(e) => dispatch(setCurrentOrder({ ...order, postalCode: e.target.value }))} className="w-full rounded border border-slate-300 bg-white px-2 py-2 text-sm" /></FormField>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-slate-300 bg-slate-50 p-3">
            <FormField label="Invoice No."><input value={order.orderNumber} onChange={(e) => dispatch(setCurrentOrder({ ...order, orderNumber: e.target.value }))} className="w-full rounded border border-slate-300 bg-white px-2 py-2 text-sm" /></FormField>
            <FormField label="Invoice Date"><input type="date" value={order.invoiceDate} onChange={(e) => dispatch(setCurrentOrder({ ...order, invoiceDate: e.target.value }))} className="w-full rounded border border-slate-300 bg-white px-2 py-2 text-sm" /></FormField>
            <FormField label="Reference no"><input value={order.referenceNo} onChange={(e) => dispatch(setCurrentOrder({ ...order, referenceNo: e.target.value }))} className="w-full rounded border border-slate-300 bg-white px-2 py-2 text-sm" /></FormField>
            <FormField label="Note"><textarea value={order.notes} onChange={(e) => dispatch(setCurrentOrder({ ...order, notes: e.target.value }))} className="min-h-[140px] w-full rounded border border-slate-300 bg-white px-2 py-2 text-sm" /></FormField>
          </div>
        </div>

        <div className="overflow-x-auto p-4">
          <div className="mb-3 flex items-center justify-between text-sm text-slate-600">
            <span>{loading ? 'Loading order form...' : 'Order lines'}</span>
            <button onClick={addLine} className="rounded border border-slate-700 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Add Line</button>
          </div>
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="border border-slate-300 px-2 py-2 text-left">Item Code</th>
                <th className="border border-slate-300 px-2 py-2 text-left">Description</th>
                <th className="border border-slate-300 px-2 py-2 text-left">Note</th>
                <th className="border border-slate-300 px-2 py-2 text-left">Quantity</th>
                <th className="border border-slate-300 px-2 py-2 text-left">Price</th>
                <th className="border border-slate-300 px-2 py-2 text-left">Tax</th>
                <th className="border border-slate-300 px-2 py-2 text-left">Excl Amount</th>
                <th className="border border-slate-300 px-2 py-2 text-left">Tax Amount</th>
                <th className="border border-slate-300 px-2 py-2 text-left">Incl Amount</th>
              </tr>
            </thead>
            <tbody>
              {visibleLines.map((line, index) => (
                <tr key={index} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="border border-slate-300 px-3 py-2">
                    <select value={line.itemCode} onChange={(e) => chooseItem(index, e.target.value)} className="w-full rounded border border-slate-300 px-2 py-2">
                      <option value="">Select item</option>
                      {items.map((item) => <option key={item.id} value={item.code}>{item.code}</option>)}
                    </select>
                  </td>
                  <td className="border border-slate-300 px-3 py-2">
                    <select value={line.itemDescription} onChange={(e) => { const item = items.find((entry) => entry.description === e.target.value); if (item) chooseItem(index, item.code); }} className="w-full rounded border border-slate-300 px-2 py-2">
                      <option value="">Select description</option>
                      {items.map((item) => <option key={item.id} value={item.description}>{item.description}</option>)}
                    </select>
                  </td>
                  <td className="border border-slate-300 px-3 py-2"><input value={line.note} onChange={(e) => updateLine(index, 'note', e.target.value)} className="w-full rounded border border-slate-300 px-2 py-2" /></td>
                  <td className="border border-slate-300 px-3 py-2"><input type="number" value={line.quantity} min="1" onChange={(e) => updateLine(index, 'quantity', Number(e.target.value))} className="w-full rounded border border-slate-300 px-2 py-2" /></td>
                  <td className="border border-slate-300 px-3 py-2"><input type="number" value={line.unitPrice} min="0" onChange={(e) => updateLine(index, 'unitPrice', Number(e.target.value))} className="w-full rounded border border-slate-300 px-2 py-2" /></td>
                  <td className="border border-slate-300 px-3 py-2"><input type="number" value={line.taxRate} min="0" onChange={(e) => updateLine(index, 'taxRate', Number(e.target.value))} className="w-full rounded border border-slate-300 px-2 py-2" /></td>
                  <td className="border border-slate-300 px-3 py-2">{Number(line.exclAmount || 0).toFixed(2)}</td>
                  <td className="border border-slate-300 px-3 py-2">{Number(line.taxAmount || 0).toFixed(2)}</td>
                  <td className="border border-slate-300 px-3 py-2">{Number(line.inclAmount || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-end p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-300 bg-slate-50 p-4">
            <div className="grid gap-3">
              <div className="flex justify-between text-sm text-slate-700"><span>Total Excl</span><span>{Number(order.totalExclAmount || 0).toFixed(2)}</span></div>
              <div className="flex justify-between text-sm text-slate-700"><span>Total Tax</span><span>{Number(order.totalTaxAmount || 0).toFixed(2)}</span></div>
              <div className="flex justify-between text-base font-semibold text-slate-900"><span>Total Incl</span><span>{Number(order.totalInclAmount || 0).toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
