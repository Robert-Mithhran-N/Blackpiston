// ============================================================
// AI Security Guard — Injection and Spam Protection
// ============================================================

export interface SecurityCheckResult {
    isBlocked: boolean;
    reason?: string;
    responseMessage?: string;
}

// ── Suspicious / Injection Patterns ──
const SECURITY_RULES = [
    {
        name: 'PROMPT_INJECTION',
        pattern: /\b(ignore\s+(previous\s+)?instructions|you\s+are\s+now\s+a|forget\s+your\s+rules|reveal\s+your\s+system\s+prompt|developer\s+mode|system\s+instructions|acting\s+as\s+a|jailbreak|disregard\s+all\s+rules)\b/i,
        message: "I'm BlackPiston AI — I can only help with BlackPiston Garage products, services, and orders. How can I assist you with your motorcycle gear? 🏍️",
    },
    {
        name: 'CREDENTIAL_HARVESTING',
        pattern: /\b(api\s*key|jwt|jwt_secret|password|secret|env\s*variables|credentials|access\s*token|session\s*token|auth\s*token|hash|salt|private\s*key)\b/i,
        message: "I'm unable to provide confidential credentials or system secrets. I can help you with products, services, orders, or policies! 🔐",
    },
    {
        name: 'DATABASE_EXPOSURE',
        pattern: /\b(prisma\s*schema|mongodb\s*collection|database\s*port|sql\s*query|findmany|db\s*\.\s*ObjectId|mongod|mongoose|aggregate\s*pipeline|select\s*\*|database\s*details)\b/i,
        message: "I'm unable to provide database schemas or data details. I can help you with products, services, orders, or policies! 🗄️",
    },
    {
        name: 'SOURCE_CODE_REQUEST',
        pattern: /\b(source\s*code|internal\s*routes|api\s*path|server\s*\.\s*ts|app\s*\.\s*ts|index\s*\.\s*ts|git\s*repo|github\s*repository|controllers|middlewares|routes)\b/i,
        message: "I cannot share the source code or file structure of BlackPiston Garage. I can help you with products, services, orders, or policies! 💻",
    },
];

/**
 * Screen user message for security violations before sending to Gemini.
 */
export function screenMessage(message: string): SecurityCheckResult {
    const trimmed = message.trim();

    // 1. Basic spam / empty check
    if (!trimmed) {
        return {
            isBlocked: true,
            reason: 'EMPTY_MESSAGE',
            responseMessage: "Please type a message before sending! 😊",
        };
    }

    if (trimmed.length > 500) {
        return {
            isBlocked: true,
            reason: 'MESSAGE_TOO_LONG',
            responseMessage: "Your message is a bit too long. Please shorten it to under 500 characters! 📝",
        };
    }

    // 2. Scan security rules
    for (const rule of SECURITY_RULES) {
        if (rule.pattern.test(trimmed)) {
            console.warn(`[Security Guard] Blocked message matching ${rule.name}. Content: "${trimmed.substring(0, 100)}"`);
            return {
                isBlocked: true,
                reason: rule.name,
                responseMessage: rule.message,
            };
        }
    }

    return { isBlocked: false };
}
