# pi-jj-context

This is a [Pi package][pi-url] that, when Pi is started, checks the current
folder to see if it is in a [jujutsu][jujutsu-url] repo. If it is, it adds the
persistent custom message to the context saying:

> Repository VCS policy: this is a Jujutsu repository. Other repos may or may
> not be Jujutsu repositories themselves.

The message is persisted when missing from active context at session start.
It's not shown in the TUI, but you can see it in the export. If compaction
removes it from active context, the extension persists a replacement without
triggering an assistant turn. Later model requests reuse that message rather
than receiving a fresh ephemeral message each time.

The problem I want to solve is needing to add to AGENTS files something about
checking if I'm using jj or git in a particular repo. Now the check for `jj` is
done automatically, so no AGENTS edits are needed.

## Install

Install globally from a Git repository:

```sh
pi install git:git@github.com:TheRiver/pi-jj-context.git@v0.1.1
```

For local development:

```sh
pi -e ./extensions/jj-context.ts
```

No package-manager install is required: the extension has no runtime
dependencies.

## Release

Tag releases so installations can be pinned:

```sh
jj bookmark create v0.1.0 -r @
jj git push --bookmark v0.1.0
```

Then update the version in `package.json` for the next release.

## License

Licensed under MIT.

[jujutsu-url]: https://www.jj-vcs.dev/
[pi-url]: https://pi.dev
