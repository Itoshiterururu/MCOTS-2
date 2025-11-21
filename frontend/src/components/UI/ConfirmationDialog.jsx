import React from 'react';
import '../../styles/components/ConfirmationDialog.css';

/**
 * A reusable confirmation dialog component styled to match the military theme
 * @param {Object} props - Component props
 * @param {string} props.message - The confirmation message
 * @param {Function} props.onConfirm - Function to call when user confirms
 * @param {Function} props.onCancel - Function to call when user cancels
 * @param {string} [props.title='Confirm Action'] - Title for the dialog
 * @param {string} [props.confirmText='Confirm'] - Text for the confirm button
 * @param {string} [props.cancelText='Cancel'] - Text for the cancel button
 */
const ConfirmationDialog = ({ 
  message, 
  onConfirm, 
  onCancel,
  title = 'Confirm Action',
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}) => {
  // Handle click outside the dialog
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  // Prevent event propagation when clicking on dialog content
  const handleDialogClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="confirmation-dialog-backdrop" onClick={handleBackdropClick}>
      <div className="confirmation-dialog" onClick={handleDialogClick}>
        <div className="confirmation-dialog-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          {title}
        </div>
        <div className="confirmation-dialog-content">
          <p>{message}</p>
        </div>
        <div className="confirmation-dialog-actions">
          <button className="confirmation-dialog-button cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button className="confirmation-dialog-button confirm" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
