var app = (function () {
    var canvasNumber = null;
    
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
    
    var addPolygonToCanvas = function (polygon) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        var points = polygon.points;
        ctx.fillStyle = '#FFBF00';
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (i in points) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
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
            stompClient.subscribe('/app/topic/newpoint.0', function (pt) {
                var point=JSON.parse(pt.body);
                addPointToCanvas(new Point(point.x,point.y));                
            });
        });

    };
    
    

    return {

        init: function () {
            var can = document.getElementById("canvas");
            //websocket connection
            //connectAndSubscribe();
            //add listener to canvas
            can.addEventListener("click",function(evt){
               var pos=getMousePosition(evt); 
               app.publishPoint(pos.x,pos.y);
            });
        },
        
        connectToCanvas: function(canvasN){ 
            var can = document.getElementById("canvas");
            var context = canvas.getContext('2d');
            context.clearRect(0, 0, can.width, can.height);
            console.info('Connecting to WS...');
            var socket = new SockJS('/stompendpoint');
            stompClient = Stomp.over(socket);
            canvasNumber = canvasN;
            var newPoint = "/topic/newpoint."+canvasNumber+"";
            var newPoly = "/topic/newpolygon."+canvasNumber+"";
            //subscribe to /topic/TOPICXX when connections succeed
            stompClient.connect({}, function (frame) {
                console.log('Connected: ' + frame);
                
                stompClient.subscribe(newPoint, function (pt) {
                    var point=JSON.parse(pt.body);
                    addPointToCanvas(new Point(point.x,point.y));                
                });
                
                stompClient.subscribe(newPoly, function (event) {
                    var polygon=JSON.parse(event.body);
                    addPolygonToCanvas(polygon);                
                });
            });  
        },

        publishPoint: function(px,py){
            var url = "localhost:8080";
            var pt=new Point(px,py);
            if (canvasNumber === null) {
                alert('Canvas Connection is Missing');
                return;
            }
            console.info("publishing point at "+pt);
            addPointToCanvas(pt);
            stompClient.send("/app/newpoint."+canvasNumber, {}, JSON.stringify(pt));
            
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