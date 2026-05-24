import React from 'react';

export default function Modal({ onClose, children, style = {} }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={style}>
        {children}
      </div>
    </div>
  );
}
