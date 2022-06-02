! function($export, root) { "object" == typeof exports && "undefined" != typeof module ? root(exports) : "function" == typeof define && define.amd ? define(["exports"], root) : root(($export = "undefined" != typeof globalThis ? globalThis : $export || self)) }(this,function(out){

    console.log(out)

})