// src/components/Button.jsx
import React from 'react';
import styles from '../styles/Button.module.css';

const Button = ({ children, variant = 'primary', ...props }) => {
  return (
    <button className={`${styles.btn} ${styles[variant]}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
