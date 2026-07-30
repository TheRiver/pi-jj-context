# pi-jj-context

This is a [Pi package][pi-url] that, when Pi is started, checks the current 
folder to see if it is in a [jujutsu][jujutsu-url] repo. If it is, 
it adds the persistent custom message to the context saying:

> Repository VCS policy: this is a Jujutsu repository. Use `jj` rather than
> `git` for version-control operations, unless the user explicitly requests Git.

The message is added once per session. It's not shown in the TUI, but you can 
see it in the export. If
compaction removes it from active context, the extension adds an equivalent
ephemeral message to later model requests. 

## Install

Install globally from a Git repository:

```sh
pi install git:git@github.com:TheRiver/pi-jj-context.git@v0.1.0
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