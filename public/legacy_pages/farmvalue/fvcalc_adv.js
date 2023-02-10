var data = {};

var research = null;
var orders = null;
var eggTypes = null;
var habs = null;
var vehicles = null;

var _UI = {
    init: {
        egg0: 0,
        hab0: 1,
        hab1: 0,
        hab2: 0,
        hab3: 0,
        fleet0: 1,
        fleet1: 0,
        fleet2: 0,
        fleet3: 0
    },
    egg: [],
    hab: [],
    fleet: [],
    silos: [],
    shippingCapacity: [],
    research: [],
    mysticalEggs: []
}

var rawData = {};

var parameters = {};
var d = new Date();
var timeStamp = d.getTime();

$.when(
    //LOAD JSON
    
    $.getJSON('research.json?' + timeStamp, 
    function(jsonData) {
        research = jsonData;
    }).error(function(jqXHR, textStatus, errorThrown){
		alert(textStatus + ' in ' + jqXHR + ' - ' + errorThrown)
    }),
    $.getJSON('orders.json?' + timeStamp, 
    function(jsonData) {
        orders = jsonData;
    }).error(function(jqXHR, textStatus, errorThrown){
        alert(textStatus + ' in ' + jqXHR + ' - ' + errorThrown)
    }),
    $.getJSON('eggTypes.json?' + timeStamp, 
    function(jsonData) {
        eggTypes = jsonData;
        data['egg'] = jsonData;
    }).error(function(jqXHR, textStatus, errorThrown){
        alert(textStatus + ' in ' + jqXHR + ' - ' + errorThrown)
    }),
    $.getJSON('habs.json?' + timeStamp, 
    function(jsonData) {
        habs = jsonData;
        data['hab'] = jsonData;
    }).error(function(jqXHR, textStatus, errorThrown){
        alert(textStatus + ' in ' + jqXHR + ' - ' + errorThrown)
    }),
    $.getJSON('vehicles.json?' + timeStamp, 
    function(jsonData) {
        vehicles = jsonData;
        data['fleet'] = jsonData;
    }).error(function(jqXHR, textStatus, errorThrown){
        alert(textStatus + ' in ' + url + ' - ' + errorThrown)
    }),
$.ready).done(function() {
    $(function(){
        init();
    }),
    //TOOLTIPS
    $('.tooltip').on({
        'click': function() {
          $(this).tooltip({ 
              items: '.tooltip', 
              content: '<p class="loading">Loading...</p><img class="tooltipImg" src="./images/tooltips/' + $(this).parent().next()[0].id + '.png"/>', 
              tooltipClass: 'tooltipBox',
            })
          $(this).tooltip('open');
        },
        'mouseout': function() {      
            if ($('.tooltipBox').length > 0) {
                $(this).tooltip('disable');
            }
        }
    });
    //ACCORDION
    $('.accordion').accordion({
        collapsible: true,
        icons: false,
        heightStyle: 'content'
    });
    //INPUT VALIDATION
    $('input.number').limitRegex(/^(\d{1,3},?)*$/, function() { 
        // add a design change when the regex fails
        $(this).css("border-color", "red");
    }).on("keydown blur", function() {
        // remove the design change when the user types a key or exits the textbox
        $(this).css("border-color", "");
    }).on('keyup',function() {
        $(this).val(function() {
            return Number((this.value).replace(/(,)/g, '')).toLocaleString('en-US');
        })
    });

    $("input.symbol").limitRegexs(/^(\d{1,3},?)*$/, 
    function() {
        var validSymbols = []
        for(i = 0; i < orders.length; i++) {
            validSymbols.push(orders[i].symbol)
        }
        return RegExp('^\\d{1,3}(\\.?((\\d{1,3})?(' + validSymbols.toString().replace(/,/g, '|') + ')?)?)?$');
    }(),
    function() { 
        // add a design change when the regex fails
        $(this).css("border-color", "red");
        $(this).tooltip({ 
            items: 'input.symbol', 
            content: 'Please enter the value as shown in the game. See tooltip for help.', 
            tooltipClass: 'regex',
          })
        $(this).tooltip('open');
    }).on("keydown blur", function() {
        // remove the design change when the user types a key or exits the textbox
        $(this).css("border-color", "");
        $(this).tooltip('disable');
    });
    
    // $(':input').on('change',
    // function() {
    //     Number((this.value).replace(/(,)/g, '')).toLocaleString('en-US');
    //     update();
    // });
});

$.fn.limitRegex = function(regex, onFail) {
    var pastValue, pastSelectionStart, pastSelectionEnd;
    this.on("keydown", function() {
        pastValue          = this.value;
        pastSelectionStart = this.selectionStart;
        pastSelectionEnd   = this.selectionEnd;
    });
    this.on("input propertychange", function() {
        if (this.value.length > 0 && !regex.test(this.value)) {
            if (typeof onFail === "function") {
                onFail.call(this, this.value);
            }            
            this.value          = pastValue;
            this.selectionStart = pastSelectionStart;
            this.selectionEnd   = pastSelectionEnd;
        }
    }); 
    return this;
};

$.fn.limitRegexs = function(regexA, regexB, onFail) {
    var pastValue, pastSelectionStart, pastSelectionEnd;
    this.on("keydown", function() {
        pastValue          = this.value;
        pastSelectionStart = this.selectionStart;
        pastSelectionEnd   = this.selectionEnd;
    });
    this.on("input propertychange", function() {
        if (this.value.length > 0 && !(regexA.test(this.value) || regexB.test(this.value)) ) {
            if (typeof onFail === "function") {
                onFail.call(this, this.value);
            }            
            this.value          = pastValue;
            this.selectionStart = pastSelectionStart;
            this.selectionEnd   = pastSelectionEnd;
        }
    }); 
    return this;
};

class Input {
    constructor(options) {
        this.element = options.element;
        this.type = options.type;
        this.name = options.name;
        this.scope = document.getElementById(options.containerID);
        this.minValue = options.minValue === undefined ? null : options.minValue;
        this.maxValue = options.maxValue === undefined ? null : options.maxValue;
        this.value = options.defaultValue;
        this.defaultValue = options.defaultValue;
        this.class = options.class === undefined ? null : options.class;
        this.createDOMObject();
    }
    createDOMObject() {
        let scope = this.scope;
        
        if (this.type === 'range') {
            let minNode = document.createElement('h6');
            let minNodeText = document.createTextNode(this.minValue);
                minNode.appendChild(minNodeText);
            
            scope.append(minNode);
        }

        let input = document.createElement('input');
            input.type = this.type;
            input.autocomplete = 'off';
            input.autofill = 'off';
            input.id = this.name;
            input.min = this.minValue;
            input.max = this.maxValue;
            input.value = this.value;
            if (this.class !== undefined) {
                input.className += this.class;
            }
            (function(instance) {
                ['input', 'change'].forEach((event) =>
                    input.addEventListener(event, () => {
                        instance.value = Number(input.value.replace(/\D/g, ''));
                        if (instance.type === 'range') {
                            document.getElementById(instance.name + 'SliderValue').innerHTML = input.value;
                            rawData[input.id] = input.value;
                        }
                        if (instance.type === 'tel') {
                            rawData[input.id] = Number(input.value.replace(/\D/g, ''));
                        }
                        if (instance.type === 'text') {
                            rawData[input.id] = input.value;
                        }
                    })
                );
            })(this);

        scope.children[0].parentNode.insertBefore(input, scope.children[0].nextSibling)

        if (this.type === 'range') {
            let maxNode = document.createElement('h6');
                maxNode.id = this.name + 'SliderMax';
            let maxNodeText = document.createTextNode(this.maxValue);
                maxNode.appendChild(maxNodeText);
            
            scope.append(maxNode);

            document.getElementById(this.name + 'SliderValue').innerHTML = this.value
        }
    }
    reset() {
        this.value = this.defaultValue;
        rawData[this.name] = this.defaultValue;
    }
}

class Slot {
    constructor(options) {
        this.index = options.i
        this.context = options.context;
        this.text = options.text;
        this.createDOMObject();
        this.dropdown = new Select(options);
    }
    createDOMObject() {
        var scope = document.getElementById(this.context);
        var node = document.createElement('div');
            node.id = this.context + 'SlotContainer' + this.index;
        scope.append(node);

            scope = document.getElementById(this.context + 'SlotContainer' + this.index);
            node = document.createElement('div');
            node.id = this.context + this.index;
            node.className = 'dropdown';
            node.setAttribute('name', this.context);
            scope.append(node);
            
            if (this.context !== 'egg') {
                node = document.createElement('h5');
                node.className = this.context + 'Title hCenter';
            var textNode = document.createTextNode(this.text + ' ' + (this.index + 1));
                node.appendChild(textNode);
                scope.append(node);
            }

            scope = document.getElementById(this.context + this.index);
            node = document.createElement('img');
            node.id = this.context + this.index + 'Selected';
            scope.append(node);
            
            node = document.createElement('br');
            scope.append(node);

            node = document.createElement('h5');
            node.id = this.context + this.index + 'SelectedName';
            scope.append(node);
    }
    popDOMObject() {
        let scope = document.getElementById('fleet');
        scope.removeChild(scope.children[scope.children.length - 1])
    }
}

class Select {
    constructor(options) {
        this.context = options.context;
        this.name = options.name;
        this.scope = document.getElementById(options.container).parentNode.parentNode;
        this.listenerScope = document.getElementById(options.name);
        this.itemData = data[options.context];
        this.items = [];
        this.selected = rawData[options.context][options.i] == null ? 0 : rawData[options.context][options.i] ;
        this.tag = this.itemData[this.selected].tag;
        this.createDropdownObject(options);
    }
    createDropdownObject(options) {
        let node = document.createElement('div');
            node.id = options.name + 'Dropdown';
            node.className = 'dropdownContent';
        this.scope.append(node);
        for (let index = 0; index < this.itemData.length; index++) {
            this.addItem(options, index)
        };
        window.addEventListener('click', function (evt) {
            if (currentNode && evt.target.id !== currentNode.id) {
                closeDropdown(currentNode.id);
                currentNode = false;
            }
        });
        this.listenerScope.addEventListener('click', (evt) => {
            if (currentNode) {
                closeDropdown(currentNode.id);
            }
            openDropdown(node.id);
            currentNode = node;
            evt.stopPropagation();
        });
    }
    addItem(options, index) {
        let e = new DropdownItem(options, index);
        this.items.push(e['textName']);
    }
}

class DropdownItem {
    constructor(options, index) {
        this.index = options.i;
        this.context = options.container;
        this.scope = document.getElementById(options.name + 'Dropdown');
        this.className = options.context + 'Option';
        this.id = options.context + 'Option' + index;
        this.textName = data[options.context][index]['name'];
        this.createDOMObject(options, index);
    }
    createDOMObject(options, index) {
        let node = document.createElement('div');
            node.className = this.className;
            node.id = this.id;
        this.scope.append(node);

        let item = this.scope.children[index];
        let imgNode = document.createElement('img');
            imgNode.setAttribute('src', './images/' + options.context + '/' + options.context + index + '.png');
        item.append(imgNode);

        let nameNode = document.createElement('h5');
        let textNode = document.createTextNode(this.textName);
            nameNode.appendChild(textNode);
            item.append(nameNode);

        item.addEventListener('click', () => {
            _UI[this.context][this.index].dropdown.selected = index;
            _UI[this.context][this.index].dropdown.tag = data[this.context][index].tag;
            rawData[this.context][this.index] = index;
            update();
        });
    }
}

class ResearchTier {
    constructor(research, index) {
        this.index = index;
        this.tier = research[index].tier;
        this.title = research[index].title;
        this.research = [];
        this.createDOMObject(research, index);
    }
    createDOMObject(research) {
        let scope = document.getElementById('researchAccordion');

        let node = document.createElement('div');
            node.className = 'tierHeadingBox';

        let headingNode = document.createElement('h4');
            headingNode.className = 'researchTier';
            headingNode.id = 'tier' + this.tier;
        let textNode = document.createTextNode(this.title);
        headingNode.appendChild(textNode);
        node.appendChild(headingNode);

        let buttonNode = document.createElement('a');
            buttonNode.className = 'maxButton right';
        let maxText = document.createElement('h5');
            maxText.className = 'hCenter'
            textNode = document.createTextNode('Max Tier');
        maxText.appendChild(textNode);
        buttonNode.appendChild(maxText);
        (function(index) {
            buttonNode.addEventListener('click', (e) => {
                if (_UI.research[index].title === 'Epic Research') {
                    _UI.research[index].max();
                }
                else {
                    for (let i = 0; i <= index; i++) {
                    _UI.research[i].max();
                    }
                }
                let scope = e.target.parentElement;
                if (scope.nextElementSibling === null) {
                    scope = scope.parentElement;
                }
                if (scope.nextElementSibling.style.display !== 'none') {
                    e.stopPropagation();
                }
            });
        })(this.index)
        
        node.append(buttonNode);
        scope.append(node);

            node = document.createElement('div');
            node.className = 'researchElementsGroup';
            node.id = 'tier' + research[i].tier + 'Research';
        
        scope.append(node);
    }
    addResearch(research, tierIndex, index) {
        let a = new ResearchItem(research, tierIndex, index);
        this.research.push(a);
    }
    max() {
        for (index in this.research) {
            this.research[index].max();
        }
    }
}

class ResearchItem {
    constructor(research, tierIndex, index) {
        this.index = index;
        this.tierIndex = tierIndex;
        this.tier = research[tierIndex].tier;
        this.name = research[tierIndex].research[index].name;
        this.value = rawData.research[tierIndex][index];
        this.maxLevel = research[tierIndex].research[index].maxLevel;
        this.description = research[tierIndex].research[index].description;
        this.factor = research[tierIndex].research[index].factor;
        this.factorType = research[tierIndex].research[index].factorType;
        this.parameter = research[tierIndex].research[index].parameter;
        this.tag = research[tierIndex].research[index].tag;
        this.createDOMObject();
    }
    createDOMObject() {
        let scope = document.getElementById('tier' + this.tier + 'Research')
        
        let imageDiv = document.createElement('a');
            imageDiv.style.position = 'relative';
            (function(instance) {
                imageDiv.addEventListener('click', (e) => {
                    instance.max();
                    e.stopPropagation;
                });
            })(this);

        let image = document.createElement('img');
            image.className = 'researchImage';
            image.setAttribute('src', './images/research/' + this.tier +'-' + this.index + '.png')

        let imageText = document.createElement('span');
            imageText.className = 'imageMaxButton';
        let imageTextText = document.createTextNode('Max');
            imageText.appendChild(imageTextText);

            imageDiv.append(image, imageText);
            
        let input = document.createElement('input');
            input.className = 'researchInput';
            input.id = this.tier + '-' + this.index;
            input.setAttribute('type', 'number');
            input.setAttribute('defaultValue', '0');
            input.setAttribute('min', '0');
            input.setAttribute('max', String(this.maxLevel));
            (function(instance) {
                input.addEventListener('change', () => {
                    let value = Number(input.value) > Number(input.max) ? Number(input.max) : Number(input.value);
                    instance.value = value;
                    rawData['research'][instance.tierIndex][instance.index] = value;
                })
            })(this);
        
        let name = document.createElement('h5');
            name.className = 'researchElements tier' + this.tier;
        let nameText = document.createTextNode(this.name);
        name.appendChild(nameText);
        
        let description = document.createElement('p');
            description.className = 'researchElementsDescription';
        let descriptionText = document.createTextNode(this.description);
        description.appendChild(descriptionText);

        scope.append(imageDiv, input, name, description)
    }
    max() {
        this.value = this.maxLevel;
        rawData['research'][this.tierIndex][this.index] = Number(this.value);
        update();
    }
}

function initialData() {
    // EGG
    rawData['egg'] = [0];
    // HABS
    rawData['hab'] = [1, 0, 0, 0];
    // FLEET
    rawData['fleet'] = [1, 0, 0, 0];
    // SILOS
    rawData['silos'] = 1;
    // POPULATION
    rawData['population'] = 1000;
    // SHIPPING CAPACITY
    rawData['shippingCapacity'] = "6000"
    // RESEARCH
    rawData['research'] = [];
    for (tier in research) {
        rawData.research[tier] = [];
        for (item in research[tier].research) {
            rawData.research[tier][item] = 0;
        }
    }
    // MYSTICAL EGGS
    rawData['soulEggs'] = 0;
    rawData['prophecyEggs'] = 0;
}

function init() {
    initialData();
    retreiveData();
    resetParameters();
    createSlots();
    createFleetSlots();
    populateResearch();
    update();
    setHandlers();
    expand('hab');
    expand('fleet');
    collapse('habSummary');
    collapse('fleetSummary');
}
let currentNode = false; // NOT SURE WHERE TO PUT THIS DECLARATION TO KEEP IT TIDY. CALLED ON IN THE SELECT CLASS

function createSlots() {
    // EGG
    _UI.egg.push(
        new Slot({
            i: 0,
            context: 'egg',
            container: 'egg',
            name: 'egg0'
        })
    );
    // HABS
    for (let i = 0; i < 4; i++) {
        _UI.hab.push(
            new Slot({
                i: i,
                context: 'hab',
                text: 'Hab',
                container: 'hab',
                name: 'hab' + i
            })
        )
    }
    //SILOS
    _UI['silos'] = (
        new Input({
            type: 'range',
            name: 'silos',
            containerID: 'silosSliderContainer',
            minValue: 1,
            maxValue: 10,
            defaultValue: 1
        })
    )
    // _UI['population'] = (
    //     new Input({
    //         type: 'range',
    //         name: 'population',
    //         containerID: 'populationSliderContainer',
    //         minValue: 0,
    //         maxValue: 1000,
    //         defaultValue: 1000
    //     })
    // )
    // SHIPPING CAPACITY
    _UI.shippingCapacity.push(
        new Input({
            type: 'text',
            name: 'shippingCapacity',
            containerID: 'shippingCapacityBox',
            minValue: 5000,
            defaultValue: 5000,
            class: 'symbol'
        }),
    );
    // MYSTICAL EGGS
    _UI.mysticalEggs.push(
        new Input({
            type: 'tel',
            name: 'soulEggs',
            containerID: 'soulEggsBox',
            minValue: 0,
            defaultValue: 0
        }),
    );
    _UI.mysticalEggs.push(
        new Input({
            type: 'tel',
            name: 'prophecyEggs',
            containerID: 'prophecyEggsBox',
            minValue: 0,
            defaultValue: 0
        })
    );
}

function updateUI() {
    // FARM VALUE
    if (data.egg[rawData.egg[0] + 1] !== undefined) {
        if (parameters.farmValue >= data.egg[rawData.egg[0] + 1].unlock) {
            document.getElementById('farmValue').classList.add('pulse');
            document.getElementById('bockImg').classList.add('shake');
        }
        else {
            document.getElementById('farmValue').classList.remove('pulse');
            document.getElementById('bockImg').classList.remove('shake');
        }
    }
    else {
        document.getElementById('farmValue').classList.remove('pulse');
        document.getElementById('bockImg').classList.remove('shake');
    } //not the most elegant way to write this logic but it is the fastest

    // DROPDOWNS
    document.querySelectorAll('.dropdown-select').forEach( (node) => {
        node.classList.remove('dropdown-select');
    });
    for (key of ['egg', 'hab', 'fleet']) {
        for (index in _UI[key]) {
            let value = _UI[key][index];
            document.getElementById(key + index + 'Selected')
                .setAttribute('src', './images/' + value.dropdown.context + '/' + value.dropdown.context + value.dropdown.selected + '.png');
            document.getElementById(key + index + 'SelectedName')
                .innerText = value.dropdown.items[value.dropdown.selected];
            document.getElementById(key + index + 'Dropdown').children[value.dropdown.selected]
            .classList.add('dropdown-select');
        }
    }
    // SILOS
    document.getElementById('silos').value = rawData.silos;
    document.getElementById('silosSliderValue').innerHTML = rawData.silos;
    // SHIPPING CAPACITY
    document.getElementById('shippingCapacity').value = rawData['shippingCapacity'].toLocaleString('en-US');
    // RESEARCH
    document.querySelectorAll('.researchInput').forEach( (node) => {
        let tier = Number(node.id.match(/^\d+/));
        let index = Number(node.id.match(/\d+$/));
        var tierIndex = null;
        for (i in _UI.research) {
            if (_UI.research[i].tier === tier) {
                tierIndex = i;
                break
            }
        }
        node.value = _UI.research[tierIndex].research[index].value;
    });
    //MYSTICAL EGGS 
    for (instance of _UI.mysticalEggs) {
        document.getElementById(instance.name).value = rawData[instance.name].toLocaleString('en-US');
    }
}

function createFleetSlots() {
    let oldFleetLength = _UI.fleet.length
    let delta = parameters.maxFleetSize - oldFleetLength;
    if (delta > 0) {
        for (let i = 0; i < delta; i++) {
            _UI.fleet.push(new Slot({
                i: _UI.fleet.length,
                context: 'fleet',
                text: 'Vehicle',
                container: 'fleet',
                name: 'fleet' + _UI.fleet.length
            }) )
        }
    }
    else if (delta < 0) {
        for (let i = _UI.fleet.length; i > oldFleetLength + delta; i--) {
            _UI.fleet[i - 1].popDOMObject(i - 1);
            _UI.fleet.pop();
        }
    }
}

function populateResearch() {
    for (i in research) {
        let a = new ResearchTier(research, i)
        _UI.research.push(a)

        for (j in research[i].research) {
            a.addResearch(research, i, j);
        }
    }
}

function setHandlers() {
    //SELECT FIELDS ON CLICK
    $('input').on('click',
    function() {
        this.select();
        $(this).off('click');
    });
    //CALCULATE
    $('input').on('change',
    function() {
        update();
    });
    //RESET BUTTONS
    let resetButtons = []
    resetButtons.push(document.getElementById('resetFarm'), document.getElementById('resetAll'));
    for (node of resetButtons) {
        (function(id) {
            node.addEventListener('click', () => {
                //RESET CODE GOES HERE
                for (i in _UI.research) {
                    for (j in _UI.research[i].research) {
                        if (_UI.research[i].title !== 'Epic Research') {
                            _UI.research[i].research[j].value = 0;
                            rawData.research[i][j] = 0;
                        }
                        else if (id === 'resetAll') {
                            _UI.research[i].research[j].value = 0;
                            rawData.research[i][j] = 0;
                        }
                    }
                }
                _UI.egg[0].dropdown.selected = 0;
                rawData.egg = [0];
                for (i in _UI.hab) {
                    _UI.hab[i].dropdown.selected = _UI.init['hab' + i];
                    rawData.hab[i] = _UI.init['hab' + i];
                }
                for (i in _UI.fleet) {
                    _UI.fleet[i].dropdown.selected = _UI.init['fleet' + i];
                    rawData.fleet[i] = _UI.init['fleet' + i];
                }
                if (id === 'resetAll') {
                    _UI.silos.reset();
                    for (i in _UI.mysticalEggs) {
                        _UI.mysticalEggs[i].reset();
                    }
                }
                update();
            })
        })(node.id)
    }
    //EXPAND BUTTON
    document.addEventListener("click", function(evt) {
        var targetElement = evt.target;
        if (RegExp(/expand$/i).test(targetElement.id)) {
            var toDisplay = null;
            var toCollapse = null;
            if (document.getElementById(targetElement.name + 'Summary').style.display !== 'none') {
                toDisplay = targetElement.name;
                toCollapse = targetElement.name + 'Summary';
                targetElement.innerHTML = 'Collapse';
            }
            else {
                toDisplay = targetElement.name + 'Summary';
                toCollapse = targetElement.name;
                targetElement.innerHTML = 'Expand';
            }
            expand(toDisplay);
            collapse(toCollapse);
        }
    });
}

function expand(elementID) {
    var element = document.getElementById(elementID);
    element.style.display = 'flex';
}

function collapse(elementID) {
    var element = document.getElementById(elementID);
    element.style.display = 'none';
}

function openDropdown(elementID) {
    var element = document.getElementById(elementID);
    element.style.display = 'flex';
}

function closeDropdown(elementID) {
    var element = document.getElementById(elementID);
    element.style.display = 'none';
}

function getInputValue(elementID) {
    var x = (document.getElementById(elementID).value);
    var y = Number(x.replace(/\D/g, ""));
    if (document.getElementById(elementID).type == 'select-one') {
        return y;
    }
    else if (/\D$/.test(x)) {
        return  (x.replace(/\D*$/, '')) * Math.pow(10, (magnitudeGet(String(x.match(/\D*$/)))));
    }
    else {
        return y;
    }
}

function magnitudeGet(str) {
    let key = String(str.match(/([A-z]{1,2})$/g));
    //console.log('Key: ' + key);
    for(var i = 0; i < orders.length; i++) {
        if(orders[i].symbol === key) {
            return orders[i].magnitude;
        }
    }
    return 0;
}

function convertName(n) { //converting the format of unreadable number into the game's name format
    if (isNaN(n)) {
        return 'Need More Info';
    }
    else if (levelOf(n) < 1){
        return Math.floor(n).toLocaleString();
    }
    else if (levelOf(n) <= orders.length) {
        return Math.round((n / cutoffOf(n)) * 1000) / 1000 + ' ' + (orders[levelOf(n)-1].name);
    }
    else {
        return Math.round((n / cutoffOf(n)) * 1000) / 1000 + '[e' + ((levelOf(n) + 1) * 3) + ']';
    }
}

function convertSymbol(n, rounding) { //converting the format of unreadable number into the game's symbol format
    if (levelOf(n) < 1){
        return (Math.floor(n) !== n ? n.toLocaleString(undefined, {minimumFractionDigits: rounding, maximumFractionDigits: rounding}) : n.toLocaleString());
    }
    else if (levelOf(n) <= orders.length) {
        return Math.round((n / cutoffOf(n)) * 1000) / 1000 + (orders[levelOf(n)-1].symbol);
    }
    else {
        return Math.round((n / cutoffOf(n)) * 1000) / 1000 + 'e' + ((levelOf(n) + 1) * 3)
    }
}

function levelOf(n) {
    return Math.floor(((Math.floor(Math.log(n) / Math.LN10 + 0.000000001)) / 3) - 1);
}

function cutoffOf(n) {
    return Math.pow(10,(Math.floor((((Math.log(n) * 1000)/(Math.log(10) * 1000)) * 1000 )/ 3000)) * 3);
}

function mergeObjects(object1, object2, object3) {
    var a = Object.keys(object1);
    var b = Object.keys(object2);
    var c = Object.keys(object3);
    for (var i = 0; i < b.length; i++) {
        for (var j = 0; j <a.length; j++) {
            if (b[i] === a[j]) {
                object1[a[j]] = (object1[a[j]] * (object2[b[i]] * 1000)) / 1000;
            }
        }
    }
    object1 = Object.assign(object2, object1);
    for (var i = 0; i < c.length; i++) {
        for (var j = 0; j <a.length; j++) {
            if (c[i] === a[j]) {
                object1[a[j]] += object3[c[i]];
            }
        }
    }
    object1 = Object.assign(object3, object1);
    return object1;
}

function storeData() {
    localStorage.rawData = JSON.stringify(rawData);
}

function retreiveData() {
    if (localStorage.rawData) {
        let savedData = JSON.parse(localStorage.rawData);
        validMerge(rawData, savedData);
    }
}

function validMerge(baseObject, newObject) {
    if (newObject) {
        for (i in newObject) {
            if (typeof newObject[i] === 'object') {
                validMerge(baseObject[i], newObject[i]);
            }
            else if (typeof newObject[i] === 'number') {
                baseObject[i] = newObject[i];
            }
            else if (typeof newObject[i] === 'string') {
                baseObject[i] = newObject[i];
            }
        }
    }
}

function printResults(parameters) {
    document.getElementById('farmValue').innerHTML = convertName(parameters['farmValue']);

    document.getElementById('prophecyEggTip').innerHTML = 5 + _UI.research[_UI.research.length-1].research[5].value + '%'

    document.getElementById('farmValueResult').innerHTML = convertName(parameters['farmValue']);
    document.getElementById('nextEggResult').innerHTML = data.egg[rawData.egg[0] + 1] === undefined ? 'You\'re at the final egg!' : convertName(data.egg[rawData.egg[0] + 1].unlock);
    document.getElementById('meBonusResult').innerHTML = Math.round(parameters['meBonus'] * 100).toLocaleString();
    document.getElementById('eggValueResult').innerHTML = convertSymbol(parameters['eggTypeValue'] * parameters['eggValue'], 2);
    document.getElementById('layingRateResult').innerHTML = convertSymbol((parameters['population'] * parameters['layingRate']));
    document.getElementById('hatchRateResult').innerHTML = parameters['hatchRate'].toLocaleString();
    document.getElementById('maxCapacityResult').innerHTML = Math.round(((parameters['habCapacity'] * 100) * (parameters['maxCapacity'] * 100)) / 10000).toLocaleString();
    document.getElementById('populationSliderMax').innerHTML = Math.round(((parameters['habCapacity'] * 100) * (parameters['maxCapacity'] * 100)) / 10000).toLocaleString();
    document.getElementById('vehicleCapacityResult').innerHTML = Math.round(parameters['vehicleCapacity'] * parameters['vehicleCapacityMultiplier']).toLocaleString();

    document.getElementById('smallDroneReward').innerHTML = convertSymbol(parameters['farmValue'] * 0.0001, 2);
    document.getElementById('mediumDroneReward').innerHTML = convertSymbol(parameters['farmValue'] * 0.0005, 2);
    document.getElementById('largeDroneReward').innerHTML = convertSymbol(parameters['farmValue'] * 0.0025, 2);
    document.getElementById('eliteDroneReward').innerHTML = convertSymbol(parameters['farmValue'] * 0.05, 2);
    
    document.getElementById('stackOfCash').innerHTML = convertSymbol(parameters['farmValue'] * 0.005, 2);
    document.getElementById('pileOfCash').innerHTML = convertSymbol(parameters['farmValue'] * 0.025, 2);
    document.getElementById('tonOfCash').innerHTML = convertSymbol(parameters['farmValue'] * 0.075, 2);

    document.getElementById('smallVideoReward').innerHTML = convertSymbol(parameters['farmValue'] * 0.025, 2);
    document.getElementById('largeVideoReward').innerHTML = convertSymbol(parameters['farmValue'] * 0.075, 2);
}

function findIndexByObject(array, key, objectName) {
    for (let index = 0; index < array.length; index++) {
        if (array[index][objectName] === key) {
            return index
        }
    }
}

function update() {
    updateUI();
    calculate();
    storeData();
}

function resetParameters() {
    parameters = {
        layingRate: 2, //eggs per minute per chicken
        eggValue: 1,
        hatchRefill: 1,
        runningBonus: 1,
        maxRunningBonus: 1.5,
        shippingCapacity: 5000,
        habCapacity: 1,
        hatchRate: 0,
        hatchCapacity: 1,
        vehicleCapacityMultiplier: 1,
        maxFleetSize: 4,
        silos: 1,
        meBonus: 0,
        accTricks: 1,
    };
}

function farmValueFormula(parameters) {
    //SUB CALCULATIONS
    let habSpace = Math.ceil(parameters.habCapacity * parameters.maxCapacity);
    let eggsMin = parameters.population * parameters.layingRate;
    let eggValue = (parameters.eggTypeValue * parameters.eggValue) * (1 + parameters.meBonus);
    let eggsDelivered = Math.min(parameters.shippingCapacity, eggsMin)
    let weightedPopulation = (Math.floor(eggsDelivered / parameters.layingRate) + (Math.ceil((eggsMin - eggsDelivered) / parameters.layingRate) * 0.2));
    let subValue1 = weightedPopulation + Math.pow(habSpace - parameters.population, 0.6) + (180 * parameters.hatchRate * parameters.silos)
    let subValue2 = parameters.accTricks  * parameters.eggMultiplier * parameters.layingRate / 2 * eggValue * 2000
    //FINAL CALCULATION
    parameters['farmValue'] = subValue1 * subValue2;
}

function calculate() {
    resetParameters();

    parameters['eggTypeValue'] = eggTypes[_UI.egg[0].dropdown.selected].value;
    parameters['eggMultiplier'] = 1 + (0.5 * _UI.egg[0].dropdown.selected);
    parameters['maxCapacity'] = function() {
        let total = 0;
        for (var i = 0; i < _UI.hab.length; i++) {
            total += habs[_UI.hab[i].dropdown.selected].capacity;
        }
        return total;
    }();

    for (tier of _UI.research) {
        var subParametersMultiplier = {};
        var subParametersSum = {};
        for (instance of tier.research) {
            let parameterKey = [];
                if (instance.parameter.constructor === Array) {parameterKey = instance.parameter} else { parameterKey.push(instance.parameter) };
            let factorType = instance.factorType;  
            let level = Number(instance.value);
            let value = instance.factor * level;
            let tag = instance.tag === undefined ? null : instance.tag;
            switch (tag) {
                case 'portalHab': {
                    let count = 0;
                    for (hab of _UI.hab) {
                        if(hab.dropdown.tag === 'portalHab') {
                            count++
                        }
                    }
                    value = (count / _UI.hab.length) * value;
                    subParametersMultiplier[parameterKey] = subParametersMultiplier[parameterKey] === undefined ? 1 + value : subParametersMultiplier[parameterKey] + value;
                }
                break;
                default:
                    for (key of parameterKey) {
                        if (factorType === 'multiplier') {
                            subParametersMultiplier[key] = subParametersMultiplier[key] === undefined ? 1 + value : subParametersMultiplier[key] + value;
                        }
                        else if (factorType === 'sum') {
                            subParametersSum[key] = subParametersSum[key] === undefined ? 0 + value : subParametersSum[key] + value;
                        }
                        else if (factorType === 'power') {
                            if (subParametersMultiplier[key] === undefined) {
                                subParametersMultiplier[key] = 1
                            }
                            parameters[key] *= Math.pow(instance.factor, level);
                            
                        }
                    };
                break;
            }
            
        }
        parameters = mergeObjects(parameters, subParametersMultiplier, subParametersSum);
    }

    parameters['silos'] = Number(rawData.silos);

    document.getElementById('populationSliderValue').innerHTML = Math.round((document.getElementById('population').value) / 1000 * Math.round(((parameters['habCapacity'] * 100) * (parameters['maxCapacity'] * 100)) / 10000)).toLocaleString();
    document.getElementById('population').oninput = function() {
        document.getElementById('populationSliderValue').innerHTML = Math.round((document.getElementById('population').value) / 1000 * Math.round(((parameters['habCapacity'] * 100) * (parameters['maxCapacity'] * 100)) / 10000)).toLocaleString();
        rawData.population = Number(this.value);
    };
    parameters['population'] = Number(document.getElementById('populationSliderValue').innerHTML.replace(/\D/g, ''));

    parameters['shippingCapacity'] = getInputValue('shippingCapacity');

    createFleetSlots();
    parameters['vehicleCapacity'] = function() {
        var total = 0;
        for (var i = 0; i < parameters['maxFleetSize']; i++) {
            total += vehicles[_UI.fleet[i].dropdown.selected].capacity;
        }
        return total;
    }();
    
    let soulFood = _UI.research[_UI.research.length - 1].research[findIndexByObject(_UI.research[_UI.research.length - 1].research, 'Soul Food', 'name')].value;
    let prophecyBonus = _UI.research[_UI.research.length - 1].research[findIndexByObject(_UI.research[_UI.research.length - 1].research, 'Prophecy Bonus', 'name')].value
    let soulEggs = rawData.soulEggs;
    let prophecyEggs = rawData.prophecyEggs;
    parameters['meBonus'] = Math.pow(105 + (1 * prophecyBonus), prophecyEggs) == Infinity ? alert("Javascript can not count that high :(") : soulEggs * (((10 + (1 * soulFood)) / 100) * ((Math.pow(105 + (1 * prophecyBonus), prophecyEggs) / Math.pow(100, prophecyEggs))));
    if (parameters.meBonus == Infinity) {
        
    }
    // console.log(parameters);
    farmValueFormula(parameters);
    printResults(parameters);
}