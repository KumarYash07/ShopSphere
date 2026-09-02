import { useState, useEffect } from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import { cancelOrderApi } from '../../api/orderApi';
import { formatPrice } from '../../utils/helpers';

const PRESET_REASONS = [
  'Ordered by mistake / Changed my mind',
  'Found a better price elsewhere',
  'Incorrect shipping address or contact info',
  'Delivery time is too long',
  'Payment or billing issue',
  'Other reason',
];

export default function CancelOrderModal({ show, order, onClose, onSuccess }) {
  const [selectedReason, setSelectedReason] = useState(PRESET_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Reset form when order changes or modal opens
  useEffect(() => {
    if (show) {
      setSelectedReason(PRESET_REASONS[0]);
      setCustomReason('');
      setErrorMsg('');
      setSubmitting(false);
    }
  }, [show, order]);

  if (!show || !order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    let finalReason = selectedReason;
    if (selectedReason === 'Other reason') {
      if (!customReason.trim()) {
        setErrorMsg('Please enter a brief explanation for cancelling this order.');
        return;
      }
      finalReason = customReason.trim();
    } else if (customReason.trim()) {
      finalReason = `${selectedReason} - ${customReason.trim()}`;
    }

    setSubmitting(true);
    try {
      const targetId = order._id || order.id;
      const res = await cancelOrderApi(targetId, finalReason);
      if (res.success) {
        if (onSuccess) {
          const updated = {
            ...order,
            ...(res.order || {}),
            _id: targetId,
            id: targetId,
            orderStatus: res.order?.orderStatus || 'cancelled',
            paymentStatus: res.order?.paymentStatus || (order.paymentMethod !== 'cod' && order.paymentStatus === 'paid' ? 'refunded' : order.paymentStatus),
            cancelledAt: res.order?.cancelledAt || new Date(),
            cancellationReason: res.order?.cancellationReason || finalReason,
          };
          onSuccess(updated);
        }
        onClose();
      } else {
        setErrorMsg(res.message || 'Failed to cancel order.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'An error occurred while cancelling your order.';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', zIndex: 1070, backdropFilter: 'blur(3px)' }}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 520 }}>
        <div className="modal-content rounded-4 border-0 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="modal-header border-0 bg-danger-subtle px-4 pt-4 pb-3 align-items-start">
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle bg-danger text-white shadow-sm flex-shrink-0"
                style={{ width: 44, height: 44 }}
              >
                <FiAlertTriangle size={22} />
              </div>
              <div>
                <h5 className="modal-title fw-bold text-danger mb-1">Cancel Order</h5>
                <p className="text-secondary small mb-0">
                  Order #{order.orderNumber} · {formatPrice(order.totalAmount)}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close ms-auto"
              aria-label="Close"
              disabled={submitting}
              onClick={onClose}
            />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body px-4 py-3">
              {errorMsg && (
                <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3 d-flex align-items-center gap-2">
                  <FiAlertTriangle className="flex-shrink-0" />
                  <div>{errorMsg}</div>
                </div>
              )}

              {/* Order quick overview */}
              <div className="p-3 bg-light rounded-3 mb-3 border">
                <div className="d-flex justify-content-between align-items-center mb-1 small">
                  <span className="text-muted">Items count:</span>
                  <span className="fw-semibold text-dark">
                    {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center small">
                  <span className="text-muted">Current status:</span>
                  <span className={`badge ${order.orderStatus === 'shipped' ? 'bg-info text-dark' : 'bg-warning text-dark'} text-capitalize px-2 py-1`}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              {/* Warning message */}
              <p className="small text-muted mb-3">
                {order.orderStatus === 'shipped'
                  ? 'Your order has already been shipped. Confirming cancellation will alert the logistics partner to halt delivery and initiate return to origin.'
                  : 'Are you sure you want to cancel this order? Once cancelled, the fulfillment will stop immediately and this order cannot be undone.'}
              </p>

              {/* Reason Selector */}
              <div className="mb-3">
                <label className="form-label small fw-bold text-dark mb-2">
                  Reason for Cancellation <span className="text-danger">*</span>
                </label>
                <div className="d-flex flex-column gap-2">
                  {PRESET_REASONS.map((reason) => (
                    <label
                      key={reason}
                      className={`form-check d-flex align-items-center p-2 rounded-3 border cursor-pointer transition-all ${
                        selectedReason === reason ? 'border-danger bg-danger-subtle text-danger' : 'border-light-subtle bg-white text-dark'
                      }`}
                      style={{ cursor: 'pointer' }}
                    >
                      <input
                        type="radio"
                        name="cancelReason"
                        className="form-check-input me-2 mt-0"
                        checked={selectedReason === reason}
                        onChange={() => setSelectedReason(reason)}
                        disabled={submitting}
                      />
                      <span className="small fw-medium">{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Optional or Additional Details textarea */}
              <div className="mb-2">
                <label className="form-label small fw-semibold text-secondary mb-1">
                  {selectedReason === 'Other reason' ? 'Please specify reason *' : 'Additional comments (optional)'}
                </label>
                <textarea
                  className="form-control form-control-sm rounded-3"
                  rows="2"
                  placeholder={
                    selectedReason === 'Other reason'
                      ? 'Tell us why you need to cancel this order...'
                      : 'Provide any additional context...'
                  }
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  disabled={submitting}
                  required={selectedReason === 'Other reason'}
                  maxLength={300}
                />
                <div className="text-end text-muted mt-1" style={{ fontSize: 11 }}>
                  {customReason.length}/300
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="modal-footer border-top px-4 py-3 bg-light d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary rounded-pill px-4 btn-sm fw-semibold"
                disabled={submitting}
                onClick={onClose}
              >
                Keep Order
              </button>
              <button
                type="submit"
                className="btn btn-danger rounded-pill px-4 btn-sm fw-bold d-inline-flex align-items-center gap-2"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    Cancelling...
                  </>
                ) : (
                  'Confirm Cancellation'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
