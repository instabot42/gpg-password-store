import listCommand from "./list.js";
import showCommand from "./show.js";

// Maybe try and make this behave a little more like standard pass (ie, less interactive)
export default async function defaultCommand(defaultName, options) {
    if (defaultName === '') {
        return listCommand(options)
    }

    return showCommand(defaultName, options)
}