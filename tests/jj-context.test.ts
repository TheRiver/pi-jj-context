import assert from "node:assert/strict";
import test from "node:test";
import jjContextExtension from "../extensions/jj-context.ts";

// Model the extension boundary: persisted custom messages enter active context,
// while compaction can remove them without deleting session history.
function session({ code = 0, killed = false, fails = false } = {}) {
	const handlers = new Map();
	const history = [];
	let active = [];
	const deliveries = [];
	const ctx = {
		sessionManager: {
			getBranch: () => history,
			buildSessionProjection: () => ({ messages: [...active] }),
		},
	};
	jjContextExtension({
		on: (event, handler) => handlers.set(event, handler),
		exec: async () => {
			if (fails) throw new Error("jj unavailable");
			return { code, killed };
		},
		sendMessage: (message, options) => {
			deliveries.push({ message, options });
			history.push({ ...message, type: "custom_message" });
			active.push(message);
		},
	} as any);
	return {
		deliveries,
		async emit(event) {
			return handlers.get(event)?.({ messages: [...active] }, ctx);
		},
		removeFromContext() { active = []; },
		async request() {
			return (await handlers.get("context")?.({ messages: [...active] }, ctx))?.messages ?? [...active];
		},
	};
}

test("compaction restores one persistent policy that later requests reuse", async () => {
	const s = session();
	await s.emit("session_start");
	s.removeFromContext();
	await s.emit("session_compact");
	assert.equal(s.deliveries.length, 2);
	const replacement = s.deliveries[1];
	assert.equal(replacement.options.triggerTurn, false);
	assert.equal(replacement.message.display, false);
	for (let i = 0; i < 3; i++) {
		assert.deepEqual(await s.request(), [replacement.message]);
	}
	assert.equal(s.deliveries.length, 2);

	// A later compaction can remove the replacement too.
	s.removeFromContext();
	await s.emit("session_compact");
	assert.equal(s.deliveries.length, 3);
});

test("a policy retained by compaction or session reload is not duplicated", async () => {
	const s = session();
	await s.emit("session_start");
	await s.emit("session_compact");
	await s.emit("session_start");
	assert.equal(s.deliveries.length, 1);
	assert.equal(s.deliveries[0].options.triggerTurn, false);
});

test("resuming a compacted session restores the policy despite its presence in history", async () => {
	const s = session();
	await s.emit("session_start");
	s.removeFromContext();
	await s.emit("session_start");
	assert.equal(s.deliveries.length, 2);
	assert.deepEqual(await s.request(), [s.deliveries[1].message]);
});

for (const result of [{ code: 1 }, { killed: true }, { fails: true }]) {
	test(`unsuccessful repository detection adds no policy: ${JSON.stringify(result)}`, async () => {
		const s = session(result);
		await s.emit("session_start");
		await s.emit("session_compact");
		assert.deepEqual(await s.request(), []);
		assert.equal(s.deliveries.length, 0);
	});
}
