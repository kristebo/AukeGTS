package no.auke.drone.services;

import no.auke.drone.domain.Drone;

import java.util.Collection;

/**
 * Created by huyduong on 3/25/2015.
 */
public interface DroneService {
    Drone registerDrone(String id, String name);
    Drone removeDrone(String droneId);
    Drone getDrone(String id);
    Collection<Drone> getAll();
    Drone moveDrone(String id);
}
