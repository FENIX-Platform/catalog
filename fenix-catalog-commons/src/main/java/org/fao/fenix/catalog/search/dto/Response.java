package org.fao.fenix.catalog.search.dto;

import org.fao.fenix.catalog.search.dto.data.Resource;

import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;

public class Response {

    private int count = 0;
    private Collection<Resource> resources;

    public Collection<Resource> getResources() {
        return resources;
    }

    public void setResources(Collection<Resource> resources) {
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
            resources = new LinkedList<>();
        resources.add(resource);
        count++;
    }

    public void addResources(Collection<Resource> resources) {
        if (resources==null)
            return;

        if (this.resources==null)
            this.resources = new LinkedList<>();
        this.resources.addAll(resources);
        count+=resources.size();
    }
}
