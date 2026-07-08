const VARIANTS = {
  primary: 'bg-primary text-white hover:bg-indigo-700 shadow',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  danger: 'bg-red-50 text-red-600 hover:bg-red-100',
  ghost: 'text-gray-500 hover:text-gray-800 hover:bg-gray-100',
};

const Button = ({ variant = 'primary', className = '', children, isLoading = false, disabled, ...props }) => {
  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {isLoading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
};

export default Button;
