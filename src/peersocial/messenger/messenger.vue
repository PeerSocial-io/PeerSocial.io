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
                    <div class="col-1 d-flex p-0">
                        <div class="d-flex flex-column col-12 bg-dark text-light pr-0 pt-2 pb-2">
                            <div>
                                <div class="d-flex flex-column">
                                    <div class="align-self-center"><i class="fa-solid fa-2xl fa-house"></i></div>
                                </div>
                            </div>
                            <div class="mt-auto mb-auto">
                                <div class="d-flex flex-column">
                                    <div class="align-self-center"><i class="pt-3 pb-3 fa-solid fa-2xl fa-pen"></i></div>
                                </div>
                                
                                <div class="d-flex flex-column">
                                    <div class="align-self-center"><i class="pt-3 pb-3 fa-solid fa-2xl fa-inbox"></i></div>
                                </div>
                                
                                
                                <div class="d-flex flex-column">
                                    <div class="align-self-center"><i class="pt-3 pb-3 fa-solid fa-2xl fa-gears"></i></div>
                                </div>
                            </div>
                            <div>
                                <div class="d-flex flex-column">
                                    <div class="align-self-center"><img style="width: 4em;" class="user-avatar rounded-circle" src="https://ssl.gstatic.com/accounts/ui/avatar_2x.png"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-3  text-light" style="background-color:#59626a;">
                        <div class="pt-2">
                            <input type="text" class="form-control" placeholder="Search">
                        </div>
                        <div>
                            <div class="row pt-2 pr-2 pl-2">
                                <div><img style="width: 4em;" class="user-avatar rounded-circle" src="https://ssl.gstatic.com/accounts/ui/avatar_2x.png"></div>
                                <div class="d-flex flex-column p-2">
                                    <div>DISPLAY_NAME</div>
                                    <div>Last Message: ...</div>
                                </div>
                            </div>    
                        </div>
                    </div>
                    <div class="col-8 d-flex flex-column h-100 text-light pl-0" style="background-color:#8b939b;">
                        <div class="container" style="background-color:#6a6f74;">
                            <div class="d-flex justify-content-center p-2">
                                <span>DISPLAY_NAME</span>
                            </div>
                        </div>
                        
                        <div class="mt-auto mb-auto"></div>
                        
                        <div style="overflow-y: auto;" id="messages_data">
                            <div class="col-12">
                                
                                <div class="row p-2">
                                    <div class="container-fluid">
                                        <div>
                                            <span class="badge badge-pill badge-success">From Message</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row p-2">
                                    <div class="container-fluid">
                                        <div class="d-flex justify-content-end">
                                            <span class="badge badge-pill badge-primary">To Message</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row p-2">
                                    <div class="container-fluid">
                                        <div>
                                            <span class="badge badge-pill badge-success">From Message</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row p-2">
                                    <div class="container-fluid">
                                        <div class="d-flex justify-content-end">
                                            <span class="badge badge-pill badge-primary">To Message</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row p-2">
                                    <div class="container-fluid">
                                        <div>
                                            <span class="badge badge-pill badge-success">From Message</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row p-2">
                                    <div class="container-fluid">
                                        <div class="d-flex justify-content-end">
                                            <span class="badge badge-pill badge-primary">To Message</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row p-2">
                                    <div class="container-fluid">
                                        <div>
                                            <span class="badge badge-pill badge-success">From Message</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row p-2">
                                    <div class="container-fluid">
                                        <div class="d-flex justify-content-end">
                                            <span class="badge badge-pill badge-primary">To Message</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row p-2">
                                    <div class="container-fluid">
                                        <div>
                                            <span class="badge badge-pill badge-success">From Message</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row p-2">
                                    <div class="container-fluid">
                                        <div class="d-flex justify-content-end">
                                            <span class="badge badge-pill badge-primary">To Message</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row p-2">
                                    <div class="container-fluid">
                                        <div>
                                            <span class="badge badge-pill badge-success">From Message</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row p-2">
                                    <div class="container-fluid">
                                        <div class="d-flex justify-content-end">
                                            <span class="badge badge-pill badge-primary">To Message</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row p-2">
                                    <div class="container-fluid">
                                        <div>
                                            <span class="badge badge-pill badge-success">From Message</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row p-2">
                                    <div class="container-fluid">
                                        <div class="d-flex justify-content-end">
                                            <span class="badge badge-pill badge-primary">To Message</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row p-2">
                                    <div class="container-fluid">
                                        <div>
                                            <span class="badge badge-pill badge-success">From Message</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row p-2">
                                    <div class="container-fluid">
                                        <div class="d-flex justify-content-end">
                                            <span class="badge badge-pill badge-primary">To Message</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row p-2">
                                    <div class="container-fluid">
                                        <div>
                                            <span class="badge badge-pill badge-success">From Message</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row p-2">
                                    <div class="container-fluid">
                                        <div class="d-flex justify-content-end">
                                            <span class="badge badge-pill badge-primary">To Message</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row p-2">
                                    <div class="container-fluid">
                                        <div>
                                            <span class="badge badge-pill badge-success">From Message</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row p-2">
                                    <div class="container-fluid">
                                        <div class="d-flex justify-content-end">
                                            <span class="badge badge-pill badge-primary">To Message</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row p-2">
                                    <div class="container-fluid">
                                        <div>
                                            <span class="badge badge-pill badge-success">From Message</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row p-2">
                                    <div class="container-fluid">
                                        <div class="d-flex justify-content-end">
                                            <span class="badge badge-pill badge-primary">To Message</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row p-2">
                                    <div class="container-fluid">
                                        <div>
                                            <span class="badge badge-pill badge-success">From Message</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row p-2">
                                    <div class="container-fluid">
                                        <div class="d-flex justify-content-end">
                                            <span class="badge badge-pill badge-primary">To Message</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row p-2">
                                    <div class="container-fluid">
                                        <div>
                                            <span class="badge badge-pill badge-success">From Message</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row p-2">
                                    <div class="container-fluid">
                                        <div class="d-flex justify-content-end">
                                            <span class="badge badge-pill badge-primary">To Message</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row p-2">
                                    <div class="container-fluid">
                                        <div>
                                            <span class="badge badge-pill badge-success">From Message</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row p-2">
                                    <div class="container-fluid">
                                        <div class="d-flex justify-content-end">
                                            <span class="badge badge-pill badge-primary">To Message</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row p-2">
                                    <div class="container-fluid">
                                        <div>
                                            <span class="badge badge-pill badge-success">From Message</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row p-2">
                                    <div class="container-fluid">
                                        <div class="d-flex justify-content-end">
                                            <span class="badge badge-pill badge-primary">To Message</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row p-2">
                                    <div class="container-fluid">
                                        <div>
                                            <span class="badge badge-pill badge-success">From Message</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row p-2">
                                    <div class="container-fluid">
                                        <div class="d-flex justify-content-end">
                                            <span class="badge badge-pill badge-primary">To Message</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row p-2">
                                    <div class="container-fluid">
                                        <div>
                                            <span class="badge badge-pill badge-success">From Message</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row p-2">
                                    <div class="container-fluid">
                                        <div class="d-flex justify-content-end">
                                            <span class="badge badge-pill badge-primary">To Message</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row p-2">
                                    <div class="container-fluid">
                                        <div>
                                            <span class="badge badge-pill badge-success">From Message</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row p-2">
                                    <div class="container-fluid">
                                        <div class="d-flex justify-content-end">
                                            <span class="badge badge-pill badge-primary">To Message</span>
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

    export default {
        data() {
            return {
                loading: true,
                messages: []
            }
        },
        created() {
            this.loadInbox();
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