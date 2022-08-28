import clipboard from 'clipboardy'

let isEnabled = true
let hasWrittenToClipboard = false

export function disableClipboard() {
    isEnabled = false
}

export function hasClipboardBeenChanged() {
    return hasWrittenToClipboard
}

export function copyToClipboard(content) {
    if (!isEnabled) { return }

    // Clip the content to the clipboard
    clipboard.writeSync(content)
    hasWrittenToClipboard = true
}

export function clearClipboardIfNeeded() {
    if (!isEnabled) { return }

    // If we've not changed the clipboard, no need to clear it later
    if (!hasWrittenToClipboard) {
        return
    }

    clipboard.writeSync('')
}
