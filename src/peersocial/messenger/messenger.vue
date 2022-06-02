<template>
    
    <div class="">
        
        <template v-if="loading">
            <div class="spinner-border" role="status">
                <span class="sr-only">Loading...</span>
            </div>
        </template>

        <template v-else>
            <div class="messenger_main">
                <div class="row" style="height:-webkit-fill-available;">
                    <div class="d-none col-sm-1 d-sm-flex   p-0">
                        <div class="d-flex flex-column col-12 bg-dark text-light pr-0 pt-2 pb-2">
                            <div class="pt-5">
                                <div class="d-flex flex-column">
                                    <div class="align-self-center"><button class="btn text-light"><i class="fa-solid fa-2xl fa-house"></i></button></div>
                                </div>
                            </div>
                            <div class="mt-auto mb-auto">
                                <div class="d-flex flex-column">
                                    <div class="align-self-center"><button class="btn text-light"><i class="pt-3 pb-3 fa-solid fa-2xl fa-pen"></i></button></div>
                                </div>
                                
                                <div class="d-flex flex-column">
                                    <div class="align-self-center"><button class="btn text-light"><i class="pt-3 pb-3 fa-solid fa-2xl fa-inbox"></i></button></div>
                                </div>
                                
                                
                                <div class="d-flex flex-column">
                                    <div class="align-self-center"><button class="btn text-light"><i class="pt-3 pb-3 fa-solid fa-2xl fa-gears"></i></button></div>
                                </div>
                            </div>
                            <div class="pb-5">
                                <div class="d-flex flex-column">
                                    <div class="align-self-center"><button class="btn"><img style="max-width: 4em;width:100%" class="user-avatar rounded-circle" src="https://ssl.gstatic.com/accounts/ui/avatar_2x.png"></button></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="d-none d-lg-block col-lg-3 col-xl-2  text-light" style="background-color:#59626a;">
                        
                        <div class="pt-2">
                            <input type="text" class="form-control" placeholder="Search">
                        </div>
                        <div class="" id="inbox_list">
                            <div class="pt-2 d-block">
                                <button class="btn d-inline-block m-0 w-100 text-left text-light" style="white-space: nowrap;">
                                    <div class="d-inline-block"><img style="width: 4em;" class="user-avatar rounded-circle" src="https://ssl.gstatic.com/accounts/ui/avatar_2x.png"></div>
                                    <div class="d-inline-block align-middle p-2">
                                        <div>DISPLAY_NAME</div>
                                        <div>Last Message: ...</div>
                                    </div>
                                </button>    
                            </div>
                            
                            <div class="pt-2 d-block">
                                <button class=" btn d-inline-block m-0 w-100 text-left text-light" style="white-space: nowrap;">
                                    <div class="d-inline-block"><img style="width: 4em;" class="user-avatar rounded-circle" src="https://ssl.gstatic.com/accounts/ui/avatar_2x.png"></div>
                                    <div class="d-inline-block align-middle p-2">
                                        <div>DISPLAY_NAME</div>
                                        <div>Last Message: ...</div>
                                    </div>
                                </button>    
                            </div>
                        </div>
                    </div>
                    <div class="d-flex col-12 col-sm-11 col-lg-8 col-xl-9  flex-column h-100 text-light pl-0" style="background-color:#8b939b;">
                        <div class="container-fluid" style="background-color:#6a6f74;">
                            <div class="d-flex p-2">
                                <div>
                                    <button class="btn btn-outline align-middle d-block d-sm-none">
                                        <i class="fa-solid fa-bars"></i>
                                    </button>
                                </div>
                                <div class="ml-auto mr-auto">
                                    <button class="btn btn-outline align-middle">
                                        <span class="text-light">DISPLAY_NAME</span>
                                    </button>
                                </div>
                                <div>
                                    
                                </div>
                                
                            </div>
                        </div>
                        
                        <div class="mt-auto mb-auto"></div>
                        
                        <div style="overflow-y: auto;" id="messages_data">
                            <div class="col-12">
                                <div v-for="message in messages" :key="message.id">
                                    <div class="row p-2" v-if="message.from">
                                        <div class="container-fluid">
                                            <div>
                                                <span class="badge badge-pill badge-success">From Message</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="row p-2" v-if="message.to">
                                        <div class="container-fluid">
                                            <div class="d-flex justify-content-end">
                                                <span class="badge badge-pill badge-primary">To Message</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                            </div>
                        </div>
                        
                        <div style="position: sticky;bottom: 0;">
                            <div class="container">
                                <div class="row p-2"> 
                                    <div class="input-group">
                                        <input type="text" class="form-control" placeholder="Message...">
                                        <div class="input-group-append">
                                            <button class="btn btn-primary" type="button">Send</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
        </template>

</div>

</template>
<script>
    import styles from './messenger.lazy.css'

    //https://gun.eco/docs/Content-Addressing
    //https://gun.eco/docs/SEA.certify
    //https://gun.eco/docs/RAD

    export default {
        data() {
            return {
                loading: true,
                messages: []
            }
        },
        created() {
            for (let i = 0; i < 50; i++) {
                this.messages.push({
                    from:"person", 
                    id: i,
                    message: "From Message"
                })  
                this.messages.push({
                    to:"person", 
                    id: ++i,
                    message: "To Message"
                })                
            }
            
            this.loading = false;

            // this.loadInbox();
        },
        methods: {
            loadInbox() {
                this.loading = false;
                var userPub = this.app.user.login.user().is.pub;
                var gun = this.app.gun;

                this.app.gun.get('#messages').get({ '.': { '*': userPub } }).map().once((data, key) => {

                    console.log(data) // 'hello world!', true
                    this.messages.push(data);

                });
            },
            sendMessage(pubkey, message) {
                return new Promise(async(resolve) => {
                    var SEA = this.app.sea;
                    message = "PSIO" + JSON.stringify(message)

                    let hash = await SEA.work(message, null, null, { name: 'SHA-256' });
                    gun.get('#messages').get(pubkey + '#' + hash).put(message).once(function() {
                        resolve();
                    });
                });
            }
        },
        renderTriggered (){
            // var container = this.$el.querySelector("#messages_data");
            // container.scrollTop = container.scrollHeight;
        },
        mounted() {
            this.app.$(".navbar").hide();
            styles.use();
            
            var md = this.$el.querySelector("#messages_data");
            md.scrollTop  = md.scrollHeight
        },
        unmounted() {
            this.app.$(".navbar").show();
            styles.unuse();
        },
        beforeUnmount() {},
        props: ["app"],
        computed: {
            total() {
                return 1;
            }
        }
    }
</script>