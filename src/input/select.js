import enquirer from 'enquirer'

export default class ValueSelect extends enquirer.Select {
    async result() {
        return this.selected.value
    }
}
