//VARIABLES

var jData = null;
var validSymbols = [];
var validSymbolsRegex = ''; 
var meBonusLast = false;

//EVENTS

$.when(
    //LOAD JSON
    $.getJSON('data.json', 
    function(jsonData) {
        jData = jsonData;
        init();
    }).error(function(jqXHR, textStatus, errorThrown){
		alert(textStatus + ' in ' + url + ' - ' + errorThrown)
    }),
$.ready).done(function() {
    //SELECT FIELDS ON CLICK
    $('input').on('click',
    function() {
        this.select();
        $(this).off('click');
    });
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
    $('input.limit').on('change', 
    function() {
        this.value = Math.min(parseNumber(this.value), this.max).toLocaleString('en-US');
        this.value = Math.max(parseNumber(this.value), this.min).toLocaleString('en-US');
    });
    //DEPENDENT VARIABLE RECALCULATION
    $('#meBonus').on('change',
    function() {
        meBonusLast = true;
    });
    $('#soulEggs').on('change',
    function() {
        meBonusLast = false;
    });
    $('#population').on('change',
    function() {
        var x = document.getElementById('population');
        var y = document.getElementById('maxPopulation');
        if (parseNumber(x.value) > parseNumber(y.value)) {
            x.value = Math.min(parseNumber(x.value), y.max).toLocaleString('en-US');
            y.value = parseNumber(x.value).toLocaleString('en-US');
        }
    });
    $('#maxPopulation').on('change',
    function() {
        var x = document.getElementById('population');
        var y = document.getElementById('maxPopulation');
        if (parseNumber(x.value) > parseNumber(y.value)) {
            x.value = parseNumber(y.value).toLocaleString('en-US');
        }
    });
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
        $(this).tooltip('disable');
    });

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
    $(':input').on('change',
    function() {
        Number((this.value).replace(/(,)/g, '')).toLocaleString('en-US');
        calc();
    });
});

//FUNCTIONS

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

function init() {
    populate();
    calc();
}

function populate() {
    var selection = document.getElementById('eggType');
    for (var i = 0; i < jData.eggTypes.length; i++) {
        selection.innerHTML = selection.innerHTML +
            '<option value="' + jData.eggTypes[i]['ID'] + '">' + jData.eggTypes[i]["Name"] + '</option>';
    }
    //Load Cookies
    let cookieArray = document.cookie.replace(/\s/g, "").split(';');
    for (arrayValue of cookieArray) {
        let key = arrayValue.split('=')[0];
        let value = arrayValue.split('=')[1];
        let element = document.getElementById(key);
        if (element == null) {
            break
        }
        else if (isNaN(value) || value == null) {
            break
        }
        else {
            element.value = value;
        }
    }
}

function parseNumber(x) {
    return Number(x.replace(/\D/g, ""))
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
    //console.log('OoM level = ' + levelOf(n))
    if (levelOf(n) < 1){
        return Math.floor(n);
    }
    else if (levelOf(n) <= jData.orders.length) {
        return Math.round((n / cutoffOf(n)) * 1000) / 1000 + (jData.orders[levelOf(n)-1].symbol);
    }
    else {
        return Math.round((n / cutoffOf(n)) * 1000) / 1000 + 'e' + ((levelOf(n) + 1) * 3)
    }
}

function levelOf(n) {
    return Math.floor(((Math.floor(Math.log(n) / Math.LN10 + 0.000000001)) / 3) - 1);
}

function cutoffOf(n) {
    return Math.pow(10,(Math.floor((Math.log(n)/Math.log(10)) / 3)) * 3);
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

function writeCookies() {
    storedVariables = [
        'eggType', 
        'maxPopulation', 
        'accTricks', 
        'silos', 
        'soulEggs', 
        'prophecyEggs',
        'soulFood', 
        'prophecyBonus'
    ];
    for (varName of storedVariables) {
        document.cookie = varName + '=' + getInputValue(varName) + '; max-age=' + 120*24*60*60 + ';';
    }
}

function calc() {
    var eggType = getInputValue('eggType');
    var population = getInputValue('population');
	var maxPopulation = getInputValue('maxPopulation');
    var eggValue = getInputValue('eggValue');
    var layingRate = getInputValue('layingRate');
    var hatchRate = getInputValue('hatchRate'); 
    var accTricks = 1 + ((getInputValue('accTricks')) * .05);
    var silos = getInputValue('silos');
    var soulEggs = getInputValue('soulEggs');
	var prophecyEggs = getInputValue('prophecyEggs');
	var meBonus = getInputValue('meBonus') / 100;
    var soulFood = getInputValue('soulFood');
    var prophecyBonus = getInputValue('prophecyBonus');
    //INTERNAL VARIABLES
    for (var i = 0; i < jData.eggTypes.length; i++) {
        if (jData.eggTypes[i].ID == eggType) {
            var eggMultiplier = 1 + (0.5 * i);
        }
    }
    //CALCULATION
    if (meBonusLast == true) {
        meBonus = (getInputValue('meBonus')) / 100;
        document.getElementById('soulEggs').value = (Math.ceil(meBonus * (1 / ((0.10 + (.01 * soulFood)) * ((Math.pow(105 + (1 * prophecyBonus), prophecyEggs))) / Math.pow(100, prophecyEggs))))).toLocaleString('en-US');
    }
    else {
        meBonus = soulEggs * ((0.10 + (.01 * soulFood)) * ((Math.pow(105 + (1 * prophecyBonus), prophecyEggs)) / Math.pow(100, prophecyEggs)));
        document.getElementById('meBonus').value = (Math.floor(meBonus * 100)).toLocaleString('en-US');
    }
    //SUB CALCULATIONS
    var incSec = (layingRate / 60) * (eggValue * (1 + meBonus));
    var subValue1 = incSec * 54000;
	var subValue2 = incSec / population * maxPopulation * 6000;
	var subValue3 = incSec / population * hatchRate * 7200000 * silos;
    //FINAL CALCULATION
    var farmValue = (subValue1 + subValue2 + subValue3) * accTricks * eggMultiplier;
    //AUXILLARY CALCULATIONS
    document.getElementById('smallDroneReward').innerHTML = convertSymbol(farmValue * 0.0004);
    document.getElementById('mediumDroneReward').innerHTML = convertSymbol(farmValue * 0.003);
    document.getElementById('largeDroneReward').innerHTML = convertSymbol(farmValue * 0.01);
    document.getElementById('eliteDroneReward').innerHTML = convertSymbol(farmValue * 0.4);
    
    document.getElementById('stackOfCash').innerHTML = convertSymbol(farmValue * 0.02);
    document.getElementById('pileOfCash').innerHTML = convertSymbol(farmValue * 0.1);
    document.getElementById('tonOfCash').innerHTML = convertSymbol(farmValue * 0.3);

    document.getElementById('smallVideoReward').innerHTML = convertSymbol(farmValue * 0.1);
    document.getElementById('largeVideoReward').innerHTML = convertSymbol(farmValue * 0.3);
    //WRITE ANSWER
    writeCookies();
	document.getElementById('farmValue').innerHTML = convertName(farmValue);
}