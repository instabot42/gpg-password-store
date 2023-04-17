import enquirer from 'enquirer'

export default class AutoCompleteTimeout extends enquirer.AutoComplete {
    constructor(options = {}) {
        super(options)
        this.timeoutDelay = options.timeoutDelay || 15000
        this.timeout = null
        this.initialSearch = options.initialSearch || ''
    }

    async initialize() {
        await super.initialize()

        if (this.initialSearch !== '') {
            this.input = this.initialSearch
            this.cursor = this.initialSearch.length
            await this.complete()
        }
    }

    async close() {
        clearTimeout(this.timeout)
        this.timeout = null
        await super.close()
    }

    resetTimeout() {
        clearTimeout(this.timeout)
        this.timeout = setTimeout(() => this.cancel(), this.timeoutDelay)
    }

    format() {
        if (!this.focused) return this.input
        if (this.options.multiple && this.state.submitted) {
            return this.selected.map((ch) => this.styles.primary(ch.message)).join(', ')
        }
        if (this.state.submitted) {
            this.value = this.input = this.focused.value
            const part = this.selected.name.split(' =>')
            return this.styles.primary(part[0])
        }
        return this.input
    }

    async render() {
        await super.render()
        this.resetTimeout()
    }
}
