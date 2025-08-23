import React from 'react';
import './modal.css';

const CustomModal = ({ isOpen, onClose, title, children, confirmText, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content"  onClick={(e) => e.stopPropagation()}>
        {title && <h2 className="modal-title">{title}</h2>}
        <div className="modal-body">{children}</div>
        <div className="modal-footer">
          {onConfirm && (
            <button className="modal-btn confirm" onClick={onConfirm}>
              {confirmText || 'Confirmar'}
            </button>
          )}
          {onClose && (
            <button className="modal-btn cancel" onClick={onClose}>Fechar</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomModal;
