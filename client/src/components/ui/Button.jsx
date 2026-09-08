export default function Button({ className = '', variant = 'primary', type = 'button', ...props }) {
  const variants = {
    primary: 'bg-brand text-white hover:bg-[#4338ca] disabled:bg-[#aaa5f2]',
    secondary: 'border border-line bg-white text-ink hover:bg-canvas',
    ghost: 'text-muted hover:bg-canvas hover:text-ink',
  };
  return <button type={type} className={`inline-flex min-h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 disabled:cursor-not-allowed ${variants[variant]} ${className}`} {...props} />;
}
