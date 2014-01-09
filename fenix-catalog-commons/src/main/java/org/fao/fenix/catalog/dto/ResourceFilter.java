package org.fao.fenix.catalog.dto;

import org.fao.fenix.catalog.dto.value.ValueFilter;

import java.util.Collection;
import java.util.Map;

public class ResourceFilter {
    private String[] types;
    private Map<String,Collection<ValueFilter>> metadata;
    private Map<String,Collection<ValueFilter>> data;
    private Map<String,Object> business;



    public String[] getTypes() {
        return types;
    }

    public void setTypes(String[] types) {
        this.types = types;
    }

    public Map<String, Collection<ValueFilter>> getMetadata() {
        return metadata;
    }

    public void setMetadata(Map<String, Collection<ValueFilter>> metadata) {
        this.metadata = metadata;
    }

    public Map<String, Collection<ValueFilter>> getData() {
        return data;
    }

    public void setData(Map<String, Collection<ValueFilter>> data) {
        this.data = data;
    }

    public Map<String, Object> getBusiness() {
        return business;
    }

    public void setBusiness(Map<String, Object> business) {
        this.business = business;
    }
}
