import c from 'ansi-colors'

c.theme({
    heading: c.bold.greenBright,
    muted: c.dim,
    primary: c.cyan,
    success: c.green,
    info: c.blueBright,
    warning: c.yellowBright,
    danger: c.bold.redBright,

    placeholder: c.cyan,
    strong: c.bold,
    dark: c.dim.gray,
    disabled: c.gray,
    em: c.italic.blueBright,
    underline: c.underline,
})

export const styles = c

export class Terminal {
    constructor(options = {}) {
        this.stdout = options.stdout || process.stdout
    }

    write(msg) {
        this.stdout.write(msg)
    }

    heading(msg) {
        this.write(c.heading(msg))
    }

    result(msg) {
        this.write(c.warning(msg))
    }

    bright(msg) {
        this.write(c.bold.whiteBright(msg))
    }

    muted(msg) {
        this.write(c.muted(msg))
    }

    primary(msg) {
        this.write(c.primary(msg))
    }

    success(msg) {
        this.write(c.success(msg))
    }

    info(msg) {
        this.write(c.info(msg))
    }

    warning(msg) {
        this.write(c.warning(msg))
    }

    danger(msg) {
        this.write(c.danger(msg))
    }

    error(msg) {
        this.write(c.red(msg))
    }
}

export const term = new Terminal()
export default term
