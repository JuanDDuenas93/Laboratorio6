/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package edu.eci.arsw.collabpaint;

import edu.eci.arsw.collabpaint.model.Point;
import edu.eci.arsw.collabpaint.model.Polygon;
import java.util.Map;
import java.util.Queue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 *
 * @author JuanDuenas
 */
@Controller
public class STOMPMessagesHandler {

    @Autowired
    SimpMessagingTemplate msgt;

    private Map<String, Queue<Point>> pointsInMemory = new ConcurrentHashMap<>();

    @MessageMapping("/newpoint.{numdibujo}")
    public void handlePointEvent(Point pt, @DestinationVariable String numdibujo) throws Exception {
        System.out.println("Nuevo punto recibido en el servidor!:" + pt + " Destino " + numdibujo + "");
        msgt.convertAndSend("/topic/newpoint." + numdibujo, pt);

        Queue<Point> points;

        if (pointsInMemory.containsKey(numdibujo)) {
            points = pointsInMemory.get(numdibujo);
        } else {
            points = new ConcurrentLinkedQueue<>();
            pointsInMemory.put(numdibujo, points);
        }
        points.add(pt);
        if (points.size() > 3) {
            Polygon polygon = new Polygon();
            for (Point p : points) {
                polygon.addPoint(p);
            }
            msgt.convertAndSend("/topic/newpolygon." + numdibujo, polygon);
            System.out.println("New polygon send to server!: " + polygon);
            pointsInMemory.put(numdibujo, new ConcurrentLinkedQueue<>());
        }

    }

}
