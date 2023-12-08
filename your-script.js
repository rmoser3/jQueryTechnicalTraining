// Your Javascript goes here. This is the file you submit for review.
$("#your-name-here").html("Ryan Moser");

// element id's
const stepTwo = "#step2";
const stepThree = "#step3";
const stepFour = "#step4";
const dateInput = "#dateInput";
const urlInput = "#urlInput";
const jsonText = "#jsonText";

// currency id's
const euro = "EUR";
const yuan = "CNY";
const krone = "NOK";
const canadian = "CAD";
const real = "BRL";
const rupee = "INR";
const yen = "JPY";
const usd = "USD";

var currencies = [euro, yuan, krone, canadian, real, rupee, yen];

// click handlers
$("#urlBtn").click(GenerateUrl);
$("#tableBtn").click(ResetTableBody);
$("#downloadBtn").click(Download);

// change handlers 
$(dateInput).change(GenerateUrl);
$(urlInput).change(Download);
$(jsonText).change(ResetTableBody);

// hide these elements initially 
$(stepTwo).hide();
$(stepThree).hide();
$(stepFour).hide();

// Constructs and displays the URL constructed from the API URL and the date
function GenerateUrl(e) {
    e.preventDefault();
    var date = $(dateInput).val();

    var to = currencies.join(",");

    var url = 'https://api.frankfurter.app/' + date + `?from=${usd}&to=${to}`;

    $(urlInput).val(url).trigger("change");
    $(urlInput).prop("readonly", true);

    $(stepTwo).show('slide', {direction: 'left'}, 500);
}

// Retrieves API URL and sends request 
function Download(e) {
    e.preventDefault();

    var url = $(urlInput).val();

    $.ajax({
        url,
        type: 'GET',
        dataType: 'json', 
        complete: function(res) {
            $(jsonText).val(JSON.stringify(res));
            $(stepThree).show('slide', {direction: 'right'}, 500);
            $(jsonText).trigger("change");
        }
    });
}

// Clears the current table body and replaces it with new data from API result 
function ResetTableBody(e) {
    e.preventDefault();

    $(".step4-body").empty();

    var data = JSON.parse(JSON.parse($(jsonText).val()).responseText);

    // get base amount in USD
    var base = $("#amountInputUSD").val();

    // order currencies and process them alphabetically 
    currencies = currencies.sort();
    currencies.forEach((currency) => {
        var rate = data.rates[currency];
        var amount = (base * rate).toFixed(2);

        $(".step4-body").append(`<tr class="currency-row"><td class="currency-column">${currency}</td><td class="rate-column">${rate}</td><td class="amount-column"><input id="amountInput" type="text" class="form-control amount-field" value="${amount}" onchange="Calculate" />
        </td><td class="calculate-column"><button class="btn btn-default calculate-button">Calculate</button></td></tr>`);
    });

    var buttons = $(".calculate-button");
    buttons.click(Calculate)

    var inputs = $(".amount-field");
    inputs.keyup(Calculate);

    $(stepFour).fadeIn(1500);
}

function Calculate(e) {
    e.preventDefault();

    // get rate and amount for selected row 
    var current = e.target.parentNode.parentNode.children[0].innerHTML;
    var currentRow = $(`td:contains(${current})`).parent();
    var currentColumns = currentRow.children();

    var currentRate = currentColumns[1].innerHTML;
    var currentAmount = currentColumns[2].children[0].value;

    // iterate through each other row and update amount field 
    var otherCurrencies = currencies.filter((c) => {
        return c != current;
    });
    otherCurrencies = [usd].concat(otherCurrencies);

    usdAmount = 0;

    otherCurrencies.forEach((c) => {
        var row = $(`td:contains(${c})`).parent();
        var rate = row.children('.rate-column').html();
        var input = row.children('.amount-column').children('.amount-field');

        if (c == usd) {
            usdAmount = (currentAmount / currentRate).toFixed(2);
            input.val(usdAmount);
        }
        else {
            var newAmount = (rate * usdAmount).toFixed(2);
            input.val(newAmount);
        }
    })
}