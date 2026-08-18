import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type CategoryKey = "road_damage" | "garbage_overflow" | "water_leakage" | "street_light" | "drainage" | "other";

interface ClassificationResult {
  category: CategoryKey;
  confidence: number;
  priority: "high" | "medium" | "low";
}

const CATEGORY_KEYWORDS: Record<CategoryKey, string[]> = {
  road_damage: ["road", "pothole", "street", "crack", "asphalt", "pavement", "damage", "broken road"],
  garbage_overflow: ["garbage", "trash", "waste", "bin", "litter", "overflow", "rubbish", "dump"],
  water_leakage: ["water", "leak", "pipe", "tank", "drain", "tap", "sewage", "flood"],
  street_light: ["light", "lamp", "street light", "pole", "dark", "broken light"],
  drainage: ["drain", "drainage", "sewer", "culvert", "channel", "clog", "block"],
  other: [],
};

const CATEGORY_PRIORITY: Record<CategoryKey, "high" | "medium" | "low"> = {
  road_damage: "high",
  water_leakage: "high",
  drainage: "medium",
  garbage_overflow: "medium",
  street_light: "low",
  other: "low",
};

function classifyByFilename(filename: string): ClassificationResult {
  const lower = filename.toLowerCase();
  let bestCategory: CategoryKey = "other";
  let bestScore = 0;

  (Object.keys(CATEGORY_KEYWORDS) as CategoryKey[]).forEach((key) => {
    const keywords = CATEGORY_KEYWORDS[key];
    const score = keywords.filter((kw) => lower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestCategory = key;
    }
  });

  const confidence = bestScore > 0 ? Math.min(0.55 + bestScore * 0.12, 0.95) : 0.4;
  return {
    category: bestCategory,
    confidence: Number(confidence.toFixed(2)),
    priority: CATEGORY_PRIORITY[bestCategory],
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const filename: string = body?.filename ?? "";
    const userCategory: string | undefined = body?.category;

    let result = classifyByFilename(filename);

    // If the user explicitly selected a category, blend it with the AI result:
    // trust the user's category mapping but keep AI confidence influence.
    if (userCategory && userCategory !== "other") {
      const key = userCategory as CategoryKey;
      result = {
        category: key,
        confidence: Math.max(result.confidence, 0.75),
        priority: CATEGORY_PRIORITY[key] ?? "medium",
      };
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Classification failed";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
