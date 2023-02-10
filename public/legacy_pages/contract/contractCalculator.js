console.log("If you are interested in my project and would like to contact me, flick through an email to me at tvandinther@gmail.com")

// CONSTANTS
const CONSTANTS = {
    COLORS : {
        CONTRACT : {
            FAILED : "rgb(214, 0, 0)",
            COMPLETED : "rgb(9, 119, 9)",
            EXPIRED : "rgb(214, 0, 0)"
        }
    },
    STRINGS : {
        CONTRACT : {
            FAILED : "Contract Failed!",
            COMPELTED : "Contract Completed!",
            EXPIRED : "Contract Expired!" 
        }  
    }
}

//VARIABLES

var jData = null;
var validSymbols = [];
var validSymbolsRegex = ''; 
var now = new Date() / 1000;

const mioiContractApp = {
    dataReady: false,
};

// CLASSES

class Contract {
    constructor(contractId, order, options) {
        this.contractId = contractId;
        this.order = order;
        this.coopAllow = options.coopAllow;
        this.coopSize = options.coopSize || null;
        this.description = options.description;
        this.duration = options.duration;
        this.egg = options.egg;
        // this.eggName = options.eggName;
		this.name = options.title;
		this.goals = options.goals;
		this.rewards = this.goals['standard'] || options.rewards
        this.validUntil = options.validUntil;
        this.node = null;
        this.expanded = false;
        this.coop = null;
    }
    createDOMObject() {
        this.calculation = new ContractCalculation({
            contract : this,
            target : this.rewards[this.rewards.length - 1].goal
        });

        this.UI = {}

        
        let context = document.getElementById('contracts');

        let containerNode = document.createElement('div');
            containerNode.className = 'flex-container';
            containerNode.style.order = this.order;

        let node = document.createElement('div');
            node.id = this.contractId;
            node.className = 'contract';
            node.addEventListener('click', (evt) => {
                this.toggleExpand(evt);
            });

        this.node = node;
        
        let img = document.createElement('img');
            img.onerror = () => {
                img.setAttribute('src', 'images/eggs/egg_unknowdn.png'); //fallback image
                img.onerror = null; // prevents error loop if fallback image fails
            };
            img.setAttribute('src', 'images/eggs/egg' + this.egg + '.png')
        node.appendChild(img);
        
        let infoNode = document.createElement('div');
            infoNode.className = 'contract-info';

        this.UI.name = new TextElement({
            parentNode : infoNode,
            element : 'h4',
            text : this.name,
            contract : this
        })

        this.UI.timeLeft = new TextElement({
            parentNode : infoNode,
            element : 'h6',
            text : '',
            contract : this
        })
        this.updateTimeLeftText();
        
        let expandedNode = document.createElement('div');
            expandedNode.className = 'details';

        this.UI.coopSize = new TextElement({
            parentNode : expandedNode,
            element : 'h5',
            text : 'Max Co-op Size: ' + (this.coopAllow ? this.coopSize : 'None'),
            contract : this
        })
        
        // COOP REQUEST
        if (this.coopAllow == true) {
            this.UI.coopRequest = new InputElement({
                parentNode : expandedNode,
                className : 'coopRequest',
                contract : this,
                onFail : function() {
                    this.loadingIcon.hide();		
                    this.classList.add('failure');
                },
                submitFunction : function() {
                    this.classList.remove('failure');
                    this.loadingIcon.show();
                    if (this.value == "" || this.failedInputs.includes(this.value)) {
                        setTimeout(this.onFail.bind(this), 500);
                    }
                    else if (this.countdown) {
                        this.onFail();
                    }
                    else {
                        let coopDetailsRequest = getCoop(this.contract.contractId, this.value);
                        coopDetailsRequest.then(response => {
                            this.loadingIcon.hide();
                            this.contract.updateContractWithCoop(new Coop(this.contract, response));
                        }).catch(rejection => {
                            switch (rejection.status) {
                                case 429 :
                                    let timeout = function(rejection) {
                                        let now = Math.ceil(new Date() / 1000);
                                        let seconds = Number(rejection.getResponseHeader('X-RateLimit-Reset')) - now + 2;
                                        let setTooltipText = seconds => {
                                            this.tooltip.innerText = `Too many requests. Trying again in ${seconds} seconds.`;
                                        };
                                        setTooltipText(seconds);
                                        this.countdown = setInterval(() => {
                                            if (seconds >= 2) {
                                                seconds = seconds - 1;
                                                setTooltipText(seconds)
                                            }
                                            else {
                                                this.hideTooltip();
                                                this.classList.remove('failure');
                                                this.countdown = clearInterval(this.countdown);
                                                this.submitFunction();
                                            }
                                        }, 1000)
                                    }
                                    this.showTooltip(timeout.bind(this, rejection));
                                    this.input.blur();
                                    this.onFail();
                                    break;
                                
                                case 404 :
                                    this.failedInputs.push(this.value);
                                    this.input.focus();
                                    this.onFail();
                                    break;
                            }
                        });
                    }
                },
                regex : /^([a-z-\d])*$/,
                keyRedirects : {
                    ' ' : '-', 'A' : 'a', 'B' : 'b', 'C': 'c', 'D' : 'd', 'E': 'e',
                    'F' : 'f', 'G' : 'g', 'H' : 'h', 'I': 'i', 'J' : 'j', 'K': 'k',
                    'L' : 'l', 'M' : 'm', 'N' : 'n', 'O': 'o', 'P' : 'p', 'Q': 'q',
                    'R' : 'r', 'S' : 's', 'T' : 't', 'U': 'u', 'V' : 'v', 'W': 'w',
                    'X' : 'x', 'Y' : 'y', 'Z' : 'z'
                }
            });

            this.UI.coopRequest.loadingIcon = new LoadingElement({		
                imgSrc : "Ball-0.7s-200px.svg",		
                parentNode : this.UI.coopRequest.node		
            })
        }

		let coopDetailsNode = document.createElement('div');
		this.UI.coopDetails = coopDetailsNode;
            coopDetailsNode.className = 'coopDetails';
            coopDetailsNode.classList.add('hide-fade');

        //  TIME TO COMPLETION
        this.timeToCompletion = document.createElement('h5');
        coopDetailsNode.appendChild(this.timeToCompletion);

		// REWARDS
		this.UI.rewards = [];

        let rewardsNode = document.createElement('div');
            rewardsNode.className = 'rewards';

        let rewardHeading = new TextElement({
            parentNode : coopDetailsNode,
            element : 'h4',
            text : 'Rewards',
            contract : this
        });
		this.createRewardsDOMObjects(rewardsNode)
		coopDetailsNode.appendChild(rewardsNode);

        // MEMBERS
        if (this.coopAllow == true) {
            let membersTitle = new TextElement({
                parentNode : coopDetailsNode,
                element : 'h4',
                text : 'Members',
                contract : this
            });

            this.UI.members = new MemberTable({
                parentNode: coopDetailsNode,
                maxCoopSize: this.coopSize
            });
        }

        // APPEND ALL
        expandedNode.appendChild(coopDetailsNode);
        infoNode.appendChild(expandedNode);
        node.appendChild(infoNode);
        containerNode.appendChild(node);
        context.appendChild(containerNode);
    }
    setTimeToCompletion() {
        let ttc = (this.rewards[this.rewards.length - 1].goal - this.coop.eggsLaid) / this.coop.layingRate;
        let ttcString = this.convertEpoch(ttc);
        if (ttc < 0) {
            this.timeToCompletion.innerHTML = `This contract has been completed.`;
            this.timeToCompletion.style.color = CONSTANTS.COLORS.CONTRACT.COMPLETED;
        }
        else {
            this.timeToCompletion.innerHTML = `${ttcString} left until completion at the current laying rate`;
            this.timeToCompletion.style.color = ttc < this.coop.timeLeft ? CONSTANTS.COLORS.CONTRACT.COMPLETED : CONSTANTS.COLORS.CONTRACT.FAILED;
        }
    }
	createRewardsDOMObjects(parentNode) {
        for (let reward of this.rewards) {
            this.UI.rewards.push(new Reward(reward, parentNode));
		}
	}
    updateContractWithCoop(coopInstance) {
        if (this.coop) {
            this.clearCoop();
        }
        this.coop = coopInstance;
        
        this.UI.coopSize.text = this.coop.members.length + '/' + this.coopSize + ' Users in Co-op';
        this.updateTimeLeftText();
        
        // UPDATE URL
        let url = new URL(window.location.href);
        let searchParams = new URLSearchParams(url.search);
        searchParams.set('contract', this.contractId);
        searchParams.set('coop', this.coop.name);
        url.search = searchParams;
        window.history.replaceState(null, null, url);

		// REWARDS
		this.updateRewards(this.goals[this.coop.league])
        for (let reward of this.UI.rewards) {
            reward.updateProgress(coopInstance.eggsLaid);
        }

        // TIME TO COMPLETION
        this.setTimeToCompletion()
        
        // MEMBERS
        this.UI.members.updateCoop(coopInstance);

        // Update Calc
        this.calculation.updateInputFields({
            target : this.rewards[this.rewards.length - 1].goal,
            eggsLaid : this.coop.eggsLaid
		})
		this.UI.coopDetails.classList.remove('hide-fade');
    }
    toggleExpand(evt) {
        if (this.expanded && evt.target.tagName == 'IMG') {
            this.collapse(evt);
        }
        else {
            this.expand(evt);
        }
    }
    expand(evt) {
        if (this.expanded) {
            return
        }
        for (let contract in mioiContractApp.contracts) {
            if (this !== mioiContractApp.contracts[contract]) {
                mioiContractApp.contracts[contract].collapse(evt);
            }
        }
        if (!this.expanded) {
            this.node.parentNode.classList.add('expand');
            this.node.scrollIntoView({
                behaviour: 'smooth',
                block: 'center'
            });
            try {
                this.node.querySelector('.coopRequest>input').focus();
            }
            catch(TypeError) {
                // Caught in the case of a non-coop contract
            }
        }
        this.expanded = true;
        this.calculation.updateInputFields();
        if (this.coop) {
            this.updateTimeLeftText();
        }
    }
    collapse(evt) {
        this.node.parentNode.classList.remove('expand');
        this.expanded = false;
        this.updateTimeLeftText();
    }
    searchCoop(coop) {
        this.UI.coopRequest.input.value = coop;
        this.UI.coopRequest.submitFunction();
    }
    clearCoop() {
        for (let reward of this.UI.rewards) {
            reward.updateProgress(0);
        }
        this.UI.members.clearTable();
	}
	updateRewards(goals) {
		if (!goals) return
		this.rewards = goals
		let rewardsParentNode = this.UI.rewards[0].scope
		rewardsParentNode.innerHTML = "" // clear children
		this.createRewardsDOMObjects(rewardsParentNode)
	}
    updateTimeLeftText() {
        let determineTimeLeftText = () => {
            if (this.coop.timeLeft <= 0) {
                if (this.coop.eggsLaid >= this.rewards[this.rewards.length - 1].goal) {
                    this.UI.timeLeft.colour = CONSTANTS.COLORS.CONTRACT.COMPLETED;
                    return CONSTANTS.STRINGS.CONTRACT.COMPELTED;
                }
                else {
                    this.UI.timeLeft.colour = CONSTANTS.COLORS.CONTRACT.FAILED;
                    return CONSTANTS.STRINGS.CONTRACT.FAILED;
                }
            }
            else {
                this.UI.timeLeft.colour = null;
                return this.convertEpoch(this.coop.timeLeft) + ' remaining';
            }
        }
        let determineValidForText = () => {
            if (this.getExpireETA(false) > 0) {
                this.UI.timeLeft.colour = null;
                return 'Valid for ' + this.getExpireETA(true);
            }
            else {
                this.UI.timeLeft.colour = CONSTANTS.COLORS.CONTRACT.EXPIRED;
                return CONSTANTS.STRINGS.CONTRACT.EXPIRED;
            }
        }
        this.UI.timeLeft.text = this.expanded ? determineTimeLeftText() : determineValidForText();
    }
    getExpireETA(string=false) {
        let currentEpoch = Date.now() / 1000;
        let expire = this.validUntil - currentEpoch; // in seconds
        if (string === true) {
            return this.convertEpoch(expire);
        }
        return expire;
    }
    convertEpoch(epochTime) {
        let d = Math.floor(epochTime / (3600*24));
        let h = Math.floor(epochTime % (3600*24) / 3600);
        let m = Math.floor(epochTime % 3600 / 60);
        let s = Math.floor(epochTime % 60);
        let stringValues = [d, h, m, s];
        // run through the array and format a suitable string
        let timeString = ''
        if (stringValues[0] > 0) {
            timeString += stringValues[0] + 'd ';
        }
        if (stringValues[1] > 0) {
            timeString += stringValues[1] + 'h ';
        }
        if (stringValues[2] > 0) {
            timeString += stringValues[2] + 'm ';
        }
        // if (stringValues[3] > 0) {
        //     timeString += stringValues[3] + 's ';
        // } 
        if (timeString == "") {
            return "0";
        }
        else {
            return timeString.slice(0, timeString.length - 1);
        }
    }
}

class MemberTable {
    constructor(options) {
        this.coop = null;
        this.table = null;
        this.scope = options.parentNode;
        this.className = options.className || null;
        this.maxCoopSize = options.maxCoopSize || null;

        this.columns = {
            ' ' : {
                valueFunction : function(coop, i) {return parseInt(i) + 1},
                className : 'member-index table-bold',
                columnWidth : '50px'
            },
            'Name' : {
                valueFunction : function(coop, i) {return coop.members[i].name},
                className : 'member-name',
                columnWidth : 'auto'
            },
            'Eggs Laid' : {
                valueFunction : function(coop, i) {return convertSymbol(coop.members[i].eggs)},
                className : 'member-eggs',
                columnWidth : 'auto'
            },
            'Laying Rate' : {
                valueFunction : function(coop, i) {return convertSymbol(coop.members[i].rate) + '/s'},
                className : 'member-rate',
                columnWidth : 'auto'
            },
            'Contribution' : {
                valueFunction : function(coop, i) {return percentString(coop.members[i].eggs / coop.eggsLaid, 2)},
                className : 'member-contribution',
                columnWidth : 'auto'
            }
        }
    }
    get members() {
        if (this.coop) {
            return this.coop.members;
        }
        else {
            return null;
        }
    }
    updateCoop(coop) {
        this.coop = coop;
        if (this.table == null) {
            this.createDOMObject();
        }
		this.updateTable();
    }
    createDOMObject() {
        let membersNode = document.createElement('div');
            membersNode.id = this.coop.contract.contractId + '-members';
            membersNode.className = 'members';
        
        this.table = membersNode;
        this.scope.appendChild(membersNode);

        let tableColumnWidths = [];
        for (let heading of Object.keys(this.columns)) {
            let columnHeader = document.createElement('p');
                columnHeader.className = 'table-bold';
            let columnHeaderText = document.createTextNode(heading);
            columnHeader.appendChild(columnHeaderText);
            
            this.table.appendChild(columnHeader);
            tableColumnWidths.push(this.columns[heading].columnWidth);
        }
        membersNode.style.gridTemplateColumns = tableColumnWidths.join(' ');
    }
    updateTable() {
        this.clearTable(); 
        
        for (let i in this.members) {
            for (let column of Object.values(this.columns)) {
                let node = document.createElement('p');
                    node.className = column.className;
                let nodeText = document.createTextNode(column.valueFunction(this.coop, i));
                node.appendChild(nodeText);

                this.table.appendChild(node);
            }
        }
    }
    clearTable() {
        if (this.table) {
            while (this.table.children.length > Object.keys(this.columns).length) {
            this.table.removeChild(this.table.lastChild);
            }
        }
    }
}

class TextElement {
    constructor(options) {
        this.scope = options.parentNode;
        this.element = options.element;
        this.className = options.className || null;
        this.contract = options.contract;
        this.colour = options.colour || null;

        this.node = null;
        this.createDOMObject();
        this.text = options.text;
    }
    createDOMObject() {
        let node = document.createElement(this.element);
        let nodeText = document.createTextNode(null);
        node.appendChild(nodeText);
        this.node = node;
        this.scope.appendChild(this.node);
        this.colour = this.colour;
    }
    get text() {
        return this.node.textContent;
    }
    set text(text) {
        this.node.lastChild.nodeValue = text;
    }
    set colour(value) {
        if (this.node) {
            this.node.style.color = value;
        }
    }
}

class LoadingElement {		
    constructor(options) {		
        this.imgSrc = options.imgSrc;		
        this.scope = options.parentNode;		
        this.node = null;		
        this.createDOMObject();		
    }		
    createDOMObject() {		
        let node = document.createElement('img');		
        node.setAttribute('src', this.imgSrc);		
        node.className = "loadIcon";		
        this.node = node;		
        this.hide();		
        this.scope.appendChild(node);		
    }		
    show() {		
        this.node.classList.remove('hide-fade');		
    }		
    hide() {		
        this.node.classList.add('hide-fade');		
    }		
}

class ImageElement {
    constructor(options) {
        this.src = options.src;
        this.scope = options.parentNode;
        this.contract = options.contract;
        this.hoverText = options.hoverText || null;

        this.node = null;
        this.createDOMObject();
    }
    createDOMObject() {
        let container = document.createElement('div');
            container.className = 'img';
        let node = document.createElement('img');
        node.setAttribute('src', this.src);
        node.setAttribute('title', this.hoverText);
        this.node = container;
        container.appendChild(node)
        this.scope.appendChild(container)
    }
}

class InputElement {
    constructor(options) {
        this.scope = options.parentNode;
        this.className = options.className || null;
        this.contract = options.contract;
        this.submitFunction = options.submitFunction || null;
        this.onFail = options.onFail || null;
        this.regex = options.regex || null;
        this.keyRedirects = options.keyRedirects || null;

        this.failedInputs = [];
        this.node = null;
        this.input = null;
        this.createDOMObject();
    }
    createDOMObject() {
        let inputContainer = document.createElement('div');
            inputContainer.className = this.className;
        this.node = inputContainer;
        
        let inputField = document.createElement('input');
            inputField.placeholder = 'Enter your Co-Op Code';
        if (this.regex) {
            inputField.limitRegex(this.regex, this.keyRedirects);
        }
        this.input = inputField;
        inputContainer.appendChild(inputField);

        let submitButton = document.createElement('a');
            submitButton.addEventListener('click', (evt) => {
                this.submitFunction();
                this.input.blur();
                evt.stopPropagation();
            });
        
        let arrowIcon = document.createElement('img');
            arrowIcon.setAttribute('src', 'images/right_arrow.svg');
        submitButton.appendChild(arrowIcon);

        inputContainer.appendChild(submitButton);

        inputField.addEventListener("keyup", function(evt) {
            if (evt.keyCode === 13) { // 'ENTER' key
                evt.preventDefault();
                submitButton.click();
            }
        });

        let tooltip = document.createElement('span');
            tooltip.className = 'input-tooltip';
            tooltip.classList.add('hide-fade');
        this.tooltip = tooltip;

        inputContainer.appendChild(tooltip);

        this.scope.appendChild(inputContainer);
    }
    showTooltip(value) {
        if (typeof value == 'string') {
            this.tooltip.innerText = value;
        }
        else if (typeof value == 'function') {
            value();
        }
        this.tooltip.classList.remove('hide-fade');
    }
    hideTooltip() {
        this.tooltip.classList.add('hide-fade');
    }
    get classList() {
        return this.node.classList;
    }
    get value() {
        return this.input.value;
    }
    set value(value) {
        this.input.value = value
    }
}

class NumberInputElement {
    constructor(options) {
        this.elementID = options.elementID;
        this.min = options.min || 0;
        this.max = options.max || 0;
        this.value = options.value || 0;
        this.type = options.type;

        this.linkDOMObject();
    }
    linkDOMObject() {
        this.input = document.getElementById(this.elementID);

        // Create linkages for min, max and value

        switch(type) {
            case 'number' :
                this.input.limitRegex(/^(\d{1,3},?)*$/, {}, () => { 
                    // add a design change when the regex fails
                    this.style.borderColor = 'red';
                });
                let removeBorder = el => el.style.borderColor = null;
                this.input.addEventListener("keydown", function() {
                    removeBorder(this);
                });
                this.input.addEventListener('blur', function() {
                    removeBorder(this);
                });
                this.input.addEventListener('keyup',function() {
                    this.value = Number((this.value).replace(/(,)/g, '')).toLocaleString('en-US');
                });
                break;

            case 'symbol' :
                this.input.limitRegexs(/^(\d{1,3},?)*$/, 
                function() {
                    for(i = 0; i < jData.orders.length; i++) {
                        validSymbols.push(jData.orders[i].symbol)
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
                    if($(this).data('ui-tooltip')) {
                        $(this).tooltip('disable');
                    }
                });
                break;
        }
    }
}

class GridElement {
    constructor(options) {

    }
}

class Coop {
    constructor(contractInstance, responseObject) {
        this.contract = contractInstance;
        this.name = responseObject.coop;
        this.eggsLaid = responseObject.eggs;
        this.members = responseObject.members;
        this.timeLeft = responseObject.timeLeft;
		this.layingRate = responseObject.totalRate;
		this.league = responseObject.league;
    }
}

class Reward {
    constructor(reward, scope) {
		this.type = reward.type
        this.subtype = reward.subtype;
        this.quantity = reward.quantity;
        this.progress = 0;
        this.goal = reward.goal;
        this.difficulty = reward.difficulty;
        this.scope = scope;

        this.UI = {
            image : null,
            quantityText : null,
            progressBar : null
        }

        this.createDOMObject();
    }
    createDOMObject() {
        let imageName = `${this.type}.png`;
        let quantity = Number(this.quantity).toLocaleString();
        switch (this.type) {
            case "BOOST" :
                imageName = `b_icon_${this.subtype}.png`;
                quantity = `+${quantity}`;
                break;
            case "RESEARCH" :
                imageName = `${this.subtype}.png`;
                quantity = `+${quantity}`;
                break;
            case "PIGGY_LEVEL" :		
            case "PIGGY_BANK" :		
                quantity = `+${quantity}`;		
                break;		
            case "PIGGY_MULTIPLY" :		
                quantity = `x${quantity}`;		
                break;		
        }
        
        this.UI.image = new ImageElement({
            src : 'images/rewards/' + imageName,
            parentNode : this.scope,
            contract : this,
            hoverText : imageName.match(/(?!(\w*)_icon_)?\w*/)[0].replace(/_/g, ' ').toLowerCase()
        });

        this.UI.quantity = new TextElement({
            parentNode : this.scope,
            element : 'p',
            text : quantity,
            contract : this
        });

        this.UI.progressBar = new ProgressBar({
            parentNode: this.scope,
            colour: 'rgb(45, 196, 31)',
            bgColour: 'rgb(168, 168, 168)',
            strokeColour: 'rgba(30, 30, 30, 0.5)',
            fullColour: 'rgba(45, 196, 31, 0.65)',
            className: 'progress'
        });
    }
    updateProgress(absolute) {
        this.UI.progressBar.updateProgress(absolute, this.goal);
        let decimal = absolute / this.goal;
        if (decimal >= 1) {
            let tickOverlay = document.createElement('img');
                tickOverlay.setAttribute('src', "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaWQ9IkxheWVyXzEiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiB4bWw6c3BhY2U9InByZXNlcnZlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiM0MUFENDk7fQo8L3N0eWxlPjxnPjxwb2x5Z29uIGNsYXNzPSJzdDAiIHBvaW50cz0iNDM0LjgsNDkgMTc0LjIsMzA5LjcgNzYuOCwyMTIuMyAwLDI4OS4yIDE3NC4xLDQ2My4zIDE5Ni42LDQ0MC45IDE5Ni42LDQ0MC45IDUxMS43LDEyNS44IDQzNC44LDQ5ICAgICAiLz48L2c+PC9zdmc+")
                tickOverlay.className = 'overlay';
                
            this.UI.image.node.children[0].classList.add('grayed');
            this.UI.image.node.appendChild(tickOverlay);
        }
        else if (decimal < 1) {
            let imageScope = this.UI.image.node;
            while (imageScope.children.length > 1) {
                imageScope.children[1].remove();
            }
            imageScope.children[0].classList.remove('grayed');
        }
    }
}

class ProgressBar {
    constructor(options) {
        this.parentNode = options.parentNode;
        this.elementId = options.elementId || null;
        this.className = options.className || null;
        this.colour = options.colour || 'rgb(45, 196, 31)';
        this.bgColour = options.bgColour || 'rgb(168, 168, 168)';
        this.strokeColour = options.strokeColour || 'rgba(0, 0, 0, 0.0)';
        this.fullColour = options.fullColour || this.colour;
        this.value = 0;
        this.max = 1;

        this.container = document.createElement('div');
        this.container.className = this.className;

        this.container.addEventListener('mouseenter', () => {
            let fadeIn = (animationTime) => {
                this.textNode.style.animationDuration = animationTime + 'ms';
                this.textNode.classList.remove('animate-fadeout');
                this.textNode.classList.add('animate-fadein');
            }
            let fadeOut = (animationTime) => {
                this.textNode.style.animationDuration = animationTime + 'ms';
                this.textNode.classList.remove('animate-fadein');
                this.textNode.classList.add('animate-fadeout');
            }
            let showHover = () => {
                this.hover(true);
                phase[1].run();
            }
            let hideHover = () => {
                this.hover(false);
                phase[3].run();
            }
            let armOut = () => {
                this.textNode.classList.remove('animate-fadein');
                let handler = () => {
                    this.container.removeEventListener('mouseleave', handler);
                    phase[2].run();
                }
                this.container.removeEventListener('mouseleave', stopAll);
                this.container.addEventListener('mouseleave', handler)
            }
            let phase = []
            let stopAll = () => {
                if (phase[0].state > 1 && phase[0].state < 5) {
                    phase[0].stop();
                    phase[3].run();
                }
                else if (phase[1].state > 0) {
                    phase[1].stop();
                    phase[2].run();
                }
                else {
                    phase[0].stop();
                }
            }
            let delay = [200, 0, 0, 0]
            let duration = [150, 150, 300, 300]
            phase.push(new DelayDuration(delay[0], duration[0], () => {fadeOut(duration[0])}, showHover));
            phase.push(new DelayDuration(delay[1], duration[1], () => {fadeIn(duration[1])}, armOut));
            phase.push(new DelayDuration(delay[2], duration[2], () => {fadeOut(duration[2])}, hideHover));
            phase.push(new DelayDuration(delay[3], duration[3], () => {fadeIn(duration[3])}, () => {this.textNode.classList.remove('animate-fadein')}));
            
            phase[0].run();

            
            this.container.addEventListener('mouseleave', stopAll);
        })

        this.canvas = document.createElement('canvas');
        this.id = this.elementId;
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 535;
        this.canvas.height = 30;
        this.container.appendChild(this.canvas);
        this.parentNode.appendChild(this.container);
        this.addText(null);
        this.updateProgress(this.value);
    }
    updateProgress(value, max) {
        this.value = value;
        this.max = max

        this.ctx.clearRect(this.ctx, 0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.fillStyle = this.bgColour;
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.fillStyle = this.decimal >= 1 ? this.fullColour : this.colour;
        this.ctx.fillRect(0, 0, this.ctx.canvas.width * this.decimal, this.ctx.canvas.height);
        this.ctx.strokeStyle = this.strokeColour;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(this.ctx.canvas.width * this.decimal, 0);
        this.ctx.lineTo(this.ctx.canvas.width * this.decimal, this.ctx.canvas.height);
        this.ctx.stroke();

        this.text = this.decimal >= 1 ? percentString(1, 0) : percentString(this.decimal, 0);
    }
    addText(string) {
        let node = document.createElement('p');
        let text = document.createTextNode(string);
            node.className = this.className;
        node.appendChild(text);
        this.textNode = node;
        this.container.appendChild(node);
        
    }
    set text(string) {
        this.textNode.lastChild.nodeValue = string;
    }
    get decimal() {
        return this.value / this.max;
    }
    hover(bool) {
        if (bool) {
            this.text = convertSymbol(this.value) + ' / ' + convertSymbol(this.max);
        }
        else {
            this.text = this.decimal >= 1 ? percentString(1, 0) : percentString(this.decimal, 0);
        }
    }
}

class DelayDuration {
    constructor(delay, duration, delayCallback, durationCallback) {
        this.delay = delay;
        this.duration = duration;
        this.delayCallback = delayCallback || null;
        this.durationCallback = durationCallback || null;

        this.delayTimer = null;
        this.durationTimer = null;
        this.state = 0; 
        // 0: stopped, 
        // 1: initiated,
        // 2: post-delay pre-callback,
        // 3: post-delay post-callback,
        // 4: post-duration pre-callback,
        // 5: complete
    }
    run() {
        // this.stop();
        this.state = 1;
        this.delayTimer = setTimeout(() => {
            if (typeof this.delayCallback == 'function') {
                this.state = 2;
                this.delayCallback();
            }
            this.state = 3;
            this.durationTimer = setTimeout(() => {
                if (typeof this.durationCallback == 'function') {
                    this.state = 4;
                    this.durationCallback();
                    this.state = 5;
                }
            }, this.duration)
        }, this.delay)
    }
    stop() {
        clearTimeout(this.delayTimer);
        clearTimeout(this.durationTimer);
        this.state = 0
    }
}

class ContractCalculation {		
    constructor(parameters = {}) {
        this.contract = parameters.contract;
        this.target = parameters.target || this.getInputValue('target');
        this.eggsLaid = parameters.eggsLaid || this.getInputValue('eggsLaid');
        this.population = this.getInputValue('population');		
        this.maxPopulation = this.getInputValue('maxPopulation');		
        this.layingRate = this.getInputValue('layingRate');		
        this.shippingRate = this.getInputValue('shippingRate')		
        this.hatchRate = this.getInputValue('hatchRate');		
        this.hatchCalm = 1 + ((this.getInputValue('hatchCalm')) * .1);
        
        this.fieldIDs = [
            'target',
            'eggsLaid',
            'population',
            'maxPopulation',
            'layingRate',
            'shippingRate',
            'hatchRate',
            'hatchCalm'
        ]
        // if (parameters) {
        //     this.updateInputFields();
        // }
    }
    calc() {		
        //BREAKPOINT CALCULATION		
        let a = this.hatchRate * this.hatchCalm * 4;		
        let b = this.layingRate / this.population;		
        let c = this.population;		
        let d = this.eggsLaid;		
        let y = this.target;		
        let qA = (a * b) / 2;		
        let qB = b * c;		
        let qC = d - y;
        let determinant = Math.pow(qB, 2) - 4 * qA * qC
        let numerator = determinant < 0 ? 0 : -1 * qB + Math.sqrt(determinant)		
        let denominator = 2 * qA;		
        let xToTarget =  numerator / denominator;		
        let breakpoints = [0]		
        let xMaxPopulation = (this.maxPopulation - c) / a;		
        let xMaxShippingRate = ((this.shippingRate / b) - c) / a;		
        breakpoints.push(xToTarget, xMaxPopulation, xMaxShippingRate);		
        breakpoints.sort((a, b) => a - b );
        //WHATIFS		
        let maxFarmPopulation = (a * xToTarget) + c;		
        let maxFarmShipping = ((a * xToTarget) + c) * b;		
        //CALCULATE TIME		
        let time = 0;		
        time =+ breakpoints[1]		
        this.showWarning('maxPopulationWarning', 0, false);
        this.showWarning('shippingRateWarning', 0, false);
        for (let i = 1; i < breakpoints.length; i++) {		
            if (breakpoints[i] == xToTarget) {		
                break;		
            }		
            else if (breakpoints[i] == xMaxPopulation) {		
                d += findEggsLaid(breakpoints[i], breakpoints[i - 1], a, b, c);		
                time += findTime(y, b, c, d);		
                this.showWarning('maxPopulationWarning', maxFarmPopulation, true);		
                break;		
            }		
            else if (breakpoints[i] == xMaxShippingRate) {		
                d += findEggsLaid(breakpoints[i], breakpoints[i - 1], a, b, c);		
                time += findTime(y, b, c, d);		
                this.showWarning('shippingRateWarning', maxFarmShipping, true);		
                break;		
            }		
        }		
    		
        function findEggsLaid(endBreakpoint, startBreakpoint, a, b, c) {		
            let xRuntime = endBreakpoint - startBreakpoint;		
            return (a * b / 2) * Math.pow(xRuntime, 2) + b * c * xRuntime;		
        }		
    		
        function findTime(y, b, c, d) {		
            return (y - d) / (b * (a * breakpoints[1] + c));		
        }		
        		
        //WRITE ANSWER
        document.getElementById('variablesPrompt').innerHTML = 'Time remaining assuming solo progress using the variables below:';
        if (isNaN(time)) {		
            document.getElementById('time').innerHTML = 'Never';
        }
        else if (time > 60 * 24 * 7 * 52) {		
            document.getElementById('time').innerHTML = 'Forever';
        }
        else if (time <= 0)	{
            document.getElementById('time').innerHTML = 'Completed';
        }
        else {		
            document.getElementById('time').innerHTML = timeConvert(time);		
        }		
        //plot();		
    }
    showWarning(warningType, value, display) {
        const warningBox = document.getElementById('warningBox');
        var valueInput = document.getElementById(warningType + 'Value');
        var warning = document.getElementById(warningType);
        let visible = warningBox.className === 'hide' ? false : true;
        if (display === true && visible === false) {
            warning.style.display = 'grid';
            warningBox.classList.remove('hide');
            //warningBox.style.display = 'block';
            //warningBox.style.height = '130px';
            valueInput.innerHTML = warningType === 'maxPopulationWarning' ?
            (Math.ceil(value/Math.pow(10, Math.floor(Math.log10(value)) - 2)) * Math.pow(10, Math.floor(Math.log10(value)) - 2)).toLocaleString():
            convertSymbol(Math.ceil(value/Math.pow(10, Math.floor(Math.log10(value)) - 3)) * Math.pow(10, Math.floor(Math.log10(value)) - 3));
            visible = true;
    
        }
        if (display === false) {
            warningBox.classList.add('hide');
            //warningBox.style.height = '0px';
            //warningBox.style.display = 'none';
            warning.style.display = 'none';
            visible = false;
        }
    }
    getInputValue(elementID) {
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
    setInputValue(elementID, value) {
        switch (elementID) {
            case 'hatchCalm' :
                document.getElementById(elementID).value = parseInt(Math.round((value - 1) / 0.1));
                break;
            
            default :
                document.getElementById(elementID).value = convertSymbol(value);
                break;
        }
    }
    updateInputFields(parameters) {
        this.showWarning('maxPopulationWarning', 0, false);
        this.showWarning('shippingRateWarning', 0, false);
        if (parameters) {
            Object.keys(parameters).forEach(key => this[key] = parameters[key]);
        }
        // this.setInputValue('target', this.target);
        // if (this.eggsLaid) { this.setInputValue('eggsLaid', this.eggsLaid) }
        // this.calc();
        ['target', 'eggsLaid'].forEach(elementID => this.setInputValue(elementID, this[elementID]));
        this.calc();
    }	
}

// ---------------------------------------------------------------------------------------
// -------------------------------------     APP     -------------------------------------
// ---------------------------------------------------------------------------------------

function init() {
    window.addEventListener('DOMContentLoaded', checkLoadState);
    loadData();
}

function loadData() {
    let dataJson = loadJSON('data.json').then((res) => {
        jData = res;
    });
    let contracts = getCachedContracts()
    let loadPromises = [
        dataJson,
        contracts
    ];
    Promise.all(loadPromises).then(() => {
        mioiContractApp.dataReady = true;
        checkLoadState();
    }).catch(err => console.log(err));
}

function initApp() {
    addInputValidation();
    populateContracts();
    if (window.location.search) {
        loadQueriedContract();
    }
}

function loadQueriedContract() {
    let query = new URLSearchParams(window.location.search);
    let contract = mioiContractApp.contracts[query.get('contract')]
    contract.expand();
    contract.searchCoop(query.get('coop'));

}

function checkLoadState() {
    if (mioiContractApp.dataReady && document.readyState !== 'loading') {
        initApp();
    }
    else if (document.readyState !== 'loading') {
        handleDOMLoaded();
    }
}

function handleDOMLoaded(evt) {
    //SELECT FIELDS ON CLICK
    for (let node of document.querySelectorAll('input')) {
        let handleSelect = (evt) => {
            evt.srcElement.select();
            this.removeEventListener('focus', handleSelect);
        };
        node.addEventListener('focus', handleSelect.bind(node));
    }
    //TOOLTIPS
    $('.tooltip').on({
        'click': function() {
          $(this).tooltip({ 
              items: '.tooltip', 
              content: '<p class="loading">Loading...</p><img class="tooltipImg" src="./tooltips/' + $(this).parent().next()[0].id + '.png"/>', 
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
    //LIMITS INPUT VALUE TO MIN/MAX
    for (let node of document.querySelectorAll('input.limit')) {
        node.addEventListener('change', function() {
            this.value = Math.min(parseNumber(this.value), this.max).toLocaleString('en-US');
            this.value = Math.max(parseNumber(this.value), this.min).toLocaleString('en-US');
        })
    }
}

function addInputValidation() {
    //INPUT VALIDATION
    $("input.symbol").limitRegexs(/^(\d{1,3},?)*$/, 
    function() {
        for(i = 0; i < jData.orders.length; i++) {
            validSymbols.push(jData.orders[i].symbol)
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
        if($(this).data('ui-tooltip')) {
            $(this).tooltip('disable');
        }
    });
    for (let node of document.querySelectorAll('input.number')) {
        node.limitRegex(/^(\d{1,3},?)*$/, {}, function() { 
            // add a design change when the regex fails
            this.style.borderColor = 'red';
            // $(this).css("border-color", "red");
        });
        let removeBorder = function(el) {
            el.style.borderColor = null;
        }
        node.addEventListener("keydown", function() {
            removeBorder(this);
        });
        node.addEventListener('blur', function() {
            removeBorder(this);
        })
        node.addEventListener('keyup',function() {
            this.value = Number((this.value).replace(/(,)/g, '')).toLocaleString('en-US');
            // $(this).val(function() {
            //     return Number((this.value).replace(/(,)/g, '')).toLocaleString('en-US');
            // })
        });
    }
    for (let node of document.querySelectorAll('input')) {
        node.addEventListener('change', function() {
            Number((this.value).replace(/(,)/g, '')).toLocaleString('en-US');
            let unboundCalculation = new ContractCalculation();
            unboundCalculation.calc();
        })
    };
}

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

HTMLElement.prototype.limitRegex = function(regex, keyRedirects, onFail) {
    keyRedirects = keyRedirects || {};
    
    let pastValue, pastSelectionStart, pastSelectionEnd;
    this.addEventListener("keydown", function() {
        pastValue          = this.value;
        pastSelectionStart = this.selectionStart;
        pastSelectionEnd   = this.selectionEnd;
    });
    this.addEventListener("input", function() {
        let difference = function(pre, post) {
            for (let i = 0; i < post.length; i++) {
                if (pre[i] !== post[i].toLowerCase()) {
                    return post.slice(i, post.length);
                }
            }
        };
        let insertCharacter = function(inputField, character) {
            let pastCursorPosition = inputField.selectionDirection == 'forward' ? inputField.selectionEnd : inputField.selectionStart;
            inputField.value = inputField.value.slice(0, inputField.selectionStart) + character + inputField.value.slice(inputField.selectionEnd, inputField.value.length);
            inputField.setSelectionRange(pastCursorPosition + 1, pastCursorPosition + 1);
        }
        let typedChar = difference(pastValue, this.value);
        
        if (this.value.length > 0 && !regex.test(this.value)) {
            if (typeof onFail === "function") {
                onFail.call(this, this.value);
            }            
            this.value          = pastValue;
            this.selectionStart = pastSelectionStart;
            this.selectionEnd   = pastSelectionEnd;
        }
        if (typedChar in keyRedirects) {
            insertCharacter(this, keyRedirects[typedChar]);
        }
    }); 
    return this;
};

function loadJSON(filepath) {
    return XMLHTTPPromise('GET', filepath);
}

function XMLHTTPPromise(method, url, body) {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest;
        xhr.open(method, url);
        xhr.onerror = () => reject(xhr.statusText);
        if (method == "POST") {
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            // xhr.setRequestHeader("x-mioi-auth-key", "PublicAPIComingSoon")
            xhr.send(body);
        }
        else {
            xhr.send();
        }
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    let response = JSON.parse(xhr.responseText);
                    if (response == "") {
                        reject(xhr);
					}
                    resolve(response);
                }
                else {
                    reject(xhr);
                }
            }
        }
    }) 
}

function egginc_get(requestJSON) {
    const url = "https://us-central1-total-messenger-204107.cloudfunctions.net/egginc_get";
    let requestBody = JSON.stringify(requestJSON);
    
    return XMLHTTPPromise('POST', url, requestBody);
}

async function getCoop(contractName, coopName) {
    let query = `
        query getCoop($coopName: String!, $contractName: String!) {
            eggInc {
                coop(coopName: $coopName, contractName: $contractName) {
                    contract
                    coop
                    eggs
                    totalRate
					timeLeft
					league
                    members {
                        name
                        id
                        eggs
                        rate
                    }
                }
            }
        }
    `
    let variables = {
        coopName: coopName,
        contractName: contractName
      }
    let body = {
        operation : 'getCoop',
        query : query,
        variables : variables
    }
    return await XMLHTTPPromise("POST", "../api/ei/gql", JSON.stringify(body)).then(response => {
        if (response.data.eggInc.coop == null) {
            return Promise.reject({ status: 404 })
        }
        else return response.data.eggInc.coop;
    });
}

function getFarms(identifier) {
    return egginc_get({
        'request-type' : 'get-farms',
        'identifier' : identifier
    })
}

function getCachedContracts() {
    return new Promise((resolve, reject) => {
        loadJSON("https://mioi-www-public.storage.googleapis.com/activeContracts.json")
        .then(jsonString => {
            mioiContractApp['contracts'] = {}
            if (typeof jsonString == 'object') {
                let contracts = jsonString.activeContracts;
                let i = 0;
                for (let contract of contracts) {
                    if (contract.serveUntil > now && contract.name !== "first-contract") {
                        mioiContractApp.contracts[contract.name] = new Contract(contract.name, i, contract);
                        i++;
                    }
                }
            }
            resolve();
        }).catch(err => console.log(err));
    });
}

function populateContracts() {
    if (typeof mioiContractApp.contracts != 'object') {
        // Make error dom
    }
    else {
        for (let obj in mioiContractApp.contracts) {
            mioiContractApp.contracts[obj].createDOMObject();
        }
    }
}

function parseNumber(x) {
    return Number(x.replace(/\D/g, ""));
}

function magnitudeGet(str) {
    var key = String(str.match(/([A-z]{1,2})$/g));
    for(var i = 0; i < jData.orders.length; i++) {
        if(jData.orders[i].symbol === key) {
            return jData.orders[i].magnitude;
        }
    }
    return 0;
}

function convertName(n) { //converting the format of unreadable number into the game's name format
    if (isNaN(n)) {
        return 'Need More Info';
    }
    else if (levelOf(n) < 1){
        return Math.floor(n);
    }
    else if (levelOf(n) <= jData.orders.length) {
        return Math.round((n / cutoffOf(n)) * 1000) / 1000 + ' ' + (jData.orders[levelOf(n)-1].name);
    }
    else {
        return Math.round((n / cutoffOf(n)) * 1000) / 1000 + '[e' + ((levelOf(n) + 1) * 3) + ']';
    }
}

function convertSymbol(n) { //converting the format of unreadable number into the game's symbol format
    if (n < 1000000) {
        return n.toLocaleString();
    }
    else if (levelOf(n) < 1){
        return Math.floor(n);
    }
    else if (levelOf(n) <= jData.orders.length) {
        return Math.round((n / cutoffOf(n)) * 1000) / 1000 + (jData.orders[levelOf(n)-1].symbol);
    }
    else {
        return Math.round((n / cutoffOf(n)) * 1000) / 1000 + 'e' + ((levelOf(n) + 1) * 3)
    }
}

function round(n, precision) {
    return Math.round(n * Math.pow(10, precision)) / Math.pow(10, precision);
}

function percentString(n, precision) {
    return (n * 100).toFixed(precision) + '%';
}

function orderOf(n) {
    return Math.floor(Math.log(n) / Math.LN10 + 0.000000001) / 3;
}

function levelOf(n) {
    // Returns an integer representing its order of magnitude where 1 = million and 2 = billion etc.
    return Math.floor(orderOf(n) - 1);
}

function cutoffOf(n) {
    // Returns the floor of n's "illion". E.g. 28 million returns 1 million, 794 billion returns 1 billion
    return Math.pow(10, Math.floor(orderOf(n)) * 3);
}

function timeConvert(time) { 
    //return 'Roughly ' + String(Math.floor(time/24/60) + " days, " + Math.floor(time/60%24) + ' hours and ' + Math.ceil(time%60) + ' minutes');
    var units = {
        year: 24*60*365,
        month: 24*60*30,
        week: 24*60*7,
        day: 24*60,
        hour: 60,
        minute: 1
    }
    var result = []
    for(var name in units) {
      var p =  Math.floor(time/units[name]);
      if(p == 1) result.push(' ' + p + ' ' + name);
      if(p >= 2) result.push(' ' + p + ' ' + name + 's');
      time %= units[name]
    
    }
    return 'Roughly ' + result;
}


init();