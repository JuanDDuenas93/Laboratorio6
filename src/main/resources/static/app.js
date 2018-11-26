var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };
    
    
    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint.0', function (pt) {
                var point=JSON.parse(pt.body);
                addPointToCanvas(new Point(point.x,point.y));                
            });
        });

    };
    
    

    return {

        init: function () {
            var can = document.getElementById("canvas");
            //websocket connection
            connectAndSubscribe();
            //add listener to canvas
            can.addEventListener("click",function(evt){
               var pos=getMousePosition(evt); 
               app.publishPoint(pos.x,pos.y);
            });
        },
        
        connectToCanvas: function(canvasNumber){
            console.info('Connecting to WS...');
            var socket = new SockJS('/stompendpoint');
            stompClient = Stomp.over(socket);
            var newPoint = "/topic/newpoint."+canvasNumber+"";
        
            //subscribe to /topic/TOPICXX when connections succeed
            stompClient.connect({}, function (frame) {
                console.log('Connected: ' + frame);
                stompClient.subscribe(newPoint, function (pt) {
                    var point=JSON.parse(pt.body);
                    addPointToCanvas(new Point(point.x,point.y));                
                });
            });  
        },

        publishPoint: function(px,py){
            var pt=new Point(px,py);
            var canvasNumber = document.getElementById("connectTo");
            console.info("publishing point at "+pt);
            addPointToCanvas(pt);
            stompClient.send("/topic/newpoint."+canvasNumber.value+"", {}, JSON.stringify(pt));
            
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        },
        
    };

})();