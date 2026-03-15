
import React from 'react';

export function Hero() {
    return (
        <section className="w-full min-h-screen flex flex-col items-center justify-center bg-background border-b border-neutral-100">
            <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                    Hero Section
                </h1>
                <p className="mx-auto max-w-[700px] text-neutral-500 md:text-xl">
                    This is a blank canvas for your next big idea.
                </p>
            </div>
        </section>
    );
}
