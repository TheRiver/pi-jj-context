# pi-jj-context

A [Pi package](https://pi.dev) that detects Jujutsu repositories and adds this
hidden, persistent message to the session:

> Repository VCS policy: this is a Jujutsu repository. Use `jj` rather than
> `git` for version-control operations, unless the user explicitly requests Git.

It detects a repository by running `jj root` in Pi's working directory. This
works from nested directories and deliberately prefers Jujutsu even for
colocated repositories with both `.jj` and `.git` metadata.

The message is added once per session and is not displayed in the transcript. If
compaction removes it from active context, the extension adds an equivalent
ephemeral message to later model requests.

## Install

Install globally from a Git repository:

```sh
pi install git:git@github.com:YOUR-USER/pi-jj-context@v0.1.0
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
