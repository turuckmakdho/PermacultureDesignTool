var request = new XMLHttpRequest()


window.onload = () =>{

    getOpenMeteoData();
    
    //console.log(window.location);
    
};

function getOpenMeteoData() {

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

    
    request.open('GET', APICall, true);
    
    request.onload = function () {
        
        const reqResults = JSON.parse(this.response).daily;
        
        console.log(JSON.parse(this.response));

        // cleanup sunrise and sunset outputs
        const sunriseTimes = new Array();
        reqResults.sunrise.forEach(element => {
            const time = element.slice(element.search('T') + 1);
            sunriseTimes.push(time);
        });

        const sunsetTimes = new Array();
        reqResults.sunset.forEach(element => {
            const time = element.slice(element.search('T') + 1);
            sunsetTimes.push(time);
        });

        // write data on webpage
        document.getElementById('dates').innerHTML = reqResults.time;
        document.getElementById('temperaturesMax').innerHTML = reqResults.temperature_2m_max;
        document.getElementById('temperaturesMin').innerHTML = reqResults.temperature_2m_min;
        document.getElementById('sunrise').innerHTML = sunriseTimes;
        document.getElementById('sunset').innerHTML = sunsetTimes;
        document.getElementById('precipitation_sum').innerHTML = reqResults.precipitation_sum;
        document.getElementById('rain_sum').innerHTML = reqResults.rain_sum;
        document.getElementById('snowfall_sum').innerHTML = reqResults.snowfall_sum;

    }
    
    request.send();
}