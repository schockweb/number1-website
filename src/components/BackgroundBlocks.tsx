import React from 'react';

export function BackgroundBlocks() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-50 bg-[#F7F7F5]">
            {/* Massive solid block 1 */}
            <div
                className="absolute top-0 right-0 w-[80vw] h-[95vh] bg-[#EBEBE8]"
                style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0 80%)' }}
            />

            {/* Massive solid block 2 */}
            <div
                className="absolute bottom-0 left-0 w-[70vw] h-[70vh] bg-[#DFDFDC]"
                style={{ clipPath: 'polygon(0 0, 100% 30%, 85% 100%, 0 100%)' }}
            />

            {/* Massive solid block 3 (Accent geometric shape) */}
            <div
                className="absolute top-[25vh] left-[20vw] w-[45vw] h-[55vh] bg-[#D4D4D1]"
                style={{ clipPath: 'polygon(20% 0, 95% 15%, 80% 100%, 0 85%)' }}
            />

            {/* Additional smaller balancing block */}
            <div
                className="absolute bottom-[10vh] right-[10vw] w-[30vw] h-[40vh] bg-[#C8C8C5]"
                style={{ clipPath: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)' }}
            />
        </div>
    );
}
