export default function LoadingSpinner({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3", 
    lg: "h-12 w-12 border-4"
  };

  return (
    <div 
      className={`animate-spin ${sizeClasses[size]} border-[#bc7a2e] border-t-transparent rounded-full ${className}`}  
    />
  );
}