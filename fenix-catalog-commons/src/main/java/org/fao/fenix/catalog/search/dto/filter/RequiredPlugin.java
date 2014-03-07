package org.fao.fenix.catalog.search.dto.filter;

import org.codehaus.jackson.annotate.JsonIgnore;

import javax.enterprise.context.RequestScoped;
import java.util.Map;

@RequestScoped
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

    //Utils
    @JsonIgnore
    public String getClassName() {
        return className;
    }

    @JsonIgnore
    public void setClassName(String className) {
        this.className = className;
    }

    public void copy(RequiredPlugin source) {
        this.name = source.name;
        this.className = source.className;
        this.properties = source.properties;
    }
}
