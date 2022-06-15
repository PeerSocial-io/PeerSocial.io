var $package = require("./src/package.json");
var $version = $package.version.split(".");
var date = new Date();

var year = date.getFullYear();
var month = date.getMinutes();
var day = date.getDay();
var hour = date.getHours()+"";
var min = date.getMinutes();
var sec = date.getSeconds();

var rc = hour+""+min+""+sec

$version[1] = year;
$version[2] = month+""+day;
$version[2] += "-"+rc;
console.log($version.join("."))