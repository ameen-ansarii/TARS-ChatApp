export function Logo({ className = "", size = 24 }: { className?: string, size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 3" className="animate-[spin_10s_linear_infinite]" />
            <path d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="2.5" fill="currentColor" className="animate-pulse" />
            <path d="M12 2L12 4M12 20L12 22M2 12L4 12M20 12L22 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}
