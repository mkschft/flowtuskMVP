import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { personas, valuePropData } = await request.json();

    if (!personas || !Array.isArray(personas) || personas.length === 0) {
      return NextResponse.json(
        { error: "Personas array is required" },
        { status: 400 }
      );
    }

    // Generate LinkedIn posts for each persona
    const linkedInPosts = personas.map((persona: { id: string; personaName: string; personaRole: string; personaCompany: string; painPoints: string[]; title: string; description: string }) => {
      const valueProp = valuePropData[persona.id]?.variations?.[0]?.text || '';
      
      return {
        personaId: persona.id,
        personaName: persona.personaName,
        post: `🎯 Introducing our ideal customer:

Meet ${persona.personaName}
${persona.personaRole} at ${persona.personaCompany}

Their biggest challenges:
${persona.painPoints.slice(0, 3).map((p: string) => `• ${p}`).join('\n')}

How we help:
${valueProp}

Are you a ${persona.personaRole}? Let's talk.

#positioning #b2b #saas #${persona.personaRole.toLowerCase().replace(/\s+/g, '')}`,
        
        alternativePost: `💡 Customer spotlight: ${persona.title}

${persona.description}

Key pain points we solve:
${persona.painPoints.slice(0, 3).map((p: string) => `✓ ${p}`).join('\n')}

Our approach:
${valueProp}

Know someone in ${persona.personaRole} role? Tag them below! 👇

#customerinsight #marketpositioning #b2bmarketing`
      };
    });

    // Generate combined post for all personas
    const combinedPost = `🎯 We've identified our 3 ideal customer profiles:

${personas.map((p: { personaName: string; personaRole: string; personaCompany: string }, idx: number) => `${idx + 1}. ${p.personaName} - ${p.personaRole} at ${p.personaCompany}`).join('\n')}

Each has unique challenges we're perfectly positioned to solve.

Want to see how we can help your business? Drop a comment or DM! 💬

#positioning #customerprofile #b2bsaas #startups`;

    return NextResponse.json({
      success: true,
      message: "LinkedIn posts generated successfully",
      posts: linkedInPosts,
      combinedPost,
      tips: [
        "Post during business hours (9 AM - 5 PM on weekdays)",
        "Tag relevant people or companies",
        "Add a relevant image or infographic",
        "Respond to comments within the first hour",
        "Consider posting as a carousel for better engagement"
      ]
    });

  } catch (error) {
    console.error("Error generating LinkedIn export:", error);
    return NextResponse.json(
      { error: "Failed to generate LinkedIn export" },
      { status: 500 }
    );
  }
}

