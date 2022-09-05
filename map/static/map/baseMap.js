window.onload = () =>{

    getOpenMeteoData();
    
};

function getOpenMeteoData() {
    var request = new XMLHttpRequest()

    const APICall = new URL("https://archive-api.open-meteo.com/v1/era5");

    // getting latitude and longitude from url
    const argString = window.location.href; 
    const locationStart = argString.search("center=") + "center=".length;
    const locationEnd = argString.search("&zoom=");
    const location = argString.slice(locationStart, locationEnd);

    const latitude = location.slice(0, location.search(",%20"));
    const longitude = location.slice(location.search(",%20") + ",%20".length);

    // setting time interval to get the last year's data
    const today = new Date();
    const lastYear = new Date(today);

    lastYear.setFullYear(lastYear.getFullYear()-1);

    // building api call url 
    APICall.searchParams.append('latitude', latitude);
    APICall.searchParams.append('longitude', longitude);
    APICall.searchParams.append('start_date', lastYear.toISOString().slice(0,10));
    APICall.searchParams.append('end_date', today.toISOString().slice(0,10));

    // getting useful information from API 
    APICall.searchParams.append('daily', 'temperature_2m_max');    
    APICall.searchParams.append('daily', 'temperature_2m_min');    
    APICall.searchParams.append('daily', 'sunrise');    
    APICall.searchParams.append('daily', 'sunset');    
    APICall.searchParams.append('daily', 'precipitation_sum');    
    APICall.searchParams.append('daily', 'rain_sum');    
    APICall.searchParams.append('daily', 'snowfall_sum');    
    APICall.searchParams.append('timezone', 'auto')

    // request the info to the API
    request.open('GET', APICall, true);

    // parse request answers 
    request.onload = function () {
        
        const reqResults = JSON.parse(this.response).daily;
        
        // cleanup sunrise outputs
        const sunriseTimes = new Array();
        cleanUpDateArray(reqResults.sunrise, sunriseTimes);

        // cleanup sunset outputs
        const sunsetTimes = new Array();
        cleanUpDateArray(reqResults.sunset, sunsetTimes);

        // write data on webpage
        document.getElementById('dates').innerHTML = reqResults.time;
        document.getElementById('temperaturesMax').innerHTML = reqResults.temperature_2m_max;
        document.getElementById('temperaturesMin').innerHTML = reqResults.temperature_2m_min;
        document.getElementById('sunrise').innerHTML = sunriseTimes;
        document.getElementById('sunset').innerHTML = sunsetTimes;
        document.getElementById('precipitation_sum').innerHTML = reqResults.precipitation_sum;
        document.getElementById('rain_sum').innerHTML = reqResults.rain_sum;
        document.getElementById('snowfall_sum').innerHTML = reqResults.snowfall_sum;

        getPlantsData(reqResults);
    }

    request.send();
}

function cleanUpDateArray(arrayToClean, outputArray) {
    arrayToClean.forEach(element => {
        const time = element.slice(element.search('T') + 1);
        outputArray.push(time);
    });
}

function getPlantsData(requestInfo) {

    var request = new XMLHttpRequest()
    const APICall = new URL("https://www.openfarm.cc/api/v1/crops/");
    
    // build request's parameters according to location 
    setPlantFilters(APICall, requestInfo);

    //console.log(APICall.href);

    request.open('GET', APICall, true);
    
    request.onload = function () {

        //console.log(typeof(JSON.parse(this.response)));

        // parse request answers and show them on the page
        JSON.parse(this.response).data.forEach(elem => {
            //console.log(elem);
            let cropsList = document.getElementById("cropsSuggestion");
            let crop = document.createElement('li');
            let text = document.createTextNode(elem.attributes.name);

            crop.appendChild(text);
            cropsList.appendChild(crop);
        } )
    }
    
    request.send();
}

function setPlantFilters(Url, requestInfo) {

    // console.log(requestInfo);

    // get average daylight hours in the last year and show it on the page
    const daylightAverage = getDaylightHours(requestInfo.sunrise, requestInfo.sunset); 
    const daylightString = Math.floor(daylightAverage) + " H " + Math.floor((daylightAverage - Math.floor(daylightAverage)) * 60) + " min";
    document.getElementById("sunlightHours").innerHTML = daylightString;
    
    // change filter accroding to daylight hours
    const upperBound = 12;
    const lowerBound = 11;

    if (daylightAverage > upperBound)
        Url.searchParams.append('filter', 'full sun');
    else if (daylightAverage < lowerBound)
        Url.searchParams.append('filter', 'full shade');
    else 
        Url.searchParams.append('filter', 'partial sun');

    // get all other averages and shows them
    document.getElementById("maxTempAvg").innerHTML = (requestInfo.temperature_2m_max.reduce((a, b) => a + b, 0) / requestInfo.temperature_2m_max.length).toFixed(2) + "°C";
    document.getElementById("minTempAvg").innerHTML = (requestInfo.temperature_2m_min.reduce((a, b) => a + b, 0) / requestInfo.temperature_2m_min.length).toFixed(2) + "°C";
    document.getElementById("precipitationAvg").innerHTML = (requestInfo.precipitation_sum.reduce((a, b) => a + b, 0) / requestInfo.precipitation_sum.length).toFixed(2) + "mm";
    document.getElementById("rainAvg").innerHTML = (requestInfo.rain_sum.reduce((a, b) => a + b, 0) / requestInfo.rain_sum.length).toFixed(2) + "mm";
    document.getElementById("snowAvg").innerHTML = (requestInfo.snowfall_sum.reduce((a, b) => a + b, 0) / requestInfo.snowfall_sum.length).toFixed(2) + "cm";
    
}

function getDaylightHours(sunriseTimes, sunsetTimes) {
    const daylightHours = new Array();
    sunriseTimes.forEach((elem, index) => {

        const sunset = new Date(sunsetTimes[index]);
        const sunrise = new Date(elem);

        // gives sunlight hours and accounts for days when the sun doesn't set or doesn't rise
        if (isNaN(sunset.getTime()) || isNaN(sunrise.getTime()))
            daylightHours.push(12); // 12 is the average of days when there's 24h of sun vs 0h of sun
        else
            daylightHours.push((sunset.getTime() - sunrise.getTime()) / (3600*1000));
    })

    return daylightHours.reduce((a, b) => a + b, 0) / daylightHours.length;;
}