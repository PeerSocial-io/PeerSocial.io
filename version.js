var $package = require("./src/package.json");
var $version = $package.version.split(".");
var date = new Date();

var year = date.getFullYear();
var month = date.getMonth()+1;
var day = date.getDate();
var hour = date.getHours()+"";
var min = date.getMinutes();
var sec = date.getSeconds();

var rc = hour+""+min+""+sec

$version[1] = year;
$version[2] = ""+month+""+day+"-"+rc;
console.log($version.join("."))