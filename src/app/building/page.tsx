
import { BuildingFlow } from '@/components/BuildingFlow';

export default function BuildingPage() {
    return (
        <main className="min-h-screen bg-background text-foreground selection:bg-black selection:text-white">
            <BuildingFlow />
        </main>
    );
}
