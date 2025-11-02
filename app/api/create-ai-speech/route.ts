import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(req: NextRequest) {
    try {
        const { content, flowId, modelCode } = await req.json() as {
            content?: string;
            flowId?: string;
            modelCode?: string;
        };

        if (!content || !flowId || !modelCode) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }

        // Use regular client to verify user and flow ownership
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }

        // Verify user owns the flow
        const { data: flow } = await supabase
            .from("flows")
            .select("id")
            .eq("id", flowId)
            .eq("author", user.id)
            .single();

        if (!flow) {
            return new Response(JSON.stringify({ error: "Flow not found or access denied" }), { status: 403 });
        }

        // Look up model by code
        const { data: model, error: modelError } = await supabase
            .from("models")
            .select("id")
            .eq("code", modelCode)
            .single();

        if (modelError || !model) {
            console.error("Model lookup error:", modelError);
            return new Response(JSON.stringify({
                error: "Model not found",
                details: modelError?.message || "Invalid model code"
            }), { status: 404 });
        }

        // Use service client to bypass RLS when inserting AI speech
        const serviceClient = createServiceClient();
        const { data: speech, error } = await serviceClient
            .from("speech")
            .insert({
                content,
                parent_flow: flowId,
                author: null,
                model_id: model.id,
                context: {},
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating AI speech:", error);
            return new Response(JSON.stringify({
                error: "Failed to create AI speech",
                details: error.message,
                code: error.code
            }), { status: 500 });
        }

        return new Response(JSON.stringify(speech), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (e) {
        console.error("create-ai-speech error", e);
        return new Response(JSON.stringify({
            error: "Internal server error",
            details: e instanceof Error ? e.message : String(e)
        }), { status: 500 });
    }
}

