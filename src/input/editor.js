import { spawn } from 'node:child_process';
import FileServices from '../common/file-services.js'
import term from '../input/terminal.js'

// export default async function editor(content) {
//     return edit(content)
// }

function deleteFile(file) {
    if (!FileServices.deleteFileRaw(file)) {
        term.error(`Failed to delete file ${file}\n`);
    } else {
        term.muted(`Deleted tmp file OK\n`);
    }
}

export default async function editor(content) {
    term.muted(`Editing...\n`);

    // Get the user's preferred editor from environment
    const editor = process.env.EDITOR || process.env.VISUAL || 'vi';

    // Create a temporary file
    const tmpFile = FileServices.generateTempFilename();

    // Write initial content to the temp file
    FileServices.writeFileRaw(tmpFile, content);

    return new Promise((resolve, reject) => {
        // Spawn the editor process
        const editorProcess = spawn(editor, [tmpFile], {
            stdio: 'inherit', // This allows the editor to use the terminal
            shell: true
        });

        editorProcess.on('exit', (code) => {
            if (code === 0) {
                // Read the edited content
                const editedContent = FileServices.readFileRaw(tmpFile);

                // Clean up the temp file
                deleteFile(tmpFile);
                resolve(editedContent);
            } else {
                // Clean up on error too
                deleteFile(tmpFile);
                reject(new Error(`Editor exited with code ${code}`));
            }
        });

        editorProcess.on('error', (err) => {
            // Clean up on error
            deleteFile(tmpFile);
            reject(err);
        });
    });
}
