<a name="module_app"></a>

## app
App Instance


* [app](#module_app)
    * [.debug](#module_app.debug) : <code>boolean</code>
    * [.source_version](#module_app.source_version) : <code>string</code>
    * [.package](#module_app.package) : <code>object</code>
    * [.events](#module_app.events) : <code>module</code>
    * [.window](#module_app.window) : <code>object</code>
    * [.state](#module_app.state) : <code>EventEmitter</code>
        * [.$hash](#module_app.state.$hash) : <code>EventEmitter</code>
            * ["render"](#module_app.state.$hash+event_render)
            * ["unload"](#module_app.state.$hash+event_unload)
            * ["200"](#module_app.state.$hash+event_200)
            * ["/{pagename}"](#module_app.state.$hash+event_/{pagename})
            * ["400"](#module_app.state.$hash+event_400)
        * [.query](#module_app.state.query) : <code>object</code>
        * [.reload()](#module_app.state.reload)
        * [.back()](#module_app.state.back)
    * [.dapp_info](#module_app.dapp_info) : <code>object</code>

<a name="module_app.debug"></a>

### app.debug : <code>boolean</code>
**Kind**: static property of [<code>app</code>](#module_app)  
**Default**: <code>false</code>  
<a name="module_app.source_version"></a>

### app.source\_version : <code>string</code>
**Kind**: static property of [<code>app</code>](#module_app)  
<a name="module_app.package"></a>

### app.package : <code>object</code>
**Kind**: static property of [<code>app</code>](#module_app)  
<a name="module_app.events"></a>

### app.events : <code>module</code>
**Kind**: static property of [<code>app</code>](#module_app)  
**Summery**: `new events.EventEmitter();`  
<a name="module_app.window"></a>

### app.window : <code>object</code>
**Kind**: static property of [<code>app</code>](#module_app)  
<a name="module_app.state"></a>

### app.state : <code>EventEmitter</code>
App state control

**Kind**: static property of [<code>app</code>](#module_app)  
**Summery**: Controls State of the app. URL based event emitter     *  

* [.state](#module_app.state) : <code>EventEmitter</code>
    * [.$hash](#module_app.state.$hash) : <code>EventEmitter</code>
        * ["render"](#module_app.state.$hash+event_render)
        * ["unload"](#module_app.state.$hash+event_unload)
        * ["200"](#module_app.state.$hash+event_200)
        * ["/{pagename}"](#module_app.state.$hash+event_/{pagename})
        * ["400"](#module_app.state.$hash+event_400)
    * [.query](#module_app.state.query) : <code>object</code>
    * [.reload()](#module_app.state.reload)
    * [.back()](#module_app.state.back)

<a name="module_app.state.$hash"></a>

#### state.$hash : <code>EventEmitter</code>
App state page control

**Kind**: static property of [<code>state</code>](#module_app.state)  
**Summery**: Controls State of the app. URL based event emitter  `state.$hash.on("/mypage",()=>{})`  

* [.$hash](#module_app.state.$hash) : <code>EventEmitter</code>
    * ["render"](#module_app.state.$hash+event_render)
    * ["unload"](#module_app.state.$hash+event_unload)
    * ["200"](#module_app.state.$hash+event_200)
    * ["/{pagename}"](#module_app.state.$hash+event_/{pagename})
    * ["400"](#module_app.state.$hash+event_400)

<a name="module_app.state.$hash+event_render"></a>

##### "render"
Triggered by `window.requestAnimationFrame`

**Kind**: event emitted by [<code>$hash</code>](#module_app.state.$hash)  
<a name="module_app.state.$hash+event_unload"></a>

##### "unload"
Triggered before a page is rendered

**Kind**: event emitted by [<code>$hash</code>](#module_app.state.$hash)  
<a name="module_app.state.$hash+event_200"></a>

##### "200"
Triggered before a page is found

**Kind**: event emitted by [<code>$hash</code>](#module_app.state.$hash)  
<a name="module_app.state.$hash+event_/{pagename}"></a>

##### "/{pagename}"
Triggered to load `/{pagename}`

**Kind**: event emitted by [<code>$hash</code>](#module_app.state.$hash)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| path | <code>array</code> | remaining url string split with `/` |
| currentState | <code>HistoryState</code> | current History state |
| lastState | <code>HistoryState</code> | last History state |

<a name="module_app.state.$hash+event_400"></a>

##### "400"
Triggered before a page is NOT found

**Kind**: event emitted by [<code>$hash</code>](#module_app.state.$hash)  
<a name="module_app.state.query"></a>

#### state.query : <code>object</code>
**Kind**: static namespace of [<code>state</code>](#module_app.state)  
<a name="module_app.state.reload"></a>

#### state.reload()
reload current state

**Kind**: static method of [<code>state</code>](#module_app.state)  
<a name="module_app.state.back"></a>

#### state.back()
go back 1 state

**Kind**: static method of [<code>state</code>](#module_app.state)  
<a name="module_app.dapp_info"></a>

### app.dapp\_info : <code>object</code>
**Kind**: static namespace of [<code>app</code>](#module_app)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| DAPP_PUB | <code>string</code> | dapp pub key. |
| pub | <code>string</code> | dapp pub key. |
| name | <code>string</code> | The name of the app. |
| relay_peers | <code>array</code> | The default treasure. |

