import { edit } from 'external-editor'


export default async function editor(content) {
    return edit(content)
}

