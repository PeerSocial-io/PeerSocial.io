<template>
    
    <div>
        <span><strong>Total: </strong>{{total}}</span>
    </div>
    
    <hr/>
    
    <div class="container">
    
        <div class="jumbotron p-4 p-md-5 text-white rounded bg-dark">
            <div class="col-md-6 px-0">
                <h1 class="display-4 font-italic">Thanks for joining!</h1>
                <p class="lead my-3">Your making a difference just by participating.</p>
            </div>
        </div>
    
        <div>
            <h1>Welcome!</h1>
            <p>Now your asking what to do with peer social.</p>
    
            <h1>Add a Peer!</h1>
            <p>Click Add Peer. Of you if know a peer alias#code click <a href="/peers">HERE</a> and click `Lookup Peer`</p>
    
            <!--<h1>Add a PeerApp!</h1>-->
            <!--<p>Once you have added a friend that has created some apps.. then you can run them by visiting there profile and clicking on there app. </p>-->
    
    
            <h1>Get the Source!</h1>
            <p>Want the Source? Well here it is. <a href="https://github.com/PeerSocial-io/PeerSocial.io">https://github.com/PeerSocial-io/PeerSocial.io</a><br/><br/> Reason you would want the source.
                <ul>
                    <li>Run your own local peer.</li>
                    <li>NO restrictions to the core code.</li>
                    <li>Provide a PeerSocial.io PeerService.</li>
                    <li>Help Contribute to the core code.</li>
                    <li>Learn how it works.</li>
                    <li>Forking for your community.</li>
                    <li>Expanding the network.</li>
                </ul>
            </p>
    
            <div>
                <h1>Let's talk about it.</h1>
                <a class="discord-chat-link" href="https://discord.gg/rHM4GmR">
                    <span>Discord Chat: https://discord.gg/rHM4GmR</span>
                </a>
            </div>
    
            <br/>
            <br/>
    <!--
            <div class="d-inline-block" style="background-color:gray;">
                <canvas class="test-canvas " width="500" height="500"></canvas>
            </div>
    -->
        </div>
    
    </div>
</template>
<script>
export default {
    dispose() {
        return this;
    },
    props: {
        num1: Number,
        num2: Number
    },
    computed: {
        total() {
            return parseInt(this.num1) + parseInt(this.num2);
        }
    }
}
</script>