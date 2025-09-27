import React from 'react';

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
};

const popupStyle = {
  backgroundColor: 'rgba(18, 18, 18, 0.95)',
  borderRadius: '12px',
  padding: '24px 32px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  minWidth: '280px',
};

const spinnerStyle = {
  width: '40px',
  height: '40px',
  border: '3px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '50%',
  borderTopColor: '#e91e63',
  animation: 'spin 1s linear infinite',
};

const messageStyle = {
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: 500,
  margin: 0,
  textAlign: 'center',
};

const SignInOutPopup = ({ show, message }) => {
  if (!show) return null;

  return (
    <div style={overlayStyle}>
      <style>
        {`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
      <div style={popupStyle}>
        <div style={spinnerStyle} />
        <p style={messageStyle}>{message}</p>
      </div>
    </div>
  );
};

export default SignInOutPopup;