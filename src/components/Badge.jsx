export default function Badge({ children, variant = 'default', size = 'md' }) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'danger': return 'bg-red-100 text-red-800 border-red-200';
      case 'primary': return 'bg-primary-100 text-primary-800 border-primary-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'text-xs px-2 py-0.5';
      case 'lg': return 'text-sm px-3 py-1';
      default: return 'text-xs px-2.5 py-1';
    }
  };

  return (
    <span className={`inline-flex items-center justify-center font-medium border rounded-full ${getVariantClasses()} ${getSizeClasses()}`}>
      {children}
    </span>
  );
}
