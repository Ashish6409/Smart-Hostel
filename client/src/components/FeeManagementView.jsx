import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  CheckCircle, 
  AlertCircle, 
  Receipt, 
  Download, 
  Clock,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';

export default function FeeManagementView({ currentUser }) {
  const [invoices, setInvoices] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const isAdminOrWarden = currentUser?.role === 'ADMIN' || currentUser?.role === 'WARDEN';

  useEffect(() => {
    fetchInvoices();
    if (isAdminOrWarden) {
      fetchAnalytics();
    }
  }, [currentUser]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const url = isAdminOrWarden ? '/fees/all' : '/fees/my-invoices';
      const res = await api.get(url);
      setInvoices(res.data.invoices || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/fees/analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePay = async (invoiceId) => {
    setPayingId(invoiceId);
    try {
      const res = await api.post(`/fees/pay/${invoiceId}`, {
        paymentMethod: 'UPI / NetBanking'
      });
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
      alert(`Payment successful! Transaction ID: ${res.data.transactionId}`);
      fetchInvoices();
      if (isAdminOrWarden) fetchAnalytics();
    } catch (err) {
      alert(err.response?.data?.error || 'Payment failed');
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center space-x-2 text-violet-400 font-semibold text-xs uppercase tracking-wider">
          <CreditCard className="w-4 h-4" />
          <span>Pillar 6 • Automated Invoicing & Financial Reconciliation</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white mt-1">Smart Fee Management</h1>
        <p className="text-xs text-slate-400">
          Automated due calculations, dynamic late fine computation, instant payment settlement, and collection metrics.
        </p>
      </div>

      {/* Admin Financial Analytics Bar */}
      {isAdminOrWarden && analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Billed</span>
            <p className="text-2xl font-extrabold text-white mt-2">₹{analytics.totalBilled?.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">Hostel & Mess Invoices</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Collected Revenue</span>
            <p className="text-2xl font-extrabold text-emerald-400 mt-2">₹{analytics.totalCollected?.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">{analytics.paidCount} settled invoices</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Outstanding Overdue</span>
            <p className="text-2xl font-extrabold text-rose-400 mt-2">₹{analytics.totalOverdue?.toLocaleString()}</p>
            <p className="text-xs text-rose-300/80 mt-1">{analytics.overdueCount} overdue students</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Collection Rate</span>
            <p className="text-2xl font-extrabold text-indigo-400 mt-2">{analytics.collectionRate}%</p>
            <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${analytics.collectionRate}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Invoices List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">
              {isAdminOrWarden ? 'Hostel Campus Invoices' : 'My Fee Invoices & Receipts'}
            </h2>
            <p className="text-xs text-slate-400">Itemized billing breakdown for hostel residence</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">{invoices.length} invoices</span>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-400 text-xs">Loading fee records...</div>
        ) : invoices.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/60 border border-slate-800 rounded-xl text-slate-400 text-xs">
            No invoices found.
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      {inv.invoiceNumber}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                      {inv.term}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      inv.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      inv.status === 'OVERDUE' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {inv.status}
                    </span>
                  </div>

                  {inv.user && (
                    <p className="text-xs text-slate-300 mt-1 font-medium">
                      Student: {inv.user.name} ({inv.user.rollNumber}) • Room {inv.user.roomNumber || 'Hostel'}
                    </p>
                  )}

                  {/* Breakdown line */}
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
                    <span>Rent: ₹{inv.baseRent?.toLocaleString()}</span>
                    <span>•</span>
                    <span>Mess: ₹{inv.messFee?.toLocaleString()}</span>
                    <span>•</span>
                    <span>Amenities: ₹{inv.amenitiesFee?.toLocaleString()}</span>
                    {inv.lateFine > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-rose-400 font-bold">Late Fine: +₹{inv.lateFine?.toLocaleString()}</span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Due Date: {new Date(inv.dueDate).toLocaleDateString()}
                    {inv.paidAt && ` • Settled on: ${new Date(inv.paidAt).toLocaleDateString()}`}
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-800 gap-2 shrink-0">
                  <div className="text-left md:text-right">
                    <span className="text-xs text-slate-400">Total Payable</span>
                    <p className="text-xl font-black text-white">
                      ₹{(inv.totalPayable || inv.totalAmount)?.toLocaleString()}
                    </p>
                  </div>

                  {inv.status !== 'PAID' ? (
                    <button
                      onClick={() => handlePay(inv.id)}
                      disabled={payingId === inv.id}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{payingId === inv.id ? 'Processing...' : 'Pay Online Now'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedReceipt(inv)}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold rounded-lg border border-slate-700 transition-all flex items-center space-x-1.5"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>View Receipt</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Digital Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-white text-base">Hostel Fee Receipt</h3>
              </div>
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt No:</span>
                <span className="text-white font-bold">{selectedReceipt.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="text-indigo-400 font-bold">{selectedReceipt.transactionId || 'TXN-HOSTEL-001'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Term:</span>
                <span>{selectedReceipt.term}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Date:</span>
                <span>{new Date(selectedReceipt.paidAt || Date.now()).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Method:</span>
                <span>{selectedReceipt.paymentMethod || 'UPI Online'}</span>
              </div>

              <div className="border-t border-slate-800 pt-3 space-y-1">
                <div className="flex justify-between">
                  <span>Room Base Rent:</span>
                  <span>₹{selectedReceipt.baseRent?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mess Advance Fee:</span>
                  <span>₹{selectedReceipt.messFee?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amenities & Maintenance:</span>
                  <span>₹{selectedReceipt.amenitiesFee?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2 text-sm font-bold text-emerald-400">
                  <span>Amount Paid:</span>
                  <span>₹{selectedReceipt.totalAmount?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedReceipt(null)}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
