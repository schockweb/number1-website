"use client";

import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { inspirationItems, InspirationItem } from '@/lib/inspirationData';

interface InspirationGalleryProps {
    onSelect: (item: InspirationItem) => void;
}

export function InspirationGallery({ onSelect }: InspirationGalleryProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const handleSelect = (item: InspirationItem) => {
        setSelectedId(item.id);
        onSelect(item);
    };

    return (
        <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inspirationItems.map((item) => (
                    <Card
                        key={item.id}
                        depth={selectedId === item.id ? 'deep' : 'soft'}
                        className={`cursor-pointer border-2 transition-colors ${selectedId === item.id ? 'border-black bg-neutral-50' : 'border-transparent hover:border-neutral-200'}`}
                        onClick={() => handleSelect(item)}
                    >
                        <div className="h-40 bg-neutral-100 mb-4 rounded-md flex items-center justify-center text-neutral-400 font-mono text-xs">
                            Preview: {item.title}
                        </div>
                        <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                        <p className="text-sm text-neutral-600 mb-4">{item.description}</p>
                        <div className="flex flex-wrap gap-2">
                            {item.features.map((feature, idx) => (
                                <span key={idx} className="text-xs bg-neutral-100 px-2 py-1 rounded-full font-medium">
                                    {feature}
                                </span>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
