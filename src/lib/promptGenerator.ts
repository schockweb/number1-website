import { InspirationItem } from './inspirationData';
import { BuildingStageAnswers } from '@/components/ProjectFlow';

export function generatePrompt(inspiration: InspirationItem, answers: BuildingStageAnswers): string {
    return `
# Project Request: ${answers.industry} Website
**Aesthetic Style**: ${inspiration.title} (${inspiration.style})
**Vibe**: ${answers.vibe}
**Voice**: ${answers.voice}

## Design Direction
The user wants a website with a **${inspiration.title}** aesthetic.
- **Visuals**: ${inspiration.description}
- **Color Palette**: ${answers.colorPalette}
- **Key Features**: ${inspiration.features.join(', ')}

## Core Functionality
The primary purpose of the site is **${answers.features}**. 
Ensure the layout prioritizes this goal while maintaining the strict design principles of the chosen aesthetic.

## Tech Stack Requirements
- Framework: Next.js 14+ (App Router)
- Styling: Tailwind CSS
- Animation: Framer Motion (only if necessary for the vibe)

## Implementation Steps
1. **Setup**: Initialize project with clear folder structure.
2. **Design System**: Define colors and typography variables in \`globals.css\`.
3. **Core Components**: Build reusable components (Buttons, Cards, Layouts) matching the **${answers.vibe}** feel.
4. **Features**: Implement the **${answers.features}** logic.
5. **Content**: Use the **${answers.voice}** voice for all copy.

## Additional Notes
- Focus on depth and spacing.
- Ensure strict responsiveness.
- Make it feel "Premium" and "${answers.vibe}".
`.trim();
}
