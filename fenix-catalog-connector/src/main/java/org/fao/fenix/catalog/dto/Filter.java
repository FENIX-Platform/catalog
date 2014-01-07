package org.fao.fenix.catalog.dto;

import org.fao.fenix.catalog.dto.value.ValueFilter;

import java.util.Collection;
import java.util.Map;

public class Filter {

    private String resourceType;
    private Map<String,Collection<ValueFilter>> filter;
    private boolean dataRequired;


    public String getResourceType() {
        return resourceType;
    }

    public void setResourceType(String resourceType) {
        this.resourceType = resourceType;
    }

    public Map<String, Collection<ValueFilter>> getFilter() {
        return filter;
    }

    public void setFilter(Map<String, Collection<ValueFilter>> filter) {
        this.filter = filter;
    }

    public boolean isDataRequired() {
        return dataRequired;
    }

    public void setDataRequired(boolean dataRequired) {
        this.dataRequired = dataRequired;
    }

    //Utils
    public static Filter getInstance(Map<String,Object> source) {
        return null; //TODO
    }
}
