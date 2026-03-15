import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
}

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    ...props
}: ButtonProps) {
    const baseStyles = "inline-flex items-center justify-center rounded-none font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-95";

    const variants = {
        primary: "bg-foreground text-background hover:bg-neutral-800 depth-soft hover:depth-deep",
        secondary: "bg-neutral-100 text-foreground hover:bg-neutral-200",
        outline: "border border-neutral-200 text-foreground hover:bg-neutral-50"
    };

    const sizes = {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-base",
        lg: "h-14 px-8 text-lg"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
