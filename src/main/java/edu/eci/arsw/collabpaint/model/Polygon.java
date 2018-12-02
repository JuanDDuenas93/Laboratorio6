/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package edu.eci.arsw.collabpaint.model;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 *
 * @author JuanDuenas
 */
public class Polygon {

    List<Point> points;

    public Polygon() {
        points = new CopyOnWriteArrayList<>();
    }

    public void addPoint(Point p) {
        points.add(p);
    }

    public List<Point> getPoints() {
        return points;
    }

    public void setPoints(List<Point> points) {
        this.points = points;
    }

    @Override
    public String toString() {
        return "Polygon{" + "points=" + points + '}';
    }
}
