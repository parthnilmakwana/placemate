import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Shared Button Component for PlaceMate
 * Enforces the "Quiet Confidence" design system button hierarchy.
 *
 * @param {string} variant - 'primary', 'secondary', 'ghost', 'danger'
 * @param {string} size - 'sm', 'md', 'lg'
 * @param {boolean} fullWidth - If true, button takes full width
 * @param {string} as - Element to render ('button', 'a', Link, etc.)
 * @param {string} to - Routing link (used if to is provided, defaults as to Link)
 * @param {string} href - External link (used if href is provided, defaults as to 'a')
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  as,
  to,
  href,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed rounded-md cursor-pointer';

  const variantStyles = {
    primary: 'bg-brand-primary hover:bg-brand-hover text-white',
    secondary: 'bg-surface-primary hover:bg-surface-elevated border border-border-strong text-text-main',
    ghost: 'bg-transparent hover:bg-white/5 text-text-secondary hover:text-text-main border border-transparent',
    danger: 'bg-status-error hover:opacity-80 text-white',
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  const classes = `${baseStyles} ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.md} ${widthStyle} ${className}`.trim();

  let Component = as || 'button';
  if (!as && to) {
    Component = Link;
  } else if (!as && href) {
    Component = 'a';
  }

  // Ensure button gets a type default to avoid form submission bugs
  const elementProps = Component === 'button' ? { type: props.type || 'button', ...props } : props;

  return (
    <Component className={classes} to={to} href={href} {...elementProps}>
      {children}
    </Component>
  );
}
