package org.fao.fenix.catalog.dto;

import org.fao.fenix.catalog.dto.data.Resource;

import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;

public class Response {

    private int count = 0;
    private Map<String,Collection<Resource>> resources;

    public Map<String,Collection<Resource>> getResources() {
        return resources;
    }

    public void setResources(Map<String,Collection<Resource>> resources) {
        this.resources = resources;
    }

    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }


    //Utils
    public void addResource(Resource resource) {
        if (resource==null)
            return;

        if (resources==null)
            resources = new HashMap<>();

        Collection<Resource> resourcesByType = resources.get(resource.getResourceType());
        if (resourcesByType==null)
            resources.put(resource.getResourceType(),resourcesByType=new LinkedList<>());
        resourcesByType.add(resource);

        count++;
    }

    public void addResources(Collection<Resource> resources) {
        if (resources!=null)
            for (Resource resource : resources)
                addResource(resource);
    }
}
