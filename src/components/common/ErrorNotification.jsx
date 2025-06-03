import React, { useState, useEffect } from 'react';
import { Alert, Snackbar, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

/**
 * A reusable error notification component that displays error messages to users
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the notification is visible
 * @param {string} props.message - The error message to display
 * @param {Function} props.onClose - Function to call when closing the notification
 * @param {string} props.severity - The severity level (error, warning, info, success)
 * @param {number} props.duration - How long to show the notification in milliseconds
 */
const ErrorNotification = ({ 
  open, 
  message, 
  onClose, 
  severity = 'error',
  duration = 5000 
}) => {
  const [isOpen, setIsOpen] = useState(open);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  };

  return (
    <Snackbar
      open={isOpen}
      autoHideDuration={duration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        severity={severity}
        variant="filled"
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default ErrorNotification;
