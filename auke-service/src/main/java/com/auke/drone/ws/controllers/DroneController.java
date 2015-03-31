package com.auke.drone.ws.controllers;

import com.auke.drone.ws.dto.JsonResponse;
import no.auke.drone.dao.DroneFactory;
import no.auke.drone.dao.impl.SimpleDroneFactory;
import no.auke.drone.domain.Drone;
import no.auke.drone.domain.DroneData;
import no.auke.drone.domain.Observer;
import no.auke.drone.services.DroneService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;


import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.util.Collection;
import java.util.List;
import java.util.Set;

/**
 * Created by huyduong on 3/24/2015.
 */
@Path("/drone")
@Component
@Produces(MediaType.APPLICATION_JSON)
public class DroneController {
    @Autowired
    private DroneService droneService;

    @GET
    @Path("/register")
    public JsonResponse register(@QueryParam("id") String id, @QueryParam("name") String name) {
        Drone drone = droneService.registerDrone(id, name);
        return new JsonResponse(drone == null, drone);
    }

    @GET
    @Path("/remove")
    public JsonResponse remove(@QueryParam("id") String id, @QueryParam("name") String name) {
        Drone drone = droneService.removeDrone(id);
        return new JsonResponse(drone == null, drone);
    }

    @GET
    @Path("/get")
    public JsonResponse get(@QueryParam("id") String id) {
        Drone drone = droneService.getDrone(id);
        return new JsonResponse(drone == null, drone);
    }

    @GET
    @Path("/getall")
    public JsonResponse getAll() {
        Collection<Drone> drones = droneService.getAll();
        return new JsonResponse(drones == null, drones);
    }

    @GET
    @Path("/move")
    public JsonResponse move(@QueryParam("id") String id) {
        Drone drone = droneService.moveDrone(id);
        return new JsonResponse(drone == null, drone);
    }
}