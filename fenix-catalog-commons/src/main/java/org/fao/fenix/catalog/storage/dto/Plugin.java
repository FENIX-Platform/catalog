package org.fao.fenix.catalog.storage.dto;

import org.codehaus.jackson.annotate.JsonAutoDetect;
import org.codehaus.jackson.annotate.JsonIgnoreProperties;
import org.codehaus.jackson.annotate.JsonMethod;
import org.codehaus.jackson.annotate.JsonProperty;
import org.fao.fenix.catalog.tools.orient.OrientClass;

import java.util.Set;

@OrientClass
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonAutoDetect({JsonMethod.NONE})
public class Plugin {

    private String name;
    private String className;
    private String component;
    private Set<String> requiredParameters;
    private Set<String> optionalParameters;


    @JsonProperty
    public String getName() {
        return name;
    }

    @JsonProperty
    public void setName(String name) {
        this.name = name;
    }

    @JsonProperty
    public String getClassName() {
        return className;
    }

    @JsonProperty
    public void setClassName(String className) {
        this.className = className;
    }

    @JsonProperty
    public String getComponent() {
        return component;
    }

    @JsonProperty
    public void setComponent(String component) {
        this.component = component;
    }

    @JsonProperty
    public Set<String> getRequiredParameters() {
        return requiredParameters;
    }

    @JsonProperty
    public void setRequiredParameters(Set<String> requiredParameters) {
        this.requiredParameters = requiredParameters;
    }

    @JsonProperty
    public Set<String> getOptionalParameters() {
        return optionalParameters;
    }

    @JsonProperty
    public void setOptionalParameters(Set<String> optionalParameters) {
        this.optionalParameters = optionalParameters;
    }
}
