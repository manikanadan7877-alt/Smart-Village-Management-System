import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface VillageData {
  population: number;
  waterTanks: { name: string; pct: number; current: number; capacity: number }[];
  garbageBins: { name: string; pct: number; current: number; capacity: number }[];
  complaints: { id: string; title: string; status: string; priority: string; category: string; location_label: string }[];
  pendingCount: number;
  resolvedCount: number;
  highPriorityCount: number;
  totalComplaints: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { messages, village } = await req.json();
    const lastUserMsg = [...messages].reverse().find((m: ChatMessage) => m.role === 'user');
    const query = (lastUserMsg?.content || '').toLowerCase().trim();

    // Fetch real data
    const [waterRes, garbageRes, complaintsRes] = await Promise.all([
      supabase.from('water_tanks').select('*'),
      supabase.from('garbage_bins').select('*'),
      supabase.from('complaints').select('id,title,status,priority,category,location_label').order('created_at', { ascending: false }),
    ]);

    const waterTanks = (waterRes.data || []).map((t: any) => ({
      name: t.name,
      pct: t.capacity_liters > 0 ? Math.round((t.current_level_liters / t.capacity_liters) * 100) : 0,
      current: t.current_level_liters,
      capacity: t.capacity_liters,
    }));
    const garbageBins = (garbageRes.data || []).map((b: any) => ({
      name: b.name,
      pct: b.capacity_liters > 0 ? Math.round((b.current_level_liters / b.capacity_liters) * 100) : 0,
      current: b.current_level_liters,
      capacity: b.capacity_liters,
    }));
    const complaints = (complaintsRes.data || []).map((c: any) => ({
      id: c.id, title: c.title, status: c.status, priority: c.priority,
      category: c.category, location_label: c.location_label,
    }));

    const pendingCount = complaints.filter((c: any) => c.status === 'pending').length;
    const resolvedCount = complaints.filter((c: any) => c.status === 'resolved').length;
    const highPriorityCount = complaints.filter((c: any) => c.priority === 'high' && c.status !== 'resolved').length;
    const lowWaterTanks = waterTanks.filter((t: any) => t.pct <= 30);
    const fullBins = garbageBins.filter((b: any) => b.pct >= 80);

    const data: VillageData = {
      population: 1248,
      waterTanks, garbageBins, complaints,
      pendingCount, resolvedCount, highPriorityCount, totalComplaints: complaints.length,
    };

    const villageName = village?.name || 'the village';

    // Detect language — user's latest message has highest priority
    const hasTamil = /[\u0b80-\u0bff]/.test(query);
    const hasTanglish = /\b(epdi|irukku|irukka|sollu|enna|eththani|engal|oor|veli|pani|thanneer|vilai|makal|pathi|konjam)\b/i.test(query) && !hasTamil;
    const isTamil = hasTamil;
    const isTanglish = hasTanglish;

    // Build response
    const { reply, module } = buildReply(query, data, { lowWaterTanks, fullBins, highPriorityCount }, isTamil, isTanglish, villageName);

    return new Response(
      JSON.stringify({ reply, module, data: { waterCount: waterTanks.length, avgWaterPct: Math.round(waterTanks.reduce((s: number, t: any) => s + t.pct, 0) / Math.max(waterTanks.length, 1)) } }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ reply: "AI Assistant is temporarily unavailable. Please try again.", module: null, error: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildReply(
  query: string,
  data: VillageData,
  alerts: { lowWaterTanks: any[]; fullBins: any[]; highPriorityCount: number },
  isTamil: boolean,
  isTanglish: boolean,
  villageName: string
): { reply: string; module: string | null } {
  const { waterTanks, garbageBins, complaints, population, pendingCount, resolvedCount, totalComplaints, highPriorityCount } = data;
  const { lowWaterTanks, fullBins, highPriorityCount: hpc } = alerts;

  const lowWater = lowWaterTanks.length > 0;
  const fullBin = fullBins.length > 0;
  const totalAlerts = lowWaterTanks.length + fullBins.length + hpc;

  // Water
  if (/\b(water|thaneer|தண்ணீ|tank|drop|jal)\b/i.test(query)) {
    const avgPct = Math.round(waterTanks.reduce((s, t) => s + t.pct, 0) / Math.max(waterTanks.length, 1));
    if (isTamil) {
      const lowList = lowWaterTanks.map((t) => `${t.name} (${t.pct}%)`).join(', ');
      return {
        reply: `கிராமத்தில் ${waterTanks.length} நீர்த்தேக்கங்கள் உள்ளன. சராசரி நீர் மட்டம் ${avgPct}%. ${lowWater ? `குறைந்த நீர் மட்டம்: ${lowList}. உடன் நடவடிக்கை தேவை.` : 'அனைத்து தேக்கங்களும் நல்ல நிலையில் உள்ளன.'}`,
        module: '/water-tanks',
      };
    }
    if (isTanglish) {
      const lowList = lowWaterTanks.map((t) => `${t.name} (${t.pct}%)`).join(', ');
      return {
        reply: `Oorla ${waterTanks.length} water tanks irukku. Average level ${avgPct}%. ${lowWater ? `Low water tanks: ${lowList}. Athigam prompt aaganum.` : 'Ellam tanks normal-ah irukku.'}`,
        module: '/water-tanks',
      };
    }
    const lowList = lowWaterTanks.map((t) => `${t.name} (${t.pct}%)`).join(', ');
    return {
      reply: `There are ${waterTanks.length} water tanks in the village. Average water level is ${avgPct}%. ${lowWater ? `Low water alert for: ${lowList}. Immediate action recommended.` : 'All tanks are at healthy levels.'}`,
      module: '/water-tanks',
    };
  }

  // Agriculture
  if (/\b(agriculture|crop|farm|soil|vivasayam|விவசா|paddy|cultivation|irrigation)\b/i.test(query)) {
    if (isTamil) return { reply: `வேளாண்மை நிலை நல்லது. 12 பண்ணைகள் செயல்பாட்டில் உள்ளன. மண் ஈரப்பதம் 68%, பயிர் ஆரோக்கியம் சிறப்பாக உள்ளது. பயிர் விளைச்சல்: அதிக விளைச்சல் எதிர்பார்க்கப்படுகிறது.`, module: '/agriculture' };
    if (isTanglish) return { reply: `Agriculture condition nalla irukku. 12 farms active-ah irukku. Soil moisture 68%, crop health good-ah irukku. Yield: high yield expected.`, module: '/agriculture' };
    return { reply: `Agriculture status is good. 12 farms are active. Soil moisture is at 68%, crop health is excellent across all zones. Expected yield: high. No pest alerts detected.`, module: '/agriculture' };
  }

  // Weather
  if (/\b(weather|temperature|climate|veli|வெப்ப|rain|mausam)\b/i.test(query)) {
    if (isTamil) return { reply: `தற்போதைய வானிலை: 28°C, பகுதி மேகமூட்டம். மழைப்பொழிவு: 12mm. காற்று தரம்: நல்லது.`, module: null };
    if (isTanglish) return { reply: `Current weather: 28°C, Partly Cloudy. Rainfall: 12mm. Air quality: Good.`, module: null };
    return { reply: `Current weather: 28°C, Partly Cloudy. Rainfall: 12mm recorded today. Air quality is good. No weather alerts active.`, module: null };
  }

  // Alerts / emergency
  if (/\b(alert|emergency|warning|danger|alert|அபாய|seithi)\b/i.test(query)) {
    if (totalAlerts === 0) {
      if (isTamil) return { reply: `எந்த அவசர அறிவிப்பும் இல்லை. கிராமம் பாதுகாப்பாக உள்ளது.`, module: null };
      if (isTanglish) return { reply: `Emergency alert ondrum illai. Village safe-ah irukku.`, module: null };
      return { reply: `No emergency alerts active. The village is safe.`, module: null };
    }
    const alertList: string[] = [];
    lowWaterTanks.forEach((t) => alertList.push(`Water low: ${t.name} (${t.pct}%)`));
    fullBins.forEach((b) => alertList.push(`Bin full: ${b.name} (${b.pct}%)`));
    if (hpc > 0) alertList.push(`${hpc} high-priority complaints`);
    if (isTamil) return { reply: `${totalAlerts} அவசர அறிவிப்புகள் உள்ளன: ${alertList.join(', ')}`, module: '/water-tanks' };
    if (isTanglish) return { reply: `${totalAlerts} alerts active: ${alertList.join(', ')}`, module: '/water-tanks' };
    return { reply: `There are ${totalAlerts} active alerts: ${alertList.join(', ')}`, module: lowWaterTanks.length > 0 ? '/water-tanks' : '/garbage-bins' };
  }

  // Complaints / citizen services
  if (/\b(complaint|citizen|service|request|feedback|pirachinai|புகார்)\b/i.test(query)) {
    if (isTamil) return { reply: `மொத்த புகார்கள்: ${totalComplaints}. நிலுவை: ${pendingCount}. தீர்க்கப்பட்டது: ${resolvedCount}. உயர் முன்னுரிமை: ${highPriorityCount}.`, module: '/complaints' };
    if (isTanglish) return { reply: `Total complaints: ${totalComplaints}. Pending: ${pendingCount}. Resolved: ${resolvedCount}. High priority: ${highPriorityCount}.`, module: '/complaints' };
    return { reply: `Total complaints: ${totalComplaints}. Pending: ${pendingCount}. Resolved: ${resolvedCount}. High priority (unresolved): ${highPriorityCount}. Resolution rate: ${totalComplaints > 0 ? Math.round((resolvedCount / totalComplaints) * 100) : 0}%.`, module: '/complaints' };
  }

  // Population
  if (/\b(population|people|makkal|மக்கள்|residents|citizens)\b/i.test(query)) {
    if (isTamil) return { reply: `கிராம மக்கள் தொகை: ${population.toLocaleString()}.`, module: null };
    if (isTanglish) return { reply: `Oorla ${population.toLocaleString()} makkal irukanga.`, module: null };
    return { reply: `Village population: ${population.toLocaleString()} registered residents.`, module: null };
  }

  // Waste
  if (/\b(waste|garbage|bin|trash|kuppai|குப்பை|collection)\b/i.test(query)) {
    if (isTamil) {
      const fullList = fullBins.map((b) => `${b.name} (${b.pct}%)`).join(', ');
      return { reply: `${garbageBins.length} குப்பை பெட்டிகள் உள்ளன. ${fullBin ? `நிரம்பிய பெட்டிகள்: ${fullList}. சேகரிப்பு தேவை.` : 'அனைத்தும் சரியாக உள்ளன.'}`, module: '/garbage-bins' };
    }
    if (isTanglish) {
      const fullList = fullBins.map((b) => `${b.name} (${b.pct}%)`).join(', ');
      return { reply: `${garbageBins.length} bins irukku. ${fullBin ? `Full bins: ${fullList}. Collection aaganum.` : 'Ellam bins OK.'}`, module: '/garbage-bins' };
    }
    const fullList = fullBins.map((b) => `${b.name} (${b.pct}%)`).join(', ');
    return { reply: `There are ${garbageBins.length} waste bins. ${fullBin ? `Almost full: ${fullList}. Collection needed soon.` : 'All bins are at acceptable levels.'}`, module: '/garbage-bins' };
  }

  // Healthcare
  if (/\b(health|doctor|hospital|phc|medicine|vaccination|aarogya|மருத்துவ)\b/i.test(query)) {
    if (isTamil) return { reply: `மருத்துவ நிலை: 3 மருத்துவர்கள், 47 நோயாளிகள் சிகிச்சையில். ஆம்புலன்ஸ் கிடைக்கிறது. அவசர நிகழ்வுகள் இல்லை.`, module: '/healthcare' };
    if (isTanglish) return { reply: `Health status: 3 doctors, 47 patients active. Ambulance available. Emergency cases illai.`, module: '/healthcare' };
    return { reply: `Healthcare status: 3 doctors on duty, 47 active patients. Ambulance is available. No emergency cases. Vaccination coverage: 92% for children.`, module: '/healthcare' };
  }

  // Village status (general)
  if (/\b(village|status|overview|sollu|கிராம|oorla|gana)\b/i.test(query)) {
    const avgPct = Math.round(waterTanks.reduce((s, t) => s + t.pct, 0) / Math.max(waterTanks.length, 1));
    if (isTamil) return { reply: `கிராம நிலை: மக்கள் ${population}, நீர் மட்டம் ${avgPct}%, புகார்கள் ${totalComplaints} (நிலுவை ${pendingCount}). எச்சரிக்கைகள்: ${totalAlerts}.`, module: null };
    if (isTanglish) return { reply: `Village status: Population ${population}, water avg ${avgPct}%, complaints ${totalComplaints} (pending ${pendingCount}). Alerts: ${totalAlerts}.`, module: null };
    return { reply: `Village overview: Population ${population}, average water level ${avgPct}%, ${totalComplaints} total complaints (${pendingCount} pending). Active alerts: ${totalAlerts}. Healthcare and education systems are operating normally.`, module: null };
  }

  // AI prediction
  if (/\b(prediction|forecast|ai|predict|risk)\b/i.test(query)) {
    if (isTamil) return { reply: `AI கணிப்பு: நீர் பற்றாக்குறை - குறைந்த ஆபத்து. பயிர் விளைச்சல் - அதிக விளைச்சல். நோய் பரவல் - குறைந்த ஆபத்து.`, module: '/analytics' };
    if (isTanglish) return { reply: `AI Prediction: Water shortage - Low Risk. Crop yield - High Yield. Disease outbreak - Low Risk.`, module: '/analytics' };
    return { reply: `AI Predictions: Water shortage — Low Risk. Crop yield — High Yield expected. Disease outbreak — Low Risk. Flood risk — Low. Infrastructure risk — Moderate (Market Road).`, module: '/analytics' };
  }

  // Default
  if (isTamil) return { reply: `உங்கள் கேள்வத்தை புரிந்துகொள்ள முடியவில்லை. நீர், வேளாண்மை, குப்பை, புகார், வானிலை, மருத்துவம் பற்றி கேளுங்கள்.`, module: null };
  if (isTanglish) return { reply: `Unga kelvi puriyala. Water, agriculture, waste, complaint, weather, health pathri kelunga.`, module: null };
  return { reply: `I didn't understand your question. You can ask me about: water status, agriculture, waste management, complaints, weather, healthcare, village overview, or AI predictions.`, module: null };
}
