package org.fao.fenix.catalog.dto;

import org.codehaus.jackson.annotate.JsonIgnore;

import java.util.Map;

public class RequiredPlugin {

    private String name;
    private String className;
    private Map<String,Object> properties;


    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Map<String, Object> getProperties() {
        return properties;
    }

    public void setProperties(Map<String, Object> properties) {
        this.properties = properties;
    }

    @JsonIgnore
    public String getClassName() {
        return className;
    }

    @JsonIgnore
    public void setClassName(String className) {
        this.className = className;
    }
}
