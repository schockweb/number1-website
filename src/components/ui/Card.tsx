import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    depth?: 'soft' | 'deep' | 'none';
    className?: string;
}

export function Card({ children, depth = 'soft', className = '', ...props }: CardProps) {
    const depthClass = depth === 'soft' ? 'depth-soft' : depth === 'deep' ? 'depth-deep' : '';

    return (
        <div
            className={`bg-white rounded-none p-6 transition-all duration-300 hover:scale-[1.01] ${depthClass} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}
