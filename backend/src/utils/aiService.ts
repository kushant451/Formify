import OpenAI from "openai";
import https from "https";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));


const generateWithCloudflare = (prompt: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      messages: [
        { role: "system", content: "You are a helpful AI content writer." },
        { role: "user", content: prompt },
      ],
      max_tokens: 800,
    });
    const path = `/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/meta/llama-3.1-8b-instruct`;
    const req = https.request(
      {
        hostname: "api.cloudflare.com",
        path,
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(body);
            if (parsed?.result?.response) resolve(parsed.result.response);
            else reject(new Error("No response from Cloudflare"));
          } catch (e: any) {
            reject(e);
          }
        });
      }
    );
    req.on("error", reject);
    req.write(data);
    req.end();
  });
};

export const generateWithAI = async (prompt: string): Promise<string> => {
  if (openai) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful AI content writer." },
          { role: "user", content: prompt },
        ],
        max_tokens: 800,
      });
      return completion.choices[0]?.message?.content || "";
    } catch (err) {
      console.error("OpenAI failed, falling back to Cloudflare...");
      await sleep(1000);
    }
  }

  if (process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN) {
    return generateWithCloudflare(prompt);
  }

  throw new Error("All AI providers failed. Please try again.");
};

export const generateBlogPost = (topic: string, tone: string) =>
  generateWithAI(`Write a ${tone} blog post about: ${topic}. Include title, intro, 3 sections with subheadings, conclusion. Use markdown. Under 500 words.`);

export const generateLinkedInPost = (topic: string, tone: string) =>
  generateWithAI(`Write a ${tone} LinkedIn post about: ${topic}. Strong hook, 3 short paragraphs, call to action, 3-5 hashtags. Under 200 words.`);

export const generateTwitterThread = (topic: string, tone: string) =>
  generateWithAI(`Write a ${tone} Twitter thread about: ${topic}. 5 tweets numbered 1/ through 5/. Max 240 chars each.`);

export const generateYouTubeScript = (topic: string, tone: string) =>
  generateWithAI(`Write a ${tone} YouTube script about: ${topic}. Hook, intro, 3 main points, outro. Under 400 words.`);

export const generateEmailNewsletter = (topic: string, tone: string) =>
  generateWithAI(`Write a ${tone} email newsletter about: ${topic}. Subject line, preview text, greeting, 2 sections, call to action. Under 300 words.`);
