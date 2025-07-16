import React from 'react';

/**
 * PrimaryButton - A reusable primary action button component
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 * @param {boolean} [props.disabled=false] - Whether the button is disabled
 * @param {string} [props.style] - Additional inline styles
 */
export function PrimaryButton({ children, onClick, disabled = false, style = {} }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        background: '#7A54FF',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        padding: '12px 24px',
        fontSize: '16px',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.2s ease',
        ...style
      }}
      onMouseEnter={e => !disabled && (e.target.style.background = '#6A44E6')}
      onMouseLeave={e => !disabled && (e.target.style.background = '#7A54FF')}
    >
      {children}
    </button>
  );
}

/**
 * SecondaryButton - A reusable secondary action button component
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 * @param {boolean} [props.disabled=false] - Whether the button is disabled
 * @param {string} [props.style] - Additional inline styles
 */
export function SecondaryButton({ children, onClick, disabled = false, style = {} }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        background: 'transparent',
        color: '#7A54FF',
        border: '1px solid var(--Gradient-Border, #FDB3B3)',
        borderRadius: '4px',
        padding: '12px 24px',
        fontSize: '16px',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.2s ease',
        ...style
      }}
      onMouseEnter={e => !disabled && (e.target.style.background = '#f8f8f8')}
      onMouseLeave={e => !disabled && (e.target.style.background = 'transparent')}
    >
      {children}
    </button>
  );
}

/**
 * BottomSheet - A reusable bottom sheet modal component
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls whether the bottom sheet is visible
 * @param {Function} props.onClose - Callback function called when the sheet should close
 * @param {string} [props.title] - Optional title displayed in the header
 * @param {React.ReactNode} props.children - Content to display in the bottom sheet
 * @param {boolean} [props.showCloseButton=true] - Whether to show the close button
 * @param {number} [props.maxWidth=480] - Maximum width of the bottom sheet
 * @param {number} [props.minWidth=320] - Minimum width of the bottom sheet
 * @param {string} [props.padding='24px 24px 20px 24px'] - Padding for the content area
 * 
 * @example
 * <BottomSheet 
 *   isOpen={showSheet} 
 *   onClose={() => setShowSheet(false)}
 *   title="My Sheet"
 * >
 *   <div>Your content here</div>
 * </BottomSheet>
 */
export default function BottomSheet({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  showCloseButton = true,
  maxWidth = 480,
  minWidth = 320,
  padding = '24px 24px 20px 24px',
  style = {},
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.18)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 100,
          background: '#fff',
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          boxShadow: '0 -4px 32px 0 rgba(122,84,255,0.10)',
          padding,
          margin: '0 auto',
          maxWidth,
          minWidth,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          ...style,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header with title and close button */}
        {(title || showCloseButton) && (
          <div style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: title ? '16px' : '0',
            paddingBottom: title ? '16px' : '0',
            borderBottom: title ? '1px solid #f0f0f0' : 'none'
          }}>
            {title && (
              <h3 style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: 700,
                color: '#212121'
              }}>
                {title}
              </h3>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#757575',
                  padding: '4px',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={e => e.target.style.backgroundColor = '#f5f5f5'}
                onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
              >
                ×
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div style={{ width: '100%' }}>
          {children}
        </div>
      </div>
    </div>
  );
} 