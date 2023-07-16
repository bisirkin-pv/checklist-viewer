function getUID(){
    return Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36)
}

class ChecklistContainer{
    constructor(title, cheklistItems){
        this.uid = getUID()
        this.title = title
        this.items = cheklistItems
    }
    getHTML(){
        return `
        <div class="checklist-block" data-id="${this.uid}">
            <div class="checklist-header">${this.title}</div>
            <div class="checklist-content">
                ${this.items.getHTML()}
            </div>
        </div>
        `
    }
}

class ChecklistLine{
    constructor(title, detail, done=false){
        this.uid = getUID()
        this.title = title
        this.detail = detail
        this.done = done
    }
    toggleDone(){
        this.done = !this.done
    }
    getHTMLDetail(){
        return `
        <div class="checklist-content-list-button up-chevron"></div>
        <div class="checklist-content-list-detail hidden">${this.detail}</div>
        `
    }
    getHTML(){
        return `
        <div class="checklist-content-list" data-id="${this.uid}">
            <input type="checkbox" class="checklist-content-list-input" name="${this.uid}"/>
            <label class="checklist-content-list-title" for="${this.uid}">${this.title}</label>
            ${this.detail ? this.getHTMLDetail() : ''}
        </div>
        `
    }
}

class ChecklistLines{
    constructor(){
        this.items = []
    }
    add(checklistLine){
        this.items.push(checklistLine)
    }
    getHTML(){
        let html = ''
        for(const item of this.items){
            html += item.getHTML()
        }
        return html
    }
}

class ChecklistContainers{
    constructor(){
        this.containers = []
    }
    add(checklistContainer){
        this.containers.push(checklistContainer)
    }
    getHTML(){
        let html = ''
        for(const container of this.containers){
            html += container.getHTML()
        }
        return html
    }
}


/**
 * Main class
 * Build and render checklist use json data
 * @param {String} elementId - root element id for render checklist
 * 
 * example use:
 *  import {ChecklistBuilder} from "./checklistViewer.js"
    const checklistBuilder = new ChecklistBuilder('content_checklist')
    checklistBuilder.build(json)
 */
export class ChecklistBuilder{
    constructor(elementId){
        this.elementId = elementId
        this.checklistContainers = new ChecklistContainers()
        this.container = document.getElementById(this.elementId)
        this._error = false
        this.title = 'Checklist'
        if(!this.container){
            this._error = true
            console.error('Error: (ChecklistBuilder) Not found root element')
        }
    }

    build(json){
        if(this._error) return
        this.addClass()
        this.parse(json)
        this.setPageTitle()
        this.setHTML()
        this.initListener()
    }

    addClass(){
        this.container.classList.add('checklist')
    }

    parse(json){
        this.title = json.title
        
        for(const item of json.items){
            this.checklistContainers.add(this.setChecklist(item))
        }
    }

    setChecklist(checklist){
        const items = this.setChecklistItems(checklist.items)
        return new ChecklistContainer(checklist.text, items) 
    }

    setChecklistItems(items){
        const checklistLines = new ChecklistLines()
        for(const item of items){
            const detail = item.blocks?.length ?  item.blocks.map(el=>`<p>${el}</p>`).join() : null
            const checklistLine = new ChecklistLine(item.text, detail)
            checklistLines.add(checklistLine)
        }
        return checklistLines
    }

    setPageTitle(){
        this.container.innerText = `
            <div class="checklist-title">
                ${this.title}
            </div>
            ${this.container.innerText}
        ` 
    }

    setHTML(){
        this.container.innerHTML =  `
            ${this.container.innerText}
            ${this.checklistContainers.getHTML()}
        `
    }

    initListener(){
        this.container.addEventListener('click', this.onClickHandler)
    }

    destroyListener(){
        this.container.removeEventListener('click', this.onClickHandler)
    }

    onClickHandler(event) {
        this.buttonClickHandler(event)
        this.itemTitleClickHandler(event)
        this.checkboxClickHandler(event)        
    }

    buttonClickHandler(event){
        if(event.target.classList.contains('checklist-content-list-button')){
            const id = event.target.parentNode.dataset.id
            const element = document.querySelector(`.checklist-content-list[data-id="${id}"] .checklist-content-list-detail`)
            element.classList.toggle('hidden')
            target.classList.toggle('up-chevron')
            target.classList.toggle('down-chevron')
        }
    }

    itemTitleClickHandler(event){
        if(event.target.classList.contains('checklist-content-list-title')){
            const id = event.target.parentNode.dataset.id
            const element = document.querySelector(`.checklist-content-list[data-id="${id}"]`)
            element.classList.toggle('checked')
            const checkbox = element.querySelector(`.checklist-content-list-input`)
            checkbox.checked = !checkbox.checked
        }
    }

    checkboxClickHandler(event){
        if(event.target.classList.contains('checklist-content-list-input')){
            const id = event.target.parentNode.dataset.id
            const element = document.querySelector(`.checklist-content-list[data-id="${id}"]`)
            element.classList.toggle('checked')
        }
    }

}