
var str = "https://api.coingecko.com/api/v3/coins/list";
var strMore = "https://api.coingecko.com/api/v3/coins/";
var strReport = "https://min-api.cryptocompare.com/data/pricemulti?fsyms=XXX&tsyms=USD";
var coinReport = [];
//var coinMatch = [];

$(document).ready(function () {
    $(".prog-bar").show();
    localStorage.clear();
    getHomePage();
    setInterval(
        function(){$(".prog-bar").removeAttr("style").hide();},
        500);
});

function getHomePage() {
    $(".coinsList").html("");
    $("#search").val("");
    $("#aboutPg").removeClass("active");
    $("#reportPg").removeClass("active");
    $("#homePg").addClass("active");
    
    $.ajax({
        url:str,
        type:"GET",
        data:{},
        success:function(result){
            printCoins(result);
        },
        error:function(xhr){
            console.log("Error: ",xhr); 
        }
    });
}

function printCoins(coinsArr){
    if(coinsArr.length > 0){
        for (let i =0;i <coinsArr.length;i++){
            if (i <= 100) {
                addCoin(coinsArr[i]);
            }else{
                if (localStorage.coinReport) {
                    coinReport = JSON.parse(localStorage.coinReport);
                    $.each(coinReport,function(index,val){
                        $(`.${val.id}`).prop("checked",true);   
                    });
                }  
                return false;
            }
        }  
    }else {
        addCoin(coinsArr);
    }
}

function addCoin(coin,flag ="") {
    let div_col_4 = $("<div></div>");
    $(div_col_4).addClass("col-md-4");
    let div_detail_row = $("<div></div>");
    $(div_detail_row).addClass("row");
    let div_col_4_tog = $("<div></div>");
    $(div_col_4_tog).addClass("col-md-4");
    let div_col_8_data = $("<div></div>");
    $(div_col_8_data).addClass("col-md-8");
    $(div_col_8_data).addClass("card-data");


    let div_card = $("<div></div>");
    $(div_card).addClass("card");
    $(div_card).addClass("mt-5");
    $(div_card).addClass("border-1");

    let symbol =  $("<label></lable>");
    $(symbol).html(coin.symbol);

    let name = $("<label></label>");
    $(name).html(coin.id);

    let tog = $("<label></label>");
    $(tog).addClass("switch");
    $(tog).addClass("mt-2");
    let togCheck = $("<input>");
    $(togCheck).attr("type","checkbox");
    $(togCheck).addClass(coin.id);
    $(togCheck).attr("id",coin.id);
    let togSpan = $("<span></span>");
    $(togSpan).addClass("slider");
    $(togSpan).addClass("round");
    (flag != "") ? $(togCheck).attr("checked",true) : "";
    $(togCheck).change(function(){
        if (this.checked && flag == ""){
            addToReport(this,coin.symbol,coin.id);
        }else if (!this.checked && flag != "") {
            coinReport.find(x=> x.id ===coin.id).check = false;
        }else if (!this.checked && flag == ""){
            let index = coinReport.findIndex(x => x.id ===coin.id);
            coinReport.splice(index,1);
        }
    });

    $(tog).append($(togCheck));
    $(tog).append($(togSpan));

    $(div_card).append($(div_detail_row));
    $(div_detail_row).append($(div_col_8_data));
    $(div_detail_row).append($(div_col_4_tog));

    $(div_col_8_data).append($(symbol));
    $(div_col_8_data).append($(name));
    if (flag ==""){
        let more = $("<div></div>")
        $(more).addClass("btn");
        $(more).addClass("btn-info");
        $(more).addClass("btn-sm");
        $(more).addClass("b-more");
        $(more).addClass("more-Unclicked");
        $(more).html("More Info");

        $(more).on("click",function(){
            if($(this).hasClass("more-Unclicked")){
                $(".prog-bar").show();
                $(this).addClass("more-clicked");
                $(this).removeClass("more-Unclicked");
                setTimeout(() => {
                    localStorage.clear();
                }, 1000 * 60 * 2);
                getDetails($(name).text(),div_detail_row);
                setInterval(
                    function(){$(".prog-bar").removeAttr("style").hide();},
                    1000);
                
            }else {
                $(".prog-bar").show();
                $(this).addClass("more-Unclicked");
                $(this).removeClass("more-clicked");
                removeDetails(div_detail_row);
                setInterval(
                    function(){$(".prog-bar").removeAttr("style").hide();},
                    1000);
            }  
        });

        $(div_col_8_data).append($(more));
    }
    
    //(flag == "") ? $(div_col_8_data).append($(more)) : null;
    $(div_col_4_tog).append($(tog));

    (flag != "") ? $(".close").on("click",cancelAdd) : null;

    $(div_col_4).append($(div_card));
    (flag =="") ? $(".coinsList").append($(div_col_4)) : $(".modal-body").append($(div_col_4));
}

function getDetails(coinId,row){
    if (localStorage.res && localStorage.coinId == coinId) {
        let res = JSON.parse(localStorage.res);
        enterDetails(res,row);
    } else {
        $.ajax({
            url:strMore + coinId,
            type:"GET",
            data:{},
            success:function(result){
                let res = result;
                localStorage.res = JSON.stringify(res);
                localStorage.coinId = coinId;
                enterDetails(result,row);
                //enterDetails(resRow);
            },
            error:function(xhr){
                console.log("Error: ",xhr); 
            }
        });
    }
    
}

function removeDetails(row){
    $(row).next(".coinData").remove();
}

function enterDetails(res,row){
    $(row).after(format(res));
}

function format ( d ) {
    return `<div class="coinData">
            <img src=${d.image.thumb}> 
            <div> USD: ${d.market_data.current_price.usd} <b>$</b> </div>
            <div> EUR: ${d.market_data.current_price.eur} <b>€</b> </div>
            <div> ILS: ${d.market_data.current_price.ils} <b>₪</b> </div>
        </div>`;
}

function addToReport(coin,coinSymbol,coinId){
    let newCoinReport = {id:coinId,symbol:coinSymbol,check:true};
    if (coinReport.length == 5 && !coinReport.find(x=> x.id === coinId)){
        $.each(coinReport,function(index,val){
            //openModal(val.coinSymbol,val.coinName);
            addCoin(val,"M"); 
        });
        $(".modal").addClass("d-block");
        coinReport.push(newCoinReport);
        localStorage.coinReport = JSON.stringify(coinReport);
    } else {
        if (!coinReport.find(x=> x.id === coinId)){
            coinReport.push(newCoinReport);
            localStorage.coinReport = JSON.stringify(coinReport);
        }  
    }
}

function checkReportArr(){
    $.each(coinReport,function(index,val){
        if (!val.check){
            coinReport = $.grep(coinReport,function(e){
                return e.id != val.id;
            });
            localStorage.coinReport = JSON.stringify(coinReport);
            $(".modal-body").html("");
            $(".modal").removeClass("d-block");
            $(`.${val.id}`).prop("checked",false);
        }
    });
}

function cancelAdd(){
    $(".modal").removeClass("d-block");
    $(".modal-body").html("");
    let removeCoin = coinReport[coinReport.length-1].id;
    coinReport.splice(coinReport.length-1,1);
    $(`.${removeCoin}`).prop("checked",false);
}

function getCoin(){
    let search = $("#search").val();
    $(".coinsList").html("");
    $.ajax({
        url:strMore + search,
        type:"GET",
        data:{},
        success:function(result){
            printCoins(result);
        },
        error:function(xhr){
            console.log("Error: ",xhr); 
        }
    });
}

function getReportsPage(){
    $("#aboutPg").removeClass("active");
    $("#homePg").removeClass("active");
    $("#reportPg").addClass("active");

    $(".coinsList").html("");
    let reportsPg = $("<div></div>");
    $(reportsPg).addClass("chartContainer");
    $(reportsPg).attr("id","chartContainer");
    $(reportsPg).attr("style","height: 300px; width: 100%;")
    $(".coinsList").append($(reportsPg));
    
    let coinsChar = "";
    //initRepArrFlg = 0;
    $.each(coinReport,function(index,val){
        if (index < coinReport.length - 1){
            coinsChar += val.symbol + ",";
        }else {
            coinsChar += val.symbol;
        }
        
    });
    coinsChar = coinsChar.toUpperCase();
    getDataReport(coinsChar);
    
}

function getDataReport(coinsChar){
    let strRep = strReport.replace("XXX",coinsChar);
    $.ajax({
        url:strRep,
        type:"GET",
        data:{},
        success:function(result){
            printReports(result,coinsChar);
        },
        error:function(xhr){
            console.log("Error: ",xhr); 
        }
    });

}

function printReports(res,coinsChar){ 
    //ZRX,ZXC,BCH,BTC,ETH,USDT,XRP
    var coinsRepArr = [];
    var coinsCharArr = [];
    let coinTmp = {};
    let i = 0;

    var updateInterval = 2000;
    var time = new Date;

    // starting at 10.00 am
    time.setHours(10);
    time.setMinutes(00);
    time.setSeconds(00);
    time.setMilliseconds(00);
    
    coinsChar = "";
    for (var key in res) {
        coinTmp = {};
        coinTmp = {x:time.getTime(),y:res[key].USD}
        if (!coinsRepArr[key] ) {
            coinsRepArr[key] = [];
            coinsCharArr[i] = [];
            coinsCharArr[i++].push(key);
            coinsChar += key + ",";
        }
        coinsRepArr[key].push(coinTmp);  
    }

    coinsChar = coinsChar.slice(0,-1);
    var options = {
        title: {
            text: coinsChar + " to USD"
        },
        axisX: {
            title: "chart updates every 2 secs"
        },
        axisY: {
            suffix: "$",
            includeZero: false
        },
        toolTip: {
            shared: true
        },
        legend: {
            cursor: "pointer",
            verticalAlign: "top",
            fontSize: 22,
            fontColor: "dimGrey",
            itemclick: toggleDataSeries
        },
        data: [{
            type: "line",
            xValueType: "dateTime",
            yValueFormatString: "###.00# $",
            xValueFormatString: "hh:mm:ss TT",
            showInLegend: true,
            name: coinsCharArr[0] ? coinsCharArr[0][0] : null,
            dataPoints: coinsCharArr[0] ? coinsRepArr[coinsCharArr[0][0]] : null
        },
        {
            type: "line",
            xValueType: "dateTime",
            yValueFormatString: "###.00# $",
            showInLegend: true,
            name: coinsCharArr[1] ? coinsCharArr[1][0] : null,
            dataPoints: coinsCharArr[1] ? coinsRepArr[coinsCharArr[1][0]] : null
        }, {
            type: "line",
            xValueType: "dateTime",
            yValueFormatString: "###.00# $",
            showInLegend: true,
            name: coinsCharArr[2] ? coinsCharArr[2][0] : null,
            dataPoints: coinsCharArr[2] ? coinsRepArr[coinsCharArr[2][0]] : null
        }, {
            type: "line",
            xValueType: "dateTime",
            yValueFormatString: "###.00# $",
            showInLegend: true,
            name: coinsCharArr[3] ? coinsCharArr[3][0] : null,
            dataPoints: coinsCharArr[3] ? coinsRepArr[coinsCharArr[3][0]] : null
        }, {
            type: "line",
            xValueType: "dateTime",
            yValueFormatString: "###.00# $",
            showInLegend: true,
            name: coinsCharArr[4] ? coinsCharArr[4][0] : null,
            dataPoints: coinsCharArr[4] ? coinsRepArr[coinsCharArr[4][0]] : null
        }]
    };

    var chart = $("#chartContainer").CanvasJSChart(options);

    function toggleDataSeries(e) {
        if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
        }
        else {
            e.dataSeries.visible = true;
        }
        e.chart.render();
    }

    function updateChart(){
        for (var key in res) {
            time.setTime(time.getTime() + updateInterval);
            coinTmp = {};
            coinTmp = {x:time.getTime(),y:res[key].USD}
            coinsRepArr[key].push(coinTmp);  
        }

        coinsCharArr[0] ? options.data[0].legendText = coinsCharArr[0] + " : " + coinsRepArr[coinsCharArr[0][0]][0].y + "$" : null;
        coinsCharArr[1] ? options.data[1].legendText = coinsCharArr[1] + " : " + coinsRepArr[coinsCharArr[1][0]][0].y + "$" : null;
        coinsCharArr[2] ? options.data[2].legendText = coinsCharArr[2] + " : " + coinsRepArr[coinsCharArr[2][0]][0].y + "$" : null;
        coinsCharArr[3] ? options.data[3].legendText = coinsCharArr[3] + " : " + coinsRepArr[coinsCharArr[3][0]][0].y + "$" : null;
        coinsCharArr[4] ? options.data[4].legendText = coinsCharArr[4] + " : " + coinsRepArr[coinsCharArr[4][0]][0].y + "$" : null;
        $("#chartContainer").CanvasJSChart().render();
    }

    updateChart();
    setInterval(function () { updateChart() }, updateInterval);
}

function getAboutPage(){
    $("#aboutPg").addClass("active");
    $("#homePg").removeClass("active");
    $("#reportPg").removeClass("active");

    $(".coinsList").html("");
    let aboutHeader = $("<div></div>");
    $(aboutHeader).addClass("col-md-12");
    let AboutH1 = $("<h1></h1>");
    $(AboutH1).html("Developer Info");
    $(aboutHeader).append($(AboutH1));

    let aboutBody = $("<div></div>");
    $(aboutBody).addClass("col-md-4");
    let aboutName = $("<div></div>");
    $(aboutName).html("Name : Yaniv");
    let aboutAge = $("<div></div>");
    $(aboutAge).html("Age : 38");
    let aboutStatus = $("<div></div>");
    $(aboutStatus).html("Status : Married + 3");
    
    let aboutBodyImg = $("<div></div>");
    $(aboutBodyImg).addClass("col-md-6");
    let aboutImg = $("<img/>");
    $(aboutImg).attr("id","aboutImg");
    $(aboutImg).attr("src","yanivProfileImg.jpg");

    $(aboutBody).append($(aboutName));
    $(aboutBody).append($(aboutAge));
    $(aboutBody).append($(aboutStatus));
    $(aboutBodyImg).append($(aboutImg));

    $(".coinsList").append($(aboutHeader));
    $(".coinsList").append($(aboutBodyImg));
    $(".coinsList").append($(aboutBody));
}