'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import {
  CreditCard,
  Check,
  X,
  Eye,
  RefreshCw,
  Calendar,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

interface Payment {
  id: number;
  orderId: number;
  amount: number;
  method: string;
  status: string;
  description?: string;
  transactionReference?: string;
  processedAt?: string;
  createdAt: string;
  order: {
    id: number;
    orderNumber: string;
    company?: {
      id: number;
      name: string;
    };
    courier?: {
      id: number;
      fullName: string;
    };
  };
}

interface PaymentStats {
  summary: {
    totalPayments: number;
    pendingPayments: number;
    completedPayments: number;
    failedPayments: number;
    totalAmount: number;
    pendingAmount: number;
    completedAmount: number;
    refundedAmount: number;
    totalCommission: number;
  };
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [transactionRef, setTransactionRef] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPayments();
    fetchStatistics();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const [allPayments, pending] = await Promise.all([
        apiClient.get('/admin/payments?limit=50'),
        apiClient.get('/admin/payments/pending'),
      ]);
      setPayments(allPayments.data.data);
      setPendingPayments(pending.data);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await apiClient.get('/admin/payments/statistics');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const handleApprove = (payment: Payment) => {
    setSelectedPayment(payment);
    setActionType('approve');
    setShowModal(true);
  };

  const handleReject = (payment: Payment) => {
    setSelectedPayment(payment);
    setActionType('reject');
    setShowModal(true);
  };

  const confirmAction = async () => {
    if (!selectedPayment || !actionType) return;

    try {
      if (actionType === 'approve') {
        await apiClient.put(`/admin/payments/${selectedPayment.id}/approve`, {
          transactionReference: transactionRef,
        });
      } else {
        await apiClient.put(`/admin/payments/${selectedPayment.id}/reject`, {
          reason: rejectionReason,
        });
      }

      setShowModal(false);
      setSelectedPayment(null);
      setTransactionRef('');
      setRejectionReason('');
      fetchPayments();
      fetchStatistics();
    } catch (error) {
      console.error('Action failed:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-purple-100 text-purple-800',
    }[status] || 'bg-gray-100 text-gray-800';

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses}`}>
        {status}
      </span>
    );
  };

  const getMethodIcon = (method: string) => {
    const icons = {
      CASH: '💵',
      CREDIT_CARD: '💳',
      BANK_TRANSFER: '🏦',
      WALLET: '👛',
    };
    return icons[method] || '💰';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const displayPayments = activeTab === 'pending' ? pendingPayments : payments;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ödeme Yönetimi</h1>
          <p className="text-gray-600">Ödemeleri inceleyin ve onaylayın</p>
        </div>
        
        <button
          onClick={() => {
            fetchPayments();
            fetchStatistics();
          }}
          className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Yenile
        </button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam Ödeme</p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(stats.summary.totalAmount)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.summary.totalPayments} işlem
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bekleyen</p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(stats.summary.pendingAmount)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.summary.pendingPayments} işlem
                </p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50 text-yellow-600">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tamamlanan</p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(stats.summary.completedAmount)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.summary.completedPayments} işlem
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 text-green-600">
                <Check className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Komisyon</p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(stats.summary.totalCommission)}
                </p>
                <p className="text-xs text-gray-500 mt-1">%15 oran</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-2 px-6 text-sm font-medium ${
                activeTab === 'pending'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Onay Bekleyen ({pendingPayments.length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`py-2 px-6 text-sm font-medium ${
                activeTab === 'all'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Tüm Ödemeler
            </button>
          </nav>
        </div>

        {/* Payments Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sipariş
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Firma
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kurye
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tutar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Yöntem
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayPayments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      #{payment.order.orderNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {payment.order.company?.name || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {payment.order.courier?.fullName || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(payment.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <span className="mr-2">{getMethodIcon(payment.method)}</span>
                      {payment.method}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(payment.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(payment.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {payment.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApprove(payment)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleReject(payment)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => {
                          setSelectedPayment(payment);
                          // View details implementation
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && selectedPayment && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {actionType === 'approve' ? 'Ödemeyi Onayla' : 'Ödemeyi Reddet'}
            </h3>

            <div className="mb-4 space-y-2">
              <p className="text-sm text-gray-500">
                <strong>Sipariş:</strong> #{selectedPayment.order.orderNumber}
              </p>
              <p className="text-sm text-gray-500">
                <strong>Tutar:</strong> {formatCurrency(selectedPayment.amount)}
              </p>
              <p className="text-sm text-gray-500">
                <strong>Yöntem:</strong> {selectedPayment.method}
              </p>
            </div>

            {actionType === 'approve' ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İşlem Referans No (Opsiyonel)
                </label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Banka transfer no, makbuz no vb."
                />
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Red Nedeni
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Red nedenini yazın..."
                  required
                />
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedPayment(null);
                  setTransactionRef('');
                  setRejectionReason('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={confirmAction}
                disabled={actionType === 'reject' && !rejectionReason}
                className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                  actionType === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {actionType === 'approve' ? 'Onayla' : 'Reddet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}