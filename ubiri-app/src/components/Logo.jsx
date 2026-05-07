export default function Logo({ className = "w-8 h-8", variant = "green" }) {
  const isGreen = variant === "green";
  
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background rectangle (optional for icon mode) */}
      <rect width="100" height="100" rx="24" fill={isGreen ? "#059669" : "white"} /> 
      
      {/* The stylized "U" */}
      <path 
        d="M30 30 V60 C30 71 39 80 50 80 C61 80 70 71 70 60 V30" 
        stroke={isGreen ? "white" : "#059669"} 
        strokeWidth="8" 
        strokeLinecap="round" 
      />
      
      {/* Wrench Head (Left end) */}
      <rect x="22" y="20" width="16" height="12" rx="2" fill={isGreen ? "white" : "#059669"} />
      <rect x="26" y="22" width="8" height="8" rx="1" fill={isGreen ? "#059669" : "white"} />
      
      {/* Screwdriver Head (Right end) */}
      <path d="M64 20 H76 V28 H64 Z" fill={isGreen ? "white" : "#059669"} />
      <path d="M68 12 H72 V20 H68 Z" fill={isGreen ? "white" : "#059669"} />
    </svg>
  );
}
