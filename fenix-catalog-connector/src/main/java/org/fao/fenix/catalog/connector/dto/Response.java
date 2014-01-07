package org.fao.fenix.catalog.connector.dto;

import org.fao.fenix.catalog.connector.dto.data.Resource;

import java.util.Collection;

public class Response {

    private String resourceType;
    private Collection<Resource> resources;

    public String getResourceType() {
        return resourceType;
    }

    public void setResourceType(String resourceType) {
        this.resourceType = resourceType;
    }

    public Collection<Resource> getResources() {
        return resources;
    }

    public void setResources(Collection<Resource> resources) {
        this.resources = resources;
    }
}
