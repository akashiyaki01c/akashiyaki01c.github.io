/* グローバル変数 */
var data_holiday_east = "";
var data_holiday_west = "";
var data_weekday_east = "";
var data_weekday_west = "";

fetch("./data/2022_he.json")
    .then(function(response) {
        return response.text();
    })
    .then(function(text) {
        data_holiday_east = JSON.parse(text);
    });

fetch("./data/2022_hw.json")
    .then(function(response) {
        return response.text();
    })
    .then(function(text) {
        data_holiday_west = JSON.parse(text);
    });

fetch("./data/2022_we.json")
    .then(function(response) {
        return response.text();
    })
    .then(function(text) {
        data_weekday_east = JSON.parse(text);
    });

fetch("./data/2022_ww.json")
    .then(function(response) {
        return response.text();
    })
    .then(function(text) {
        data_weekday_west = JSON.parse(text);
    });