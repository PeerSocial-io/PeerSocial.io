<template>

    <div class="container-fluid">
        
        <template v-if="loading">
            <div class="spinner-border" role="status">
                <span class="sr-only">Loading...</span>
            </div>
        </template>

        <template v-else>
            
            <div class="row">
                <div class="col-3">col1</div>
                <div class="col-9">col2</div>
            </div>
    
        </template>

    </div>

</template>
<script>
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

                this.app.gun.get('#messages').get({ '.': { '*': userPub } }).map().once((data,key) => {
                    
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
        beforeUnmount() {},
        props: ["app"],
        computed: {
            total() {
                return 1;
            }
        }
    }
</script>