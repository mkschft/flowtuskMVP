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

    const hostname = websiteUrl ? new URL(websiteUrl).hostname : 'Your Company';
    
    // Generate plain text format
    let plainText = `CUSTOMER POSITIONING REPORT
${hostname}
Generated: ${new Date().toLocaleDateString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;

    personas.forEach((persona: { id: string; title: string; personaName: string; personaRole: string; personaCompany: string; location: string; country: string; description: string; painPoints: string[]; goals: string[] }, idx: number) => {
      const valueProp = valuePropData[persona.id]?.variations?.[0]?.text || 'Not available';
      
      plainText += `
PERSONA ${idx + 1}: ${persona.title.toUpperCase()}

Profile:
  Name:     ${persona.personaName}
  Role:     ${persona.personaRole}
  Company:  ${persona.personaCompany}
  Location: ${persona.location}, ${persona.country}

Description:
  ${persona.description}

Pain Points:
${persona.painPoints.map((p: string, i: number) => `  ${i + 1}. ${p}`).join('\n')}

Goals:
${persona.goals.map((g: string, i: number) => `  ${i + 1}. ${g}`).join('\n')}

VALUE PROPOSITION:
  "${valueProp}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;
    });

    plainText += `
SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Personas: ${personas.length}

Quick Reference:
${personas.map((p: { personaName: string; personaRole: string }, idx: number) => `  ${idx + 1}. ${p.personaName} (${p.personaRole})`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

    return NextResponse.json({
      success: true,
      message: "Plain text export generated successfully",
      content: plainText,
      fileName: `positioning-${hostname.replace(/\./g, '-')}-${Date.now()}.txt`,
      characterCount: plainText.length,
      lineCount: plainText.split('\n').length
    });

  } catch (error) {
    console.error("Error generating plain text export:", error);
    return NextResponse.json(
      { error: "Failed to generate plain text export" },
      { status: 500 }
    );
  }
}

