# GPG Password Store

Inspired by pass (https://www.passwordstore.org/), but I wanted some features to work differently and to make it more interactive to use. Also, it seemed like a fun thing to build.

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

## Setup

What you'll need...

-   GPG command line tools (this tool uses GPG for all encryption etc).
-   On a mac, pinentry-mac is kind of useful. Other platforms have similar pin entry tools. If you see errors along the lines of `public key decryption failed: Inappropriate ioctl for device`, this is likely caused by GPG wanting to ask you for the pin/passphrase for your key, but not being able to.
-   Node.js - any current version should be fine.

#### Install GPG

**Linux**

```
# gpg command line
sudo apt-get install gnupg

# A gui for Ubuntu if you like...
sudo apt-get install kgpg
```

**Mac**

https://gpgtools.org/

After you have installed GPG, create a set of keys.

#### Setup GPG Password Store

Now you can install GPG Password store

```
git clone https://github.com/instabot42/gpg-password-store.git
cd gpg-password-store
npm ci
```

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

or, if you didn't set up an alias
`./src/pass.js help`

#### Set up password store

`pass init [Name-Of-GPG-Key-To-Use-For-Encryption,And-Another-Key,Third-Key]`

You'll need to do this before you can use any other commands.
This will firstly create a folder (`~/.gpg-store` by default), to store all your passwords in (encrypted, obviously).
The command expects an argument that is the name / keyID of the GPG keys you would like to use for all encryption / decryption
You can provide a list of keys, separated by commas

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
