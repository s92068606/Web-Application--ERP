import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

export default function PrintOrderPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!id) return;
    API.get(`/orders/${id}`).then((res) => setOrder(res.data)).catch(() => setOrder(null));
  }, [id]);

  useEffect(() => {
    if (order) {
      setTimeout(() => window.print(), 300);
    }
  }, [order]);

  if (!order) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-3xl rounded border border-slate-300 bg-white p-6">
          <div className="mb-4 text-center text-slate-700">Order not found</div>
          <div className="text-center"><Link to="/" className="rounded-frame-btn">Back</Link></div>
        </div>
      </div>
    );
  }

  return (
    <div className="print-page bg-white p-6">
      <div className="mx-auto max-w-4xl text-slate-900">
        <header className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">Sales Order</h2>
            <div className="text-sm">Order No: {order.orderNumber}</div>
          </div>
          <div className="text-right text-sm">
            <div>Invoice Date: {order.orderDate?.slice(0, 10)}</div>
            <div>Reference: {order.referenceNo}</div>
          </div>
        </header>

        <section className="mb-6 grid grid-cols-2 gap-6">
          <div>
            <div className="font-semibold">Bill To</div>
            <div>{order.customerName}</div>
            <div>{order.addressLine1}</div>
            {order.addressLine2 && <div>{order.addressLine2}</div>}
            <div>{order.suburb} {order.state} {order.postalCode}</div>
            <div>{order.country}</div>
          </div>
          <div>
            <div className="font-semibold">Notes</div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{order.notes}</div>
          </div>
        </section>

        <table className="mb-6 min-w-full border-collapse print-table">
          <thead>
            <tr>
              <th className="border px-2 py-1 text-left">Item Code</th>
              <th className="border px-2 py-1 text-left">Description</th>
              <th className="border px-2 py-1 text-right">Qty</th>
              <th className="border px-2 py-1 text-right">Price</th>
              <th className="border px-2 py-1 text-right">Excl</th>
              <th className="border px-2 py-1 text-right">Tax</th>
              <th className="border px-2 py-1 text-right">Incl</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((line, idx) => (
              <tr key={idx}>
                <td className="border px-2 py-1">{line.itemCode}</td>
                <td className="border px-2 py-1">{line.itemDescription}</td>
                <td className="border px-2 py-1 text-right">{line.quantity}</td>
                <td className="border px-2 py-1 text-right">{Number(line.unitPrice).toFixed(2)}</td>
                <td className="border px-2 py-1 text-right">{Number(line.exclAmount).toFixed(2)}</td>
                <td className="border px-2 py-1 text-right">{Number(line.taxAmount).toFixed(2)}</td>
                <td className="border px-2 py-1 text-right">{Number(line.inclAmount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-64">
            <div className="flex justify-between"><span>Total Excl</span><span>{Number(order.totalExclAmount).toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Total Tax</span><span>{Number(order.totalTaxAmount).toFixed(2)}</span></div>
            <div className="flex justify-between font-semibold"><span>Total Incl</span><span>{Number(order.totalInclAmount).toFixed(2)}</span></div>
          </div>
        </div>

        <div className="no-print mt-6">
          <button onClick={() => window.print()} className="rounded-frame-btn">Print</button>
          <Link to="/" className="ml-3 rounded-frame-btn">Close</Link>
        </div>
      </div>
    </div>
  );
}
