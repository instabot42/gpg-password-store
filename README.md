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

Don't forget to backup your GPG key pairs. Without them you won't be able to ever recover your passwords.

## Setup

What you'll need...

-   GPG command line tools (this tool uses GPG for all encryption and decryption).
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

```
brew install gnupg
brew install pinentry-mac
```

See https://formulae.brew.sh/formula/gnupg and https://formulae.brew.sh/formula/pinentry-mac#default for more details, or use the GUI tools from https://gpgtools.org/

After you have installed GPG, create a set of keys.
Ultimate Guide on setting up GPG with YubiKeys: https://github.com/drduh/YubiKey-Guide

#### Setup GPG Password Store

Now you can install GPG Password store

```
git clone https://github.com/instabot42/gpg-password-store.git
cd gpg-password-store
npm ci
```

**Also**, set up an alias or similar, such as `alias pass="node ~/path/to/repo/src/pass.js"`, so you can call it from anywhere with just `pass`.

### Environment (Optional)

You don't need to set anything up here to use gpg-password-store, but you can override some defaults using these environment vars if you like.

-   GPG_PASS_DIR - the full path to the folder to store passwords in (default `~/.gpg-store`)
-   GPG_PASS_WORD_COUNT - When generating passwords, how many words should be used (can be overriden with cli args) (default 5)
-   GPG_PASS_MAX_WORD_LEN - Max length of each of the words used (default 10)
-   GPG_PASS_JOIN_TEXT - the text used between each word. Set this to 'true' and a random special char will be used each time (default '.')

### Windows Setup

`??\_ (???)_/??`

## Usage Examples

Examples below assumes you have set up an alias shown above.

`pass help`

or, if you didn't set up an alias
`./src/pass.js help`

#### Set up password store

`pass init MyGPGKeysName`

You'll need to do this before you can use any other commands.
The key name is the name that you gave your keys, though you can also use the key id shown by `gpg --list-keys` (the long hex value), or even the email address.
These are the GPG keys that will be used to encrypt/decrypt data.
If you want to encrypt to multiple keys, provide them all as a comma separated list. eg `pass init key1,key2`. Any of the given keys can be used to decrypt the password data later, so this is great for including your backup key for example.

'Init' will firstly create a folder (`~/.gpg-store` by default) to store all your passwords in (encrypted, obviously).
The command expects an argument that is the name / keyID of the GPG keys you would like to use for all encryption / decryption
You can provide a list of keys, separated by commas

Usefully, if you need to migrate your password store to a new set of keys, or add a new key, just use init again with the new list of keys.

Note that key names that contain spaces will need to be quoted.

#### Add a new password to the DB

`pass insert`

Give a name for the entry - this is how you will identify the password in the future
Enter the username and password.
Optionally add some additional text that will be stored with the entry

The new password will be copied to the clipboard (but only for 15 seconds)

#### List all your passwords

`pass ls`

shows a list of all the passwords in your store (just the names you gave them, not the actual passwords)

#### Find and show a password entry

`pass` or `pass get`

Enter the name your gave your password (tab for auto-completion).

Once you have chosen a password, all the values in the entry will be offered. pick one and it will be copied to the clipboard.

Choose the 'Show Full Record' to see the entire entry, including any notes you have added to the entry. You can also add the -s option to the command line to show the entry right away.

ESC to exit, and ESC again to skip the clipboard clearing timeout.

#### Edit an existing entry

`pass edit` or `pass edit NameOfPassword`

This will open your configured editor to edit the details stored

#### Remove an entry

`pass rm`

Choose the entry to delete, and complete the endless 'are you sure' steps.

#### Generate a random password

`pass generate-password` or just `pass g`

It will not be stored anywhere.

### Format

Each entry in your password store is just a simple text document. There is no specific format defined or expected, so it up to you how you keep your information for each entry.

However, there are a couple of things pass will look for in your text document. To create named fields that will be listed for copy and paste when using `pass get`, put the values on their own lines, like so...

```
Label: Value to show that can be copy and pasted
Password: This value will be masked when shown in the copy/paste menu, as the label contains 'password'

Some line of text, will not turn into a item that can be copy and pasted.
this is just some notes
```

### Other Useful info

Every password entry you create will result in a new text file in your password store folder. The file will contain the GPG encrypted version of your entry.
You can access this data using pass, but you can also access it using the regular GPG tools - it is just a regular 'armor' encoded GPG encrypted message.
This means you do not need this app in order to read and access your password data.

In order to protect your data though, the filenames of all these separate password entries are just random (UUID's if you care). GPG Password Store keeps one other file to
keep track of these random files. `.db` is a simple database that contains a list of your passwords and the name of the file each password entry is stored in.
This db file is also encrypted using your keys, but again, you can decrypt it yourself with the GPG tools manually. It is just a simple JSON file.

### Using with git

If you want to keep a history of your password entries, a simple way to do this is to make you GPG Password Store folder into a git repo...

```
cd ~/.gpg-store
git init
```

As everything is just text files inside this folder, git can track your changes and you can commit from time to time and keep a history.

### Cloud Storage

GPG Password Store does nothing about cloud storage and does not connect to the internet - you can use it on devices with no internet access, without any issues at all.
If you want to keep a backup of your password data off-site though, you are free to use any service you have confidence in. GPG uses very secure encryption, and if you manage and protect your GPG private keys correctly, it should, in theory, be safe to store your encrypted password data in your iCloud / Dropbox / Google Drive folder. If you are also using git, you could also just push the repo to a remote server too. However, you'll have to make your own choices about this, depending on how confident you are in your key storage and how safe you feel the service you use is. GPG Password Store will only ever write encrypted data into the folder.

It's worth knowing that there is nothing clever going on though. You can simply copy the files out of the folder onto anything you need to. Copy them to a USB stick, a NAS Drive, S3, whatever. Restoring is as simple as copying them back again. **Make sure you get the hidden .db file too.**

### My keys are expiring soon - what do I do....?

You can either extend the expiry date of your keys, or switch to using new keys.

To switch your store to a new GPG key, use `pass init NewKeyName`. Everything will be re-encrypted to this new key, and it will be the one used for future activity.

To add an extra key, so both your current key, OR the new key can be used, then `pass init OldKey,NewKey` can be used. Everything will be re-encrypted such that it can be decrypted with either of the keys listed.

**Note:** You will need access to the private keys to be able to decrypt data again. Good idea to take a backup of your store before changing the keys

### Can I use a YubiKey

Yes. Setting it up can be tricky, but here is a good guide that will cover even the most paranoid of you...

https://github.com/drduh/YubiKey-Guide

## Credits

Heavily inspired by https://www.passwordstore.org/

Word list taken from https://www.npmjs.com/package/password (uses the UNLICENSE license)
