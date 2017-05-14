Bug 2 Trello
==========

A browser extension to add bugs/issues to a Trello board.

It currently supports Launchpad, GitHub, SourceForge, BitBucket, and Debian's BTS.

There is also support for some Bugzilla instances. This support currently requires that the JSON-RPC interface is available.

It is known to work with with Wikimedia, Mozilla, KDE, Apache, and Redhat.
It is known *not* to work with GNOME, Kernel.org, and Novell.

- Install it from the Chrome Store: https://chrome.google.com/webstore/detail/bug2trello/aomnoofmdnaccffobkddehcmdihggcke
- Report bugs: https://github.com/andrewsomething/bug2trello/issues
- Grab the code: `git clone git://github.com/andrewsomething/bug2trello.git`

Bug 2 Trello is licensed under the MIT License.

Development
-----------

* Install the dependencies using: `npm install`
* Build the extension with: `npm run `
* The `dist/` directory will contain the unpacked extension.
* Running `npm run package` will produce a packaged extension in `./bug2trello.zip`
