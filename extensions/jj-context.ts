import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

const CUSTOM_TYPE = "jj-context";
const CONTENT =
	"This local working copy uses Jujutsu (`jj`). Use `jj` for local version-control operations here. This is not a project-wide VCS policy: collaborators may use Git. Do not add Jujutsu requirements to shared instructions, documentation or tooling based on this notice. Check other working copies independently.";

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

	function ensureContextMessage(ctx: ExtensionContext) {
		if (!isJujutsuRepository) return;
		if (hasContextMessage(ctx.sessionManager.buildSessionProjection().messages)) return;

		pi.sendMessage(contextMessage(), { triggerTurn: false });
	}

	pi.on("session_start", async (_event, ctx) => {
		try {
			const result = await pi.exec("jj", ["root"], { timeout: 1_000 });
			isJujutsuRepository = result.code === 0 && !result.killed;
		} catch {
			isJujutsuRepository = false;
		}

		ensureContextMessage(ctx);
	});

	// Restore the guidance persistently, rather than appending fresh input to every request.
	pi.on("session_compact", (_event, ctx) => {
		ensureContextMessage(ctx);
	});
}
