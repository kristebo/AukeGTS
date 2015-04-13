package no.auke.drone.domain;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.locks.ReentrantLock;

import no.auke.drone.utils.LocationFunction;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Created by huyduong on 3/24/2015.
 */
public abstract class TrackerBase implements Tracker, Observer {
    
	private static final Logger logger = LoggerFactory.getLogger(TrackerBase.class);

    private String id;
    private String name;
    private long time;
    private double altitude;
    private double speed;
    private TrackerType droneType = TrackerType.SIMULATED;
    private String layerid;

	private Person flyer;
    private boolean isUsedCamera;
    private MapPoint currentPosition;
    private List<MapPoint> positions;
    protected AtomicBoolean isFlying = new AtomicBoolean(); // default value
    
    protected ReentrantLock block = new ReentrantLock();

    public TrackerBase() {
        positions = new ArrayList<MapPoint>();
        isFlying.set(true);
    }
    
    public TrackerBase(String id) {
    	this();
    	this.id = id;
    }    

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
    
    public String getLayerid() {
		return layerid;
	}

	public void setLayerid(String layerid) {
		this.layerid = layerid;
	}
    
    public void setCurrentPosition(MapPoint currentPosition) {
        this.currentPosition = currentPosition;
    }

    public void update() {
        calculate();
    }


    
    // LHA: something like this get position with a boundary
    @Override
    public boolean withinView(double upperLat, double upperLon, double lowerLat, double lowerLon) {
        
    	try {

    		block.lock();

    		return (this.currentPosition.getLongitude() >= upperLon && this.currentPosition.getLongitude() <= lowerLon)
                    && (this.currentPosition.getLatitude() >= upperLat && this.currentPosition.getLatitude() <= lowerLat);
    		
    		
    	} finally {
    		
    		block.unlock();
    	}
    
    }    

    @Override
    public boolean equals(Object obj) {
        Tracker tracker = (Tracker) obj;
        return StringUtils.trim(this.id).equalsIgnoreCase(StringUtils.trimToEmpty(tracker.getId()))
                && StringUtils.trim(this.name).equalsIgnoreCase(StringUtils.trimToEmpty(tracker.getName()));
    }

    @Override
    public int hashCode() {
        int result = id != null ? id.hashCode() : 0;
        result = 31 * result + (name != null ? name.hashCode() : 0);
        return result;
    }

    @Override
    public String toString() {
        
    	return "drone id: " + id + ", name:" + name + ", latitude " + currentPosition.getLatitude() + ", longitude"
                + currentPosition.getLongitude();
    }

    @Override
    public long getTime() {
        return time;
    }

    @Override
    public void setTime(long time) {
        this.time = time;

    }

    @Override
    public double getSpeed() {
        return speed;
    }

    @Override
    public void setSpeed(double speed) {
        this.speed = speed;
    }

    @Override
    public double getAltitude() {
        return altitude;
    }

    @Override
    public void setAltitude(double altitude) {
        this.altitude = altitude;

    }

    @Override
    public boolean isUsedCamera() {
        return isUsedCamera;
    }

    @Override
    public void setUsedCamera(boolean isUsedCamera) {
        this.isUsedCamera = isUsedCamera;
    }

    @Override
    public void setTrackerType(TrackerType type) {
        this.droneType = type;
    }

    @Override
    public TrackerType getTrackerType() {
        return this.droneType;
    }

    @Override
    public void setFlyer(Person person) {
        this.flyer = person;
    }

    @Override
    public Person getFlyer() {
        return flyer;
    }

    @Override
    public MapPoint getCurrentPosition() {
        return currentPosition;
    }

    @Override
    public List<MapPoint> getPositions() {
        return positions;
    }

    @Override
    public void setPositions(List<MapPoint> positions) {
        this.positions = positions;
    }

    public boolean isFlying() {
        return isFlying.get();
    }

    public void setFlying(boolean isFlying) {
        
        if(!isFlying && this.isFlying.getAndSet(false)) {
        	
        	try {

        		block.lock();
        		logger.info("Save tracker " + id);
            	LocationFunction.writeLocationHistoryByDroneId(this.getId(),getCurrentPosition());
        		
        		
        	} finally {
        		
        		block.unlock();
        	}
        	
        	
        } else {
        	
        	this.isFlying.set(true);
        }
        
    }

}
