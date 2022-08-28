# GPG Password Store

Inspired by pass (https://www.passwordstore.org/), but I wanted more control over some aspects and getting tab completion to work was proving too hard. Also, it seemed like a fun thing to build.

Note, I built this just for fun - it's not audited and it's not my job to maintain it. Use it if you like. or don't. 

### Features

* Offline - there are no network features at all
* No background tasks - it only runs when you run it from the command line
* Each password stored in a separate encrypted file. A single corrupt file doesn't take you down.
* Trusted, secure GPG encryption (needs GPG command line tools installed)
* Leaves cloud backup up to you.
* git friendly. Encrypted data uses ascii armour format. Make your password folder a git repo to keep a history / backups and push for off-site redundancy (if you want)
* Organise your passwords with regular folders
* You can decrypt and access your data using the normal gpg command line tools if you need to (assuming your have your gpg keys)
* auto-completion to make hunting down your passwords simpler
* configurable random password generation (using libsodium for battle tested random number generation)

Don't forget to backup your GPG key pairs. Without them you won't be able to every recover your passwords.

## Setup

### Install GPG
https://gpgtools.org/
The tool just calls the gpg command line tools under the hood, so they need to be installed

### Install pinentry
Also add pinentry-mac if you are running on a mac. This enable requests for key pair passwords to popup a dialog asking for it.
If you see errors like 'public key decryption failed: Inappropriate ioctl for device', this will be the fix.
`brew install pinentry-mac`

See https://github.com/Homebrew/homebrew-core/issues/14737 for more on this
https://gpgtools.tenderapp.com/kb/faq/password-management

### Set up dependencies

`npm ci`


### Environment

You don't need to set anything up here to use gpg-password-store, but you can override some defaults using these settings if you like.

* GPG_PASS_DIR - the full path to the folder to store passwords in (default `~/.gpg-store`)
* GPG_PASS_WORD_COUNT - When generating passwords, how many words should be used (can be overriden with cli args) (default 5)
* GPG_PASS_MAX_WORD_LEN - Max length of each of the words used (default 10)
* GPG_PASS_JOIN_TEXT - the text used between each word. Set this to 'true' and a random special char will be used each time (default '.')

Also, set up an alias, such as `alias pass="node ~/path/to/repo/src/pass.js"`, so you can call it from anywhere with just `pass`

### Windows Setup

¯\_ (ツ)_/¯


## Usage

Assumes you have set up an alias...


`pass help`

You'll need to start with `pass init <Name-Of-GPG-Key-To-Use-For-Encryption>` to create the required folder and config.

### Add a new password to the DB

`pass.js insert`

Give a name for the entry - this is how you will identify the password in the future
Enter the username and password.
Optionally add some additional text that will be stored with the entry

The password will be copied to the clipboard (but only for 15 seconds)

### Find and show a password

`pass.js show`

Enter the name your gave your password (tab for auto-completion)
Any key fields will be extracted and shown in a menu. Select the item to copy it to the clipboard.
ESC to stop selecting fields and quit. The clipboard will be cleared soon afterwards.


### Format

When adding notes, or editing records, here are some rules that might help.

The first line of the file is assumed to be the password.
After that you are free to use any format you like. However, pass show will look for lines in the following format:-

```
Label: Value
```

When offering items to be copied to the clipboard, all these values will also be listed, making it easy to support
copying the username, password, url or any other things you need into the clipboard.

# Credits

Heavily inspired by https://www.passwordstore.org/

Word list taken from https://www.npmjs.com/package/password (uses the UNLICENSE license)