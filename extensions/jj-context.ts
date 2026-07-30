import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const CUSTOM_TYPE = "jj-context";
const CONTENT =
	"Repository VCS policy: this is a Jujutsu repository. Use `jj` rather than `git` for version-control operations, unless the user explicitly requests Git.";

function contextMessage() {
	return {
		role: "custom" as const,
		customType: CUSTOM_TYPE,
		content: CONTENT,
		display: false,
		timestamp: Date.now(),
	};
}

function hasContextMessage(messages: ReadonlyArray<{ role: string; customType?: string }>) {
	return messages.some((message) => message.role === "custom" && message.customType === CUSTOM_TYPE);
}

export default function jjContextExtension(pi: ExtensionAPI) {
	let isJujutsuRepository = false;

	pi.on("session_start", async (_event, ctx) => {
		try {
			const result = await pi.exec("jj", ["root"], { timeout: 1_000 });
			isJujutsuRepository = result.code === 0 && !result.killed;
		} catch {
			isJujutsuRepository = false;
		}

		if (!isJujutsuRepository) return;

		const branchHasContext = ctx.sessionManager
			.getBranch()
			.some((entry) => entry.type === "custom_message" && entry.customType === CUSTOM_TYPE);

		if (!branchHasContext) {
			pi.sendMessage(contextMessage());
		}
	});

	// Compaction can omit the persistent custom message from the active context.
	// Add it back only to the outgoing request when that happens.
	pi.on("context", (event) => {
		if (!isJujutsuRepository || hasContextMessage(event.messages)) return;

		return { messages: [...event.messages, contextMessage()] };
	});
}
