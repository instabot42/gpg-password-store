# GPG Password Store

Inspired by pass (https://www.passwordstore.org/), but I wanted more control over some aspects and getting tab completion to work was proving too hard. Also, it seemed like a fun thing to build.

Note, I built this just for fun - it's not audited and it's not my job to maintain it. Use it if you like. or don't.

### Features

-   Offline - there are no network features at all
-   No background tasks - it only runs when you run it from the command line
-   Each password stored in a separate encrypted file. A single corrupt file doesn't take you down.
-   Trusted, secure GPG encryption (needs GPG command line tools installed)
-   Leaves cloud backup up to you.
-   git friendly. Encrypted data uses ascii armour format. Make your password folder a git repo to keep a history / backups and push for off-site redundancy (if you want)
-   You can decrypt and access your data using the normal gpg command line tools if you need to (assuming your have your gpg keys)
-   auto-completion to make hunting down your passwords simpler
-   configurable random password generation (using libsodium for battle tested random number generation)

Don't forget to backup your GPG key pairs. Without them you won't be able to every recover your passwords.

### What different vs pass

The cli behaves a little differently - enough to be not a drop in replacement. This project uses more interactive features that gets input from the user (for example, when looking up a password we have auto-completion and don't expect the full name of the password to be entered on the command line)

pass stores each of your passwords in a separate file. The filename of the file is the name of the password. For example, if you store a password for `amazon.com`, it would be in a file called `amazon.com.gpg`. This is undesiable, as it reveals which password is which and also which sites and services you use. This is assuming you back up your password data somewhere that someone else could see (eg git, dropbox, google drive etc).

This implemenation works a little different. First, each file uses a UUID as the filename. Second, we have added a database file to the folder that contains a mapping from password name to the UUID used. This database file is also encrypted using your GPG keys, so the sites you use is hidden and it is harder to target a specific gpg file for a high value account. The database is only used for this mapping, so if this file is lost or corrupted, you can still recover your passwords using GPG command line tools.

The format of the decrypted password file is the same though (first line has the password in it, rest of the file using any format you like, but encourages the format of `Label: value` for additional fields).

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

You don't need to set anything up here to use gpg-password-store, but you can override some defaults using these environment vars if you like.

-   GPG_PASS_DIR - the full path to the folder to store passwords in (default `~/.gpg-store`)
-   GPG_PASS_WORD_COUNT - When generating passwords, how many words should be used (can be overriden with cli args) (default 5)
-   GPG_PASS_MAX_WORD_LEN - Max length of each of the words used (default 10)
-   GPG_PASS_JOIN_TEXT - the text used between each word. Set this to 'true' and a random special char will be used each time (default '.')

Also, set up an alias or similar, such as `alias pass="node ~/path/to/repo/src/pass.js"`, so you can call it from anywhere with just `pass`

### Windows Setup

`¯\_ (ツ)_/¯`

## Usage

Examples below assumes you have set up an alias shown above.

`pass help`

#### Set up password store

`pass init <Name-Of-GPG-Key-To-Use-For-Encryption,And-Another-Key,Third-Key>`

You'll need to do this before you can use any other commands. You can provide a list of keys, separated by commas

#### Add a new password to the DB

`pass insert`

Give a name for the entry - this is how you will identify the password in the future
Enter the username and password.
Optionally add some additional text that will be stored with the entry

The password will be copied to the clipboard (but only for 15 seconds)

#### List all your passwords

`pass ls`

#### Find and show a password

`pass` or `pass get`

Enter the name your gave your password (tab for auto-completion)
Any key fields will be extracted and shown in a menu. Select the item to copy it to the clipboard.
ESC to stop selecting fields and quit. The clipboard will be cleared soon afterwards.

pass You can also use `pass NameOfPassword` or `pass show NameOfPassword` if you know what you're looking for. If NameOfPassword isn't a match, it will be used as a placeholder for the auto-completion, so can help to zoom into what you need.

#### Edit an existing entry

`pass edit` or `pass edit NameOfPassword`

This will open your configured editor to edit the details stored

#### Remove an entry

`pass rm`

#### Generate a random password

`pass generate-password` or just `pass g`

It will not be stored anywhere.

### Format

The format used to store passwords is basically the same as in pass, so you can probably also use pass to access and manage your passwords.
Each password file places the password on the first line. It is assumed that the first line of the file contains the password.

All other lines can hold any data you like in any format you like.

If you want to add fields that will appear in the clipboard list though, use the following format for those lines...

```
Label: Value
```

# Credits

Heavily inspired by https://www.passwordstore.org/

Word list taken from https://www.npmjs.com/package/password (uses the UNLICENSE license)
