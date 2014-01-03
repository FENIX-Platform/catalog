package org.fao.fenix.catalog.connector;

import javax.enterprise.context.RequestScoped;

@RequestScoped
public class Selector {

    private String resourceType;

    public String getResourceType() {
        return resourceType;
    }

    public void setResourceType(String resourceType) {
        this.resourceType = resourceType;
    }
}
