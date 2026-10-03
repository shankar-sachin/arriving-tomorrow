/**
 * Customer support, fully scripted. Keyword intents pick the topic; the number of messages so far
 * picks how unhinged the answer is. No AI and no server: it all runs in the browser.
 */

export type Intent = "greeting" | "where" | "refund" | "manager" | "angry" | "thanks" | "product" | "bye" | "other";

export interface Agent {
  name: string;
  title: string;
}

export const AGENTS: Agent[] = [
  { name: "Brenda", title: "Senior Delivery Optimist" },
  { name: "Brenda's Manager", title: "Head of Escalations (also Brenda)" },
  { name: "The Regional Director", title: "Brenda, in a blazer" },
];

const RULES: Array<[Intent, RegExp]> = [
  ["manager", /\b(manager|supervisor|human|real person|someone else|escalate|boss|ceo|director)\b/i],
  ["refund", /\b(refund|money back|return|cancel|chargeback|reimburse|compensat)/i],
  ["angry", /\b(scam|ridiculous|fraud|lawyer|sue|useless|terrible|worst|wtf|fuck|shit|damn|hell|bs|unacceptable)\b|!{3,}/i],
  ["where", /\b(where|when|order|package|parcel|deliver|arriv|track|ship|late|still|waiting|tomorrow|eta)/i],
  ["product", /\b(size|fit|colou?r|fabric|wash|material|saree|lehenga|hat|boots|dress|jacket|gown)\b/i],
  ["thanks", /\b(thanks|thank you|thx|ty|cheers|appreciate)\b/i],
  ["bye", /\b(bye|goodbye|cya|see ya|later|done)\b/i],
  ["greeting", /^\s*(hi|hello|hey|yo|sup|hiya|howdy|good (morning|afternoon|evening))\b/i],
];

export function classify(message: string): Intent {
  if (message.trim().length > 6 && message === message.toUpperCase() && /[A-Z]{4}/.test(message)) return "angry";
  return RULES.find(([, re]) => re.test(message))?.[0] ?? "other";
}

/** Three tiers per intent: calm, weird, fully unhinged. */
const LINES: Record<Intent, [string[], string[], string[]]> = {
  greeting: [
    ["Hi! Thanks for contacting Clothes Never Come. How can I not help you today?"],
    ["Hello again! It's always lovely to hear from a customer who's still waiting."],
    ["Oh. It's you. Hi. The package is fine. Everyone's fine."],
  ],
  where: [
    [
      "Great news: your order is arriving tomorrow!",
      "I've checked the system and your package is in transit. Very in transit.",
      "Your order has left the warehouse. Emotionally, at least.",
    ],
    [
      "The driver called in. He's fine, he's just been watching a lot of documentaries about the ocean.",
      "Your package was briefly detained at customs for being too fabulous.",
      "We had to reroute through Iceland. Something about a volcano and a guy named Steinar.",
      "The truck is parked outside your house right now, but it's shy.",
    ],
    [
      "Your package has unionised and is demanding better working conditions.",
      "I'm told your parcel has gained sentience and is reconsidering the whole thing.",
      "The package is currently in a timeshare presentation in Orlando. It can't leave until it hears the full pitch.",
      "We've located your order. It's on the moon. Don't ask how. Arriving tomorrow.",
    ],
  ],
  refund: [
    ["Absolutely. You paid $0.00, so I've refunded $0.00. It should appear in your account in 3 to 5 business never."],
    ["I've escalated your refund to our Refunds team. The Refunds team is a single fax machine in a basement in Delaware."],
    ["Refund approved! Please return the item in its original packaging first. Oh. Right. Hm."],
  ],
  manager: [
    ["Let me transfer you. Please hold. *puts on a different hat*"],
    ["Transferring you to someone more senior. *adjusts tie* Hello, this is a completely different person."],
    ["You've reached the top of the org chart. It's me. It's been me the whole time."],
  ],
  angry: [
    ["I completely understand your frustration, and I want you to know your package also feels terrible about this."],
    ["I hear you. I've marked your account as 'spicy' so our drivers know to approach with caution, eventually."],
    ["I'm going to pretend I didn't read that and instead tell you that your package says hi from Portugal."],
  ],
  thanks: [
    ["You're welcome! Your satisfaction is our number one priority, right after delivery, which is priority zero."],
    ["Anytime! I'll be here, also not receiving anything."],
    ["No, thank YOU. You're the only one who still believes."],
  ],
  product: [
    ["Great question! All our items fit perfectly, because they never touch your body."],
    ["Our size guide says it runs true to size in theory, which is where it's shipping from."],
    ["The fabric is 100% hypothetical. Machine wash cold, if it ever shows up."],
  ],
  bye: [
    ["Thanks for chatting! Your order is still arriving tomorrow. Have a lovely day."],
    ["Bye! I'll call you if anything changes. Nothing will change."],
    ["Goodbye. I'll tell your package you said hi. It misses you, in its way."],
  ],
  other: [
    [
      "I'm sorry, I didn't quite catch that. But your order is arriving tomorrow, if that helps.",
      "Let me look into that for you. *types loudly* Okay, I've looked into it. Arriving tomorrow.",
    ],
    [
      "Interesting. I've written that on a sticky note and put it on the fridge.",
      "Our system has flagged that message as 'a vibe'. Someone will get back to you tomorrow.",
    ],
    [
      "Respectfully, I've been in this chat for so long that I've forgotten what clothes are.",
      "I'm going to be honest with you, I just work here. I don't even know where 'here' is.",
    ],
  ],
};

/** Tier 0 for the first few messages, then it gets weirder. */
export const tierFor = (turn: number) => (turn < 3 ? 0 : turn < 7 ? 1 : 2);

/** The agent you're talking to; asking for a manager promotes you up the chain (back to Brenda). */
export const agentFor = (escalations: number) => AGENTS[Math.min(escalations, AGENTS.length - 1)];

export function reply(message: string, turn: number): { intent: Intent; text: string } {
  const intent = classify(message);
  const options = LINES[intent][tierFor(turn)];
  return { intent, text: options[turn % options.length] };
}

export const GREETING = "Hi, I'm Brenda from Clothes Never Come support. Ask me anything about your order, and I'll tell you it's arriving tomorrow.";

export const QUICK_REPLIES = ["Where's my order?", "I want a refund", "Does it run true to size?", "Let me speak to a manager"];
