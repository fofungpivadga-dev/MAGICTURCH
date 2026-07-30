import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
}

export default function BackButton({ to, label, className = '' }: BackButtonProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => (to ? navigate(to) : navigate(-1))}
      className={`flex items-center gap-2 text-sm text-text-muted hover:text-text transition-colors focus-ring ${className}`}
    >
      <FaArrowLeft size={14} /> {label}
    </button>
  );
}
