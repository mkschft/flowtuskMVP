import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { personas, valuePropData, websiteUrl } = await request.json();

    if (!personas || !Array.isArray(personas) || personas.length === 0) {
      return NextResponse.json(
        { error: "Personas array is required" },
        { status: 400 }
      );
    }

    // For MVP, we'll generate a structured JSON export that can be manually converted to slides
    // Full Google Slides API integration would require OAuth and googleapis package
    
    const slidesData = {
      title: `Customer Positioning - ${new URL(websiteUrl).hostname}`,
      slides: [
        // Slide 1: Cover
        {
          type: 'cover',
          title: 'Customer Positioning',
          subtitle: `Generated for ${new URL(websiteUrl).hostname}`,
          date: new Date().toLocaleDateString()
        },
        // Slides 2-4: Each persona
        ...personas.map((persona: { id: string; personaName: string; personaRole: string; personaCompany: string; location: string; country: string; title: string; description: string; painPoints: string[]; goals: string[] }, idx: number) => ({
          type: 'persona',
          number: idx + 1,
          personaName: persona.personaName,
          personaRole: persona.personaRole,
          personaCompany: persona.personaCompany,
          location: `${persona.location}, ${persona.country}`,
          title: persona.title,
          description: persona.description,
          painPoints: persona.painPoints,
          goals: persona.goals,
          valueProp: valuePropData[persona.id]?.variations?.[0]?.text || 'Value proposition not available'
        })),
        // Slide 5: Summary
        {
          type: 'summary',
          title: 'Positioning Summary',
          personas: personas.map((p: { personaName: string; personaRole: string; personaCompany: string }) => ({
            name: p.personaName,
            role: p.personaRole,
            company: p.personaCompany
          }))
        }
      ]
    };


    // Create a template URL for Google Slides
    // In production, this would be a real template ID
    const templateUrl = "https://docs.google.com/presentation/d/1TEMPLATE_ID/edit?usp=sharing&template=true";
    
    return NextResponse.json({
      success: true,
      message: "Opening Google Slides template...",
      templateUrl: templateUrl,
      instructions: "Click the link to open a Google Slides template. Make a copy to customize it with your data.",
      data: slidesData,
      action: "open_template"
    });

  } catch (error) {
    console.error("Error generating Google Slides export:", error);
    return NextResponse.json(
      { error: "Failed to generate Google Slides export" },
      { status: 500 }
    );
  }
}

